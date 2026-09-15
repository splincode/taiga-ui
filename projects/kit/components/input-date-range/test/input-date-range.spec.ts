import {ChangeDetectionStrategy, Component, effect, signal} from '@angular/core';
import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {RANGE_SEPARATOR_CHAR, TuiDay, TuiDayRange} from '@taiga-ui/cdk';
import {provideTaiga, TuiDropdownOpen, TuiRoot} from '@taiga-ui/core';
import {TuiCalendarRange, TuiInputDateRange} from '@taiga-ui/kit';

describe('TuiInputDateRangeDirective', () => {
    @Component({
        imports: [ReactiveFormsModule, TuiInputDateRange, TuiRoot],
        template: `
            <tui-root>
                <tui-textfield>
                    <input
                        tuiInputDateRange
                        [formControl]="control"
                    />
                    <tui-calendar-range *tuiDropdown />
                </tui-textfield>
            </tui-root>
        `,
        changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class Test {
        public syncRuns = 0;
        public readonly range = signal<TuiDayRange | null>(null);
        public readonly control = new FormControl<TuiDayRange | null>(null);

        constructor() {
            effect(() => {
                this.syncRuns += 1;
                this.control.setValue(this.range());
            });
        }
    }

    let fixture: ComponentFixture<Test>;
    let testComponent: Test;
    let control: FormControl<TuiDayRange | null>;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [Test],
            providers: [provideTaiga()],
        });
        await TestBed.compileComponents();
        fixture = TestBed.createComponent(Test);
        testComponent = fixture.componentInstance;
        control = fixture.componentInstance.control;
        fixture.detectChanges();
    });

    it('does not track internal value while setting form control from effect', () => {
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

        testComponent.range.set(
            new TuiDayRange(new TuiDay(2025, 0, 1), new TuiDay(2025, 0, 3)),
        );

        fixture.detectChanges();

        const syncRuns = testComponent.syncRuns;
        const actualRange = `01.01.2025${RANGE_SEPARATOR_CHAR}03.01.2025`;
        const newRange = `02.01.2025${RANGE_SEPARATOR_CHAR}04.01.2025`;

        expect(testComponent.syncRuns).toBe(syncRuns);
        expect(input.value).toBe(actualRange);
        expect(control.value?.getFormattedDayRange('dd/mm/yyyy', '.')).toBe(actualRange);

        input.value = newRange;
        input.dispatchEvent(new Event('input', {bubbles: true}));
        fixture.detectChanges();

        expect(testComponent.syncRuns).toBe(syncRuns);
        expect(input.value).toBe(newRange);
        expect(control.value?.getFormattedDayRange('dd/mm/yyyy', '.')).toBe(newRange);
    });

    it('moves caret to the end after selecting first day in empty input', () => {
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
        const day = new TuiDay(2025, 0, 1);
        const calendar = openCalendar();

        input.focus();
        calendar['onDayClick'](day);
        fixture.detectChanges();

        expect(input.value).toBe(`01.01.2025${RANGE_SEPARATOR_CHAR}`);
        expect(input.selectionStart).toBe(input.value.length);
    });

    it('commits unfinished single-day range synchronously on destroy', () => {
        const day = new TuiDay(2025, 0, 1);
        const range = new TuiDayRange(day, day);
        const calendar = openCalendar();

        calendar['onDayClick'](day);
        calendar.ngOnDestroy();

        expect(control.value?.daySame(range)).toBe(true);
    });

    it('does not warn about destroyed OutputRef when dropdown calendar is destroyed', () => {
        const dropdown = getDropdown();
        const calendar = openCalendar();
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        try {
            calendar['onDayClick'](new TuiDay(2025, 0, 1));
            dropdown.toggle(false);

            expect(warnSpy).not.toHaveBeenCalledWith(
                expect.stringContaining('Unexpected emit for destroyed `OutputRef`'),
            );
        } finally {
            warnSpy.mockRestore();
        }
    });

    function getDropdown(): TuiDropdownOpen {
        return fixture.debugElement
            .query(By.css('tui-textfield'))
            .injector.get(TuiDropdownOpen);
    }

    function openCalendar(): TuiCalendarRange {
        getDropdown().toggle(true);
        fixture.detectChanges();

        return getCalendar();
    }

    function getCalendar(): TuiCalendarRange {
        return fixture.debugElement.query(By.directive(TuiCalendarRange))
            .componentInstance;
    }
});
