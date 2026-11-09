const { test, expect } = require("@playwright/test");
const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const raiz = path.resolve(__dirname, "..");

const archivos = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/index.html": ["index.html", "text/html; charset=utf-8"],
  "/styles.css": ["styles.css", "text/css; charset=utf-8"],
  "/script.js": ["script.js", "text/javascript; charset=utf-8"],
  "/products.json": ["products.json", "application/json; charset=utf-8"],
};

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
