import {TuiComponentHarness} from '@taiga-ui/testing/utils';

export class TuiCellHarness extends TuiComponentHarness {
    public static hostSelector = '[tuiCell]';

    public async getText(): Promise<string> {
        return (await this.host()).text();
    }

    public async getSize(): Promise<string | null> {
        return (await this.host()).getAttribute('data-size');
    }

    public async getHeight(): Promise<string | null> {
        return (await this.host()).getAttribute('data-height');
    }
}
