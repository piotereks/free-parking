import { test, expect } from '@playwright/test';

test('donate tooltip is two lines and fully visible', async ({ page }) => {
  await page.goto('/');

  const donateButton = page.locator('.donate-btn');
  await expect(donateButton).toBeVisible();
  await donateButton.hover();

  const tooltip = page.locator('#donate-tooltip');
  await expect(tooltip).toBeVisible();

  const subLines = tooltip.locator('.tooltip-sub span');
  await expect(subLines).toHaveCount(2);

  const lineInfo = await subLines.evaluateAll((nodes) =>
    nodes.map((node) => ({
      rects: Array.from(node.getClientRects()).length,
      top: Math.round(node.getBoundingClientRect().top)
    }))
  );

  const uniqueTops = new Set(lineInfo.map((line) => line.top));
  expect(uniqueTops.size).toBe(2);
  expect(lineInfo.every((line) => line.rects === 1)).toBe(true);

  const tooltipBox = await tooltip.boundingBox();
  expect(tooltipBox).toBeTruthy();

  const viewport = page.viewportSize();
  expect(viewport).toBeTruthy();

  if (tooltipBox && viewport) {
    expect(tooltipBox.x).toBeGreaterThanOrEqual(0);
    expect(tooltipBox.y).toBeGreaterThanOrEqual(0);
    expect(tooltipBox.x + tooltipBox.width).toBeLessThanOrEqual(viewport.width);
    expect(tooltipBox.y + tooltipBox.height).toBeLessThanOrEqual(viewport.height);
  }
});
