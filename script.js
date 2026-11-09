'use strict';
// CONFIGURACIÓN: reemplazar solo por el número autorizado por Pamela, formato 549XXXXXXXXXX, sin + ni espacios.
const WHATSAPP = '';
let products = [];
let selectedCategory = 'Todos';
let searchTerm = '';
const grid = document.getElementById('product-grid');
const filterContainer = document.getElementById('filters');
const count = document.getElementById('result-count');
const empty = document.getElementById('empty-state');
const dialog = document.getElementById('product-dialog');
const detail = document.getElementById('detail-content');
const fmt = new Intl.NumberFormat('es-AR', {style:'currency',currency:'ARS',maximumFractionDigits:0});
function el(tag, className, content) { const n = document.createElement(tag); if(className) n.className=className; if(content!==undefined) n.textContent=content; return n; }
function whatsappLink(product) {
  const txt = product ? `Hola, te consulto por ${product.nombre} (${product.id}). ¿Está disponible?` : 'Hola, quería consultar por los productos de Valkyrie Store.';
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(txt)}`;
}
function renderFilters(){
  filterContainer.replaceChildren();
  const cats = ['Todos',...new Set(products.map(p=>p.categoria).filter(Boolean))];
  cats.forEach(cat=>{const btn=el('button','filter'+(selectedCategory===cat?' active':''),cat);btn.type='button';btn.setAttribute('aria-pressed',String(selectedCategory===cat));btn.addEventListener('click',()=>{selectedCategory=cat;renderFilters();renderProducts()});filterContainer.append(btn)})
}
function renderProducts(){
  const shown=products.filter(p=>(selectedCategory==='Todos'||p.categoria===selectedCategory)&&(`${p.nombre} ${p.descripcion} ${p.categoria}`.toLocaleLowerCase('es').includes(searchTerm)));
  grid.replaceChildren();count.textContent=`${shown.length} producto${shown.length===1?'':'s'}`;empty.hidden=shown.length!==0;
  shown.forEach(p=>{
    const card=el('article','product');const media=el('div','product-image'+(!p.imagen?' no-photo':''));
    if(p.imagen){const img=el('img');img.src=p.imagen;img.alt=p.nombre;img.loading='lazy';img.addEventListener('error',()=>{img.remove();media.classList.add('no-photo')});media.append(img)}
    if(!p.disponible||p.destacado){media.append(el('span','product-tag'+(!p.disponible?' sold':''),!p.disponible?'Vendido':'Destacado'))}
    const body=el('div','product-body');body.append(el('span','product-category',p.categoria),el('h3','',p.nombre),el('p','product-desc',p.descripcion));
    const bottom=el('div','product-bottom');bottom.append(el('span','price',p.precio===null||p.precio===undefined?'Consultar precio':fmt.format(p.precio)));
    const action=el('a','action',!p.disponible?'No disponible':WHATSAPP?'Consultar ↗':'WhatsApp pendiente');
    if(p.disponible&&WHATSAPP){action.href=whatsappLink(p);action.target='_blank';action.rel='noopener noreferrer'}else{action.href='#contacto';action.setAttribute('aria-disabled','true')}
    const detailButton=el('button','detail-action','Ver detalles');detailButton.type='button';detailButton.addEventListener('click',()=>openDetail(p));
    bottom.append(action);body.append(bottom,detailButton);card.append(media,body);grid.append(card);
  })
}
function productUrl(p) {
  const url=new URL(window.location.href);
  url.hash=`producto=${encodeURIComponent(p.id)}`;
  return url.href;
}
function openDetail(p, updateHash=true) {
  detail.replaceChildren();
  const layout=el('div','detail-layout');
  const photo=el('div','detail-photo'+(!p.imagen?' no-photo':''));
  if(p.imagen){const img=el('img');img.src=p.imagen;img.alt=p.nombre;img.addEventListener('error',()=>{img.remove();photo.classList.add('no-photo')});photo.append(img)}
  const info=el('div','detail-info');
  const title=el('h2','',p.nombre);title.id='detail-title';
  info.append(el('span','product-category',p.categoria),title,el('p','detail-description',p.descripcion),el('p','detail-price',p.precio==null?'Consultar precio':fmt.format(p.precio)),el('p','detail-availability',p.disponible?'Disponible para consultar':'Producto no disponible'));
  const actions=el('div','detail-actions');
  if(p.disponible&&WHATSAPP){const contact=el('a','action','Consultar por WhatsApp ↗');contact.href=whatsappLink(p);contact.target='_blank';contact.rel='noopener noreferrer';actions.append(contact)}
  const share=el('button','share-action','Compartir producto');share.type='button';
  share.addEventListener('click',async()=>{
    const url=productUrl(p);
    try { if(navigator.share){await navigator.share({title:p.nombre,text:`Mirá este producto en Valkyrie Store`,url});return} await navigator.clipboard.writeText(url);share.textContent='¡Enlace copiado!'; }
    catch(err){if(err.name!=='AbortError'){window.prompt('Copiá este enlace:',url)}}
  });
  actions.append(share);info.append(actions);layout.append(photo,info);detail.append(layout);
  if(updateHash)history.replaceState(null,'',productUrl(p));
  dialog.showModal();
}
function openFromHash(){const match=window.location.hash.match(/^#producto=(.*)$/);if(!match)return;let id;try{id=decodeURIComponent(match[1])}catch{return}const p=products.find(p=>p.id===id);if(p)openDetail(p,false)}
document.getElementById('close-detail').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
dialog.addEventListener('close',()=>{if(location.hash.startsWith('#producto='))history.replaceState(null,'',location.pathname+location.search+'#catalogo')});
window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#producto=')){if(dialog.open)dialog.close();openFromHash()}});
document.getElementById('search').addEventListener('input',e=>{searchTerm=e.target.value.trim().toLocaleLowerCase('es');renderProducts()});
document.getElementById('year').textContent=new Date().getFullYear();
if(WHATSAPP){const a=document.getElementById('general-whatsapp');a.href=whatsappLink();a.textContent='Consultar por WhatsApp ↗';a.classList.remove('disabled-link');a.removeAttribute('aria-disabled');a.target='_blank';a.rel='noopener noreferrer';document.getElementById('contact-note').textContent='Te respondemos por WhatsApp.'}
fetch('products.json').then(r=>{if(!r.ok)throw new Error('No se pudo leer el catálogo');return r.json()}).then(data=>{if(!Array.isArray(data))throw new Error('Formato de productos inválido');products=data;renderFilters();renderProducts();openFromHash()}).catch(()=>{count.textContent='No fue posible cargar el catálogo. Abrí el sitio desde un servidor local (ver README).'});
