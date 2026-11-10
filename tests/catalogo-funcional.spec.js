const { test, expect } = require("@playwright/test");
const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const productosPrueba = require("./fixtures/productos-prueba.json");
const raiz = path.resolve(__dirname, "..");

const archivos = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/index.html": ["index.html", "text/html; charset=utf-8"],
  "/styles.css": ["styles.css", "text/css; charset=utf-8"],
  "/script.js": ["script.js", "text/javascript; charset=utf-8"],
  "/products.json": ["products.json", "application/json; charset=utf-8"],
  "/src/catalogo/validar-productos.js": [
    "src/catalogo/validar-productos.js",
    "text/javascript; charset=utf-8",
  ],
  "/config/tienda.json": [
    "config/tienda.json",
    "application/json; charset=utf-8",
  ],
  "/docs/borradores/productos-demo-completos.json": [
    "docs/borradores/productos-demo-completos.json",
    "application/json; charset=utf-8",
  ],
};

const imagenesDemo = [
  "remera-dama-negra-001.webp",
  "vestido-negro-cinturon-001.webp",
  "zapatillas-negras-001.webp",
  "zapatos-vestir-negros-001.webp",
];

for (const imagen of imagenesDemo) {
  const ruta = `/assets/productos/${imagen}`;

  archivos[ruta] = [`assets/productos/${imagen}`, "image/webp"];
}

let servidor;
let urlBase;

test.beforeAll(async () => {
  servidor = http.createServer(async (req, res) => {
    const ruta = new URL(req.url, "http://localhost").pathname;
    const archivo = archivos[ruta];

    if (!archivo) {
      res.writeHead(404);
      res.end("No encontrado");
      return;
    }

    try {
      const contenido = await fs.readFile(path.join(raiz, archivo[0]));

      res.writeHead(200, {
        "Content-Type": archivo[1],
      });
      res.end(contenido);
    } catch {
      res.writeHead(500);
      res.end("Error de lectura");
    }
  });

  await new Promise((resolve) => {
    servidor.listen(0, "127.0.0.1", resolve);
  });

  const direccion = servidor.address();
  urlBase = `http://127.0.0.1:${direccion.port}`;
});

