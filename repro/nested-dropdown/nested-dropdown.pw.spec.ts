import {DemoRoute} from '@demo/routes';
import {TuiDocumentationPagePO, tuiGoto} from '@demo-playwright/utils';
import {expect, test} from '@playwright/test';
import {TUI_DROPDOWN_LOCATORS} from '@taiga-ui/testing/locators';

test('Nested dropdown content stays painted', async ({page, browser}) => {
    await page.setViewportSize({width: 1500, height: 900});
    await tuiGoto(page, DemoRoute.DataList, {
        anchorPositioning: process.env.REPRO_POSITIONING !== 'js',
    });

    const documentationPagePO = new TuiDocumentationPagePO(page);
    const example = documentationPagePO.getExample('#complex');

    await example.scrollIntoViewIfNeeded();
    await example.locator('button').click();
    await documentationPagePO.prepareBeforeScreenshot();
    await expect(example).toBeInViewport();
    await expect(page.locator(TUI_DROPDOWN_LOCATORS.HOST)).toHaveCount(3);

    await test.info().attach('environment.json', {
        contentType: 'application/json',
        body: JSON.stringify(
            {
                browser: browser.version(),
                positioning: process.env.REPRO_POSITIONING ?? 'native',
                page: await page.evaluate(() => ({
                    userAgent: navigator.userAgent,
                    deviceScaleFactor: devicePixelRatio,
                    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
                    maxTouchPoints: navigator.maxTouchPoints,
                })),
                dropdowns: await page
                    .locator(TUI_DROPDOWN_LOCATORS.HOST)
                    .evaluateAll((elements) =>
                        elements.map((element) => ({
                            className: element.className,
                            visibility: getComputedStyle(element).visibility,
                            rect: element.getBoundingClientRect().toJSON(),
                        })),
                    ),
            },
            null,
            2,
        ),
    });
    await expect.soft(page).toHaveScreenshot('01-nested-menu.png');

    const money = page
        .locator(TUI_DROPDOWN_LOCATORS.HOST)
        .locator('[name="moneyValue"]')
        .nth(0);

    await money.focus();
    await money.clear();
    await money.fill('2000');
    await money.press('Enter');

    await expect.soft(page).toHaveScreenshot('02-edited-money.png');
});
