import {type HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {TuiInput} from '@taiga-ui/core';
import {TuiInputHarness} from '@taiga-ui/testing';

describe('Input harness', () => {
    @Component({
        imports: [ReactiveFormsModule, TuiInput],
        template: `
            <tui-textfield>
                <input
                    id="input"
                    tuiInput
                    [formControl]="control"
                />
            </tui-textfield>

            <tui-textfield>
                <input
                    id="readonly"
                    readonly
                    tuiInput
                    value="Readonly"
                />
            </tui-textfield>

            <tui-textfield>
                <input
                    id="disabled"
                    tuiInput
                    [formControl]="disabledControl"
                />
            </tui-textfield>
        `,
        changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class Test {
        public readonly control = new FormControl('Initial', {nonNullable: true});
        public readonly disabledControl = new FormControl(
            {value: 'Disabled', disabled: true},
            {nonNullable: true},
        );
    }

    let fixture: ComponentFixture<Test>;
    let loader: HarnessLoader;
    let testComponent: Test;

    beforeEach(async () => {
        TestBed.configureTestingModule({imports: [Test]});
        await TestBed.compileComponents();

        fixture = TestBed.createComponent(Test);
        loader = TestbedHarnessEnvironment.loader(fixture);
        testComponent = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('finds input by selector', async () => {
        const input = await loader.getHarness(TuiInputHarness.with({selector: '#input'}));

        expect(input).toBeTruthy();
    });

    it('reads value', async () => {
        const input = await loader.getHarness(TuiInputHarness.with({selector: '#input'}));

        expect(await input.getValue()).toBe('Initial');
    });

    it('sets value and updates form control', async () => {
        const input = await loader.getHarness(TuiInputHarness.with({selector: '#input'}));

        await input.setValue('Updated');

        expect(await input.getValue()).toBe('Updated');
        expect(testComponent.control.value).toBe('Updated');
    });

    it('reads readonly state', async () => {
        const input = await loader.getHarness(TuiInputHarness.with({selector: '#input'}));
        const readonly = await loader.getHarness(
            TuiInputHarness.with({selector: '#readonly'}),
        );

        expect(await input.isReadonly()).toBe(false);
        expect(await readonly.isReadonly()).toBe(true);
    });

    it('reads disabled state', async () => {
        const input = await loader.getHarness(TuiInputHarness.with({selector: '#input'}));
        const disabled = await loader.getHarness(
            TuiInputHarness.with({selector: '#disabled'}),
        );

        expect(await input.isDisabled()).toBe(false);
        expect(await disabled.isDisabled()).toBe(true);
    });
});
