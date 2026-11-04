import path from 'node:path';

import base from '../../projects/demo-playwright/playwright.config';

const mode = process.env.REPRO_POSITIONING === 'js' ? 'js' : 'native';
const browser = process.env.REPRO_BROWSER_LABEL ?? 'chromium';

export default {
    ...base,
    testDir: __dirname,
    testMatch: 'nested-dropdown.pw.spec.ts',
    workers: 1,
    retries: 0,
    reporter: [
        ['list'],
        [
            'html',
            {outputFolder: path.join(__dirname, 'reports', browser, mode), open: 'never'},
        ],
    ],
    outputDir: path.join(__dirname, 'results', browser, mode),
    snapshotPathTemplate: path.join(__dirname, 'snapshots', browser, mode, '{arg}{ext}'),
    projects: base.projects?.filter((project) => project.name === 'chromium'),
    use: {
        ...base.use,
        baseURL: process.env.PW_BASE_URL ?? 'http://localhost:3000',
        launchOptions: process.env.CHROME_PATH
            ? {executablePath: process.env.CHROME_PATH}
            : {},
    },
};
