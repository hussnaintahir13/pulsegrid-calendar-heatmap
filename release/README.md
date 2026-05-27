# Release — plug-and-play

This folder contains the latest **signed-by-build** `.pbiviz` for PulseGrid Calendar Heatmap. Download the file and import it into Power BI Desktop — no Node, no `pbiviz` CLI required.

## How to install in Power BI Desktop

1. Download `pulseGridCalendarHeatmap*.pbiviz` from this folder (use the **Download raw file** button in GitHub).
2. In Power BI Desktop, open the report you want to add the visual to.
3. In the **Visualizations** pane, click the **…** (More options) at the bottom of the icon grid → **Import a visual from a file**.
4. Click **OK** to the safety warning, browse to the downloaded `.pbiviz`, and pick it.
5. The PulseGrid icon now appears at the bottom of the Visualizations pane. Drag it onto the canvas, then bind a **Date** field and a **Value** measure.

## How to install in the Power BI Service

1. Same download.
2. In the Power BI Service (powerbi.com), open the workspace → **Settings → Organisational visuals** (admin) **or** open a report in Edit mode → Visualizations → **…** → **Import a visual from a file**.
3. Choose the `.pbiviz`.

## Tenant policy

Some tenants block uncertified custom visuals. If the import fails with a policy error, ask your Power BI admin to add this visual to the **organisation visuals** list — that gives it tenant-wide approval without going through AppSource certification.

## Verifying the file

The filename embeds the visual's GUID and version:

```
pulseGridCalendarHeatmapC4A7E193B82F45D6A18E3F0C9D2B6481.<version>.pbiviz
```

If the version in the filename differs from the version on the [Releases page](https://github.com/hussnaintahir13/pulsegrid-calendar-heatmap/releases), you may be looking at an older snapshot. Pull `main` and re-download.
