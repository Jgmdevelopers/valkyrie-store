# Valkyrie Store — catálogo estático

Landing page responsive en HTML, CSS y JavaScript, sin backend ni dependencias de compilación. Los productos actuales son **ejemplos ficticios**, no artículos reales ni precios de Pamela.

## Probar localmente

En terminal, dentro de la carpeta del proyecto:

```bash
python -m http.server 8000
```

Abrir http://localhost:8000. No abrir `index.html` directamente como archivo: el catálogo se carga con `fetch` y requiere servidor HTTP.

## Personalizar

1. Editar `products.json` para reemplazar los ejemplos por productos reales. `precio` acepta un número en ARS (por ejemplo `25000`) o `null` para «Consultar precio».
2. Copiar fotografías a `assets/` y referenciarlas en el campo `imagen`, por ejemplo `assets/remera.jpg`. Procurar imágenes propias y optimizadas.
3. Para habilitar las consultas comerciales, configurar el campo whatsapp en config/tienda.json con el número autorizado por Pamela, en formato internacional, sin +, espacios ni guiones. Mientras permanezca vacío, los enlaces de consulta estarán deshabilitados.
4. Cambiar la descripción comercial y datos de contacto en `index.html`. Nunca colocar datos personales sin autorización.
5. Publicar en un hosting estático que permita el uso comercial planificado, previa revisión de sus condiciones vigentes. El repositorio puede alojarse en GitHub sin habilitar GitHub Pages como hosting comercial.

## Limitaciones de la primera versión

- Sin ventas ni pagos dentro del sitio; los pedidos se coordinan por WhatsApp.
- Sin panel administrador ni actualización automática de stock.
- La edición requiere modificar archivos y desplegar una nueva versión.
- Los botones de WhatsApp quedan desactivados hasta configurar el teléfono.

## Próximos pasos

Fotografías reales, identidad de marca aprobada, carga de inventario, política de privacidad y opciones de entrega.

## Novedades v0.2

- Botón **Ver detalles** por producto con ficha en ventana accesible mediante teclado (diálogo nativo).
- Botón **Compartir producto**: usa compartir del celular cuando está disponible o copia un enlace.
- Enlaces directos tipo `https://tu-dominio/#producto=ejemplo-1`: al abrirlos se muestra la ficha correspondiente.
- El mensaje a WhatsApp sigue deshabilitado hasta configurar el número autorizado.

## Probar la v0.2

1. Ejecutar `python -m http.server 8000` desde esta carpeta.
2. Abrir `http://localhost:8000`, pulsar **Ver detalles**.
3. Pulsar **Compartir producto** y comprobar que el vínculo contiene `#producto=...`.
4. Abrir ese enlace en otra pestaña y confirmar que aparece la ficha.
5. Probar búsqueda y filtros; verificar que no se pueda consultar un producto vendido.

## Novedades v0.3 — identidad alternativa

- Nuevo diseño **dark / metal**, con negro, grafito, gris acero y blanco y tipografía de alto impacto.
- Adaptación de encabezado, portada, catálogo, fichas de productos y contacto.
- Categorías del negocio: **Ropa nueva**, **Accesorios**, **Productos variados**.
- Se conservan búsqueda, filtros, fichas compartibles y consultas por WhatsApp de v0.2.
- La referencia Hitch Wear se usó solo como orientación estética: no se copian imágenes, logos ni productos.
- Datos actuales **demostrativos**, sin precios ficticios. Reemplazar por artículos realmente comercializados por Pamela.

**Instalación sobre v0.2:** resguardar cambios propios, crear `feature/identidad-dark-metal`, reemplazar los cuatro archivos `index.html`, `styles.css`, `products.json`, `README.md` (y opcionalmente `script.js`, que no tiene cambios en esta versión). Ejecutar servidor local y comprobar filtros, ficha de producto, enlaces directos y responsive.

## Novedades v0.4 — Black & White

- Se eliminó completamente el rojo, rosa y bordó del diseño.
- Paleta estrictamente acromática: negro, blanco, grafito, grises y plateado.
- Botones blancos con texto negro, acentos plateados y foco visible.
- No se modificó la lógica de productos, filtros o WhatsApp.
- Actualización recomendada: reemplazar únicamente `styles.css` sobre v0.3 (o copiar todo si no realizaste cambios propios).

## v0.5 — Feminidad nórdica

- Identidad femenina elegante con referencia simbólica a las valquirias y geometría nórdica original.
- Tipografía Cinzel para títulos, marca y piezas visuales; DM Sans para lectura cotidiana.
- Paleta monocromática estricta (negro, blanco, gris, plata). Sin rojos, rosas ni bordó.
- Símbolo SVG propio integrado en el encabezado y la portada; no se copiaron marcas externas.
- El catálogo y la lógica de WhatsApp permanecen igual. Fotos y productos continúan siendo ejemplos.

