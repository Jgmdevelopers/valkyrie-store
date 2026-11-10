# Valkyrie Store — Contrato de datos del catálogo

**Versión:** 1.0
**Estado:** Implementado y validado
**Formato:** JSON
**Archivo de producción:** `products.json`

## 1. Objetivo

Establecer las reglas de estructura, validación y disponibilidad de los productos para mantener un catálogo confiable, compatible con GitHub Pages y reutilizable en futuras versiones.

## 2. Campos del producto

| Campo       | Tipo        | Requisito                                       |
| ----------- | ----------- | ----------------------------------------------- |
| id          | string      | Obligatorio, único y no vacío                   |
| nombre      | string      | Obligatorio, no vacío                           |
| categoria   | string      | Obligatorio, no vacío                           |
| descripcion | string      | Opcional                                        |
| precio      | number/null | Número finito mayor o igual a cero, o null      |
| stock       | integer     | Opcional, mayor o igual a cero                  |
| disponible  | boolean     | Opcional; false deshabilita la venta o consulta |
| destacado   | boolean     | Opcional                                        |
| imagen      | string      | Opcional                                        |
| variantes   | array       | Opcional, con variantes válidas                 |
| material    | string      | Opcional                                        |
| medidas     | string      | Opcional                                        |

## 3. Reglas de disponibilidad

- `disponible: false` significa producto no disponible.
- `stock: 0` significa agotado.
- `stock` positivo significa existencia registrada.
- La ausencia de `stock` significa cantidad no administrada.
- Los valores negativos, decimales o de tipo incorrecto se consideran datos inválidos.
- Las variantes utilizan reglas equivalentes de disponibilidad y stock.
- La disponibilidad efectiva de una opción depende tanto del producto como de la variante seleccionada.

## 4. Reglas de precios

- `precio: null` significa consultar precio.
- `precio: 0` es válido desde el punto de vista técnico.
- Los valores negativos, infinitos o no numéricos son inválidos.
- La moneda actual es ARS.
- La presentación utiliza formato regional `es-AR`.

## 5. Política de validación propuesta

La implementación deberá distinguir:

- Producto válido: se admite en el catálogo.
- Producto inválido: se identifica y se excluye de la presentación, sin impedir cargar los restantes.
- Catálogo inválido: se informa un error de carga o estructura.
- Identificadores duplicados: deben detectarse y rechazarse mediante una política determinista.

Los errores deberán poder diagnosticarse durante el desarrollo sin mostrar detalles técnicos innecesarios a los compradores.

## 6. Compatibilidad

- Mantener HTML, CSS y JavaScript sin backend.
- Conservar compatibilidad con GitHub Pages.
- No modificar productos comerciales para ejecutar pruebas.
- Utilizar fixtures independientes para validar escenarios.
- Mantener las pruebas existentes como regresión.

## 7. Estado de implementación

- [x] Validador de productos implementado.
- [x] Pruebas unitarias de datos inválidos.
- [x] Validación integrada en el catálogo público.
- [x] Detección de identificadores duplicados.
- [x] Validación de precios, stock y variantes.
- [x] Pruebas funcionales del catálogo.
- [x] Manejo de fotografías inexistentes.

## 8. Preparación comercial

- [ ] Incorporar fotografías reales autorizadas.
- [ ] Cargar productos confirmados por Pamela.
- [ ] Verificar precios y disponibilidad.
- [ ] Revisar talles, colores y variantes reales.
- [ ] Validar la presentación visual.
- [ ] Preparar publicación comercial.

````

Con esto mantenemos la documentación alineada con el software real.

## 3. Organizar el primer producto comercial

Cuando Pamela entregue las primeras fotografías, utilizaremos una estructura sencilla:

```text
assets/
└── productos/
    ├── .gitkeep
    ├── remera-001.webp
    ├── remera-002.webp
    └── accesorio-001.webp
````

Cada producto tendrá un identificador estable que no dependerá de su nombre comercial.

### Ejemplo de una prenda con talles

Este ejemplo es exclusivamente técnico; no debemos incorporarlo a `products.json` hasta disponer de datos reales.

<CodeBlock language="json" editable>
{
  "id": "remera-001",
  "nombre": "Remera estampada",
  "categoria": "Ropa nueva",
  "descripcion": "Remera de algodón con estampado.",
  "precio": 25000,
  "imagen": "assets/productos/remera-001.webp",
  "disponible": true,
  "destacado": false,
  "variantes": [
    {
      "nombre": "Negro / M",
      "stock": 2
    },
    {
      "nombre": "Negro / L",
      "stock": 1
    }
  ]
}
