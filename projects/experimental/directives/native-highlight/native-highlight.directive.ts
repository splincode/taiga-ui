import {DOCUMENT} from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    Directive,
    inject,
    input,
    type OnChanges,
    type OnDestroy,
    type SimpleChanges,
    ViewEncapsulation,
} from '@angular/core';
import {svgNodeFilter} from '@taiga-ui/cdk/constants';
import {tuiInjectElement} from '@taiga-ui/cdk/utils/dom';
import {tuiWithStyles} from '@taiga-ui/cdk/utils/miscellaneous';
import {TUI_HIGHLIGHT_OPTIONS} from '@taiga-ui/kit/directives/highlight';

const NAME = 'tui-native-highlight';

interface HighlightState {
    readonly highlight: Highlight;
    instances: number;
}

const states = new WeakMap<Document, HighlightState>();

@Component({
    template: '',
    styles: `::highlight(${NAME}) { background-color: var(--tui-native-highlight-background); }`,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class Styles {}

/**
 * Highlights the first occurrence of a string using the CSS Custom Highlight API.
 * In unsupported browsers and during SSR, the directive renders no highlight.
 */
@Directive({
    selector: '[tuiNativeHighlight]',
    host: {
        '[style.--tui-native-highlight-background]': 'tuiNativeHighlightColor()',
    },
})
export class TuiNativeHighlight implements OnChanges, OnDestroy {
    protected readonly nothing = tuiWithStyles(Styles);

    private readonly doc = inject(DOCUMENT);
    private readonly el = tuiInjectElement();
    private readonly state = this.register();
    private readonly range = this.state ? this.doc.createRange() : null;
    private observer?: MutationObserver;

    public readonly tuiNativeHighlight = input('');
    public readonly tuiNativeHighlightColor = input(
        inject(TUI_HIGHLIGHT_OPTIONS).highlightColor,
    );

    constructor() {
        const Observer = this.state && this.doc.defaultView?.MutationObserver;

        if (Observer) {
            this.observer = new Observer(() => this.update());
            this.observer.observe(this.el, {
                childList: true,
                characterData: true,
                subtree: true,
            });
        }
    }

    public ngOnChanges({tuiNativeHighlight}: SimpleChanges): void {
        if (tuiNativeHighlight) {
            this.update();
        }
    }

    public ngOnDestroy(): void {
        this.observer?.disconnect();

        if (!this.state || !this.range) {
            return;
        }

        this.state.highlight.delete(this.range);

        if (--this.state.instances) {
            return;
        }

        const registry = this.doc.defaultView?.CSS?.highlights;

        if (registry?.get(NAME) === this.state.highlight) {
            registry.delete(NAME);
        }

        states.delete(this.doc);
    }

    private update(): void {
        if (!this.state || !this.range) {
            return;
        }

        this.state.highlight.delete(this.range);

        const search = this.tuiNativeHighlight().toLowerCase();

        if (!search) {
            return;
        }

        const walker = this.doc.createTreeWalker(this.el, 4, svgNodeFilter);

        while (walker.nextNode()) {
            const node = walker.currentNode;
            const index = node.nodeValue?.toLowerCase().indexOf(search) ?? -1;

            if (index < 0) {
                continue;
            }

            this.range.setStart(node, index);
            this.range.setEnd(node, index + this.tuiNativeHighlight().length);
            this.state.highlight.add(this.range);

            return;
        }
    }

    private register(): HighlightState | null {
        const registry = this.doc.defaultView?.CSS?.highlights;

        if (!registry || typeof Highlight === 'undefined') {
            return null;
        }

        let state = states.get(this.doc);

        if (!state) {
            state = {highlight: new Highlight(), instances: 0};
            registry.set(NAME, state.highlight);
            states.set(this.doc, state);
        }

        state.instances++;

        return state;
    }
}