test.afterAll(async () => {
  if (servidor) {
    await new Promise((resolve, reject) => {
      servidor.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test.beforeEach(async ({ page }) => {
  await page.goto(urlBase);

  await expect(page.locator("#result-count")).toHaveText("3 productos");
});

test("El catálogo carga los tres productos demostrativos", async ({ page }) => {
  const tarjetas = page.locator("#product-grid .product");

  await expect(tarjetas).toHaveCount(3);
  await expect(tarjetas.filter({ hasText: "Remera alternativa" })).toHaveCount(
    1,
  );
  await expect(tarjetas.filter({ hasText: "Accesorio" })).toHaveCount(1);
});

test("Muestra los cuatro productos del catálogo comercial de demostración", async ({
  page,
}) => {
  const productosDemo = require("../docs/borradores/productos-demo-completos.json");

  await page.route("**/products.json", async (ruta) => {
    await ruta.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(productosDemo),
    });
  });

  await page.reload();

  const tarjetas = page.locator("#product-grid .product");

  await expect(tarjetas).toHaveCount(4);
  await expect(page.locator("#result-count")).toHaveText("4 productos");

  for (const producto of productosDemo) {
    const tarjeta = tarjetas.filter({ hasText: producto.nombre });

    await expect(tarjeta).toHaveCount(1);

    await expect(tarjeta.locator(".price")).toHaveText(
      new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
      }).format(producto.precio),
    );

    const imagen = tarjeta.locator("img");

    await expect(imagen).toBeVisible();

    await expect
      .poll(() =>
        imagen.evaluate(
          (elemento) => elemento.complete && elemento.naturalWidth > 0,
        ),
      )
      .toBe(true);
  }
});

test("El filtro por categoría funciona", async ({ page }) => {
  await page
    .locator("#filters button", {
      hasText: "Accesorios",
    })
    .click();

  await expect(page.locator("#product-grid .product")).toHaveCount(1);
  await expect(page.locator("#result-count")).toHaveText("1 producto");

  await page
    .locator("#filters button", {
      hasText: "Todos",
    })
    .click();

  await expect(page.locator("#product-grid .product")).toHaveCount(3);
});

test("La búsqueda filtra los resultados", async ({ page }) => {
  await page.locator("#search").fill("accesorio");

  await expect(page.locator("#product-grid .product")).toHaveCount(1);

  await page.locator("#search").fill("producto inexistente");

  await expect(page.locator("#product-grid .product")).toHaveCount(0);
  await expect(page.locator("#empty-state")).toBeVisible();
});

test("El ordenamiento por nombre funciona", async ({ page }) => {
  await page.locator("#sort-products").selectOption("nombre");

  const nombres = await page
    .locator("#product-grid .product h3")
    .allTextContents();

  const ordenados = [...nombres].sort((a, b) => a.localeCompare(b, "es"));

  expect(nombres).toEqual(ordenados);
});

test("El filtro de disponibles conserva los productos disponibles", async ({
  page,
}) => {
  await page.locator("#only-available").check();

  await expect(page.locator("#product-grid .product")).toHaveCount(3);
});

test("El detalle del producto abre y cierra correctamente", async ({
  page,
}) => {
  await page
    .locator("#product-grid .product")
    .filter({ hasText: "Remera alternativa" })
    .getByRole("button", { name: "Ver producto" })
    .click();

  const dialogo = page.locator("#product-dialog");

  await expect(dialogo).toBeVisible();
  await expect(page.locator("#detail-title")).toContainText(
    "Remera alternativa",
  );

  await expect(page).toHaveURL(/#producto=demo-remera$/);

  await page.locator("#close-detail").click();

  await expect(dialogo).not.toBeVisible();
});

test("Se puede abrir un producto desde su enlace directo", async ({ page }) => {
  await page.goto(`${urlBase}/#producto=demo-accesorio`);

  await expect(page.locator("#product-dialog")).toBeVisible();

  await expect(page.locator("#detail-title")).toContainText("Accesorio");
});

test("WhatsApp permanece deshabilitado sin configuración", async ({ page }) => {
  await page
    .locator("#product-grid .product")
    .first()
    .getByRole("button", { name: "Ver producto" })
    .click();

  const enlace = page.locator("#detail-content .detail-actions a");

  await expect(enlace).toHaveAttribute("aria-disabled", "true");
  await expect(enlace).not.toHaveAttribute("href", /.+/);
});

async function cargarCatalogoDePrueba(page) {
  await page.route("**/products.json", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(productosPrueba),
    });
  });

  await page.reload();

  await expect(page.locator("#result-count")).toHaveText("4 productos");
}

async function cargarConfiguracionDePrueba(page, configuracion) {
  await page.route("**/config/tienda.json", async (ruta) => {
    await ruta.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(configuracion),
    });
  });

  await page.reload();

  await expect(page.locator("#result-count")).toHaveText("3 productos");
}

test("Excluye productos agotados y deshabilitados", async ({ page }) => {
  await cargarCatalogoDePrueba(page);

  await expect(page.locator("#product-grid .product-tag.sold")).toHaveCount(2);

  await page.locator("#only-available").check();

  await expect(page.locator("#product-grid .product")).toHaveCount(2);

  await expect(page.locator("#result-count")).toHaveText("2 productos");
});

test("Ordena correctamente los precios", async ({ page }) => {
  await cargarCatalogoDePrueba(page);

  const nombres = page.locator("#product-grid .product h3");

  await page.locator("#sort-products").selectOption("precio-asc");

  await expect(nombres).toHaveText([
    "Collar no disponible",
    "Remera agotada",
    "Campera de prueba",
    "Buzo sin precio",
  ]);

  await page.locator("#sort-products").selectOption("precio-desc");

  await expect(nombres).toHaveText([
    "Campera de prueba",
    "Remera agotada",
    "Collar no disponible",
    "Buzo sin precio",
  ]);
});

