// cspell:ignore lessc
import {execFileSync} from 'node:child_process';
import {cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';

import {bundleMobileStyles} from '../bundle-styles';

describe('Mobile stylesheet bundle', () => {
    const source = resolve(__dirname, '../../styles');
    let directory: string;

    beforeEach(() => {
        directory = mkdtempSync(join(tmpdir(), 'tui-mobile-styles-'));
        cpSync(source, directory, {recursive: true});
    });

    afterEach(() => rmSync(directory, {recursive: true, force: true}));

    it('creates a self-contained LESS entry without changing the source files', () => {
        const original = readFileSync(join(source, 'taiga-ui-mobile.less'), 'utf8');

        bundleMobileStyles(directory);

        const result = readFileSync(join(directory, 'taiga-ui-mobile.less'), 'utf8');

        expect(result.match(/@import[^;]+;/g)).toEqual([
            "@import '@taiga-ui/styles/utils.less';",
        ]);
        expect(result).toContain("[data-platform='android']");
        expect(result).toContain("[data-platform='ios']");
        expect(result).toContain('[tuiToast]');
        expect(readFileSync(join(source, 'taiga-ui-mobile.less'), 'utf8')).toBe(original);
    });

    it.each([
        ['', '', 'min-block-size: 3rem'],
        ['@tui-duration-fastest: 777ms;\n', '', 'min-block-size: 3rem'],
        ['', '\n@tui-duration-fastest: 777ms;', '777ms'],
        [
            '',
            '\n.transition(@param: all, @speed: var(--tui-duration, 300ms)) { outline: 1px solid red; }',
            'outline: 1px solid red',
        ],
    ])('preserves compiled CSS with custom LESS: %s %s', (before, after, expected) => {
        const original = render(source, before, after);

        bundleMobileStyles(directory);

        const result = render(directory, before, after);

        expect(result).toBe(original);
        expect(result).toContain(expected);
    });

    it('can bundle a package again after ng-packagr copies updated styles', () => {
        bundleMobileStyles(directory);
        cpSync(source, directory, {recursive: true});
        const toast = join(directory, 'common/toast.less');

        writeFileSync(
            toast,
            `${readFileSync(toast, 'utf8')}\n.t-watch { color: red; }\n`,
        );
        bundleMobileStyles(directory);

        expect(readFileSync(join(directory, 'taiga-ui-mobile.less'), 'utf8')).toContain(
            '.t-watch { color: red; }',
        );
    });

    function render(styles: string, before: string, after: string): string {
        const filename = join(directory, 'consumer.less');

        writeFileSync(
            filename,
            `${before}@import '${join(styles, 'taiga-ui-mobile.less')}';${after}`,
        );

        return execFileSync(
            process.execPath,
            [
                require.resolve('less/bin/lessc'),
                `--include-path=${resolve('node_modules')}`,
                filename,
            ],
            {encoding: 'utf8'},
        );
    }
});
