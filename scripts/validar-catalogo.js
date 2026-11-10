"use strict";

const path = require("node:path");
const fs = require("node:fs");

const { validarImagenes } = require("../src/catalogo/validar-imagenes.js");

const raiz = path.resolve(__dirname, "..");
const archivo = path.join(raiz, "products.json");

try {
  const productos = JSON.parse(fs.readFileSync(archivo, "utf8"));
  const errores = validarImagenes(productos, raiz);

  if (errores.length > 0) {
    console.error("Errores en las fotografías del catálogo:");

    errores.forEach((error) => console.error(`- ${error}`));

    process.exitCode = 1;
  } else {
    console.log("OK: referencias de fotografías válidas.");
  }
} catch (error) {
  console.error("No se pudo validar el catálogo:", error.message);
  process.exitCode = 1;
}