test("Muestra el precio o la opción consultar", async ({ page }) => {
  await cargarCatalogoDePrueba(page);

  const campera = page
    .locator("#product-grid .product")
    .filter({ hasText: "Campera de prueba" });

  await expect(campera.locator(".price")).toContainText("45.000");

  const buzo = page
    .locator("#product-grid .product")
    .filter({ hasText: "Buzo sin precio" });

  await expect(buzo.locator(".price")).toHaveText("Consultar precio");
});

test("Deshabilita variantes agotadas y selecciona una disponible", async ({
  page,
}) => {
  await cargarCatalogoDePrueba(page);

  await page
    .locator("#product-grid .product")
    .filter({ hasText: "Campera de prueba" })
    .getByRole("button", { name: "Ver producto" })
    .click();

  const selector = page.locator(".variant-select");

  await expect(selector).toBeVisible();

  await expect(selector.locator("option").nth(0)).toBeDisabled();

  await expect(selector.locator("option").nth(1)).toBeEnabled();

  await expect(selector).toHaveValue("1");

  await expect(page.locator(".detail-availability")).toContainText(
    "Disponible para consultar",
  );
});

async function cargarDatosDePrueba(page, datos) {
  await page.route("**/products.json", async (ruta) => {
    await ruta.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(datos),
    });
  });

  await page.reload();
}

test("Marca agotado cuando todas las variantes están sin stock", async ({
  page,
}) => {
  await cargarDatosDePrueba(page, [
    {
      id: "remera-agotada",
      nombre: "Remera agotada",
      categoria: "Ropa nueva",
      precio: 15000,
      disponible: true,
      variantes: [
        { nombre: "Talle M", stock: 0 },
        { nombre: "Talle L", stock: 0 },
      ],
    },
  ]);

  const tarjeta = page.locator("#product-grid .product");

  await expect(tarjeta.locator(".product-tag.sold")).toHaveText("Agotado");

  await tarjeta.getByRole("button", { name: "Ver producto" }).click();

  await expect(page.locator(".detail-availability")).toHaveText(
    "Actualmente no disponible",
  );

  const contacto = page.locator("#detail-content .detail-actions a");

  await expect(contacto).toHaveAttribute("aria-disabled", "true");

  await page.locator("#close-detail").click();

  await page.locator("#only-available").check();

  await expect(page.locator("#product-grid .product")).toHaveCount(0);
});

test("Mantiene disponible el producto si una variante tiene stock", async ({
  page,
}) => {
  await cargarDatosDePrueba(page, [
    {
      id: "remera-disponible",
      nombre: "Remera con talles",
      categoria: "Ropa nueva",
      precio: 18000,
      disponible: true,
      variantes: [
        { nombre: "Talle M", stock: 0 },
        { nombre: "Talle L", stock: 2 },
      ],
    },
  ]);

  const tarjeta = page.locator("#product-grid .product");

  await expect(tarjeta.locator(".product-tag.sold")).toHaveCount(0);

  await page.locator("#only-available").check();

  await expect(tarjeta).toHaveCount(1);

  await tarjeta.getByRole("button", { name: "Ver producto" }).click();

  const selector = page.locator(".variant-select");

  await expect(selector.locator("option").nth(0)).toBeDisabled();
  await expect(selector.locator("option").nth(1)).toBeEnabled();
  await expect(selector).toHaveValue("1");

  await expect(page.locator(".detail-availability")).toContainText(
    "Disponible para consultar",
  );
});

