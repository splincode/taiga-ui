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

const NAME = 'tui-highlight';

@Component({
    template: '',
    styles: `::highlight(${NAME}) { background-color: var(--tui-highlight-background); }`,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class Styles {}

/**
 * Highlights the first occurrence of a string using the CSS Custom Highlight API.
 * In unsupported browsers and during SSR, the directive renders no highlight.
 */
@Directive({
    selector: '[tuiHighlight]',
    host: {
        '[style.--tui-highlight-background]': 'tuiHighlightColor()',
    },
})
export class TuiHighlight implements OnChanges, OnDestroy {
    private readonly doc = inject(DOCUMENT);
    private readonly el = tuiInjectElement();
    private readonly registry = this.doc.defaultView?.CSS?.highlights;
    private readonly highlight =
        this.registry && typeof Highlight !== 'undefined'
            ? (this.registry.get(NAME) ?? new Highlight())
            : null;
    private readonly range = this.highlight ? this.doc.createRange() : null;
    protected readonly nothing = this.highlight ? tuiWithStyles(Styles) : undefined;
    private observer?: MutationObserver;

    public readonly tuiHighlight = input('');
    public readonly tuiHighlightColor = input(
        inject(TUI_HIGHLIGHT_OPTIONS).highlightColor,
    );

    constructor() {
        if (!this.highlight) {
            return;
        }

        this.registry?.set(NAME, this.highlight);

        const Observer = this.doc.defaultView?.MutationObserver;

        if (Observer) {
            this.observer = new Observer(() => this.update());
            this.observer.observe(this.el, {
                childList: true,
                characterData: true,
                subtree: true,
            });
        }
    }

    public ngOnChanges({tuiHighlight}: SimpleChanges): void {
        if (tuiHighlight) {
            this.update();
        }
    }

    public ngOnDestroy(): void {
        this.observer?.disconnect();

        if (this.highlight && this.range) {
            this.highlight.delete(this.range);
        }
    }

    private update(): void {
        if (!this.highlight || !this.range) {
            return;
        }

        this.highlight.delete(this.range);

        const search = this.tuiHighlight().toLowerCase();

        if (!search) {
            return;
        }

        const walker = this.doc.createTreeWalker(this.el, NodeFilter.SHOW_TEXT, svgNodeFilter);

        while (walker.nextNode()) {
            const node = walker.currentNode;
            const index = node.nodeValue?.toLowerCase().indexOf(search) ?? -1;

            if (index < 0) {
                continue;
            }

            this.range.setStart(node, index);
            this.range.setEnd(node, index + this.tuiHighlight().length);
            this.highlight.add(this.range);

            return;
        }
    }
}
