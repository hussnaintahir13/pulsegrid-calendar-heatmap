import powerbi from "powerbi-visuals-api";
import ISelectionId = powerbi.visuals.ISelectionId;

export type ViewMode = "yearStrip" | "monthGrid" | "weekStrip";
export type StartOfWeek = "sun" | "mon";
export type AggregationType = "sum" | "avg" | "min" | "max" | "count";
export type SchemeName =
    | "githubGreen"
    | "oceanBlue"
    | "sunset"
    | "plasma"
    | "viridis"
    | "diverging"
    | "custom";

export interface DateRow {
    date: Date;
    value: number;
    tooltipExtras: { name: string; value: string }[];
    selectionId: ISelectionId | null;
}

export interface AggregatedCell {
    isoDate: string;
    date: Date;
    value: number | null;
    tooltipExtras: { name: string; value: string }[];
    selectionIds: ISelectionId[];
}

export interface ColorScheme {
    background: string;
    text: string;
    empty: string;
    buckets: string[];
}

export interface RangeBounds {
    min: number;
    max: number;
    hasData: boolean;
}
