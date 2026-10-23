import {type HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {provideTaiga, TuiError} from '@taiga-ui/core';
import {TuiErrorHarness} from '@taiga-ui/testing';

describe('Error', () => {
    @Component({
        imports: [TuiError],
        template: `<tui-error id="error" [error]="error()" />`,
        changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class Test {
        public readonly error = signal<string | null>(null);
    }

    let fixture: ComponentFixture<Test>;
    let loader: HarnessLoader;
    let testComponent: Test;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [Test],
            providers: [provideTaiga()],
        });
        await TestBed.compileComponents();

        fixture = TestBed.createComponent(Test);
        loader = TestbedHarnessEnvironment.loader(fixture);
        testComponent = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('finds error by selector', async () => {
        const error = await loader.getHarness(TuiErrorHarness.with({selector: '#error'}));

        expect(error).toBeTruthy();
    });

    it('reads empty state', async () => {
        const error = await loader.getHarness(TuiErrorHarness.with({selector: '#error'}));

        expect(await error.hasError()).toBe(false);
        expect(await error.getText()).toBe('');
    });

    it('reads error state and text', async () => {
        const error = await loader.getHarness(TuiErrorHarness.with({selector: '#error'}));

        testComponent.error.set('Required');
        fixture.detectChanges();

        expect(await error.hasError()).toBe(true);
        expect(await error.getText()).toBe('Required');
    });

    it('updates when error is cleared', async () => {
        const error = await loader.getHarness(TuiErrorHarness.with({selector: '#error'}));

        testComponent.error.set('Required');
        fixture.detectChanges();

        expect(await error.hasError()).toBe(true);

        testComponent.error.set(null);
        fixture.detectChanges();

        expect(await error.hasError()).toBe(false);
        expect(await error.getText()).toBe('');
    });
});
