import {type HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {TuiNotification} from '@taiga-ui/core';
import {TuiNotificationHarness} from '@taiga-ui/testing';

describe('Notification harness', () => {
    @Component({
        imports: [TuiNotification],
        template: `
            <div
                id="default"
                tuiNotification
            >
                Default notification
            </div>

            <div
                id="warning"
                appearance="warning"
                size="s"
                tuiNotification
            >
                Warning notification
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

    it('finds notification by selector', async () => {
        const notification = await loader.getHarness(
            TuiNotificationHarness.with({selector: '#default'}),
        );

        expect(notification).toBeTruthy();
    });

    it('reads text', async () => {
        const notification = await loader.getHarness(
            TuiNotificationHarness.with({selector: '#warning'}),
        );

        expect(await notification.getText()).toBe('Warning notification');
    });

    it('reads appearance', async () => {
        const defaultNotification = await loader.getHarness(
            TuiNotificationHarness.with({selector: '#default'}),
        );
        const warning = await loader.getHarness(
            TuiNotificationHarness.with({selector: '#warning'}),
        );

        expect(await defaultNotification.getAppearance()).toBe('info');
        expect(await warning.getAppearance()).toBe('warning');
    });

    it('reads size', async () => {
        const defaultNotification = await loader.getHarness(
            TuiNotificationHarness.with({selector: '#default'}),
        );
        const warning = await loader.getHarness(
            TuiNotificationHarness.with({selector: '#warning'}),
        );

        expect(await defaultNotification.getSize()).toBe('l');
        expect(await warning.getSize()).toBe('s');
    });
});
