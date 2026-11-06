import {readFileSync} from 'node:fs';
import {join} from 'node:path';

import {globSync} from 'glob';

describe('Mobile styles', () => {
    it.each(globSync(join(__dirname, '../**/*.less')))(
        'does not nest imports in %s (Stackblitz compatibility)',
        (file) => {
            expect(readFileSync(file, 'utf8')).not.toMatch(/^[\t ]+@import/m);
        },
    );
});
