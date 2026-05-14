# AppSource Submission Checklist

## Packaging
- [x] Power BI Visuals API `5.11.0` declared in `pbiviz.json`.
- [x] Strict TypeScript (`strict: true`, `noImplicitAny`, `strictNullChecks`).
- [x] Unique GUID in `pbiviz.json` (`pulseGridCalendarHeatmapC4A7E193B82F45D6A18E3F0C9D2B6481`).
- [x] Versions aligned across `package.json`, `pbiviz.json`, `CHANGELOG.md`, and any release tag.
- [ ] `pbiviz package` builds cleanly (verified before submission).
- [ ] `assets/icon.png` is 300×300, transparent (add file before packaging).

## Sample content
- [ ] Sample `.pbix` demonstrating year strip, month grid, and week strip.
- [ ] Sample CSV of daily values for the public demo (no PII).

## Documentation
- [x] Public README (this repo).
- [x] CHANGELOG.
- [x] USAGE guide.
- [ ] Privacy policy URL (recommend `https://www.syedhussnain.com/privacy`).
- [x] Support URL — GitHub Issues.
- [ ] Terms of use URL.

## Listing assets
- [ ] ≥3 screenshots at 1280×720 with no PII (year strip, month grid, accessible mode).
- [x] Short description (`DESCRIPTION.md`).
- [x] Long description (`DESCRIPTION.md`).
- [ ] Square logos (300×300 and 48×48).

## Functional test cases
- [x] Empty data → friendly empty state.
- [x] Aggregation paths: sum, avg, min, max, count.
- [x] Treat-blank-as-zero on and off.
- [x] All seven colour schemes including custom mid-stop.
- [x] Auto vs manual scale bounds, including bounds that clip outliers.
- [x] All three view modes.
- [x] Compact viewport (≤300 px wide).
- [x] Year-crossing data (multi-year extent).

## Accessibility
- [x] `supportsKeyboardFocus: true` in `capabilities.json`.
- [x] Each cell has `tabindex="0"`, `role="gridcell"`, and an aria-label including date + value.
- [x] Status conveyed by colour **and** the aria-label text, not colour alone.
- [x] `forced-colors: active` CSS for Windows high-contrast.
- [x] Optional cell-border mode for low-contrast environments.
- [x] Empty state uses `role="status"`.
- [x] Includes Viridis colour scheme for CVD users.

## Security & privacy
- [x] `externalJS: []` — no third-party JS at runtime.
- [x] `privileges: []` — no host privileges requested.
- [x] No outbound `fetch` / `XMLHttpRequest` / WebSocket calls in the source.
- [x] All rendering done with native DOM + SVG; no eval, no innerHTML for untrusted strings.

## Branding & metadata
- [x] Display name: *PulseGrid Calendar Heatmap*.
- [x] Author and support email present in `pbiviz.json` and `package.json` (`contact@syedhussnain.co.uk`).
- [x] GitHub URL set in `pbiviz.json`.
- [x] MIT license file at repo root.
