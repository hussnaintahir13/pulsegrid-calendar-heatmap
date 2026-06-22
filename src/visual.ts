import "./../style/visual.less";

import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import ITooltipService = powerbi.extensibility.ITooltipService;
import IVisualEventService = powerbi.extensibility.IVisualEventService;
import IColorPalette = powerbi.extensibility.IColorPalette;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ISelectionId = powerbi.visuals.ISelectionId;
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";

import { VisualSettings } from "./settings";
import { aggregate, dataBounds, dateExtent, extractRows } from "./dataTransform";
import { bucketIndex, buildScheme, contrastingTextColor } from "./colorScale";
import {
    buildMonthGridLayout, buildWeekStripLayout, buildYearStripLayout,
    CellPosition, dayLabels, MONTH_LABELS
} from "./heatmap";
import {
    AggregatedCell, AggregationType, ColorScheme, RangeBounds, StartOfWeek, ViewMode
} from "./types";

const SVG_NS = "http://www.w3.org/2000/svg";

export class Visual implements IVisual {
    private root: HTMLElement;
    private settings: VisualSettings = new VisualSettings();
    private formattingSettingsService: FormattingSettingsService;
    private tooltipService: ITooltipService;
    private host: IVisualHost;
    private events: IVisualEventService;
    private colorPalette: IColorPalette;
    private selectionManager: ISelectionManager;
    private localizationManager: ILocalizationManager;
    private locale: string = "en-GB";
    private allowInteractions: boolean = true;

    constructor(options?: VisualConstructorOptions) {
        if (!options) {
            throw new Error("PulseGrid: VisualConstructorOptions are required.");
        }
        this.host = options.host;
        this.root = options.element;
        this.root.classList.add("pg-root");
        this.formattingSettingsService = new FormattingSettingsService();
        this.tooltipService = options.host.tooltipService;
        this.events = options.host.eventService;
        this.colorPalette = options.host.colorPalette;
        this.selectionManager = options.host.createSelectionManager();
        this.localizationManager = options.host.createLocalizationManager();
        this.locale = options.host.locale || "en-GB";
        const hostFlags = options.host as unknown as { allowInteractions?: boolean };
        this.allowInteractions = hostFlags.allowInteractions !== false;

        this.selectionManager.registerOnSelectCallback(() => {
            this.applySelectionStyling();
        });

        this.root.addEventListener("contextmenu", (event: MouseEvent) => {
            if (!this.allowInteractions) return;
            const target = event.target as Element | null;
            const selectionId = target ? this.findSelectionId(target) : null;
            this.selectionManager.showContextMenu(
                selectionId || {} as ISelectionId,
                { x: event.clientX, y: event.clientY }
            );
            event.preventDefault();
        });

        this.root.addEventListener("click", (event: MouseEvent) => {
            if (!this.allowInteractions) return;
            const target = event.target as Element | null;
            if (!target || target === this.root) {
                this.selectionManager.clear();
                this.applySelectionStyling();
            }
        });
    }

    private t(key: string, fallback: string): string {
        try {
            return this.localizationManager.getDisplayName(key) || fallback;
        } catch {
            return fallback;
        }
    }

    private findSelectionId(el: Element): ISelectionId | null {
        let current: Element | null = el;
        while (current) {
            const ids = (current as unknown as { __pgSelectionIds?: ISelectionId[] }).__pgSelectionIds;
            if (ids && ids.length > 0) return ids[0];
            current = current.parentElement;
        }
        return null;
    }

    private applySelectionStyling(): void {
        const selected = this.selectionManager.getSelectionIds() as ISelectionId[];
        const isActive = selected.length > 0;
        const cells = this.root.querySelectorAll<SVGRectElement>("rect.pg-cell");
        cells.forEach(cell => {
            const ids = (cell as unknown as { __pgSelectionIds?: ISelectionId[] }).__pgSelectionIds || [];
            if (!isActive) {
                cell.setAttribute("fill-opacity", "1");
                return;
            }
            const match = ids.some(id => selected.some(s => (s as unknown as { equals: (o: ISelectionId) => boolean }).equals(id)));
            cell.setAttribute("fill-opacity", match ? "1" : "0.35");
        });
    }

