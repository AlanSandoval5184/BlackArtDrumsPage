/* Interacciones, animaciones y funcionalidades */

/* ---------- Helpers ---------- */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

/* Insert current year */
document.getElementById('year').textContent = new Date().getFullYear();

/* Smooth scroll for nav */
$$('.main-nav a').forEach(a=>{
  a.addEventListener('click', e=>{
    e.preventDefault();
    const id = a.getAttribute('href');
    document.querySelector(id).scrollIntoView({behavior:'smooth', block:'start'});
  });
});

/* Responsive hamburger */
const btnMenu = $('#btn-menu');
const mainNav = $('.main-nav');
btnMenu && btnMenu.addEventListener('click', ()=>{
  mainNav.style.display = mainNav.style.display === 'flex' ? 'none' : 'flex';
  btnMenu.classList.toggle('open');
});

/* Simple in-view animation */
const animatedEls = document.querySelectorAll('[data-animated], .product-card, .about-card, .section-title, .carousel');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if (entry.isIntersecting) entry.target.classList.add('in-view');
  });
},{threshold:0.12});
animatedEls.forEach(el=>{
  el.setAttribute('data-animated', '');
  io.observe(el);
});

/* Product card "Ver más" -> abrir modal con detalle (simple) */
$$('.view-more').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    const card = e.target.closest('.product-card');
    const title = card.dataset.name;
    const price = card.dataset.price;
    alert(`${title}\nPrecio: MXN $${price}\n\nContáctanos para detalles y personalización.`);
  });
});

/* ---------- Carrusel ---------- */
(function initCarousel(){
  const track = $('#carousel-track');
  const items = $$('.carousel-item');
  const prev = $('#carousel-prev');
  const next = $('#carousel-next');
  let index = 0;

  function update() {
    const w = track.clientWidth;
    track.style.transform = `translateX(-${index * w}px)`;
  }

  window.addEventListener('resize', update);

  next.addEventListener('click', ()=> { index = (index + 1) % items.length; update(); });
  prev.addEventListener('click', ()=> { index = (index - 1 + items.length) % items.length; update(); });

  // Autoplay with pause on hover
  let play = setInterval(()=>{ index = (index + 1) % items.length; update(); }, 4000);
  const carousel = $('#carousel');
  carousel.addEventListener('mouseenter', ()=> clearInterval(play));
  carousel.addEventListener('mouseleave', ()=> play = setInterval(()=>{ index = (index + 1) % items.length; update(); }, 4000));
  update();
})();

/* ---------- Carrito simple ---------- */
let cart = [];
const cartCount = $('#cart-count');
const cartTotal = $('#cart-total');
const cartItemsEl = $('#cart-items');
const modalBackdrop = $('#modal-backdrop');

function renderCart(){
  cartItemsEl.innerHTML = '';
  let total = 0;
  if(cart.length === 0){
    cartItemsEl.innerHTML = '<p style="opacity:.8">Tu carrito está vacío.</p>';
  } else {
    cart.forEach((it, idx)=>{
      total += it.price;
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `<div><strong>${it.name}</strong><br><small>${it.meta || ''}</small></div>
                       <div style="text-align:right">
                         <div>MXN $${it.price}</div>
                         <div style="margin-top:.4rem">
                           <button class="btn-link remove-item" data-idx="${idx}">Quitar</button>
                         </div>
                       </div>`;
      cartItemsEl.appendChild(div);
    });
  }
  cartTotal.textContent = `MXN $${total}`;
  cartCount.textContent = cart.length;
  $$('.remove-item').forEach(btn => {
    btn.addEventListener('click', (e)=>{
      const i = +e.target.dataset.idx;
      cart.splice(i,1);
      renderCart();
    });
  });
}

