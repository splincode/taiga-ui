import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";

const { chromium, webkit } = await import(
  process.env.PLAYWRIGHT_MODULE ?? "playwright"
);
const results = [];

for (const [name, type] of Object.entries({ chromium, webkit })) {
  const executablePath =
    process.env[`PW_${name.toUpperCase()}_EXECUTABLE_PATH`];
  const browser = await type.launch(executablePath ? { executablePath } : {});
  const page = await browser.newPage();
  const settle = () =>
    page.evaluate(
      () =>
        new Promise((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(resolve));
        }),
    );
  const inspect = (id) =>
    page.locator(`#${id}`).evaluate((element) => {
      const animation = element.getAnimations()[0];
      return {
        opacity: Number(getComputedStyle(element).opacity),
        timeline: animation?.timeline?.constructor.name ?? null,
        source: animation?.timeline?.source?.id ?? null,
        subject: animation?.timeline?.subject?.className ?? null,
        progress: animation?.effect.getComputedTiming().progress ?? null,
      };
    });

  try {
    await page.setContent(await readFile(new URL("./minimal.html", import.meta.url), "utf8"));
    await settle();
    const minimal = await inspect("indicator");
    await page.setContent(
      await readFile(new URL("./index.html", import.meta.url), "utf8"),
    );
    await settle();
    const initial = {};
    for (const id of [
      "original-indicator",
      "fixed-indicator",
      "delegated-indicator",
      "removed-indicator",
    ]) {
      initial[id] = await inspect(id);
    }
    assert.equal(initial["fixed-indicator"].opacity, 0);
    assert.equal(initial["fixed-indicator"].source, "fixed-source");
    assert.equal(initial["delegated-indicator"].source, "delegated-source");
    assert.equal(initial["removed-indicator"].source, null);

    await page.locator("#overflow").check();
    await settle();
    for (const id of ["fixed-source", "delegated-source"]) {
      await page.locator(`#${id}`).evaluate((element) => {
        element.scrollTop = (element.scrollHeight - element.clientHeight) / 2;
      });
    }
    await settle();
    const scrolled = {
      fixed: await inspect("fixed-indicator"),
      delegated: await inspect("delegated-indicator"),
      parent: await inspect("fixed-outer-indicator"),
    };
    assert.equal(scrolled.fixed.opacity, 1);
    assert.ok(Math.abs(scrolled.fixed.progress - 0.5) < 0.01);
    assert.ok(Math.abs(scrolled.delegated.progress - 0.5) < 0.01);
    assert.equal(scrolled.parent.source, "fixed-outer");
    assert.equal(scrolled.parent.progress, 0);

    await page.locator("#fixed-outer").evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    await settle();
    const afterParentScroll = await inspect("fixed-indicator");
    assert.ok(
      Math.abs(afterParentScroll.progress - scrolled.fixed.progress) < 0.01,
    );

    await page.locator("#overflow").uncheck();
    await settle();
    assert.equal((await inspect("fixed-indicator")).opacity, 0);
    results.push({
      browser: name,
      version: browser.version(),
      minimal,
      initial,
      scrolled,
      afterParentScroll,
      passed: true,
    });
  } finally {
    await browser.close();
  }
}
await writeFile(
  new URL("./results.json", import.meta.url),
  `${JSON.stringify(results, null, 2)}\n`,
);
process.stdout.write(`${results.length} browsers passed\n`);
