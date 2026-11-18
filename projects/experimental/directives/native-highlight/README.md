# TuiNativeHighlight (experimental)

Highlights the **first match in a single text node** with the browser's
[CSS Custom Highlight API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API).

Unlike `TuiHighlight` from `@taiga-ui/kit`, this directive never creates an
overlay element or measures text geometry.

```ts
import {TuiNativeHighlight} from '@taiga-ui/experimental';

@Component({
    imports: [TuiNativeHighlight],
    template: `
        <span
            [tuiNativeHighlight]="search"
            tuiNativeHighlightColor="yellow"
        >
            Find a word in this text
        </span>
    `,
})
export class Example {
    protected readonly search = 'word';
}
```

- The native path uses `CSS.highlights`, a named `Highlight`, and `Range`.
- Input changes and text-node mutations refresh the matching range.
- Each instance may use its own `tuiNativeHighlightColor`.
- No highlight is rendered in browsers without the native API, or during SSR.
- Use the stable `TuiHighlight` from `@taiga-ui/kit` if old-browser highlighting is required.
- Existing single-match behavior is preserved; matching across multiple text nodes
  and highlighting all occurrences are outside the initial scope.
