const { test, expect } = require("@playwright/test");
const { pathToFileURL } = require("node:url");
const path = require("node:path");

const paginaLocal = pathToFileURL(
  path.resolve(__dirname, "../index.html"),
).href;

const resoluciones = [
  { nombre: "escritorio", ancho: 1440, alto: 900 },
  { nombre: "tablet", ancho: 768, alto: 1024 },
  { nombre: "movil", ancho: 390, alto: 844 },
  { nombre: "movil-pequeno", ancho: 360, alto: 800 },
];

for (const resolucion of resoluciones) {
  test(`Evidencia visual - ${resolucion.nombre}`, async ({ page }) => {
    await page.setViewportSize({
      width: resolucion.ancho,
      height: resolucion.alto,
    });

    await page.goto(paginaLocal);

    await expect(page.locator(".topbar")).toBeVisible();
    await expect(page.locator(".hero.hero-full")).toBeVisible();

    await page.screenshot({
      path: `evidencias/visual/${resolucion.nombre}.png`,
      fullPage: false,
      animations: "disabled",
    });
  });
}