**Actualizar desde v0.4:** crear rama `feature/identidad-valquiria-femenina`, reemplazar `index.html` y `styles.css`, y conservar `script.js` y `products.json` si ya tienen datos reales.


## v0.6 — Identidad gothic metal

- Paleta monocromática: negro, grafito, plata y blanco.
- Portada ilustrada original con valquiria rockera y estilo gótico. El arte es conceptual y no representa un producto a la venta.
- Categorías vinculadas con filtros funcionales.
- Sin carrito ni pago en línea: el catálogo es para consultas.
- No publicar un número de WhatsApp sin autorización de Pamela.
- Los productos cargados son demos: reemplazar por fichas y fotos reales antes de lanzar.

Para validar: `python -m http.server 8000`, abrir `http://localhost:8000`, probar búsqueda, categorías, diálogo y enlace compartible.

## v0.7 — Catálogo preparado para ventas

- Filtro **Solo disponibles** y ordenamiento (destacados, nombre, precio ascendente y descendente).
- Ficha con **variantes opcionales** (talles, colores o medidas), identificadas por nombre y disponibilidad.
- Consulta de WhatsApp incluyendo nombre, código, opción elegida y enlace compartible.
- Un producto agotado o una variante agotada no genera enlace de consulta.
- No se modificaron `products.json` ni las fotografías para evitar sobrescribir productos reales.

### Formato opcional de un producto con variantes

Esta estructura es **un ejemplo de formato**, no mercadería real:

```json
{
  "id": "ejemplo-remera-01",
  "nombre": "Nombre del producto real",
  "categoria": "Ropa nueva",
  "descripcion": "Descripción verificada con la vendedora",
  "precio": null,
  "imagen": "assets/foto-propia.webp",
  "disponible": true,
  "destacado": false,
  "material": "Completar con composición real",
  "medidas": "Completar con medidas reales",
  "variantes": [
    {"nombre": "Talle M", "stock": 2},
    {"nombre": "Talle L", "stock": 0},
    {"nombre": "Talle XL", "disponible": false}
  ]
}
```

**Notas de inventario:** `stock` es informativo y manual. Cuando no está definido, el sistema se basa en `disponible`. El stock de variantes NO se descuenta por consultas y NO está sincronizado con las redes. Antes de cobrar o confirmar una venta, Pamela debe verificar existencias. Si un producto tiene variantes, marcar manualmente `disponible: false` al retirarlo del catálogo o completar el stock de cada opción. Para evitar inconsistencias, se recomienda mantener ambos campos actualizados.

### Pruebas manuales

1. Abrir `http://localhost:8000` mediante `python -m http.server 8000`.
2. Probar filtros de categoría, buscador, **Solo disponibles** y los cuatro ordenamientos.
3. Abrir ficha de producto con y sin `variantes`.
4. Con datos de prueba, verificar que la variante con `stock: 0` no se pueda seleccionar.
5. Compartir una ficha, abrir el enlace en otra pestaña y verificar el producto correcto.
6. Comprobar diseño en un teléfono o con herramientas de desarrollo del navegador.
7. Verificar que el botón de WhatsApp no se active hasta configurar el número autorizado.

### Instalación desde v0.6

Trabajar en la rama `feature/identidad-valquiria-femenina`. Luego de guardar un commit de seguridad, reemplazar **solo** `index.html`, `styles.css` y `script.js`; conservar los productos y las fotos. No copiar archivos de ejemplo sobre un catálogo real. Probar, revisar `git diff` y registrar un commit de funcionalidad.


## Configuración comercial

La información pública de la tienda se administra desde
`config/tienda.json`.

### WhatsApp

Configurar el campo `whatsapp` con el número autorizado
por la responsable de la tienda.

Formato: número internacional de 10 a 15 dígitos,
sin `+`, espacios ni guiones.

Si está vacío o no cumple el formato, el contacto
por WhatsApp permanece deshabilitado.

### Instagram y Facebook

Los campos `instagram` y `facebook` admiten enlaces HTTPS
a perfiles de las plataformas correspondientes.

Ejemplos de formato:

- `https://www.instagram.com/usuario/`
- `https://www.facebook.com/usuario/`

Los enlaces deben utilizar los dominios admitidos:
`www.instagram.com` y `www.facebook.com`.

Si el campo está vacío o la dirección es inválida,
el enlace no se muestra.

### Moneda

La versión comercial inicial utiliza pesos argentinos
(`ARS`).

### Seguridad

Este archivo es público. No almacenar contraseñas,
tokens de acceso, claves privadas ni información sensible.

Publicar únicamente teléfonos y perfiles autorizados.
