import {Component, signal} from '@angular/core';
import {changeDetection} from '@demo/emulate/change-detection';
import {TuiButton} from '@taiga-ui/core';
import {TuiHighlight} from '@taiga-ui/experimental';

@Component({
    imports: [TuiButton, TuiHighlight],
    templateUrl: './index.html',
    changeDetection,
})
export default class Example {
    protected readonly text = signal('The color changes when the text updates');

    protected toggle(): void {
        this.text.update((value) =>
            value.startsWith('The color')
                ? 'The text changes, but the color stays the same'
                : 'The color changes when the text updates',
        );
    }
}
