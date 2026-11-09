const { test, expect } = require("@playwright/test");
const path = require("path");
const { pathToFileURL } = require("url");

const urlLocal = pathToFileURL(path.resolve(__dirname, "../index.html")).href;

const resoluciones = [
  { nombre: "escritorio", ancho: 1440, alto: 900 },
  { nombre: "tablet", ancho: 768, alto: 1024 },
  { nombre: "movil", ancho: 390, alto: 844 },
  { nombre: "movil-pequeno", ancho: 360, alto: 800 },
];

for (const resolucion of resoluciones) {
  test(`Header responsive - ${resolucion.nombre}`, async ({ page }) => {
    await page.setViewportSize({
      width: resolucion.ancho,
      height: resolucion.alto,
    });

    await page.goto(urlLocal);

    const header = page.locator(".topbar");
    const marca = header.locator(".brand");
    const menu = header.locator('nav[aria-label="Menú principal"]');
    const boton = header.locator(".header-cta");

    await expect(header).toBeVisible();
    await expect(marca).toBeVisible();
    await expect(menu).toBeVisible();
    await expect(boton).toBeVisible();

    await expect(marca).toContainText("VALKYRIE");
    await expect(marca).toContainText("STORE");
    await expect(boton).toContainText("Explorar");

    await expect(menu.locator("a")).toHaveCount(3);

    const cajas = {
      header: await header.boundingBox(),
      marca: await marca.boundingBox(),
      menu: await menu.boundingBox(),
      boton: await boton.boundingBox(),
    };

    for (const [nombre, caja] of Object.entries(cajas)) {
      expect(caja, `${nombre} debe tener dimensiones`).not.toBeNull();
      expect(caja.width, `${nombre} debe tener ancho`).toBeGreaterThan(0);
      expect(caja.height, `${nombre} debe tener alto`).toBeGreaterThan(0);
    }

    const seSuperponen = (a, b) =>
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y;

    expect(seSuperponen(cajas.marca, cajas.boton)).toBe(false);
    expect(seSuperponen(cajas.marca, cajas.menu)).toBe(false);
    expect(seSuperponen(cajas.menu, cajas.boton)).toBe(false);

    const hayDesbordamiento = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );

    expect(hayDesbordamiento).toBe(false);

    if (resolucion.ancho <= 900) {
      expect(cajas.menu.y).toBeGreaterThanOrEqual(
        cajas.marca.y + cajas.marca.height,
      );
    } else {
      expect(cajas.menu.y).toBeLessThan(cajas.marca.y + cajas.marca.height);
    }

    console.log(`${resolucion.nombre}: HEADER OK`, {
      viewport: resolucion.ancho,
      anchoHeader: cajas.header.width,
      anchoMarca: cajas.marca.width,
      anchoMenu: cajas.menu.width,
      anchoBoton: cajas.boton.width,
      desbordamiento: hayDesbordamiento,
    });
  });
}
