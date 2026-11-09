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
    const titulo = hero.locator("h1");
    const subtitulo = titulo.locator("i");
    const descripcion = hero.locator(".hero-content p").first();

    // Estructura
    await expect(hero).toBeVisible();
    await expect(contenido).toBeVisible();
    await expect(titulo).toBeVisible();
    await expect(subtitulo).toBeVisible();
    await expect(descripcion).toBeVisible();

    // Contenido
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

    if (resolucion.ancho <= 640) {
      expect(estilos.padding).toBe("78px 20px 56px");
    } else if (resolucion.ancho <= 900) {
      expect(estilos.padding).toBe("95px 24px 90px");
    } else {
      const paddingEsperado = Number((resolucion.ancho * 0.07).toFixed(2));

      expect(estilos.padding).toBe(`120px ${paddingEsperado}px 110px`);
    }

    // Título
    const tipografia = await titulo.evaluate((elemento) => {
      const css = getComputedStyle(elemento);

      return {
        fontFamily: css.fontFamily,
        fontWeight: css.fontWeight,
        maxWidth: css.maxWidth,
        textTransform: css.textTransform,
      };
    });

    expect(tipografia.fontFamily).toContain("Cinzel");
    expect(tipografia.fontWeight).toBe("700");
    expect(tipografia.maxWidth).toBe("750px");
    expect(tipografia.textTransform).toBe("uppercase");

    const estilosSubtitulo = await subtitulo.evaluate((elemento) => {
      const css = getComputedStyle(elemento);

      return {
        display: css.display,
        fontWeight: css.fontWeight,
      };
    });

    expect(estilosSubtitulo.display).toBe("inline-block");
    expect(estilosSubtitulo.fontWeight).toBe("400");

    // Descripción
    const parrafo = await descripcion.evaluate((elemento) => {
      const css = getComputedStyle(elemento);

      return {
        fontFamily: css.fontFamily,
        color: css.color,
        fontSize: css.fontSize,
        lineHeight: css.lineHeight,
        maxWidth: css.maxWidth,
        marginBottom: css.marginBottom,
      };
    });

    expect(parrafo.fontFamily).toContain("DM Sans");
    expect(parrafo.color).toBe("rgb(226, 221, 215)");
    expect(parrafo.marginBottom).toBe("30px");

    if (resolucion.ancho <= 640) {
      expect(parrafo.fontSize).toBe("14px");
      expect(parrafo.lineHeight).toBe("24.5px");
      expect(parrafo.maxWidth).toBe("520px");
    } else if (resolucion.ancho <= 900) {
      expect(parrafo.fontSize).toBe("15px");
      expect(parrafo.lineHeight).toBe("27.75px");
      expect(parrafo.maxWidth).toBe("520px");
    } else {
      expect(parrafo.fontSize).toBe("16px");
      expect(parrafo.lineHeight).toBe("29.6px");
      expect(parrafo.maxWidth).toBe("560px");
    }

    // Desbordamiento horizontal
    const desbordamiento = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );

    expect(desbordamiento).toBe(false);

    const estilosHero = await hero.evaluate((elemento) => {
      const css = getComputedStyle(elemento);

      return {
        display: css.display,
        position: css.position,
        color: css.color,
        overflow: css.overflow,
        justifyContent: css.justifyContent,
        borderBottomWidth: css.borderBottomWidth,
      };
    });

    expect(estilosHero.display).toBe("flex");
    expect(estilosHero.position).toBe("relative");
    expect(estilosHero.color).toBe("rgb(255, 255, 255)");
    expect(estilosHero.overflow).toBe("hidden");
    expect(["flex-start", "flow-start"]).toContain(estilosHero.justifyContent);
    expect(estilosHero.borderBottomWidth).toBe("1px");

    console.log(`${resolucion.nombre}: OK`, {
      viewport: resolucion.ancho,
      padding: estilos.padding,
      titulo: tipografia.fontWeight,
      parrafo: parrafo.fontSize,
      desbordamiento,
    });
  });
}
