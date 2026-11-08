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
