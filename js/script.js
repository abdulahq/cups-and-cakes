document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============ Loader ============
  const loader = document.getElementById('loader');
  const hero = document.getElementById('home');
  setTimeout(() => {
    loader.classList.add('hidden');
    hero.classList.add('loaded');
  }, 1100);

  // ============ Scroll progress ============
  const progress = document.getElementById('progress');

  // ============ Header ============
  const header = document.getElementById('header');

  // ============ Hero tilt (3D parallax on mouse) ============
  const heroTilt = document.getElementById('heroTilt');
  const pzLayers = document.querySelectorAll('.hero-tilt .pz');
  let targetRX = 0, targetRY = 0, rx = 0, ry = 0;

  if (!reducedMotion && heroTilt) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      targetRY = px * 7;
      targetRX = -py * 7;
    });
    hero.addEventListener('mouseleave', () => { targetRX = 0; targetRY = 0; });
  }

  // ============ Scroll parallax elements ============
  const depthEls = Array.from(document.querySelectorAll('[data-depth]'));

  // ============ Hero scroll parallax ============
  const heroInner = document.getElementById('heroInner');

  // ============ Main animation loop ============
  function updateParallax() {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;

    // progress bar
    const max = document.documentElement.scrollHeight - vh;
    const p = max > 0 ? scrollY / max : 0;
    progress.style.transform = `scaleX(${p})`;

    // hero: content drifts up + fades
    if (scrollY < vh) {
      heroInner.style.transform = `translate3d(0, ${scrollY * 0.28}px, 0)`;
      heroInner.style.opacity = 1 - scrollY / (vh * 1.1);
    }

    // hero 3D layers: scroll-based translate + mouse tilt (lerped)
    if (!reducedMotion) {
      rx += (targetRX - rx) * 0.06;
      ry += (targetRY - ry) * 0.06;
    }
    pzLayers.forEach(layer => {
      const z = parseFloat(layer.style.getPropertyValue('--z') || 0);
      const speed = 0.12 + Math.abs(z) / 2200;
      const y = scrollY * speed;
      const rot = layer.dataset.rot ? ` rotate(${layer.dataset.rot}deg)` : '';
      layer.style.transform = `translate3d(0, ${y}px, ${z}px)${rot}`;
    });
    if (heroTilt) heroTilt.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;

    // general data-depth parallax (drift relative to viewport centre)
    depthEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - vh / 2;
      const depth = parseFloat(el.dataset.depth);
      el.style.transform = `translate3d(0, ${-center * depth}px, 0)`;
      const spin = el.classList.contains('o1') ? scrollY * 0.02 : 0;
      if (spin) el.style.transform += ` rotate(${scrollY * 0.03}deg)`;
    });

    requestAnimationFrame(updateParallax);
  }

  // ============ Header on scroll ============
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 60);

  // ============ Mobile menu ============
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
    });
  });

  // ============ Active nav highlighting ============
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-link');

  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navItems.forEach(item => {
          item.classList.toggle('active', item.getAttribute('href') === `#${entry.target.id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(section => navObserver.observe(section));

  // ============ Scroll-triggered reveals ============
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || 0, 10);
        entry.target.style.transitionDelay = `${delay}ms`;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  // ============ Animated counters ============
  const counters = document.querySelectorAll('.count');
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.dec || 0, 10);
      const duration = 1800;
      const start = performance.now();

      function tick(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = (target * eased).toFixed(decimals);
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = target.toFixed(decimals);
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.6 });

  counters.forEach(c => counterObserver.observe(c));

  // ============ Catalogue data ============
  const icons = {
    cupcake: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M32 8c-6.5 0-10 5.5-9 11-1.6 1.2-2.5 3-2.5 5 0 3.6 2.9 6.5 6.5 6.5h10c3.6 0 6.5-2.9 6.5-6.5 0-2-.9-3.8-2.5-5 1-5.5-2.5-11-9-11z"/><path d="M21 32h22l-3.5 24h-15z"/><path d="M26.5 32l-1.3 24M37.5 32l1.3 24"/></svg>',
    brownie: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="12" y="26" width="40" height="26" rx="3"/><path d="M12 33h40"/><path d="M22 26v26M32 26v26M42 26v26"/><path d="M20 26c1.5 4 6 4 7.5 0M34 26c1.5 4 6 4 7.5 0"/><circle cx="26" cy="39" r="1.6"/><circle cx="38" cy="45" r="1.6"/></svg>',
    cake: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M32 6 52 42H12z"/><path d="M12 42h40v8H12z"/><path d="M32 6v44"/><path d="M26 24c4 3 8 3 12 0M24 34c4 3 8 3 12 0"/><circle cx="32" cy="5" r="3"/></svg>'
  };

  const menuData = {
    cupcakes: [
      { name: 'Classic Vanilla Bean', desc: 'Madagascar vanilla sponge with house buttercream.', price: 'Rs. 180', icon: 'cupcake' },
      { name: 'Red Velvet', desc: 'Cocoa sponge, cream cheese frosting, dark crumb.', price: 'Rs. 220', icon: 'cupcake', tag: 'Best Seller' },
      { name: 'Salted Caramel', desc: 'Soft caramel core, sea-salt finish.', price: 'Rs. 240', icon: 'cupcake' },
      { name: 'Chocolate Truffle', desc: 'Dark ganache over a moist chocolate sponge.', price: 'Rs. 220', icon: 'cupcake' },
      { name: 'Lotus Biscoff', desc: 'Biscoff buttercream, biscuit crumb, no skimping.', price: 'Rs. 260', icon: 'cupcake', tag: 'New' },
      { name: 'Strawberry & Cream', desc: 'Fresh strawberries folded into vanilla cream.', price: 'Rs. 220', icon: 'cupcake' }
    ],
    brownies: [
      { name: 'Fudgy Walnut', desc: 'Seventy-percent dark chocolate with toasted walnut.', price: 'Rs. 320', icon: 'brownie', tag: 'Classic' },
      { name: 'Lotus Blondie', desc: 'Caramelised biscuit blondie with a chewy centre.', price: 'Rs. 350', icon: 'brownie', tag: 'New' },
      { name: 'Salted Caramel', desc: 'Gooey caramel core beneath a crackled top.', price: 'Rs. 340', icon: 'brownie' },
      { name: 'Raspberry Cheesecake', desc: 'Cream cheese swirl with fresh raspberry.', price: 'Rs. 380', icon: 'brownie' },
      { name: 'The Fudgy Box (9)', desc: 'Assorted fudgy squares, gift-wrapped.', price: 'Rs. 2,400', icon: 'brownie', tag: 'Gift' }
    ],
    cakes: [
      { name: 'Custom Theme Cake', desc: 'Designed around your event — any flavour, any size.', price: 'From Rs. 2,500', icon: 'cake' },
      { name: 'Semi-Naked Layer Cake', desc: 'A minimal, elegant finish with fresh flowers.', price: 'From Rs. 3,200', icon: 'cake', tag: 'Wedding' },
      { name: 'Fondant Occasion Cake', desc: 'Sharp edges, hand-detailed, fully custom.', price: 'From Rs. 4,500', icon: 'cake' },
      { name: 'Tiered Celebration Cake', desc: 'Two tiers and above for grand occasions.', price: 'From Rs. 6,000', icon: 'cake' }
    ]
  };

  const menuList = document.getElementById('menuList');
  const tabs = document.querySelectorAll('.menu-tab');
  let itemCounter = 0;

  function renderMenu(category) {
    menuList.innerHTML = '';
    itemCounter = 0;
    menuData[category].forEach(item => {
      const el = document.createElement('div');
      el.className = 'menu-item';
      el.style.animationDelay = `${itemCounter * 60}ms`;
      el.innerHTML = `
        <div class="mi-icon">${icons[item.icon]}</div>
        <div class="mi-body">
          <div class="mi-top">
            <span class="mi-name">${item.name}</span>
            <span class="mi-price">${item.price}</span>
          </div>
          <p class="mi-desc">${item.desc}</p>
          ${item.tag ? `<span class="mi-tag">${item.tag}</span>` : ''}
        </div>
      `;
      menuList.appendChild(el);
      itemCounter++;
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderMenu(tab.dataset.cat);
    });
  });

  renderMenu('cupcakes');

  // ============ Reviews ============
  const reviewsData = [
    { text: 'Ordered a custom unicorn cake for my daughter\'s birthday — it looked even better than the reference photos. The sponge was beautifully light.', author: 'Ayesha R.', source: 'Google Review' },
    { text: 'Best brownies in Islamabad. Properly fudgy, never cakey. I have been a regular for months now.', author: 'Hamza K.', source: 'Google Review' },
    { text: 'They were so patient with every design change for my wedding cake. The result was elegant beyond what I imagined.', author: 'Sana M.', source: 'Google Review' },
    { text: 'Cupcakes arrived fresh and beautifully packed. You can tell everything is weighed, baked and iced with care.', author: 'Bilal S.', source: 'Google Review' }
  ];

  const reviewsGrid = document.getElementById('reviewsGrid');
  reviewsData.forEach((r, i) => {
    const el = document.createElement('figure');
    el.className = 'review reveal';
    if (i % 2) el.style.transitionDelay = '120ms';
    el.innerHTML = `
      <div class="review-stars">★★★★★</div>
      <p>${r.text}</p>
      <footer><cite>${r.author} · ${r.source}</cite></footer>
    `;
    reviewsGrid.appendChild(el);
  });

  // observe the dynamically added reviews too
  document.querySelectorAll('#reviewsGrid .reveal').forEach(el => revealObserver.observe(el));

  // ============ Enquiry form ============
  const form = document.getElementById('orderForm');
  const formSuccess = document.getElementById('formSuccess');

  function setError(id, msg) {
    document.getElementById(id).textContent = msg;
  }

  function validate() {
    let valid = true;

    const name = document.getElementById('name');
    const phone = document.getElementById('phone');
    const date = document.getElementById('date');

    if (!name.value.trim() || name.value.trim().length < 3) {
      setError('nameError', 'Please enter your full name.');
      name.classList.add('invalid');
      valid = false;
    } else {
      setError('nameError', '');
      name.classList.remove('invalid');
    }

    const phoneRegex = /^(\+92|0)?3\d{9}$/;
    if (!phoneRegex.test(phone.value.replace(/[\s-]/g, ''))) {
      setError('phoneError', 'Enter a valid Pakistani number, e.g. 0333-1111262.');
      phone.classList.add('invalid');
      valid = false;
    } else {
      setError('phoneError', '');
      phone.classList.remove('invalid');
    }

    const today = new Date().toISOString().split('T')[0];
    if (!date.value || date.value < today) {
      setError('dateError', 'Pick a valid future date.');
      date.classList.add('invalid');
      valid = false;
    } else {
      setError('dateError', '');
      date.classList.remove('invalid');
    }

    return valid;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validate()) {
      const name = document.getElementById('name').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const date = document.getElementById('date').value;
      const occasion = document.getElementById('occasion').value;
      const message = document.getElementById('message').value.trim();

      const text = `Good day, Cups and Cakes. I would like to enquire about a bespoke order:%0A- Occasion: ${occasion}%0A- Date: ${date}%0A- Name: ${name}%0A- Phone: ${phone}${message ? `%0A- Details: ${message}` : ''}`;
      window.open(`https://wa.me/923051111262?text=${text}`, '_blank');

      formSuccess.textContent = 'Your enquiry is being opened on WhatsApp.';
      form.reset();
      setTimeout(() => { formSuccess.textContent = ''; }, 6000);
    } else {
      formSuccess.textContent = '';
    }
  });

  // ============ Footer year ============
  document.getElementById('year').textContent = new Date().getFullYear();

  // ============ Start loops ============
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  requestAnimationFrame(updateParallax);
});
