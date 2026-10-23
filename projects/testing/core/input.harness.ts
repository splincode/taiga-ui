import {TuiComponentHarness} from '@taiga-ui/testing/utils';

export class TuiInputHarness extends TuiComponentHarness {
    public static hostSelector = 'input[tuiInput]';

    public async getValue(): Promise<string> {
        return String(await (await this.host()).getProperty('value'));
    }

    public async setValue(value: string): Promise<void> {
        await (await this.host()).setInputValue(value);
    }

    public async isDisabled(): Promise<boolean> {
        return !!(await (await this.host()).getProperty('disabled'));
    }

    public async isReadonly(): Promise<boolean> {
        return !!(await (await this.host()).getProperty('readOnly'));
    }
}
