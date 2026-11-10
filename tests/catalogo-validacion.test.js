"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  validarProducto,
  validarCatalogo,
} = require("../src/catalogo/validar-productos.js");

const base = () => ({
  id: "producto-1",
  nombre: "Campera de prueba",
  categoria: "Ropa nueva",
  precio: 45000,
  disponible: true,
  stock: 2,
});

test("Acepta un producto válido", () => {
  assert.equal(validarProducto(base(), 0).valido, true);
});

test("Acepta productos sin stock administrado", () => {
  const producto = base();
  delete producto.stock;

  assert.equal(validarProducto(producto, 0).valido, true);
});

test("Acepta precio a consultar y precio cero", () => {
  assert.equal(validarProducto({ ...base(), precio: null }, 0).valido, true);
  assert.equal(validarProducto({ ...base(), precio: 0 }, 0).valido, true);
});

test("Rechaza precios negativos o no numéricos", () => {
  for (const precio of [-100, "45000", NaN, Infinity]) {
    assert.equal(validarProducto({ ...base(), precio }, 0).valido, false);
  }
});

test("Rechaza stock negativo decimal o no numérico", () => {
  for (const stock of [-1, 1.5, "3", null]) {
    assert.equal(validarProducto({ ...base(), stock }, 0).valido, false);
  }
});

test("Rechaza identificadores y nombres vacíos", () => {
  assert.equal(validarProducto({ ...base(), id: " " }, 0).valido, false);
  assert.equal(validarProducto({ ...base(), nombre: "" }, 0).valido, false);
});

test("Rechaza variantes con stock inválido", () => {
  const producto = {
    ...base(),
    variantes: [{ nombre: "Talle M", stock: -2 }],
  };

  assert.equal(validarProducto(producto, 0).valido, false);
});

test("Acepta variantes válidas, incluidas las agotadas", () => {
  const producto = {
    ...base(),
    variantes: [
      { nombre: "Talle M", stock: 0 },
      { nombre: "Talle L", stock: 2 },
    ],
  };

  assert.equal(validarProducto(producto, 0).valido, true);
});

test("Detecta identificadores duplicados", () => {
  const resultado = validarCatalogo([
    base(),
    { ...base(), nombre: "Otro producto" },
  ]);

  assert.equal(resultado.validos.length, 1);
  assert.equal(resultado.errores.length, 1);
  assert.match(resultado.errores[0], /duplicado/);
});

test("Conserva los productos válidos si hay datos inválidos", () => {
  const resultado = validarCatalogo([
    base(),
    { ...base(), id: "producto-2", precio: -100 },
  ]);

  assert.equal(resultado.validos.length, 1);
  assert.equal(resultado.errores.length, 1);
});

test("Rechaza catálogos que no sean arreglos", () => {
  const resultado = validarCatalogo({ productos: [] });

  assert.equal(resultado.validos.length, 0);
  assert.equal(resultado.errores.length, 1);
});
