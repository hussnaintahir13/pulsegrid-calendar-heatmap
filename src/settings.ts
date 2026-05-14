import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsModel = formattingSettings.Model;
import FormattingSettingsSlice = formattingSettings.Slice;

class LayoutCard extends FormattingSettingsCard {
    name = "layout";
    displayName = "Layout";

    viewMode = new formattingSettings.ItemDropdown({
        name: "viewMode",
        displayName: "View mode",
        items: [
            { value: "yearStrip", displayName: "Year strip (GitHub style)" },
            { value: "monthGrid", displayName: "Month grid" },
            { value: "weekStrip", displayName: "Week strip" }
        ],
        value: { value: "yearStrip", displayName: "Year strip (GitHub style)" }
    });

    startOfWeek = new formattingSettings.ItemDropdown({
        name: "startOfWeek",
        displayName: "Start of week",
        items: [
            { value: "sun", displayName: "Sunday" },
            { value: "mon", displayName: "Monday" }
        ],
        value: { value: "mon", displayName: "Monday" }
    });

    cellSize = new formattingSettings.NumUpDown({ name: "cellSize", displayName: "Cell size (px)", value: 13 });
    cellGap = new formattingSettings.NumUpDown({ name: "cellGap", displayName: "Cell gap (px)", value: 2 });
    cellRadius = new formattingSettings.NumUpDown({ name: "cellRadius", displayName: "Cell corner radius (px)", value: 2 });
    showMonthLabels = new formattingSettings.ToggleSwitch({ name: "showMonthLabels", displayName: "Show month labels", value: true });
    showDayLabels = new formattingSettings.ToggleSwitch({ name: "showDayLabels", displayName: "Show day-of-week labels", value: true });
    showYearLabels = new formattingSettings.ToggleSwitch({ name: "showYearLabels", displayName: "Show year labels", value: true });
    showLegend = new formattingSettings.ToggleSwitch({ name: "showLegend", displayName: "Show legend", value: true });
    showTitle = new formattingSettings.ToggleSwitch({ name: "showTitle", displayName: "Show title", value: false });
    titleText = new formattingSettings.TextInput({ name: "titleText", displayName: "Title", value: "Activity", placeholder: "Activity" });

    slices: FormattingSettingsSlice[] = [
        this.viewMode, this.startOfWeek, this.cellSize, this.cellGap, this.cellRadius,
        this.showMonthLabels, this.showDayLabels, this.showYearLabels, this.showLegend,
        this.showTitle, this.titleText
    ];
}

class AggregationCard extends FormattingSettingsCard {
    name = "aggregation";
    displayName = "Aggregation";

    aggregationType = new formattingSettings.ItemDropdown({
        name: "aggregationType",
        displayName: "Aggregate same-day values",
        items: [
            { value: "sum", displayName: "Sum" },
            { value: "avg", displayName: "Average" },
            { value: "min", displayName: "Min" },
            { value: "max", displayName: "Max" },
            { value: "count", displayName: "Count" }
        ],
        value: { value: "sum", displayName: "Sum" }
    });

    treatBlankAsZero = new formattingSettings.ToggleSwitch({ name: "treatBlankAsZero", displayName: "Treat blank as zero", value: false });

    slices: FormattingSettingsSlice[] = [this.aggregationType, this.treatBlankAsZero];
}

class ColorsCard extends FormattingSettingsCard {
    name = "colors";
    displayName = "Colours";

    scheme = new formattingSettings.ItemDropdown({
        name: "scheme",
        displayName: "Colour scheme",
        items: [
            { value: "githubGreen", displayName: "GitHub Green" },
            { value: "oceanBlue", displayName: "Ocean Blue" },
            { value: "sunset", displayName: "Sunset" },
            { value: "plasma", displayName: "Plasma" },
            { value: "viridis", displayName: "Viridis (colour-blind safe)" },
            { value: "diverging", displayName: "Diverging (red → white → blue)" },
            { value: "custom", displayName: "Custom" }
        ],
        value: { value: "githubGreen", displayName: "GitHub Green" }
    });

    bucketCount = new formattingSettings.NumUpDown({ name: "bucketCount", displayName: "Bucket count (3–9)", value: 5 });
    useCustomMid = new formattingSettings.ToggleSwitch({ name: "useCustomMid", displayName: "Use mid-stop colour", value: false });
    customLow = new formattingSettings.ColorPicker({ name: "customLow", displayName: "Custom low", value: { value: "#EBEDF0" } });
    customMid = new formattingSettings.ColorPicker({ name: "customMid", displayName: "Custom mid", value: { value: "#FFFBEB" } });
    customHigh = new formattingSettings.ColorPicker({ name: "customHigh", displayName: "Custom high", value: { value: "#216E39" } });
    emptyColor = new formattingSettings.ColorPicker({ name: "emptyColor", displayName: "Empty / no-data cell", value: { value: "#EBEDF0" } });
    backgroundColor = new formattingSettings.ColorPicker({ name: "backgroundColor", displayName: "Background", value: { value: "#FFFFFF" } });
    textColor = new formattingSettings.ColorPicker({ name: "textColor", displayName: "Text", value: { value: "#252423" } });

    slices: FormattingSettingsSlice[] = [
        this.scheme, this.bucketCount, this.useCustomMid,
        this.customLow, this.customMid, this.customHigh,
        this.emptyColor, this.backgroundColor, this.textColor
    ];
}

class ScaleCard extends FormattingSettingsCard {
    name = "scale";
    displayName = "Scale";

    useDataMin = new formattingSettings.ToggleSwitch({ name: "useDataMin", displayName: "Use data minimum", value: true });
    useDataMax = new formattingSettings.ToggleSwitch({ name: "useDataMax", displayName: "Use data maximum", value: true });
    minValue = new formattingSettings.NumUpDown({ name: "minValue", displayName: "Manual minimum", value: 0 });
    maxValue = new formattingSettings.NumUpDown({ name: "maxValue", displayName: "Manual maximum", value: 100 });

    slices: FormattingSettingsSlice[] = [this.useDataMin, this.useDataMax, this.minValue, this.maxValue];
}

class AccessibilityCard extends FormattingSettingsCard {
    name = "accessibility";
    displayName = "Accessibility";

    cellBorders = new formattingSettings.ToggleSwitch({ name: "cellBorders", displayName: "Cell borders (high-contrast aid)", value: false });
    valueLabels = new formattingSettings.ToggleSwitch({ name: "valueLabels", displayName: "Show value inside cells", value: false });
    decimalPlaces = new formattingSettings.NumUpDown({ name: "decimalPlaces", displayName: "Decimal places", value: 0 });

    slices: FormattingSettingsSlice[] = [this.cellBorders, this.valueLabels, this.decimalPlaces];
}

export class VisualSettings extends FormattingSettingsModel {
    layout = new LayoutCard();
    aggregation = new AggregationCard();
    colors = new ColorsCard();
    scale = new ScaleCard();
    accessibility = new AccessibilityCard();
    cards = [this.layout, this.aggregation, this.colors, this.scale, this.accessibility];
}
