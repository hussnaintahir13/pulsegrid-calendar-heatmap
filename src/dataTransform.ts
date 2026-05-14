import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;
import DataViewValueColumn = powerbi.DataViewValueColumn;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;

import { AggregatedCell, AggregationType, DateRow, RangeBounds } from "./types";

const toDate = (v: powerbi.PrimitiveValue | undefined | null): Date | null => {
    if (v == null) return null;
    if (v instanceof Date) {
        return isFinite(v.getTime()) ? new Date(v.getFullYear(), v.getMonth(), v.getDate()) : null;
    }
    if (typeof v === "string" || typeof v === "number") {
        const d = new Date(v);
        return isFinite(d.getTime()) ? new Date(d.getFullYear(), d.getMonth(), d.getDate()) : null;
    }
    return null;
};

const toNumber = (v: powerbi.PrimitiveValue | undefined | null): number | null => {
    if (v == null) return null;
    const n = Number(v);
    return isFinite(n) ? n : null;
};

const isoDay = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

const formatExtra = (col: DataViewValueColumn, v: powerbi.PrimitiveValue | undefined | null): string => {
    if (v == null) return "";
    if (typeof v === "number" && col.source.format) {
        return String(v);
    }
    if (v instanceof Date) return v.toISOString().slice(0, 10);
    return String(v);
};

export function extractRows(dataView: DataView | undefined, host?: IVisualHost): DateRow[] {
    const out: DateRow[] = [];
    if (!dataView || !dataView.categorical) return out;
    const cat = dataView.categorical;
    if (!cat.categories || cat.categories.length === 0) return out;

    const dateCol = cat.categories.find(c => c.source.roles && c.source.roles.date);
    if (!dateCol) return out;

    let valueCol: DataViewValueColumn | undefined;
    const tooltipCols: DataViewValueColumn[] = [];
    if (cat.values) {
        for (const vc of cat.values as DataViewValueColumn[]) {
            const roles = vc.source.roles || {};
            if (roles.value && !valueCol) valueCol = vc;
            else if (roles.tooltips) tooltipCols.push(vc);
        }
    }

    const len = dateCol.values.length;
    const hasHighlights = !!(valueCol && valueCol.highlights);
    for (let i = 0; i < len; i++) {
        const d = toDate(dateCol.values[i]);
        if (!d) continue;
        let v: number | null;
        if (valueCol) {
            v = hasHighlights ? toNumber(valueCol.highlights![i]) : toNumber(valueCol.values[i]);
        } else {
            v = 1;
        }
        if (v == null && (!valueCol)) continue;
        const extras: { name: string; value: string }[] = [];
        for (const tc of tooltipCols) {
            extras.push({
                name: tc.source.displayName,
                value: formatExtra(tc, tc.values[i])
            });
        }
        const selectionId = host
            ? host.createSelectionIdBuilder().withCategory(dateCol, i).createSelectionId()
            : null;
        out.push({ date: d, value: v == null ? NaN : v, tooltipExtras: extras, selectionId });
    }
    return out;
}

export function aggregate(rows: DateRow[], aggType: AggregationType, treatBlankAsZero: boolean): Map<string, AggregatedCell> {
    const map = new Map<string, AggregatedCell>();
    const counts = new Map<string, number>();

    for (const r of rows) {
        const key = isoDay(r.date);
        const blank = isNaN(r.value);
        const v = blank ? (treatBlankAsZero ? 0 : NaN) : r.value;
        const existing = map.get(key);
        if (!existing) {
            map.set(key, {
                isoDate: key,
                date: r.date,
                value: blank && !treatBlankAsZero ? null : v,
                tooltipExtras: r.tooltipExtras,
                selectionIds: r.selectionId ? [r.selectionId] : []
            });
            counts.set(key, blank && !treatBlankAsZero ? 0 : 1);
            continue;
        }
        if (r.selectionId) existing.selectionIds.push(r.selectionId);
        const prev = existing.value;
        const count = counts.get(key) || 0;
        if (isNaN(v)) {
            counts.set(key, count);
            continue;
        }
        if (prev == null) {
            existing.value = v;
            counts.set(key, 1);
        } else {
            switch (aggType) {
                case "sum": existing.value = prev + v; break;
                case "avg": existing.value = (prev * count + v) / (count + 1); break;
                case "min": existing.value = Math.min(prev, v); break;
                case "max": existing.value = Math.max(prev, v); break;
                case "count": existing.value = count + 1; break;
            }
            counts.set(key, count + 1);
        }
        if (r.tooltipExtras.length > existing.tooltipExtras.length) {
            existing.tooltipExtras = r.tooltipExtras;
        }
    }
    return map;
}

export function dataBounds(cells: Map<string, AggregatedCell>): RangeBounds {
    let min = Infinity;
    let max = -Infinity;
    let hasData = false;
    cells.forEach(c => {
        if (c.value == null || isNaN(c.value)) return;
        hasData = true;
        if (c.value < min) min = c.value;
        if (c.value > max) max = c.value;
    });
    if (!hasData) return { min: 0, max: 1, hasData: false };
    if (min === max) max = min + 1;
    return { min, max, hasData: true };
}

export function dateExtent(cells: Map<string, AggregatedCell>): { start: Date; end: Date } | null {
    let start: Date | null = null;
    let end: Date | null = null;
    cells.forEach(c => {
        if (!start || c.date < start) start = c.date;
        if (!end || c.date > end) end = c.date;
    });
    if (!start || !end) return null;
    return { start, end };
}