    public update(options: VisualUpdateOptions): void {
        this.events.renderingStarted(options);
        try {
            const dataView = options.dataViews && options.dataViews[0];
            this.settings = this.formattingSettingsService.populateFormattingSettingsModel(VisualSettings, dataView);
            this.render(dataView, options.viewport.width, options.viewport.height);
            this.events.renderingFinished(options);
        } catch (e) {
            this.events.renderingFailed(options, e instanceof Error ? e.message : String(e));
        }
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.settings);
    }

    private isHighContrast(): boolean {
        const cp = this.colorPalette as unknown as { isHighContrast?: boolean };
        return cp && cp.isHighContrast === true;
    }

    private currentScheme(): ColorScheme {
        const c = this.settings.colors;
        if (this.isHighContrast()) {
            const cp = this.colorPalette as unknown as {
                background?: { value: string };
                foreground?: { value: string };
                foregroundSelected?: { value: string };
            };
            const bg = cp.background?.value || "#000000";
            const fg = cp.foreground?.value || "#FFFFFF";
            const accent = cp.foregroundSelected?.value || fg;
            const count = Math.max(3, Math.min(9, Math.round(c.bucketCount.value)));
            return {
                background: bg,
                text: fg,
                empty: bg,
                buckets: buildScheme(
                    "custom",
                    count,
                    bg,
                    accent,
                    fg,
                    true,
                    bg,
                    bg,
                    fg
                ).buckets
            };
        }
        return buildScheme(
            c.scheme.value.value as any,
            c.bucketCount.value,
            c.customLow.value.value,
            c.customMid.value.value,
            c.customHigh.value.value,
            c.useCustomMid.value,
            c.emptyColor.value.value,
            c.backgroundColor.value.value,
            c.textColor.value.value
        );
    }

    private resolveBounds(data: RangeBounds): { min: number; max: number } {
        const s = this.settings.scale;
        return {
            min: s.useDataMin.value ? data.min : s.minValue.value,
            max: s.useDataMax.value ? data.max : s.maxValue.value
        };
    }

    private formatNumber(v: number): string {
        const d = this.settings.accessibility.decimalPlaces.value;
        const dp = Math.max(0, Math.min(6, Math.round(d)));
        return v.toFixed(dp);
    }

    private formatDate(d: Date): string {
        try {
            return new Intl.DateTimeFormat(this.locale, {
                year: "numeric", month: "long", day: "numeric"
            }).format(d);
        } catch {
            const months = ["January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December"];
            return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
        }
    }

    private localizedMonth(m: number): string {
        try {
            const d = new Date(2024, m, 1);
            return new Intl.DateTimeFormat(this.locale, { month: "short" }).format(d);
        } catch {
            return MONTH_LABELS[m];
        }
    }

    private render(dataView: powerbi.DataView | undefined, width: number, height: number): void {
        const scheme = this.currentScheme();
        while (this.root.firstChild) this.root.removeChild(this.root.firstChild);
        this.root.style.background = scheme.background;
        this.root.style.color = scheme.text;
        this.root.setAttribute("role", "region");
        this.root.setAttribute("aria-label", "PulseGrid calendar heatmap");

        const rows = extractRows(dataView, this.host);
        if (rows.length === 0) {
            this.renderEmptyState();
            return;
        }

        const aggType = this.settings.aggregation.aggregationType.value.value as AggregationType;
        const treatBlankAsZero = this.settings.aggregation.treatBlankAsZero.value;
        const cells = aggregate(rows, aggType, treatBlankAsZero);
        const bounds = dataBounds(cells);
        if (!bounds.hasData) {
            this.renderEmptyState();
            return;
        }
        const extent = dateExtent(cells);
        if (!extent) {
            this.renderEmptyState();
            return;
        }

        const scale = this.resolveBounds(bounds);
        const viewMode = this.settings.layout.viewMode.value.value as ViewMode;
        const startOfWeek = this.settings.layout.startOfWeek.value.value as StartOfWeek;

        if (this.settings.layout.showTitle.value) {
            const title = document.createElement("h2");
            title.className = "pg-title";
            title.textContent = this.settings.layout.titleText.value;
            this.root.appendChild(title);
        }

        const container = document.createElement("div");
        container.className = "pg-container";
        this.root.appendChild(container);

        const cellSize = Math.max(4, Math.min(40, Math.round(this.settings.layout.cellSize.value)));
        const cellGap = Math.max(0, Math.min(8, Math.round(this.settings.layout.cellGap.value)));
        const cellRadius = Math.max(0, Math.min(cellSize / 2, Math.round(this.settings.layout.cellRadius.value)));

        if (viewMode === "yearStrip") {
            this.renderYearStrip(container, cells, extent.start, extent.end, startOfWeek, scheme, scale, cellSize, cellGap, cellRadius);
        } else if (viewMode === "monthGrid") {
            this.renderMonthGrid(container, cells, extent.start, extent.end, startOfWeek, scheme, scale, cellSize, cellGap, cellRadius, width);
        } else {
            this.renderWeekStrip(container, cells, extent.start, extent.end, startOfWeek, scheme, scale, cellSize, cellGap, cellRadius);
        }

        if (this.settings.layout.showLegend.value) {
            this.renderLegend(container, scheme, scale);
        }

        void height;
    }

    private renderYearStrip(
        parent: HTMLElement,
        cells: Map<string, AggregatedCell>,
        start: Date, end: Date,
        startOfWeek: StartOfWeek,
        scheme: ColorScheme,
        scale: { min: number; max: number },
        cellSize: number, cellGap: number, cellRadius: number
    ): void {
        const layout = buildYearStripLayout(start, end, startOfWeek);
        const showDays = this.settings.layout.showDayLabels.value;
        const showMonths = this.settings.layout.showMonthLabels.value;
        const showYears = this.settings.layout.showYearLabels.value;

        const dayLabelWidth = showDays ? 28 : 0;
        const monthLabelHeight = showMonths ? 16 : 0;
        const yearLabelHeight = showYears ? 18 : 0;
        const w = dayLabelWidth + layout.columns * (cellSize + cellGap);
        const h = yearLabelHeight + monthLabelHeight + layout.rows * (cellSize + cellGap);

        const svg = this.createSvg(w, h);
        svg.setAttribute("role", "img");
        svg.setAttribute("aria-label", `Calendar heatmap from ${this.formatDate(start)} to ${this.formatDate(end)}`);

        if (showYears) {
            const yearText = start.getFullYear() === end.getFullYear()
                ? String(start.getFullYear())
                : `${start.getFullYear()} – ${end.getFullYear()}`;
            const text = document.createElementNS(SVG_NS, "text");
            text.setAttribute("x", String(dayLabelWidth));
            text.setAttribute("y", "12");
            text.setAttribute("class", "pg-year-label");
            text.setAttribute("fill", scheme.text);
            text.textContent = yearText;
            svg.appendChild(text);
        }

        if (showMonths) {
            for (const m of layout.monthBoundaries) {
                const text = document.createElementNS(SVG_NS, "text");
                text.setAttribute("x", String(dayLabelWidth + m.col * (cellSize + cellGap)));
                text.setAttribute("y", String(yearLabelHeight + 12));
                text.setAttribute("class", "pg-month-label");
                text.setAttribute("fill", scheme.text);
                text.textContent = this.localizedMonth(m.month);
                svg.appendChild(text);
            }
        }

        if (showDays) {
            const labels = dayLabels(startOfWeek);
            for (let r = 0; r < 7; r++) {
                if (r % 2 === 0) continue;
                const text = document.createElementNS(SVG_NS, "text");
                text.setAttribute("x", "2");
                text.setAttribute("y", String(yearLabelHeight + monthLabelHeight + r * (cellSize + cellGap) + cellSize - 2));
                text.setAttribute("class", "pg-day-label");
                text.setAttribute("fill", scheme.text);
                text.textContent = labels[r];
                svg.appendChild(text);
            }
        }

        for (const c of layout.cells) {
            const rect = this.makeCell(c, cells, dayLabelWidth, yearLabelHeight + monthLabelHeight, cellSize, cellGap, cellRadius, scheme, scale);
            svg.appendChild(rect);
        }

        parent.appendChild(svg);
    }

    private renderMonthGrid(
        parent: HTMLElement,
        cells: Map<string, AggregatedCell>,
        start: Date, end: Date,
        startOfWeek: StartOfWeek,
        scheme: ColorScheme,
        scale: { min: number; max: number },
        cellSize: number, cellGap: number, cellRadius: number,
        viewportWidth: number
    ): void {
        const layout = buildMonthGridLayout(start, end, startOfWeek);
        const grid = document.createElement("div");
        grid.className = "pg-month-grid";

        const monthBlockWidth = 7 * (cellSize + cellGap) + 14;
        const cols = Math.max(1, Math.floor((viewportWidth - 16) / (monthBlockWidth + 16)));
        grid.style.gridTemplateColumns = `repeat(${cols}, max-content)`;

        const labels = dayLabels(startOfWeek);
        const showDays = this.settings.layout.showDayLabels.value;

        for (const month of layout.months) {
            const block = document.createElement("div");
            block.className = "pg-month-block";
            const heading = document.createElement("div");
            heading.className = "pg-month-heading";
            heading.textContent = `${this.localizedMonth(month.month)} ${month.year}`;
            block.appendChild(heading);

            const headerRow = showDays ? 14 : 0;
            const w = 7 * (cellSize + cellGap);
            const h = headerRow + 6 * (cellSize + cellGap);
            const svg = this.createSvg(w, h);

            if (showDays) {
                for (let i = 0; i < 7; i++) {
                    const text = document.createElementNS(SVG_NS, "text");
                    text.setAttribute("x", String(i * (cellSize + cellGap) + cellSize / 2));
                    text.setAttribute("y", "10");
                    text.setAttribute("class", "pg-day-label-small");
                    text.setAttribute("text-anchor", "middle");
                    text.setAttribute("fill", scheme.text);
                    text.textContent = labels[i][0];
                    svg.appendChild(text);
                }
            }

            for (const c of month.cells) {
                const rect = this.makeCell({ ...c, col: c.row, row: c.col }, cells, 0, headerRow, cellSize, cellGap, cellRadius, scheme, scale);
                svg.appendChild(rect);
            }
            block.appendChild(svg);
            grid.appendChild(block);
        }
        parent.appendChild(grid);
    }

    private renderWeekStrip(
        parent: HTMLElement,
        cells: Map<string, AggregatedCell>,
        start: Date, end: Date,
        startOfWeek: StartOfWeek,
        scheme: ColorScheme,
        scale: { min: number; max: number },
        cellSize: number, cellGap: number, cellRadius: number
    ): void {
        const layout = buildWeekStripLayout(start, end, startOfWeek);
        const showDays = this.settings.layout.showDayLabels.value;
        const headerHeight = showDays ? 14 : 0;
        const w = 7 * (cellSize + cellGap);
        const h = headerHeight + layout.rows * (cellSize + cellGap);
        const svg = this.createSvg(w, h);

        if (showDays) {
            const labels = dayLabels(startOfWeek);
            for (let i = 0; i < 7; i++) {
                const text = document.createElementNS(SVG_NS, "text");
                text.setAttribute("x", String(i * (cellSize + cellGap) + cellSize / 2));
                text.setAttribute("y", "10");
                text.setAttribute("class", "pg-day-label-small");
                text.setAttribute("text-anchor", "middle");
                text.setAttribute("fill", scheme.text);
                text.textContent = labels[i][0];
                svg.appendChild(text);
            }
        }

        for (const c of layout.cells) {
            const rect = this.makeCell(c, cells, 0, headerHeight, cellSize, cellGap, cellRadius, scheme, scale);
            svg.appendChild(rect);
        }
        parent.appendChild(svg);
    }

    private makeCell(
        pos: CellPosition,
        cells: Map<string, AggregatedCell>,
        offsetX: number, offsetY: number,
        cellSize: number, cellGap: number, cellRadius: number,
        scheme: ColorScheme,
        scale: { min: number; max: number }
    ): SVGGElement {
        const cell = cells.get(pos.isoDate);
        const group = document.createElementNS(SVG_NS, "g") as SVGGElement;
        const x = offsetX + pos.col * (cellSize + cellGap);
        const y = offsetY + pos.row * (cellSize + cellGap);

        const rect = document.createElementNS(SVG_NS, "rect");
        rect.setAttribute("x", String(x));
        rect.setAttribute("y", String(y));
        rect.setAttribute("width", String(cellSize));
        rect.setAttribute("height", String(cellSize));
        if (cellRadius > 0) {
            rect.setAttribute("rx", String(cellRadius));
            rect.setAttribute("ry", String(cellRadius));
        }

        let fill = scheme.empty;
        let valueText = "";
        if (cell && cell.value != null && !isNaN(cell.value)) {
            const idx = bucketIndex(cell.value, scale.min, scale.max, scheme.buckets.length);
            fill = scheme.buckets[idx];
            valueText = this.formatNumber(cell.value);
        }
        rect.setAttribute("fill", fill);

        if (this.settings.accessibility.cellBorders.value) {
            rect.setAttribute("stroke", scheme.text);
            rect.setAttribute("stroke-opacity", "0.25");
            rect.setAttribute("stroke-width", "0.5");
        }

        rect.setAttribute("class", "pg-cell");
        rect.setAttribute("tabindex", "0");
        const labelText = cell && cell.value != null && !isNaN(cell.value)
            ? `${this.formatDate(pos.date)}: ${valueText}`
            : `${this.formatDate(pos.date)}: no data`;
        rect.setAttribute("role", "gridcell");
        rect.setAttribute("aria-label", labelText);

        if (cell && cell.selectionIds.length > 0) {
            (rect as unknown as { __pgSelectionIds: ISelectionId[] }).__pgSelectionIds = cell.selectionIds;
            rect.addEventListener("click", (event: MouseEvent) => {
                if (!this.allowInteractions) return;
                this.selectionManager.select(cell.selectionIds[0], event.ctrlKey || event.metaKey).then(() => {
                    this.applySelectionStyling();
                });
                event.stopPropagation();
            });
        }

        group.appendChild(rect);

        if (this.settings.accessibility.valueLabels.value && cell && cell.value != null && !isNaN(cell.value) && cellSize >= 18) {
            const text = document.createElementNS(SVG_NS, "text");
            text.setAttribute("x", String(x + cellSize / 2));
            text.setAttribute("y", String(y + cellSize / 2 + 3));
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("class", "pg-cell-value");
            text.setAttribute("fill", contrastingTextColor(fill));
            text.setAttribute("aria-hidden", "true");
            text.textContent = valueText;
            group.appendChild(text);
        }

        const onShow = (event: MouseEvent | FocusEvent) => {
            const target = event.target as Element;
            const bbox = (target as SVGGraphicsElement).getBoundingClientRect();
            const coordinates: [number, number] = [bbox.left + bbox.width / 2, bbox.top + bbox.height / 2];
            const items: powerbi.extensibility.VisualTooltipDataItem[] = [{
                displayName: this.formatDate(pos.date),
                value: cell && cell.value != null && !isNaN(cell.value) ? valueText : "No data"
            }];
            if (cell) {
                for (const t of cell.tooltipExtras) {
                    items.push({ displayName: t.name, value: t.value });
                }
            }
            this.tooltipService.show({
                coordinates,
                isTouchEvent: false,
                dataItems: items,
                identities: []
            });
        };
        const onHide = () => {
            this.tooltipService.hide({ immediately: false, isTouchEvent: false });
        };

        rect.addEventListener("mouseover", onShow);
        rect.addEventListener("mouseout", onHide);
        rect.addEventListener("focus", onShow);
        rect.addEventListener("blur", onHide);

        return group;
    }

    private renderLegend(parent: HTMLElement, scheme: ColorScheme, scale: { min: number; max: number }): void {
        const legend = document.createElement("div");
        legend.className = "pg-legend";
        legend.setAttribute("role", "group");
        legend.setAttribute("aria-label", "Heatmap colour legend");

        const labelLow = document.createElement("span");
        labelLow.className = "pg-legend-label";
        labelLow.textContent = this.formatNumber(scale.min);
        legend.appendChild(labelLow);

        const swatches = document.createElement("div");
        swatches.className = "pg-legend-swatches";
        for (const color of scheme.buckets) {
            const sw = document.createElement("span");
            sw.className = "pg-legend-swatch";
            sw.style.background = color;
            if (this.settings.accessibility.cellBorders.value) {
                sw.style.border = `1px solid ${scheme.text}`;
                sw.style.borderColor = scheme.text;
                sw.style.opacity = "0.85";
            }
            swatches.appendChild(sw);
        }
        legend.appendChild(swatches);

        const labelHigh = document.createElement("span");
        labelHigh.className = "pg-legend-label";
        labelHigh.textContent = this.formatNumber(scale.max);
        legend.appendChild(labelHigh);

        parent.appendChild(legend);
    }

    private createSvg(width: number, height: number): SVGSVGElement {
        const svg = document.createElementNS(SVG_NS, "svg") as SVGSVGElement;
        svg.setAttribute("width", String(width));
        svg.setAttribute("height", String(height));
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
        svg.setAttribute("class", "pg-svg");
        return svg;
    }

    private renderEmptyState(): void {
        const wrap = document.createElement("div");
        wrap.className = "pg-empty";
        wrap.setAttribute("role", "status");

        const h = document.createElement("h3");
        h.textContent = this.t("Visual_Title", "PulseGrid Calendar Heatmap");
        wrap.appendChild(h);

        const p = document.createElement("p");
        const dateBold = document.createElement("strong");
        dateBold.textContent = this.t("Field_Date", "Date");
        const valueBold = document.createElement("strong");
        valueBold.textContent = this.t("Field_Value", "Value");
        p.appendChild(document.createTextNode(this.t("Empty_Prefix", "Add a ")));
        p.appendChild(dateBold);
        p.appendChild(document.createTextNode(this.t("Empty_Middle", " field and a ")));
        p.appendChild(valueBold);
        p.appendChild(document.createTextNode(this.t("Empty_Suffix", " measure to begin. The chart will render one cell per day, coloured by the chosen scheme.")));
        wrap.appendChild(p);

        this.root.appendChild(wrap);
    }
}
