# Nested scrollbar timeline scopes

Standalone HTML/CSS reduction for [Taiga UI #15344](https://github.com/taiga-family/taiga-ui/issues/15344) and [PR #15353](https://github.com/taiga-family/taiga-ui/pull/15353). Both HTML pages have no JavaScript, Angular, or Taiga UI dependency. `minimal.html` is the focused 26-line failing reduction; `index.html` compares the original, corrected, and delegated cases.

## Manual reproduction

Open `index.html` in a browser supporting CSS scroll-driven animations.

1. Leave **Make the nested sources overflow** unchecked. In WebKit 26.5, the original inner indicator is visible even though its source does not overflow. The fixed inner indicator is hidden.
2. Check the box and scroll the inner sources. The fixed indicator uses the inner scroll timeline.
3. Scroll the fixed outer area. It must not change the inner animation's progress.
4. The delegated cases put the indicator outside its source, matching the layout used by `tuiScrollable`. With scope retained, the indicator resolves the inner source. With scope removed, it has no timeline.

An unresolved timeline can still apply a zero-duration animation's filled state. A visible indicator alone therefore does not prove a valid scroll binding; `verify.mjs` checks the actual timeline source and progress.

## Observed results

Recorded with Playwright 1.62.1 on Linux. Exact browser versions, sources, opacity, and progress are in `results.json`.

| Case                                             | Chromium 151                             | WebKit 26.5                              |
| ------------------------------------------------ | ---------------------------------------- | ---------------------------------------- |
| Original nested names, no overflow               | Inner `ScrollTimeline`, indicator hidden | Ghost `ViewTimeline`, indicator visible  |
| Distinct inner name, scope retained, no overflow | Inner `ScrollTimeline`, indicator hidden | Inner `ScrollTimeline`, indicator hidden |
| Fixed source scrolled halfway                    | Progress approximately 0.5               | Progress approximately 0.5               |
| Fixed outer source scrolled                      | Inner progress unchanged                 | Inner progress unchanged                 |
| Delegated source, scope retained                 | Inner `ScrollTimeline` resolves          | Inner `ScrollTimeline` resolves          |
| Delegated source, scope removed                  | No resolved timeline                     | No resolved timeline                     |

The original case combines nested scopes using the same name with a descendant view timeline. Merely removing the view timeline is insufficient in the tested WebKit build (a separate diagnostic probe resolved no scroll timeline). The correction uses a separate name for the inner control and retains its explicit scope. It does not disable CSS animations.

This demonstrates an engine difference in this reduction. It does not establish the behavior of every Safari version or claim that global scope removal is safe. Native macOS Safari has not been tested here.

## Automated verification

```sh
npm install
npx playwright install chromium webkit
npm run verify
```

The verifier checks the corrected no-overflow state, inner scroll progress, parent/child independence, and delegated source resolution. It writes `results.json`. `PW_CHROMIUM_EXECUTABLE_PATH` and `PW_WEBKIT_EXECUTABLE_PATH` optionally select installed browser binaries; otherwise Playwright's defaults are used.
