import {readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';

export function bundleMobileStyles(directory: string): void {
    const entry = join(directory, 'taiga-ui-mobile.less');

    writeFileSync(entry, inline(entry));

    function inline(file: string): string {
        return readFileSync(file, 'utf8').replaceAll(
            /^([\t ]*)@import '([^']+)';/gm,
            (declaration: string, indent: string, target: string) => {
                if (target === '@taiga-ui/styles/utils.less' && file !== entry) {
                    // Utility mixins are already imported at the top of the entry.
                    return '';
                }

                return target.startsWith('@')
                    ? declaration
                    : inline(join(dirname(file), target))
                          .trimEnd()
                          .split('\n')
                          .map((line) => (line ? `${indent}${line}` : line))
                          .join('\n');
            },
        );
    }
}
