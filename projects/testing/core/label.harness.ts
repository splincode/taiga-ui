import {TuiComponentHarness} from '@taiga-ui/testing/utils';

export class TuiLabelHarness extends TuiComponentHarness {
    public static hostSelector = 'label[tuiLabel]';

    public async getText(): Promise<string> {
        return (await this.host()).text();
    }

    public async getFor(): Promise<string | null> {
        return (await this.host()).getAttribute('for');
    }

    public async getOrientation(): Promise<string | null> {
        return (await this.host()).getAttribute('data-orientation');
    }
}
