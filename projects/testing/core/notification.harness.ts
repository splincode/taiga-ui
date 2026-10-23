import {TuiComponentHarness} from '@taiga-ui/testing/utils';

export class TuiNotificationHarness extends TuiComponentHarness {
    public static hostSelector = '[tuiNotification]';

    public async getText(): Promise<string> {
        return (await this.host()).text();
    }

    public async getAppearance(): Promise<string | null> {
        return (await this.host()).getAttribute('data-appearance');
    }

    public async getSize(): Promise<string | null> {
        return (await this.host()).getAttribute('data-size');
    }
}
