import {ChangeDetectionStrategy, Component, signal, ViewChild} from '@angular/core';
import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {RANGE_SEPARATOR_CHAR, TuiDay, TuiDayRange} from '@taiga-ui/cdk';
import {TUI_TEXTFIELD_VALUE} from '@taiga-ui/core';
import {NG_EVENT_PLUGINS} from '@taiga-ui/event-plugins';
import {TuiCalendarRange} from '@taiga-ui/kit';

const TEXTFIELD_VALUE = signal('');

describe('TuiCalendarRange textfield integration', () => {
    @Component({
        standalone: true,
        imports: [TuiCalendarRange],
        template: '<tui-calendar-range (valueChange)="value = $event" />',
        changeDetection: ChangeDetectionStrategy.OnPush,
        providers: [{provide: TUI_TEXTFIELD_VALUE, useValue: TEXTFIELD_VALUE}],
    })
    class Test {
        @ViewChild(TuiCalendarRange)
        public readonly calendar!: TuiCalendarRange;

        public value: TuiDayRange | null = null;
    }

    let fixture: ComponentFixture<Test>;
    let testComponent: Test;
    let calendar: TuiCalendarRange;

    beforeEach(async () => {
        TEXTFIELD_VALUE.set('');
        TestBed.configureTestingModule({
            imports: [Test],
            providers: [NG_EVENT_PLUGINS],
        });
        await TestBed.compileComponents();

        fixture = TestBed.createComponent(Test);
        testComponent = fixture.componentInstance;
        fixture.detectChanges();
        calendar = testComponent.calendar;
    });

    it('reflects unfinished range picking in textfield', () => {
        const day = new TuiDay(2025, 0, 1);

        calendar['onDayClick'](day);

        expect(TEXTFIELD_VALUE()).toBe(`01.01.2025${RANGE_SEPARATOR_CHAR}`);
        expect(testComponent.value).toBeNull();
    });

    it('commits unfinished range as single day on destroy', () => {
        const day = new TuiDay(2025, 0, 1);
        const range = new TuiDayRange(day, day);

        calendar['onDayClick'](day);
        calendar.ngOnDestroy();

        expect(testComponent.value?.daySame(range)).toBe(true);
    });
});