import {DemoRoute} from '@demo/routes';
import {TuiDocumentationPagePO, tuiGoto} from '@demo-playwright/utils';
import {expect, test} from '@playwright/test';

test.describe('TuiScrollbar', () => {
    test('nested scrollbars track their own scroll position', async ({page}) => {
        await tuiGoto(page, DemoRoute.Scrollbar);

        const example = new TuiDocumentationPagePO(page).getExample('#nested-scrollbar');
        const parent = example.locator('tui-scrollbar').first();
        const child = example.locator('child tui-scrollbar');
        const parentThumb = parent.locator(
            ':scope > tui-scroll-controls .t-bar_vertical .t-thumb',
        );

        const childThumb = child.locator(
            ':scope > tui-scroll-controls .t-bar_vertical .t-thumb',
        );

        await parent.evaluate((element) => {
            element.style.blockSize = '15rem';
        });

        await expect(parentThumb).toHaveCSS('opacity', '0.2');
        await expect(childThumb).toHaveCSS('opacity', '0.2');
        await expect
            .poll(async () =>
                parentThumb.evaluate((element) => (element as HTMLElement).offsetTop),
            )
            .toBe(0);

        await child.evaluate((element) => element.scrollTo({top: element.scrollHeight}));

        await expect
            .poll(async () =>
                childThumb.evaluate((element) => (element as HTMLElement).offsetTop),
            )
            .toBeGreaterThan(0);
        await expect
            .poll(async () =>
                parentThumb.evaluate((element) => (element as HTMLElement).offsetTop),
            )
            .toBe(0);

        await child.evaluate((element) => element.scrollTo({top: 0}));
        await parent.evaluate((element) => element.scrollTo({top: element.scrollHeight}));

        await expect
            .poll(async () =>
                parentThumb.evaluate((element) => (element as HTMLElement).offsetTop),
            )
            .toBeGreaterThan(0);
        await expect
            .poll(async () =>
                childThumb.evaluate((element) => (element as HTMLElement).offsetTop),
            )
            .toBe(0);
    });

    test('nested scrollbar on Parent paragraph hover', async ({page}) => {
        await tuiGoto(page, DemoRoute.Scrollbar);

        const documentationPage = new TuiDocumentationPagePO(page);
        const example = documentationPage.getExample('#nested-scrollbar');

        await example.locator('p').filter({hasText: 'Parent'}).hover();
        await expect(example).toHaveScreenshot('scrollbar-nested-hover-parent.png');
    });
});
