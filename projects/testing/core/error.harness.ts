import {TuiComponentHarness} from '@taiga-ui/testing/utils';

export class TuiErrorHarness extends TuiComponentHarness {
    public static hostSelector = 'tui-error';

    public async hasError(): Promise<boolean> {
        return (await this.host()).hasClass('_error');
    }

    public async getText(): Promise<string> {
        return (await this.host()).text();
    }
}
