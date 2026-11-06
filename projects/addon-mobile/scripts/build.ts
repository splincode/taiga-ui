import {readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';

import {ngPackagr} from 'ng-packagr';
import {from, lastValueFrom, tap} from 'rxjs';

import {getValueByFlag, hasFlag} from '../../../scripts/shared/argv.utils';
import {bundleMobileStyles} from './bundle-styles';

const project = resolve(
    getValueByFlag('--project', 'projects/addon-mobile/ng-package.json'),
);

const {dest} = JSON.parse(readFileSync(project, 'utf8')) as {dest: string};
const styles = resolve(dirname(project), dest, 'styles');
const poll = getValueByFlag('--poll', '');
const options = {poll: poll ? Number(poll) : undefined};
const packager = ngPackagr()
    .forProject(project)
    .withTsConfig(resolve(getValueByFlag('--tsConfig', 'tsconfig.build.json')));

const watch =
    hasFlag('--watch') && getValueByFlag<'false' | 'true'>('--watch', 'true') !== 'false';

const builds = watch ? packager.watch(options) : from(packager.build(options));

void lastValueFrom(builds.pipe(tap(() => bundleMobileStyles(styles)))).catch(
    (error: unknown) => {
        console.error(error);
        process.exitCode = 1;
    },
);
