"use strict";

let WHATSAPP = "";

const CONFIG = {
  moneda: "ARS",
};

let fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: CONFIG.moneda,
  maximumFractionDigits: 0,
});

let products = [];
let selectedCategory = "Todos";
let searchTerm = "";
let order = "destacados";
let onlyAvailable = false;
const grid = document.getElementById("product-grid");
const filterContainer = document.getElementById("filters");
const count = document.getElementById("result-count");
const empty = document.getElementById("empty-state");
const dialog = document.getElementById("product-dialog");
const detail = document.getElementById("detail-content");

const el = (tag, className = "", content) => {
  const n = document.createElement(tag);
  n.className = className;
  if (content !== undefined) n.textContent = content;
  return n;
};

const stock = (p) =>
  p.disponible !== false && (!Number.isInteger(p.stock) || p.stock > 0);
const variantAvailable = (v) =>
  v.disponible !== false && (!Number.isInteger(v.stock) || v.stock > 0);
const price = (p) =>
  p.precio == null ? "Consultar precio" : fmt.format(p.precio);
const productUrl = (p) => {
  const url = new URL(window.location.href);
  url.hash = `producto=${encodeURIComponent(p.id)}`;
  return url.href;
};

function whatsappLink(p, variant) {
  const label = p
    ? `Hola, quisiera consultar por ${p.nombre} (código: ${p.id})${variant ? `, opción: ${variant.nombre}` : ""}. ¿Está disponible? ${productUrl(p)}`
    : "Hola, quisiera consultar por los productos de Valkyrie Store.";
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(label)}`;
}

function renderFilters() {
  filterContainer.replaceChildren();
  const categories = [
    "Todos",
    ...new Set(products.map((p) => p.categoria).filter(Boolean)),
  ];
  categories.forEach((cat) => {
    const button = el(
      "button",
      "filter" + (selectedCategory === cat ? " active" : ""),
      cat,
    );
    button.type = "button";
    button.setAttribute("aria-pressed", String(selectedCategory === cat));
    button.addEventListener("click", () => {
      selectedCategory = cat;
      renderFilters();
      renderProducts();
    });
    filterContainer.append(button);
  });
}

function filteredProducts() {
  const matched = products.filter(
    (p) =>
      (selectedCategory === "Todos" || p.categoria === selectedCategory) &&
      (!onlyAvailable || stock(p)) &&
      `${p.nombre} ${p.descripcion || ""} ${p.categoria} ${p.id}`
        .toLocaleLowerCase("es")
        .includes(searchTerm),
  );
  if (order === "nombre")
    matched.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  if (order === "precio-asc")
    matched.sort((a, b) => (a.precio ?? Infinity) - (b.precio ?? Infinity));
  if (order === "precio-desc")
    matched.sort((a, b) => (b.precio ?? -Infinity) - (a.precio ?? -Infinity));
  if (order === "destacados")
    matched.sort((a, b) => Number(!!b.destacado) - Number(!!a.destacado));
  return matched;
}

function photo(parent, p) {
  if (!p.imagen) {
    parent.classList.add("no-photo");
    return;
  }
  const img = el("img");
  img.src = p.imagen;
  img.alt = `Fotografía de ${p.nombre}`;
  img.loading = "lazy";
  img.addEventListener("error", () => {
    img.remove();
    parent.classList.add("no-photo");
  });
  parent.append(img);
}

function renderProducts() {
  const shown = filteredProducts();
  grid.replaceChildren();
  count.textContent = `${shown.length} producto${shown.length === 1 ? "" : "s"}`;
  empty.hidden = shown.length !== 0;
  shown.forEach((p) => {
    const card = el("article", "product");
    const media = el("div", "product-image");
    photo(media, p);
    if (!stock(p) || p.destacado)
      media.append(
        el(
          "span",
          "product-tag" + (!stock(p) ? " sold" : ""),
          !stock(p) ? "Agotado" : "Destacado",
        ),
      );
    const body = el("div", "product-body");
    body.append(
      el("span", "product-category", p.categoria),
      el("h3", "", p.nombre),
      el("p", "product-desc", p.descripcion || ""),
    );
    const bottom = el("div", "product-bottom");
    bottom.append(el("span", "price", price(p)));
    const view = el("button", "action", "Ver producto");
    view.type = "button";
    view.addEventListener("click", () => openDetail(p));
    bottom.append(view);
    body.append(bottom);
    card.append(media, body);
    grid.append(card);
  });
}

function makeField(labelText, values, className) {
  const wrap = el("label", "variant-field");
  wrap.append(el("span", "", labelText));
  const select = el("select", className);
  values.forEach((v, i) => {
    const option = el(
      "option",
      "",
      v.nombre + (variantAvailable(v) ? "" : " — agotado"),
    );
    option.value = String(i);
    option.disabled = !variantAvailable(v);
    select.append(option);
  });
  wrap.append(select);
  return { wrap, select };
}

function openDetail(p, updateHash = true) {
  detail.replaceChildren();
  const layout = el("div", "detail-layout");
  const media = el("div", "detail-photo");
  photo(media, p);
  const info = el("div", "detail-info");
  const heading = el("h2", "", p.nombre);
  heading.id = "detail-title";
  info.append(
    el("span", "product-category", p.categoria),
    heading,
    el("p", "detail-description", p.descripcion || ""),
    el("p", "detail-price", price(p)),
  );
  if (p.material)
    info.append(el("p", "detail-meta", `Material: ${p.material}`));
  if (p.medidas) info.append(el("p", "detail-meta", `Medidas: ${p.medidas}`));
  const variants = Array.isArray(p.variantes) ? p.variantes : [];
  let select;
  if (variants.length) {
    const field = makeField("Elegí una opción", variants, "variant-select");
    select = field.select;
    const firstAvailable = variants.findIndex(variantAvailable);
    if (firstAvailable >= 0) select.value = String(firstAvailable);
    info.append(field.wrap);
  }
  const availability = el("p", "detail-availability");
  info.append(availability);
  const actions = el("div", "detail-actions");
  const contact = el("a", "action");
  actions.append(contact);
  function updateContact() {
    const v = select ? variants[Number(select.value)] : undefined;
    const available =
      stock(p) && (!variants.length || (!!v && variantAvailable(v)));
    availability.textContent = available
      ? "Disponible para consultar · confirmá stock antes de comprar"
      : "Actualmente no disponible";
    contact.textContent = !WHATSAPP
      ? "WhatsApp pendiente"
      : available
        ? "Consultar por WhatsApp ↗"
        : "No disponible";
    contact.classList.toggle("disabled-link", !WHATSAPP || !available);
    if (WHATSAPP && available) {
      contact.href = whatsappLink(p, v);
      contact.target = "_blank";
      contact.rel = "noopener noreferrer";
      contact.removeAttribute("aria-disabled");
    } else {
      contact.removeAttribute("href");
      contact.setAttribute("aria-disabled", "true");
      contact.removeAttribute("target");
    }
  }

  if (select) select.addEventListener("change", updateContact);
  updateContact();
  const share = el("button", "share-action", "Compartir producto");
  share.type = "button";
  share.addEventListener("click", async () => {
    const url = productUrl(p);
    try {
      if (navigator.share) {
        await navigator.share({
          title: p.nombre,
          text: "Mirá este producto en Valkyrie Store",
          url,
        });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        share.textContent = "¡Enlace copiado!";
        return;
      }
      window.prompt("Copiá este enlace:", url);
    } catch (err) {
      if (err.name !== "AbortError") window.prompt("Copiá este enlace:", url);
    }
  });
  actions.append(share);
  info.append(actions);
  layout.append(media, info);
  detail.append(layout);
  if (updateHash) history.replaceState(null, "", productUrl(p));
  if (!dialog.open) dialog.showModal();
}

function openFromHash() {
  const match = location.hash.match(/^#producto=(.*)$/);
  if (!match) return;
  let id;
  try {
    id = decodeURIComponent(match[1]);
  } catch {
    return;
  }
  const p = products.find((item) => item.id === id);
  if (p) openDetail(p, false);
}

document
  .getElementById("close-detail")
  .addEventListener("click", () => dialog.close());

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

dialog.addEventListener("close", () => {
  if (location.hash.startsWith("#producto="))
    history.replaceState(
      null,
      "",
      location.pathname + location.search + "#catalogo",
    );
});
window.addEventListener("hashchange", () => {
  if (location.hash.startsWith("#producto=")) openFromHash();
  else if (dialog.open) dialog.close();
});
document.getElementById("search").addEventListener("input", (e) => {
  searchTerm = e.target.value.trim().toLocaleLowerCase("es");
  renderProducts();
});
document.getElementById("sort-products").addEventListener("change", (e) => {
  order = e.target.value;
  renderProducts();
});
document.getElementById("only-available").addEventListener("change", (e) => {
  onlyAvailable = e.target.checked;
  renderProducts();
});
document.getElementById("year").textContent = new Date().getFullYear();
if (WHATSAPP) {
  const anchor = document.getElementById("general-whatsapp");
  anchor.href = whatsappLink();
  anchor.textContent = "Consultar por WhatsApp ↗";
  anchor.classList.remove("disabled-link");
  anchor.removeAttribute("aria-disabled");
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  document.getElementById("contact-note").textContent =
    "Te respondemos por WhatsApp.";
}

function validarRedSocial(valor, dominio) {
  if (typeof valor !== "string" || !valor.trim()) {
    return "";
  }

  try {
    const url = new URL(valor);

    if (
      url.protocol !== "https:" ||
      url.hostname !== dominio ||
      url.username ||
      url.password ||
      !url.pathname.replaceAll("/", "")
    ) {
      return "";
    }

    return url.href;
  } catch {
    return "";
  }
}

function configurarRedesSociales(datos) {
  const redes = [
    {
      id: "link-instagram",
      url: validarRedSocial(datos?.instagram, "www.instagram.com"),
    },
    {
      id: "link-facebook",
      url: validarRedSocial(datos?.facebook, "www.facebook.com"),
    },
  ];

  let visibles = 0;

  redes.forEach(({ id, url }) => {
    const enlace = document.getElementById(id);

    enlace.hidden = !url;
    enlace.removeAttribute("href");

    if (url) {
      enlace.href = url;
      visibles++;
    }
  });

  document.getElementById("redes-sociales").hidden = visibles === 0;
}

async function cargarConfiguracion() {
  try {
    const respuesta = await fetch("config/tienda.json");

    if (!respuesta.ok) {
      throw new Error("No se pudo cargar la configuración");
    }

    const datos = await respuesta.json();

    WHATSAPP =
      typeof datos.whatsapp === "string" && /^\d{10,15}$/.test(datos.whatsapp)
        ? datos.whatsapp
        : "";

    const moneda = "ARS";

    fmt = new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: moneda,
      maximumFractionDigits: 0,
    });

    return datos;
  } catch (error) {
    console.error("Error de configuración comercial:", error.message);
    return null;
  }
}

async function iniciarTienda() {
  const configuracion = await cargarConfiguracion();

  configurarRedesSociales(configuracion);

  if (WHATSAPP) {
    const anchor = document.getElementById("general-whatsapp");

    anchor.href = whatsappLink();
    anchor.textContent = "Consultar por WhatsApp ↗";
    anchor.classList.remove("disabled-link");
    anchor.removeAttribute("aria-disabled");
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";

    document.getElementById("contact-note").textContent =
      "Te respondemos por WhatsApp.";
  }

  fetch("products.json")
    .then((respuesta) => {
      if (!respuesta.ok) {
        throw new Error("No se pudo obtener el catálogo");
      }

      return respuesta.json();
    })
    .then((datos) => {
      if (!Array.isArray(datos)) {
        throw new Error("Formato de catálogo inválido");
      }

      const resultado = window.ValidadorCatalogo.validarCatalogo(datos);

      if (resultado.errores.length > 0) {
        console.warn("Errores de validación del catálogo:", resultado.errores);
      }

      products = resultado.validos;

      renderFilters();
      renderProducts();
      openFromHash();
    })
    .catch((error) => {
      console.error("Error al cargar el catálogo:", error.message);

      count.textContent =
        "No se pudo cargar el catálogo. Revisá el servidor local y products.json.";
    });
}

iniciarTienda();

document.querySelectorAll("[data-categoria]").forEach((anchor) =>
  anchor.addEventListener("click", () => {
    selectedCategory = anchor.dataset.categoria;
    renderFilters();
    renderProducts();
  }),
);
