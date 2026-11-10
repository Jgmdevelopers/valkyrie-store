"use strict";

(function (raiz, fabrica) {
  const validador = fabrica();

  if (typeof module === "object" && module.exports) {
    module.exports = validador;
  }

  if (typeof window !== "undefined") {
    raiz.ValidadorCatalogo = validador;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const esObjeto = (valor) =>
    valor !== null && typeof valor === "object" && !Array.isArray(valor);

  const textoValido = (valor) =>
    typeof valor === "string" && valor.trim().length > 0;

  const camposTexto = ["descripcion", "imagen", "material", "medidas"];
  const camposBooleanos = ["disponible", "destacado"];

  function validarStock(objeto, errores, prefijo) {
    if (!Object.hasOwn(objeto, "stock")) return;

    if (!Number.isInteger(objeto.stock) || objeto.stock < 0) {
      errores.push(`${prefijo}.stock: debe ser un entero no negativo`);
    }
  }

  function validarVariante(variante, indice, errores, prefijo) {
    const ubicacion = `${prefijo}.variantes[${indice}]`;

    if (!esObjeto(variante)) {
      errores.push(`${ubicacion}: debe ser un objeto`);
      return;
    }

    if (!textoValido(variante.nombre)) {
      errores.push(`${ubicacion}.nombre: obligatorio`);
    }

    if (
      Object.hasOwn(variante, "disponible") &&
      typeof variante.disponible !== "boolean"
    ) {
      errores.push(`${ubicacion}.disponible: debe ser booleano`);
    }

    validarStock(variante, errores, ubicacion);
  }

  function validarProducto(producto, indice) {
    const errores = [];
    const ubicacion = `productos[${indice}]`;

    if (!esObjeto(producto)) {
      return {
        valido: false,
        errores: [`${ubicacion}: debe ser un objeto`],
      };
    }

    for (const campo of ["id", "nombre", "categoria"]) {
      if (!textoValido(producto[campo])) {
        errores.push(`${ubicacion}.${campo}: obligatorio`);
      }
    }

    if (
      producto.precio !== undefined &&
      producto.precio !== null &&
      (typeof producto.precio !== "number" ||
        !Number.isFinite(producto.precio) ||
        producto.precio < 0)
    ) {
      errores.push(`${ubicacion}.precio: valor inválido`);
    }

    validarStock(producto, errores, ubicacion);

    for (const campo of camposBooleanos) {
      if (
        Object.hasOwn(producto, campo) &&
        typeof producto[campo] !== "boolean"
      ) {
        errores.push(`${ubicacion}.${campo}: debe ser booleano`);
      }
    }

    for (const campo of camposTexto) {
      if (
        Object.hasOwn(producto, campo) &&
        typeof producto[campo] !== "string"
      ) {
        errores.push(`${ubicacion}.${campo}: debe ser texto`);
      }
    }

    if (Object.hasOwn(producto, "variantes")) {
      if (!Array.isArray(producto.variantes)) {
        errores.push(`${ubicacion}.variantes: debe ser un arreglo`);
      } else {
        producto.variantes.forEach((variante, i) =>
          validarVariante(variante, i, errores, ubicacion),
        );
      }
    }

    return {
      valido: errores.length === 0,
      errores,
    };
  }

  function validarCatalogo(datos) {
    if (!Array.isArray(datos)) {
      return {
        validos: [],
        errores: ["El catálogo debe ser un arreglo"],
      };
    }

    const validos = [];
    const errores = [];
    const identificadores = new Set();

    datos.forEach((producto, indice) => {
      const resultado = validarProducto(producto, indice);

      if (!resultado.valido) {
        errores.push(...resultado.errores);
        return;
      }

      const id = producto.id.trim();

      if (identificadores.has(id)) {
        errores.push(`productos[${indice}].id: duplicado (${id})`);
        return;
      }

      identificadores.add(id);
      validos.push(producto);
    });

    return { validos, errores };
  }

  return { validarProducto, validarCatalogo };
});
