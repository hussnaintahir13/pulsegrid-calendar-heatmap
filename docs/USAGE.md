# Using PulseGrid

## 1. Add the visual

Import `pulseGridCalendarHeatmap.pbiviz` via *Visualizations → … → Import a visual from a file* (or install from AppSource once certified).

## 2. Drop fields

| Well     | What to put there                                                  |
| -------- | ------------------------------------------------------------------ |
| Date     | A `Date` column from your calendar/dim table (not a date hierarchy)|
| Value    | The measure you want to colour by                                  |
| Tooltips | Any extra measures or columns to surface in the tooltip            |

If you drop a date *hierarchy* by accident, right-click the field in the well and pick the underlying date column.

## 3. Pick a layout

- **Year strip** — recommended default. Reads exactly like GitHub contributions.
- **Month grid** — best when the report consumer is going to look up specific dates.
- **Week strip** — best for small dashboard tiles (≤ 300 px wide).

## 4. Choose colours

- For *count*-style measures (e.g. number of orders), use **GitHub Green** or **Ocean Blue**.
- For *variance vs target*, use **Diverging** and set manual min/max symmetrically around zero in the *Scale* card.
- For accessibility-first reporting, use **Viridis**. It is perceptually uniform and colour-blind safe.

## 5. Tame scale outliers

The *Scale* card lets you turn off "Use data minimum / maximum" and set explicit bounds. Useful when a single outlier flattens the rest of the gradient. Values outside the bounds clip to the lowest / highest bucket.

## 6. Same-day collisions

If your model returns multiple rows per day (e.g. one row per transaction), the *Aggregation* card decides what to show:

- **Sum** is the default. Use it for totals.
- **Average** for rates.
- **Max / Min** for SLA breach exposure or worst-case views.
- **Count** ignores the value entirely and just counts rows.

## 7. Accessibility

Tab into the visual. Each cell receives focus and announces a date and value. For Windows high-contrast users, the *forced-colors* CSS rule kicks in automatically; enable **Cell borders** in the *Accessibility* card for additional reinforcement in non-high-contrast tenants.

## Troubleshooting

| Symptom                        | Likely cause                                                     |
| ------------------------------ | ---------------------------------------------------------------- |
| Empty state shown              | No rows survived the Date conversion. Check the field is a date.|
| Whole grid the same colour     | Single-value data. Adjust manual scale bounds.                  |
| Months collide in year strip   | Viewport too narrow. Reduce cell size or switch to month grid.  |
| High-contrast cells look the same | Enable **Cell borders** in the Accessibility card.           |
