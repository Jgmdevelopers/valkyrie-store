const { test, expect } = require("@playwright/test");
const path = require("path");
const { pathToFileURL } = require("url");

const urlProyecto = pathToFileURL(
  path.resolve(__dirname, "../index.html"),
).href;

const resoluciones = [
  { nombre: "escritorio", ancho: 1440, alto: 900 },
  { nombre: "tablet", ancho: 768, alto: 1024 },
  { nombre: "movil", ancho: 390, alto: 844 },
  { nombre: "movil-pequeno", ancho: 360, alto: 800 },
];

for (const resolucion of resoluciones) {
  test(`Hero responsive - ${resolucion.nombre}`, async ({ page }) => {
    await page.setViewportSize({
      width: resolucion.ancho,
      height: resolucion.alto,
    });

    await page.goto(urlProyecto);

    const hero = page.locator(".hero.hero-full");
    const contenido = hero.locator(".hero-content");

    await expect(hero).toBeVisible();
    await expect(contenido).toBeVisible();

    const estilos = await contenido.evaluate((elemento) => {
      const css = getComputedStyle(elemento);

      return {
        padding: css.padding,
        alignSelf: css.alignSelf,
        position: css.position,
        zIndex: css.zIndex,
      };
    });

    expect(estilos.alignSelf).toBe("center");
    expect(estilos.position).toBe("relative");
    expect(estilos.zIndex).toBe("2");

    const desbordamiento = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );

    expect(desbordamiento).toBe(false);

    console.log(resolucion.nombre, estilos);
  });
}
