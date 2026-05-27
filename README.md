# PulseGrid — Calendar Heatmap

A Power BI custom visual that renders any date-keyed measure as a GitHub-style calendar heatmap. Choose from a year strip, a month grid, or a week strip; pick from six built-in colour schemes (including colour-blind safe **Viridis** and a **Diverging** scheme for variance data) or define your own; cells expose tooltips and keyboard navigation.

## Why it matters

Power BI ships no native calendar heatmap. The marketplace alternatives are either abandoned, locked to a single 53-week layout, or fail high-contrast and keyboard users. PulseGrid fixes all three: it's actively maintained, supports three layouts and seven bucket counts, and renders proper ARIA roles plus a forced-colors fallback so accessibility users get the same insight.

## Highlights

- **Three layouts** — year strip (weeks × days), 12-month grid, and rolling week strip.
- **Smart aggregation** — multiple rows on the same calendar day collapse via sum, avg, min, max, or count.
- **Seven colour schemes** — GitHub Green, Ocean Blue, Sunset, Plasma, Viridis (CVD-safe), Diverging, plus full Custom with optional mid-stop for diverging gradients.
- **Configurable bucket count** (3–9) for any audience preference.
- **Manual or auto scale bounds** — clip outliers without filtering the model.
- **Accessible** — keyboard focus on every cell, ARIA labels with the formatted date and value, `forced-colors: active` CSS, and an optional cell-border mode for low-contrast environments.
- **No external service calls** — runs entirely inside the Power BI sandbox; `privileges: []` and `externalJS: []`.

## Data fields

| Role     | Kind       | Required | Purpose                                                |
| -------- | ---------- | -------- | ------------------------------------------------------ |
| Date     | Grouping   | Yes      | The day each cell represents.                          |
| Value    | Measure    | Yes      | The intensity that drives the cell colour.             |
| Tooltips | Measure(s) | No       | Extra fields surfaced in the native Power BI tooltip.  |

## Format pane

- **Layout** — view mode, start of week, cell size / gap / radius, labels, title.
- **Aggregation** — same-day collapse (sum/avg/min/max/count) and blank handling.
- **Colours** — scheme, bucket count, custom stops, mid-stop toggle, empty colour, canvas colours.
- **Scale** — auto vs manual bounds.
- **Accessibility** — cell borders, value labels inside cells, decimal places.

## Quick example

```DAX
DailyOrders = CALCULATE(COUNTROWS('Sales'), USERELATIONSHIP('Sales'[OrderDate], 'Calendar'[Date]))
```

Drop `Calendar[Date]` into the **Date** well and `[DailyOrders]` into **Value**. Switch the colour scheme to *Diverging* if you'd rather show variance vs a baseline (set manual min/max to symmetrical bounds around zero).

## Quick install (no build required)

Grab the latest `.pbiviz` from [`release/`](release/) and import it in Power BI Desktop via **Visualizations → … → Import a visual from a file**. See [`release/README.md`](release/README.md) for screenshots and tenant-policy notes.

## Development setup

```powershell
npm install
npm install -g powerbi-visuals-tools
pbiviz --create-cert
pbiviz start
pbiviz package
```

## Test plan

- Empty data (no rows, no Date field).
- One year of daily data, dense.
- Sparse data with multi-year extent.
- Multiple rows per day exercising every aggregation type.
- Treat-blank-as-zero on/off.
- Each view mode at small (300×200), medium (700×400), and large (1200×600) viewports.
- Each colour scheme + custom scheme with mid-stop.
- Manual min/max set to clip outliers.
- High-contrast Windows mode.
- Tab through every cell using the keyboard; verify aria-label is read by NVDA.
- Tooltips on hover and on focus.

## AppSource readiness

See [docs/APP_SOURCE_CHECKLIST.md](docs/APP_SOURCE_CHECKLIST.md). Highlights: API 5.11, strict TypeScript, no external JS, no network privileges, ≥1 keyboard-focusable role, accessible empty state, MIT licensed.

## Roadmap

- Per-cell drill-through actions.
- Streak / sparkline summary above the grid.
- Localised month and day names via the Power BI locale.
- Export grid as PNG via host download service.

## Contributing

Fork, branch, PR. Please attach a screenshot for visual changes. By contributing you license your work under MIT.

## Author

Syed Hussnain Tahir Sherazi — Associate Data Engineer, Leicester, UK.
[www.syedhussnain.com](https://www.syedhussnain.com) · [LinkedIn](https://uk.linkedin.com/in/hussnainsherazi) · contact@syedhussnain.co.uk

## License

MIT — see [LICENSE](LICENSE).
