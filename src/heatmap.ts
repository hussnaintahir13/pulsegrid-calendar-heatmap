import { AggregatedCell, StartOfWeek } from "./types";

export interface CellPosition {
    isoDate: string;
    col: number;
    row: number;
    date: Date;
}

export interface YearStripLayout {
    columns: number;
    rows: number;
    cells: CellPosition[];
    monthBoundaries: { col: number; month: number }[];
}

const dayOfWeekIndex = (date: Date, startOfWeek: StartOfWeek): number => {
    const day = date.getDay();
    return startOfWeek === "mon" ? (day === 0 ? 6 : day - 1) : day;
};

const addDays = (d: Date, n: number): Date => {
    const nd = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    nd.setDate(nd.getDate() + n);
    return nd;
};

const isoDay = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

export function buildYearStripLayout(start: Date, end: Date, startOfWeek: StartOfWeek): YearStripLayout {
    const startCursor = addDays(start, -dayOfWeekIndex(start, startOfWeek));
    const endCursor = addDays(end, 6 - dayOfWeekIndex(end, startOfWeek));
    const cells: CellPosition[] = [];
    const monthBoundaries: { col: number; month: number }[] = [];
    let lastMonth = -1;
    let cursor = startCursor;
    let col = 0;
    while (cursor <= endCursor) {
        const row = dayOfWeekIndex(cursor, startOfWeek);
        cells.push({ isoDate: isoDay(cursor), col, row, date: cursor });
        if (row === 6) col++;
        if (cursor.getDate() === 1 || (col === 0 && row === 0 && cells.length === 1)) {
            const m = cursor.getMonth();
            if (m !== lastMonth) {
                monthBoundaries.push({ col, month: m });
                lastMonth = m;
            }
        }
        cursor = addDays(cursor, 1);
    }
    return {
        columns: col + (cells.length && cells[cells.length - 1].row !== 6 ? 1 : 0),
        rows: 7,
        cells,
        monthBoundaries
    };
}

export interface MonthGridLayout {
    months: {
        year: number;
        month: number;
        cells: CellPosition[];
        columns: number;
    }[];
}

export function buildMonthGridLayout(start: Date, end: Date, startOfWeek: StartOfWeek): MonthGridLayout {
    const months: MonthGridLayout["months"] = [];
    const firstMonth = new Date(start.getFullYear(), start.getMonth(), 1);
    const lastMonth = new Date(end.getFullYear(), end.getMonth(), 1);
    let cursor = firstMonth;
    while (cursor <= lastMonth) {
        const y = cursor.getFullYear();
        const m = cursor.getMonth();
        const firstDay = new Date(y, m, 1);
        const daysInMonth = new Date(y, m + 1, 0).getDate();
        const offset = dayOfWeekIndex(firstDay, startOfWeek);
        const cells: CellPosition[] = [];
        for (let i = 0; i < daysInMonth; i++) {
            const d = new Date(y, m, 1 + i);
            const idx = offset + i;
            cells.push({
                isoDate: isoDay(d),
                col: Math.floor(idx / 7),
                row: idx % 7,
                date: d
            });
        }
        const cols = Math.ceil((offset + daysInMonth) / 7);
        months.push({ year: y, month: m, cells, columns: cols });
        cursor = new Date(y, m + 1, 1);
    }
    return { months };
}

export function buildWeekStripLayout(start: Date, end: Date, startOfWeek: StartOfWeek): { cells: CellPosition[]; columns: number; rows: number } {
    const startCursor = addDays(start, -dayOfWeekIndex(start, startOfWeek));
    const endCursor = addDays(end, 6 - dayOfWeekIndex(end, startOfWeek));
    const cells: CellPosition[] = [];
    let cursor = startCursor;
    let weekIndex = 0;
    while (cursor <= endCursor) {
        const row = weekIndex;
        const col = dayOfWeekIndex(cursor, startOfWeek);
        cells.push({ isoDate: isoDay(cursor), col, row, date: cursor });
        if (col === 6) weekIndex++;
        cursor = addDays(cursor, 1);
    }
    return { cells, columns: 7, rows: weekIndex + (cells.length && cells[cells.length - 1].col !== 6 ? 1 : 0) };
}

export function dayLabels(startOfWeek: StartOfWeek): string[] {
    return startOfWeek === "mon"
        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
}

export const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function lookupCellValue(map: Map<string, AggregatedCell>, isoDate: string): AggregatedCell | undefined {
    return map.get(isoDate);
}
