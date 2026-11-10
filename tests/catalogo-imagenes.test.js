"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { validarImagenes } = require("../src/catalogo/validar-imagenes.js");

test("Acepta productos sin fotografía", () => {
  const productos = [{ id: "demo-1", imagen: "" }, { id: "demo-2" }];

  assert.deepEqual(validarImagenes(productos, process.cwd()), []);
});

test("Rechaza rutas que no pertenecen a productos", () => {
  const productos = [
    { id: "producto-1", imagen: "../archivo.jpg" },
    { id: "producto-2", imagen: "https://ejemplo.com/foto.jpg" },
  ];

  assert.equal(validarImagenes(productos, process.cwd()).length, 2);
});

test("Detecta fotografías inexistentes", () => {
  const productos = [
    { id: "producto-1", imagen: "assets/productos/no-existe.webp" },
  ];

  const errores = validarImagenes(productos, process.cwd());

  assert.equal(errores.length, 1);
  assert.match(errores[0], /no existe/);
});

test("Acepta fotografías existentes", () => {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), "valkyrie-imagenes-"));

  try {
    const carpeta = path.join(raiz, "assets", "productos");
    fs.mkdirSync(carpeta, { recursive: true });

    fs.writeFileSync(path.join(carpeta, "prueba.webp"), "imagen-de-prueba");

    const productos = [
      { id: "producto-1", imagen: "assets/productos/prueba.webp" },
    ];

    assert.deepEqual(validarImagenes(productos, raiz), []);
  } finally {
    fs.rmSync(raiz, { recursive: true, force: true });
  }
});