$$('.add-to-cart').forEach(btn=>{
  btn.addEventListener('click', e=>{
    const card = e.target.closest('.product-card');
    const id = card.dataset.id;
    const name = card.dataset.name;
    const price = Number(card.dataset.price);
    const meta = card.querySelector('.meta')?.textContent || '';
    cart.push({id,name,price,meta});
    // animation: pulse cart icon
    cartCount.classList.add('pop');
    setTimeout(()=>cartCount.classList.remove('pop'), 400);
    renderCart();
  });
});

$('#btn-cart').addEventListener('click', ()=>{
  modalBackdrop.classList.remove('hidden');
  modalBackdrop.setAttribute('aria-hidden','false');
  renderCart();
});

$('#close-cart').addEventListener('click', ()=>{
  modalBackdrop.classList.add('hidden');
  modalBackdrop.setAttribute('aria-hidden','true');
});

$('#checkout-btn').addEventListener('click', ()=>{
  if(cart.length === 0){ alert('Tu carrito está vacío. Añade un tambora antes de pagar.'); return; }
  // Simulamos proceso de pago (simple)
  alert('Gracias por tu compra. Nos pondremos en contacto para los detalles de envío y pago.');
  cart = [];
  renderCart();
  modalBackdrop.classList.add('hidden');
});

/* Close modal when clicking backdrop outside modal */
modalBackdrop.addEventListener('click', (e)=>{
  if(e.target === modalBackdrop) {
    modalBackdrop.classList.add('hidden');
  }
});

/* ---------- Contact form validation and micro-interactions ---------- */
const contactForm = $('#contact-form');
const feedback = $('#contact-feedback');

contactForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = $('#name').value.trim();
  const email = $('#email').value.trim();
  const message = $('#message').value.trim();
  if(name.length < 2){ feedback.textContent = 'Por favor escribe un nombre válido.'; return; }
  if(!/^\S+@\S+\.\S+$/.test(email)){ feedback.textContent = 'Introduce un correo válido.'; return; }
  if(message.length < 6){ feedback.textContent = 'Agrega más detalles sobre tu solicitud.'; return; }

  // Simular envío: mostrar un micro-animación y limpiar
  feedback.style.color = 'var(--success)';
  feedback.textContent = 'Enviando solicitud...';
  setTimeout(()=>{
    feedback.textContent = 'Solicitud enviada. Te contactaremos pronto.';
    contactForm.reset();
  }, 900);
});

/* ---------- Accessible keyboard shortcuts (small but neat) ---------- */
document.addEventListener('keydown', (e)=>{
  if(e.key === 'c' && (e.ctrlKey || e.metaKey)){ // Ctrl/Cmd + C abre carrito
    e.preventDefault();
    $('#btn-cart').click();
  }
});

/* ---------- Small polish: button hover ripple (delegation) ---------- */
document.addEventListener('click', (e)=>{
  const btn = e.target.closest('.btn-primary, .btn-small, .btn-ghost');
  if(!btn) return;
  const rect = btn.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.style.position = 'absolute';
  ripple.style.left = (e.clientX - rect.left) + 'px';
  ripple.style.top = (e.clientY - rect.top) + 'px';
  ripple.style.width = ripple.style.height = '8px';
  ripple.style.borderRadius = '50%';
  ripple.style.transform = 'translate(-50%,-50%)';
  ripple.style.background = 'rgba(255,255,255,0.12)';
  ripple.style.pointerEvents = 'none';
  ripple.style.transition = 'all 700ms ease';
  ripple.style.zIndex = 9999;
  btn.style.position = 'relative';
  btn.appendChild(ripple);
  requestAnimationFrame(()=> {
    ripple.style.width = '200%';
    ripple.style.height = '200%';
    ripple.style.opacity = 0;
  });
  setTimeout(()=> ripple.remove(), 700);
});

/* ---------- Small accessibility: focus outlines ---------- */
document.addEventListener('keyup', (e)=>{
  if(e.key === 'Tab') document.body.classList.add('show-focus');
});
