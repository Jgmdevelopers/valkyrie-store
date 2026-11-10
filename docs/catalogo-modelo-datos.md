# Valkyrie Store — Contrato de datos del catálogo

**Versión:** 1.0 (propuesta)
**Estado:** Pendiente de implementación y validación
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

## 7. Pendientes

- Implementar el validador.
- Agregar pruebas unitarias de datos inválidos.
- Integrar la validación en la carga del catálogo.
- Revisar reglas de variantes y disponibilidad efectiva.
- Actualizar documentación y criterios de aceptación.
