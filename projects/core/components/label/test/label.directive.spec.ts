import {type HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {TuiLabelHarness} from '@taiga-ui/testing';

import {TuiLabel} from '../label.directive';

describe('Label', () => {
    @Component({
        imports: [TuiLabel],
        template: `
            <label
                id="label"
                for="control"
                tuiLabel
            >
                First label
            </label>
            <input id="control" />

            <label
                id="secondary"
                tuiLabel
            >
                Secondary label
            </label>
        `,
        changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class Test {}

    let fixture: ComponentFixture<Test>;
    let loader: HarnessLoader;

    beforeEach(async () => {
        TestBed.configureTestingModule({imports: [Test]});
        await TestBed.compileComponents();

        fixture = TestBed.createComponent(Test);
        loader = TestbedHarnessEnvironment.loader(fixture);

        fixture.detectChanges();
    });

    it('finds label by selector', async () => {
        const label = await loader.getHarness(TuiLabelHarness.with({selector: '#label'}));

        expect(label).toBeTruthy();
    });

    it('reads text', async () => {
        const label = await loader.getHarness(TuiLabelHarness.with({selector: '#label'}));

        expect(await label.getText()).toBe('First label');
    });

    it('reads associated control', async () => {
        const label = await loader.getHarness(TuiLabelHarness.with({selector: '#label'}));
        const secondary = await loader.getHarness(
            TuiLabelHarness.with({selector: '#secondary'}),
        );

        expect(await label.getFor()).toBe('control');
        expect(await secondary.getFor()).toBeNull();
    });

    it('reads orientation', async () => {
        const label = await loader.getHarness(TuiLabelHarness.with({selector: '#label'}));

        expect(await label.getOrientation()).toBe('horizontal');
    });
});