test("Excluye productos con precios inválidos", async ({ page }) => {
  const productos = [
    {
      id: "producto-valido",
      nombre: "Producto válido",
      categoria: "Accesorios",
      precio: 15000,
    },
    {
      id: "producto-invalido",
      nombre: "Producto inválido",
      categoria: "Accesorios",
      precio: -500,
    },
  ];

  await cargarDatosDePrueba(page, productos);

  await expect(page.locator("#result-count")).toHaveText("1 producto");

  await expect(page.locator("#product-grid .product")).toHaveCount(1);

  await expect(page.locator("#product-grid")).not.toContainText(
    "Producto inválido",
  );
});

test("No muestra productos con identificadores duplicados", async ({
  page,
}) => {
  const productos = [
    {
      id: "remera-001",
      nombre: "Remera original",
      categoria: "Ropa nueva",
      precio: 20000,
    },
    {
      id: "remera-001",
      nombre: "Remera duplicada",
      categoria: "Ropa nueva",
      precio: 25000,
    },
  ];

  await cargarDatosDePrueba(page, productos);

  await expect(page.locator("#result-count")).toHaveText("1 producto");

  await expect(page.locator("#product-grid")).toContainText("Remera original");

  await expect(page.locator("#product-grid")).not.toContainText(
    "Remera duplicada",
  );
});

test("Muestra el estado vacío cuando todos los productos son inválidos", async ({
  page,
}) => {
  await cargarDatosDePrueba(page, [
    {
      id: "sin-precio-valido",
      nombre: "Producto de prueba",
      categoria: "Accesorios",
      precio: -100,
    },
  ]);

  await expect(page.locator("#result-count")).toHaveText("0 productos");

  await expect(page.locator("#product-grid .product")).toHaveCount(0);

  await expect(page.locator("#empty-state")).toBeVisible();
});

test("Muestra una fotografía válida del producto", async ({ page }) => {
  const imagen = "assets/productos/prueba.svg";

  // Simulamos una imagen sin agregar archivos al catálogo real.
  await page.route("**/assets/productos/prueba.svg", async (ruta) => {
    await ruta.fulfill({
      status: 200,
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400"><rect width="300" height="400" fill="#555"/></svg>',
    });
  });

  await cargarDatosDePrueba(page, [
    {
      id: "producto-con-foto",
      nombre: "Producto con fotografía",
      categoria: "Ropa nueva",
      precio: 15000,
      imagen,
    },
  ]);

  const tarjeta = page.locator("#product-grid .product");

  await expect(tarjeta.locator("img")).toBeVisible();
  await expect(tarjeta.locator(".no-photo")).toHaveCount(0);

  await tarjeta.getByRole("button", { name: "Ver producto" }).click();

  const fotoDetalle = page.locator(".detail-photo img");

  await expect(fotoDetalle).toBeVisible();
  await expect(fotoDetalle).toHaveCSS("object-fit", "contain");
});

test("Muestra el fallback cuando la fotografía falla", async ({ page }) => {
  await page.route("**/assets/productos/inexistente.webp", async (ruta) => {
    await ruta.fulfill({
      status: 404,
      body: "Imagen no encontrada",
    });
  });

  await cargarDatosDePrueba(page, [
    {
      id: "producto-sin-foto",
      nombre: "Producto sin fotografía",
      categoria: "Accesorios",
      precio: 10000,
      imagen: "assets/productos/inexistente.webp",
    },
  ]);

  const media = page.locator("#product-grid .product-image");

  await expect(media).toHaveClass(/no-photo/);
  await expect(media.locator("img")).toHaveCount(0);
});

test("WhatsApp permanece deshabilitado con número inválido", async ({
  page,
}) => {
  await cargarConfiguracionDePrueba(page, {
    moneda: "ARS",
    whatsapp: "549-telefono-invalido",
  });

  const enlaceGeneral = page.locator("#general-whatsapp");

  await expect(enlaceGeneral).toHaveAttribute("aria-disabled", "true");

  await page
    .locator("#product-grid .product")
    .first()
    .getByRole("button", { name: "Ver producto" })
    .click();

  const enlaceProducto = page.locator("#detail-content .detail-actions a");

  await expect(enlaceProducto).toHaveAttribute("aria-disabled", "true");
  await expect(enlaceProducto).not.toHaveAttribute("href", /.+/);
});

