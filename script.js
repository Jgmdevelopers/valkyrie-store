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
    bottom.append(action);body.append(bottom);card.append(media,body);grid.append(card);
  })
}
document.getElementById('search').addEventListener('input',e=>{searchTerm=e.target.value.trim().toLocaleLowerCase('es');renderProducts()});
document.getElementById('year').textContent=new Date().getFullYear();
if(WHATSAPP){const a=document.getElementById('general-whatsapp');a.href=whatsappLink();a.textContent='Consultar por WhatsApp ↗';a.classList.remove('disabled-link');a.removeAttribute('aria-disabled');a.target='_blank';a.rel='noopener noreferrer';document.getElementById('contact-note').textContent='Te respondemos por WhatsApp.'}
fetch('products.json').then(r=>{if(!r.ok)throw new Error('No se pudo leer el catálogo');return r.json()}).then(data=>{if(!Array.isArray(data))throw new Error('Formato de productos inválido');products=data;renderFilters();renderProducts()}).catch(()=>{count.textContent='No fue posible cargar el catálogo. Abrí el sitio desde un servidor local (ver README).'});
