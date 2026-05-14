import { ColorScheme, SchemeName } from "./types";

interface Rgb { r: number; g: number; b: number; }

const hexToRgb = (hex: string): Rgb => {
    let h = hex.replace("#", "");
    if (h.length === 3) h = h.split("").map(c => c + c).join("");
    const num = parseInt(h, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
};

const rgbToHex = (c: Rgb): string => {
    const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
    return `#${toHex(c.r)}${toHex(c.g)}${toHex(c.b)}`;
};

const mix = (a: Rgb, b: Rgb, t: number): Rgb => ({
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t
});

interface PaletteDef { low: string; mid?: string; high: string; }

const PALETTES: Record<Exclude<SchemeName, "custom">, PaletteDef> = {
    githubGreen: { low: "#EBEDF0", high: "#216E39" },
    oceanBlue:   { low: "#EAF2F8", high: "#1B4F72" },
    sunset:      { low: "#FFF3E0", mid: "#FB923C", high: "#7C2D12" },
    plasma:      { low: "#FDE2E4", mid: "#C026D3", high: "#3B0764" },
    viridis:     { low: "#FDE725", mid: "#21908C", high: "#440154" },
    diverging:   { low: "#B2182B", mid: "#F7F7F7", high: "#2166AC" }
};

function buildBuckets(low: string, high: string, count: number, mid?: string): string[] {
    const a = hexToRgb(low);
    const b = hexToRgb(high);
    const result: string[] = [];
    if (mid) {
        const m = hexToRgb(mid);
        const half = Math.floor(count / 2);
        for (let i = 0; i < count; i++) {
            const t = i / Math.max(1, count - 1);
            let c: Rgb;
            if (t <= 0.5) {
                c = mix(a, m, t / 0.5);
            } else {
                c = mix(m, b, (t - 0.5) / 0.5);
            }
            result.push(rgbToHex(c));
            void half;
        }
    } else {
        for (let i = 0; i < count; i++) {
            const t = i / Math.max(1, count - 1);
            result.push(rgbToHex(mix(a, b, t)));
        }
    }
    return result;
}

export function buildScheme(
    name: SchemeName,
    bucketCount: number,
    customLow: string,
    customMid: string,
    customHigh: string,
    useCustomMid: boolean,
    emptyColor: string,
    background: string,
    text: string
): ColorScheme {
    const count = Math.max(3, Math.min(9, Math.round(bucketCount)));
    let buckets: string[];
    if (name === "custom") {
        buckets = buildBuckets(customLow, customHigh, count, useCustomMid ? customMid : undefined);
    } else {
        const def = PALETTES[name];
        buckets = buildBuckets(def.low, def.high, count, def.mid);
    }
    return { background, text, empty: emptyColor, buckets };
}

export function bucketIndex(value: number, min: number, max: number, n: number): number {
    if (max <= min) return 0;
    const t = (value - min) / (max - min);
    const idx = Math.floor(t * n);
    if (idx < 0) return 0;
    if (idx >= n) return n - 1;
    return idx;
}

export function contrastingTextColor(bg: string): string {
    const { r, g, b } = hexToRgb(bg);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? "#1A1A1A" : "#FFFFFF";
}
