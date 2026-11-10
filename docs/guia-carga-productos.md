# Valkyrie Store — Guía de carga de productos

**Versión:** 1.0
**Destino:** Catálogo estático de Pamela
**Fuente de datos:** `products.json`

## Objetivo

Establecer un procedimiento simple para agregar, actualizar y retirar productos del catálogo público sin modificar el código JavaScript.

## 1. Preparar las fotografías

Guardar las imágenes en `assets/productos/`.

Recomendaciones:

- Formato preferido: WebP.
- Proporción sugerida: 4:5 para prendas.
- Resolución sugerida: 1000 × 1250 píxeles.
- Utilizar nombres descriptivos, únicos y sin espacios.
- Comprimir las imágenes para mejorar la velocidad de carga.
- Utilizar únicamente fotografías autorizadas de los productos.

## 2. Registrar los datos

Cada producto debe tener un identificador único, nombre y categoría.

Campos principales:

| Campo       | Descripción                           |
| ----------- | ------------------------------------- |
| id          | Código único del artículo             |
| nombre      | Nombre comercial                      |
| categoria   | Categoría de presentación             |
| descripcion | Características del producto          |
| precio      | Precio en pesos argentinos o null     |
| imagen      | Ruta relativa a la fotografía         |
| disponible  | Disponibilidad general                |
| stock       | Cantidad disponible, si se administra |
| destacado   | Indica si se destaca en el catálogo   |
| variantes   | Opciones como talles o colores        |
| material    | Material, si corresponde              |
| medidas     | Medidas, si corresponde               |

## 3. Ejemplo de producto

```json
{
  "id": "remera-001",
  "nombre": "Remera estampada",
  "categoria": "Ropa nueva",
  "descripcion": "Remera de algodón con estampado.",
  "precio": 25000,
  "imagen": "assets/productos/remera-001.webp",
  "disponible": true,
  "stock": 3,
  "destacado": false,
  "variantes": [
    {
      "nombre": "Talle M",
      "stock": 2
    },
    {
      "nombre": "Talle L",
      "stock": 1
    }
  ]
}
```

Este ejemplo es ficticio. No representa un producto ni un precio real de Pamela.

## 4. Reglas comerciales

- Si `precio` es `null`, se muestra «Consultar precio».
- Si `stock` es `0`, el artículo se considera agotado.
- Si `disponible` es `false`, no está disponible.
- Si existen variantes, cada una puede tener su propia disponibilidad.
- Si falta una fotografía, se utiliza la presentación alternativa del catálogo.
- Los productos inválidos se excluyen de la visualización.

## 5. Procedimiento de publicación

1. Recibir de Pamela la información y fotografías del producto.
2. Guardar las fotografías en `assets/productos/`.
3. Registrar o actualizar los datos en `products.json`.
4. Verificar que el JSON sea válido.
5. Ejecutar las pruebas automatizadas.
6. Revisar visualmente las tarjetas y el detalle.
7. Registrar los cambios mediante Git.
8. Publicar la actualización en el alojamiento correspondiente.
Antes de publicar, ejecutar npm run test:catalogo. Todas las fotografías referenciadas deben existir en assets/productos/. Los productos sin fotografía pueden mantener el campo imagen vacío y utilizarán la presentación alternativa del catálogo.
Cuando un producto tiene variantes, se considera agotado si ninguna está disponible. Se recomienda administrar las cantidades en cada variante y omitir el stock general cuando represente la misma mercadería, para evitar inconsistencias.

## 6. Evolución futura

En una versión posterior, ADAPTA podrá administrar estos productos mediante Laravel.

El catálogo público podrá obtener sus datos desde una API o integrarse como plantilla pública de ADAPTA.

Hasta entonces, `products.json` será la fuente de datos utilizada para la tienda estática.
