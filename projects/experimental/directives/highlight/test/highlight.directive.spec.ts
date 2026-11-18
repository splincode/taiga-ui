import {Component} from '@angular/core';
import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {TuiHighlight} from '@taiga-ui/experimental';

describe('TuiHighlight (experimental)', () => {
    @Component({
        imports: [TuiHighlight],
        template: `
            @if (showFirst) {
                <div
                    id="first"
                    [tuiHighlight]="search"
                    [tuiHighlightColor]="color"
                >
                    Hello <span>Foobar</span>
                </div>
            }
            @if (showSecond) {
                <div
                    id="second"
                    tuiHighlight="bar"
                >
                    bar baz
                </div>
            }
        `,
    })
    class Test {
        public search = 'foo';
        public color = 'yellow';
        public showFirst = true;
        public showSecond = true;
    }

    class MockHighlight extends Set<Range> {}

    const name = 'tui-highlight';
    const registry = new Map<string, Highlight>();

    let fixture: ComponentFixture<Test> | undefined;
    let originalCSS: PropertyDescriptor | undefined;
    let originalHighlight: PropertyDescriptor | undefined;

    beforeEach(async () => {
        originalCSS = Object.getOwnPropertyDescriptor(window, 'CSS');
        originalHighlight = Object.getOwnPropertyDescriptor(window, 'Highlight');
        registry.clear();

        TestBed.configureTestingModule({imports: [Test]});
        await TestBed.compileComponents();
    });

    afterEach(() => {
        fixture?.destroy();
        fixture = undefined;

        if (originalCSS) {
            Object.defineProperty(window, 'CSS', originalCSS);
        } else {
            Reflect.deleteProperty(window, 'CSS');
        }

        if (originalHighlight) {
            Object.defineProperty(window, 'Highlight', originalHighlight);
        } else {
            Reflect.deleteProperty(window, 'Highlight');
        }
    });

    function mount(supported = true): void {
        Object.defineProperty(window, 'CSS', {
            configurable: true,
            value: Object.assign(Object.create(window.CSS ?? null), {
                highlights: registry,
            }),
        });
        Object.defineProperty(window, 'Highlight', {
            configurable: true,
            value: supported ? MockHighlight : undefined,
        });

        fixture = TestBed.createComponent(Test);
        fixture.detectChanges();
    }

    it('creates text ranges without an overlay', () => {
        mount();

        const first = document.querySelector('#first')! as HTMLElement;
        const ranges = [...registry.get(name)!];

        expect(first.querySelector('div')).toBeNull();
        expect(first.style.getPropertyValue('--tui-highlight-background')).toBe(
            'yellow',
        );
        expect(ranges.map((range) => range.toString()).sort()).toEqual(['Foo', 'bar']);
    });

    it('updates text ranges when the input changes', () => {
        mount();

        fixture!.componentInstance.search = 'bar';
        fixture!.detectChanges();

        expect([...registry.get(name)!].map((range) => range.toString()).sort()).toEqual([
            'bar',
            'bar',
        ]);
    });

    it('removes its range when the search is empty', () => {
        mount();

        fixture!.componentInstance.search = '';
        fixture!.detectChanges();

        expect([...registry.get(name)!].map((range) => range.toString())).toEqual(['bar']);
    });

    it('reacts to changes in text nodes', async () => {
        mount();

        document.querySelector('#first span')!.textContent = 'New foo';
        await new Promise<void>((resolve) => setTimeout(resolve, 0));

        expect([...registry.get(name)!].map((range) => range.toString()).sort()).toEqual([
            'bar',
            'foo',
        ]);
    });

    it('does not measure the host element when updating the range', () => {
        mount();

        const first = document.querySelector('#first') as HTMLElement;
        const measure = jest.spyOn(first, 'getBoundingClientRect');

        fixture!.componentInstance.search = 'bar';
        fixture!.detectChanges();

        expect(measure).not.toHaveBeenCalled();
        measure.mockRestore();
    });

    it('updates a color without changing the native ranges', () => {
        mount();

        const first = document.querySelector('#first') as HTMLElement;
        const previous = [...registry.get(name)!];

        fixture!.componentInstance.color = 'orange';
        fixture!.detectChanges();

        expect(first.style.getPropertyValue('--tui-highlight-background')).toBe(
            'orange',
        );
        expect([...registry.get(name)!]).toEqual(previous);
    });

    it('keeps the other highlights when one directive is removed', () => {
        mount();

        fixture!.componentInstance.showFirst = false;
        fixture!.detectChanges();

        expect([...registry.get(name)!].map((range) => range.toString())).toEqual(['bar']);
    });

    it('removes all registered ranges on destroy', () => {
        mount();

        fixture!.destroy();

        expect(registry.get(name)?.size).toBe(0);
    });

    it('can highlight again after another instance removes its last range', () => {
        mount();

        fixture!.componentInstance.search = '';
        fixture!.detectChanges();

        fixture!.componentInstance.showFirst = false;
        fixture!.componentInstance.showSecond = false;
        fixture!.detectChanges();

        expect(registry.get(name)?.size).toBe(0);

        fixture!.componentInstance.showFirst = true;
        fixture!.componentInstance.search = 'foo';
        fixture!.detectChanges();

        expect([...registry.get(name)!].map((range) => range.toString())).toEqual(['Foo']);
    });

    it('does not create an overlay when the API is unavailable', () => {
        mount(false);

        expect(document.querySelector('#first')?.querySelector('div')).toBeNull();
        expect(registry.size).toBe(0);
    });
});