test("WhatsApp habilita los enlaces con configuración válida", async ({
  page,
}) => {
  const numeroPrueba = "5491112345678";

  await cargarConfiguracionDePrueba(page, {
    moneda: "ARS",
    whatsapp: numeroPrueba,
  });

  const enlaceGeneral = page.locator("#general-whatsapp");

  await expect(enlaceGeneral).not.toHaveAttribute("aria-disabled", "true");
  await expect(enlaceGeneral).toHaveAttribute(
    "href",
    new RegExp(`^https://wa\\.me/${numeroPrueba}\\?text=`),
  );

  await expect(enlaceGeneral).toHaveAttribute("target", "_blank");
  await expect(enlaceGeneral).toHaveAttribute("rel", /noopener noreferrer/);
});

test("La consulta de WhatsApp incluye el nombre y código del producto", async ({
  page,
}) => {
  await cargarConfiguracionDePrueba(page, {
    moneda: "ARS",
    whatsapp: "5491112345678",
  });

  await page
    .locator("#product-grid .product")
    .filter({ hasText: "Remera alternativa" })
    .getByRole("button", { name: "Ver producto" })
    .click();

  const enlace = page.locator("#detail-content .detail-actions a");
  const href = await enlace.getAttribute("href");

  expect(href).toBeTruthy();

  const url = new URL(href);
  const mensaje = url.searchParams.get("text");

  expect(url.hostname).toBe("wa.me");
  expect(url.pathname).toBe("/5491112345678");
  expect(mensaje).toContain("Remera alternativa");
  expect(mensaje).toContain("demo-remera");
  expect(mensaje).toContain("#producto=demo-remera");
});

test("La consulta de WhatsApp incluye la variante seleccionada", async ({
  page,
}) => {
  await page.route("**/products.json", async (ruta) => {
    await ruta.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: "remera-prueba",
          nombre: "Remera de prueba",
          categoria: "Ropa nueva",
          precio: 15000,
          disponible: true,
          variantes: [
            { nombre: "Talle M", stock: 2 },
            { nombre: "Talle L", stock: 1 },
          ],
        },
      ]),
    });
  });

  await page.route("**/config/tienda.json", async (ruta) => {
    await ruta.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        moneda: "ARS",
        whatsapp: "5491112345678",
      }),
    });
  });

  await page.reload();

  await expect(page.locator("#result-count")).toHaveText("1 producto");

  await page.getByRole("button", { name: "Ver producto" }).click();

  await page.locator(".variant-select").selectOption("1");

  const enlace = page.locator("#detail-content .detail-actions a");
  const href = await enlace.getAttribute("href");

  expect(href).toBeTruthy();

  const mensaje = new URL(href).searchParams.get("text");

  expect(mensaje).toContain("Remera de prueba");
  expect(mensaje).toContain("remera-prueba");
  expect(mensaje).toContain("Talle L");
});

test("El catálogo funciona aunque falle la configuración comercial", async ({
  page,
}) => {
  await page.route("**/config/tienda.json", async (ruta) => {
    await ruta.fulfill({
      status: 500,
      body: "Error de configuración",
    });
  });

  await page.reload();

  await expect(page.locator("#result-count")).toHaveText("3 productos");

  await expect(page.locator("#product-grid .product")).toHaveCount(3);

  await expect(page.locator("#general-whatsapp")).toHaveAttribute(
    "aria-disabled",
    "true",
  );
});

