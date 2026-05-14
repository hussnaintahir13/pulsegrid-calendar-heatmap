# Choosing a colour scheme

| Scheme        | Best for                                          | CVD safe? | Notes                                              |
| ------------- | ------------------------------------------------- | --------- | -------------------------------------------------- |
| GitHub Green  | Activity / contribution density                   | Partial   | Familiar — most users recognise this immediately.  |
| Ocean Blue    | Volume of records, page views, web sessions       | Yes       | Calm, neutral; good for executive dashboards.      |
| Sunset        | Risk or temperature-style intensity               | No        | Diverging-feeling but technically sequential.      |
| Plasma        | High dynamic range, scientific data               | Mostly    | Pink → violet; visually striking.                  |
| **Viridis**   | **Anywhere accessibility matters**                | **Yes**   | Perceptually uniform; safe for all CVD types.      |
| Diverging     | Variance vs target, year-on-year change           | Yes       | Pair with symmetrical manual scale bounds.         |
| Custom        | Brand-aligned dashboards                          | Depends   | Toggle "Use mid-stop colour" for variance.         |

## Bucket count guidance

- **3 buckets** — quick scanning, three-state heuristic.
- **5 buckets** — default. Matches the GitHub original.
- **7 buckets** — adds granularity without overwhelming.
- **9 buckets** — only for high-density data where users will zoom in.

## Working with variance

For *actual − target* or *year-on-year delta*:

1. Pick the **Diverging** scheme.
2. In the *Scale* card, turn off "Use data minimum / maximum".
3. Set `minValue = -abs(max)` and `maxValue = abs(max)` so zero lands on the mid stop.
4. Optionally pick the **Custom** scheme with explicit brand stops and enable "Use mid-stop colour" to anchor zero.
