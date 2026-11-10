"use strict";

const path = require("node:path");
const fs = require("node:fs");

function validarImagenes(productos, raiz) {
  const errores = [];

  if (!Array.isArray(productos)) {
    return ["El catálogo debe ser un arreglo de productos."];
  }

  const carpetaProductos = path.resolve(raiz, "assets", "productos");

  for (const producto of productos) {
    if (!producto || typeof producto !== "object") {
      errores.push("Se encontró un producto inválido.");
      continue;
    }

    const imagen = producto.imagen;

    // Los productos demostrativos pueden no tener fotografía.
    if (imagen === undefined || imagen === "") {
      continue;
    }

    if (typeof imagen !== "string") {
      errores.push(`${producto.id}: la imagen debe ser una ruta de texto.`);
      continue;
    }

    const ruta = imagen.replaceAll("\\", "/");

    if (
      !/^assets\/productos\/[a-zA-Z0-9_-]+\.(webp|png|jpg|jpeg)$/i.test(ruta)
    ) {
      errores.push(`${producto.id}: ruta de imagen inválida: ${imagen}`);
      continue;
    }

    const archivo = path.resolve(raiz, ruta);

    if (
      !archivo.startsWith(carpetaProductos + path.sep) ||
      !fs.existsSync(archivo)
    ) {
      errores.push(`${producto.id}: no existe la imagen ${imagen}`);
      continue;
    }

    if (!fs.statSync(archivo).isFile()) {
      errores.push(`${producto.id}: la imagen no es un archivo.`);
    }
  }

  return errores;
}

module.exports = { validarImagenes };