test("Oculta las redes sociales sin configurar", async ({ page }) => {
  await expect(page.locator("#redes-sociales")).toBeHidden();

  await expect(page.locator("#link-instagram")).not.toHaveAttribute(
    "href",
    /.+/,
  );

  await expect(page.locator("#link-facebook")).not.toHaveAttribute(
    "href",
    /.+/,
  );
});

test("Muestra redes sociales con direcciones válidas", async ({ page }) => {
  await cargarConfiguracionDePrueba(page, {
    moneda: "ARS",
    whatsapp: "",
    instagram: "https://www.instagram.com/valkyrie.ejemplo/",
    facebook: "https://www.facebook.com/valkyrie.ejemplo/",
  });

  await expect(page.locator("#redes-sociales")).toBeVisible();

  await expect(page.locator("#link-instagram")).toHaveAttribute(
    "href",
    "https://www.instagram.com/valkyrie.ejemplo/",
  );

  await expect(page.locator("#link-facebook")).toHaveAttribute(
    "href",
    "https://www.facebook.com/valkyrie.ejemplo/",
  );

  await expect(page.locator("#link-instagram")).toHaveAttribute(
    "rel",
    /noopener noreferrer/,
  );
});

test("Rechaza enlaces sociales inválidos", async ({ page }) => {
  await cargarConfiguracionDePrueba(page, {
    moneda: "ARS",
    whatsapp: "",
    instagram: "https://www.instagram.com.ejemplo.com/perfil",
    facebook: "javascript:alert(1)",
  });

  await expect(page.locator("#redes-sociales")).toBeHidden();

  await expect(page.locator("#link-instagram")).not.toHaveAttribute(
    "href",
    /.+/,
  );

  await expect(page.locator("#link-facebook")).not.toHaveAttribute(
    "href",
    /.+/,
  );
});

test("El modo normal no muestra el aviso de demostración", async ({ page }) => {
  await expect(page.locator("#demo-notice")).toBeHidden();

  await expect(page.locator("#result-count")).toHaveText("3 productos");
});

test("El modo demostración carga cuatro productos y bloquea WhatsApp", async ({
  page,
}) => {
  await page.goto(`${urlBase}/?demo=1`);

  await expect(page.locator("#demo-notice")).toBeVisible();

  await expect(page.locator("#demo-notice")).toContainText(
    "Los precios, talles y cantidades son ilustrativos",
  );

  await expect(page.locator("#result-count")).toHaveText("4 productos");

  await expect(page.locator("#product-grid .product")).toHaveCount(4);

  const contactoGeneral = page.locator("#general-whatsapp");

  await expect(contactoGeneral).not.toHaveAttribute("href");

  const primerProducto = page.locator("#product-grid .product").first();

  await primerProducto.getByRole("button", { name: "Ver producto" }).click();

  const contactoProducto = page.locator("#detail-content .detail-actions a");

  await expect(contactoProducto).toHaveAttribute("aria-disabled", "true");

  await expect(contactoProducto).not.toHaveAttribute("href");
});

test("Limita la altura de las fotografías del detalle en móvil", async ({
  page,
}) => {
  await page.setViewportSize({
    width: 390,
    height: 844,
  });

  await page.goto(`${urlBase}/?demo=1`);

  await expect(page.locator("#result-count")).toHaveText("4 productos");

  const productos = [
    "Remera básica negra de mujer",
    "Vestido negro evasé con lazo",
    "Zapatillas urbanas negras con cordones",
    "Zapatos de vestir negros tipo mocasín",
  ];

  for (const nombre of productos) {
    const tarjeta = page
      .locator("#product-grid .product")
      .filter({ hasText: nombre });

    await tarjeta.getByRole("button", { name: "Ver producto" }).click();

    const fotografia = page.locator(".detail-photo");
    const dimensiones = await fotografia.boundingBox();

    expect(dimensiones).not.toBeNull();
    expect(dimensiones.height).toBeLessThanOrEqual(261);

    await expect(page.locator(".detail-info")).toBeVisible();

    await page.locator("#close-detail").click();
  }
});
