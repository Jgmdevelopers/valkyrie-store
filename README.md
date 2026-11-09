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
3. En `script.js`, reemplazar `const WHATSAPP = '';` por el número que Pamela autorice publicar, formato internacional **549...**, sin +, espacios ni guiones.
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
