import {type HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {TuiSliderHarness} from '@taiga-ui/testing';

import {TuiSlider} from '../slider';

describe('Slider harness', () => {
    @Component({
        imports: [ReactiveFormsModule, TuiSlider],
        template: `
            <input
                id="slider"
                max="100"
                min="10"
                step="5"
                tuiSlider
                type="range"
                [formControl]="control"
            />
            <input
                id="disabled"
                disabled
                tuiSlider
                type="range"
                value="50"
            />
        `,
        changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class Test {
        public readonly control = new FormControl(25, {nonNullable: true});
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

    it('finds slider by selector', async () => {
        const slider = await loader.getHarness(TuiSliderHarness.with({selector: '#slider'}));

        expect(slider).toBeTruthy();
    });

    it('reads value and constraints', async () => {
        const slider = await loader.getHarness(TuiSliderHarness.with({selector: '#slider'}));

        expect(await slider.getValue()).toBe(25);
        expect(await slider.getMin()).toBe(10);
        expect(await slider.getMax()).toBe(100);
        expect(await slider.getStep()).toBe(5);
    });

    it('sets value and updates form control', async () => {
        const slider = await loader.getHarness(TuiSliderHarness.with({selector: '#slider'}));

        await slider.setValue(40);

        expect(await slider.getValue()).toBe(40);
        expect(testComponent.control.value).toBe(40);
    });

    it('reads disabled state', async () => {
        const slider = await loader.getHarness(TuiSliderHarness.with({selector: '#slider'}));
        const disabled = await loader.getHarness(
            TuiSliderHarness.with({selector: '#disabled'}),
        );

        expect(await slider.isDisabled()).toBe(false);
        expect(await disabled.isDisabled()).toBe(true);
    });
});
