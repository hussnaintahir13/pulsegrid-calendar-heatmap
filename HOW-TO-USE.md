# PulseGrid Calendar Heatmap — Simple Guide

## What this visual does

This visual shows your numbers on a calendar. Each day is a small colored square. The darker or stronger the color, the bigger the number for that day. It looks like the green activity grid on GitHub, so you can spot busy days and quiet days at a glance.

## What data you need

- **Date** (required) — a real date field. This tells the visual which day each square stands for.
- **Value** (required) — the number you want to see. This sets the color of each day's square.
- **Tooltips** (optional) — any extra fields you want to show in the little pop-up box when you hover over a day.

## How to add it to your report (step by step)

1. Open Power BI Desktop and open or create a report.
2. In the **Visualizations** pane, click the **•••** (more options) button.
3. Choose **Import a visual from a file**.
4. If a warning about custom visuals appears, click **Import**.
5. Pick the file **dist\pulseGridCalendarHeatmapC4A7E193B82F45D6A18E3F0C9D2B6481.1.0.0.0.pbiviz** and open it.
6. Click the new icon in the Visualizations pane to add the visual to the page.
7. Select the visual, then drag your fields into the wells listed above.

## Buttons & options you can change

Click the visual, then open the **Format** pane (the paint roller icon) to find these groups:

**Layout**
- **View mode** — pick how the calendar is shaped: **Year strip (GitHub style)**, **Month grid**, or **Week strip**.
- **Start of week** — choose **Sunday** or **Monday** as the first day.
- **Cell size, gap, and corner radius** — make the squares bigger, smaller, more spaced out, or more rounded.
- **Labels** — turn month, day-of-week, and year labels on or off.
- **Show legend** — show or hide the color key.
- **Show title** and **Title** — add a heading above the calendar and type its text.

**Aggregation**
- **Aggregate same-day values** — if a day has more than one number, combine them by **Sum**, **Average**, **Min**, **Max**, or **Count**.
- **Treat blank as zero** — count empty days as zero instead of leaving them blank.

**Colours**
- **Colour scheme** — pick a color set: **GitHub Green**, **Ocean Blue**, **Sunset**, **Plasma**, **Viridis (colour-blind safe)**, **Diverging (red → white → blue)**, or **Custom**.
- **Bucket count (3–9)** — choose how many color shades to use.
- **Custom colors** — when you pick **Custom**, set your own low, mid, and high colors (turn on the mid-stop if you want a middle color).
- **Empty / no-data cell, Background, and Text** — set the colors for blank days, the background, and the text.

**Scale**
- **Use data minimum** and **Use data maximum** — let the visual set the color range from your data automatically.
- **Manual minimum** and **Manual maximum** — turn the auto options off to set your own range. This is handy for ignoring extreme outliers.

**Accessibility**
- **Cell borders** — add outlines around squares for easier viewing in high-contrast mode.
- **Show value inside cells** — print the number on each square.
- **Decimal places** — choose how many decimals those numbers show.

## If it looks empty or wrong

- Make sure you put a real **Date** field in the Date well. Plain text dates will not work.
- Make sure the **Value** well has a number field in it.
- Check your report filters. If a filter hides the dates, the calendar will look blank.
- If colors look flat, try the **Scale** options or pick a different **Bucket count** so the shades stand out.
