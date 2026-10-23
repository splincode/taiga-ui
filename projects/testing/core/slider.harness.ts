import {TuiComponentHarness} from '@taiga-ui/testing/utils';

export class TuiSliderHarness extends TuiComponentHarness {
    public static hostSelector = 'input[type="range"][tuiSlider]';

    public async getValue(): Promise<number> {
        return Number(await (await this.host()).getProperty('value'));
    }

    public async setValue(value: number): Promise<void> {
        await (await this.host()).setInputValue(String(value));
    }

    public async getMin(): Promise<number> {
        return Number(await (await this.host()).getProperty('min'));
    }

    public async getMax(): Promise<number> {
        return Number(await (await this.host()).getProperty('max'));
    }

    public async getStep(): Promise<number> {
        return Number(await (await this.host()).getProperty('step'));
    }

    public async isDisabled(): Promise<boolean> {
        return !!(await (await this.host()).getProperty('disabled'));
    }
}
