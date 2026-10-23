import {type HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {TuiCell} from '@taiga-ui/core';
import {TuiCellHarness} from '@taiga-ui/testing';

describe('Cell harness', () => {
    @Component({
        imports: [TuiCell],
        template: `
            <div
                id="default"
                tuiCell
            >
                Default cell
            </div>

            <div
                id="compact"
                tuiCell="s"
                tuiCellHeight="compact"
            >
                Compact cell
            </div>
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

    it('finds cell by selector', async () => {
        const cell = await loader.getHarness(TuiCellHarness.with({selector: '#default'}));

        expect(cell).toBeTruthy();
    });

    it('reads text', async () => {
        const cell = await loader.getHarness(TuiCellHarness.with({selector: '#compact'}));

        expect(await cell.getText()).toBe('Compact cell');
    });

    it('reads size', async () => {
        const defaultCell = await loader.getHarness(
            TuiCellHarness.with({selector: '#default'}),
        );
        const compact = await loader.getHarness(TuiCellHarness.with({selector: '#compact'}));

        expect(await defaultCell.getSize()).toBe('l');
        expect(await compact.getSize()).toBe('s');
    });

    it('reads height', async () => {
        const defaultCell = await loader.getHarness(
            TuiCellHarness.with({selector: '#default'}),
        );
        const compact = await loader.getHarness(TuiCellHarness.with({selector: '#compact'}));

        expect(await defaultCell.getHeight()).toBe('normal');
        expect(await compact.getHeight()).toBe('compact');
    });
});
