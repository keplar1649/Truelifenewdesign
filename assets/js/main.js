// Main JS for TrueLife Home Health
(function(){
  const header = document.querySelector('.header');
  const navLinks = document.querySelector('.nav-links');
  const toggleBtn = document.querySelector('.nav-toggle');
  const pageName = document.querySelector('.page-name');

  // Page-load fade-in
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ()=> document.body.classList.add('page-loaded'));
  } else {
    document.body.classList.add('page-loaded');
  }

  // Video Modal (responsive 16:9) for elements with [data-video]
  function createVideoModal(url){
    // Remove any existing instance
    const existing = document.getElementById('videoModal');
    if(existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'videoModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-backdrop" data-close></div>
      <div class="modal-dialog" role="dialog" aria-modal="true" aria-label="Video player">
        <button class="modal-close" aria-label="Close" data-close>&times;</button>
        <div class="embed-16x9">
          <iframe src="${url}" title="Video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
        </div>
      </div>`;

    modal.addEventListener('click', (e)=>{
      if(e.target.hasAttribute('data-close')){
        modal.remove();
      }
    });
    document.body.appendChild(modal);
  }

  // Delegate clicks for [data-video] elements across the site (News & Events pages)
  document.addEventListener('click', (e)=>{
    const trigger = e.target.closest('[data-video]');
    if(!trigger) return;
    e.preventDefault();
    const url = trigger.getAttribute('data-video');
    if(!url) return;
    // Support YouTube/Vimeo page URLs by converting to embeddable format when possible
    let embed = url;
    // YouTube short or watch URLs
    const ytWatch = /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([\w-]+)/i;
    const ytShort = /https?:\/\/(?:www\.)?youtu\.be\/([\w-]+)/i;
    const vimeo = /https?:\/\/(?:www\.)?vimeo\.com\/(\d+)/i;
    if(ytWatch.test(url)){
      embed = `https://www.youtube.com/embed/${url.match(ytWatch)[1]}?rel=0&autoplay=1`;
    }else if(ytShort.test(url)){
      embed = `https://www.youtube.com/embed/${url.match(ytShort)[1]}?rel=0&autoplay=1`;
    }else if(vimeo.test(url)){
      embed = `https://player.vimeo.com/video/${url.match(vimeo)[1]}?autoplay=1`;
    }
    createVideoModal(embed);
  });

  function onScroll(){
    if(window.scrollY > 10){
      header?.classList.add('scrolled');
    }else{
      header?.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll);
  onScroll();

  toggleBtn?.addEventListener('click', ()=>{
    // Toggle mobile navigation visibility
    navLinks?.classList.toggle('active');
  });
  // Close menu on link click (mobile)
  navLinks?.addEventListener('click', (e)=>{
    if(e.target.matches('a')) navLinks.classList.remove('active');
  });

  // Set page name from body data-page
  const pageTitle = document.body?.dataset?.page || '';
  if(pageName && pageTitle){ pageName.textContent = ' / ' + pageTitle; }

  // Simple Carousel
  const slides = Array.from(document.querySelectorAll('.slide'));
  const dotsContainer = document.querySelector('.carousel-dots');
  let idx = 0, timer;
  function show(n){
    if(slides.length === 0) return;
    idx = (n + slides.length) % slides.length;
    slides.forEach((s,i)=> s.classList.toggle('active', i===idx));
    if(dotsContainer){
      dotsContainer.querySelectorAll('button').forEach((b,i)=> b.classList.toggle('active', i===idx));
    }
  }
  function next(){ show(idx+1); }
  function start(){ if(timer) clearInterval(timer); timer = setInterval(next, 5000); }
  function buildDots(){
    if(!dotsContainer || slides.length<=1) return;
    dotsContainer.innerHTML = '';
    slides.forEach((_,i)=>{
      const b = document.createElement('button');
      if(i===0) b.classList.add('active');
      b.addEventListener('click', ()=>{ show(i); start(); });
      dotsContainer.appendChild(b);
    });
  }
  buildDots();
  show(0);
  start();

  // Testimonial Carousel
  const testimonialCarousel = document.querySelector('.testimonial-carousel');
  if (testimonialCarousel) {
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.testimonial-prev');
    const nextBtn = document.querySelector('.testimonial-next');
    let currentSlide = 0;
    const totalSlides = slides.length;

    // Show current slide
    function showSlide(index) {
      // Hide all slides
      slides.forEach(slide => slide.classList.remove('active'));
      dots.forEach(dot => dot.classList.remove('active'));
      
      // Show current slide and update dot
      slides[index].classList.add('active');
      dots[index].classList.add('active');
      currentSlide = index;
    }

    // Next slide
    function nextSlide() {
      currentSlide = (currentSlide + 1) % totalSlides;
      showSlide(currentSlide);
    }

    // Previous slide
    function prevSlide() {
      currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
      showSlide(currentSlide);
    }

    // Event listeners
    nextBtn?.addEventListener('click', nextSlide);
    prevBtn?.addEventListener('click', prevSlide);

    // Dot navigation
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        showSlide(index);
      });
    });

    // Auto-advance slides every 5 seconds
    let slideInterval = setInterval(nextSlide, 5000);

    // Pause auto-advance on hover
    testimonialCarousel.addEventListener('mouseenter', () => {
      clearInterval(slideInterval);
    });

    // Resume auto-advance when mouse leaves
    testimonialCarousel.addEventListener('mouseleave', () => {
      clearInterval(slideInterval);
      slideInterval = setInterval(nextSlide, 5000);
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    });
  }

  // Scroll Reveal Animations
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && revealEls.length){
    const io = new IntersectionObserver((entries, obs)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          // Apply optional per-element delay via data-delay (e.g., data-delay=".12s")
          const delay = entry.target.getAttribute('data-delay');
          if(delay){ entry.target.style.setProperty('--reveal-delay', delay); }
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {threshold: 0.2, rootMargin: '0px 0px -10% 0px'});
    revealEls.forEach(el=> io.observe(el));
  }else{
    // Fallback: reveal immediately
    revealEls.forEach(el=> el.classList.add('revealed'));
  }

  // Parallax backgrounds for sections with .parallax
  const parallaxSections = Array.from(document.querySelectorAll('.parallax'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(parallaxSections.length && !reduceMotion){
    let ticking = false;
    const onParallax = ()=>{
      ticking = false;
      const vh = window.innerHeight;
      parallaxSections.forEach(sec=>{
        const rect = sec.getBoundingClientRect();
        if(rect.bottom < 0 || rect.top > vh) return; // skip if far from viewport
        const speed = parseFloat(sec.dataset.parallaxSpeed || '0.2');
        // progress from -vh..vh range to smooth entry/exit
        const offset = (rect.top - vh) * speed; // negative when entering
        sec.style.setProperty('--parallax-y', `${offset.toFixed(2)}px`);
      });
    };
    const requestTick = ()=>{
      if(!ticking){
        ticking = true;
        requestAnimationFrame(onParallax);
      }
    };
    window.addEventListener('scroll', requestTick, {passive:true});
    window.addEventListener('resize', requestTick);
    // initial position
    requestTick();
  }

  // Brochure Modal
  // Create and inject a reusable modal that asks for Name, Email, Phone and lets the user download the brochure.
  function createBrochureModal(){
    if(document.getElementById('brochureModal')) return;
    const modal = document.createElement('div');
    modal.id = 'brochureModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-backdrop" data-close></div>
      <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="brochureTitle">
        <button class="modal-close" aria-label="Close" data-close>&times;</button>
        <div class="modal-header">
          <h3 id="brochureTitle">Get our brochure</h3>
          <p class="modal-sub">Tell us a bit about you and download instantly</p>
        </div>
        <form class="modal-body" id="brochureForm" novalidate>
          <div class="form-row">
            <label for="bfName">Name</label>
            <input id="bfName" name="name" type="text" placeholder="Your full name" required />
            <span class="error" aria-live="polite"></span>
          </div>
          <div class="form-row">
            <label for="bfEmail">Email</label>
            <input id="bfEmail" name="email" type="email" placeholder="you@example.com" required />
            <span class="error" aria-live="polite"></span>
          </div>
          <div class="form-row">
            <label for="bfPhone">Phone</label>
            <input id="bfPhone" name="phone" type="tel" placeholder="e.g. +971 5x xxx xxxx" required />
            <span class="error" aria-live="polite"></span>
          </div>
          <button type="submit" class="btn modal-submit">Download Brochure</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    // Open/Close helpers
    const open = ()=> modal.classList.add('open');
    const close = ()=> modal.classList.remove('open');

    // Close actions
    modal.addEventListener('click', (e)=>{
      if(e.target.matches('[data-close]')) close();
    });
    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape' && modal.classList.contains('open')) close();
    });

    // Attach to all brochure triggers
    document.querySelectorAll('#downloadBrochure, .btn-brochure').forEach(btn=>{
      btn.addEventListener('click', (e)=>{ e.preventDefault(); open(); });
    });

    // Simple validation helpers
    function setError(input, msg){
      const row = input.closest('.form-row');
      if(!row) return;
      row.classList.add('invalid');
      const err = row.querySelector('.error');
      if(err) err.textContent = msg || '';
    }
    function clearError(input){
      const row = input.closest('.form-row');
      if(!row) return;
      row.classList.remove('invalid');
      const err = row.querySelector('.error');
      if(err) err.textContent = '';
    }

    // Form submit -> validate -> trigger download -> close
    const form = modal.querySelector('#brochureForm');
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const name = form.querySelector('#bfName');
      const email = form.querySelector('#bfEmail');
      const phone = form.querySelector('#bfPhone');

      let valid = true;
      // Name
      if(!name.value.trim()) { setError(name, 'Please enter your name'); valid = false; } else { clearError(name); }
      // Email basic check
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      if(!emailOk){ setError(email, 'Enter a valid email'); valid = false; } else { clearError(email); }
      // Phone basic check (allow digits, +, spaces, dashes)
      const phoneOk = /^[+\d][\d\s\-()]{6,}$/.test(phone.value.trim());
      if(!phoneOk){ setError(phone, 'Enter a valid phone'); valid = false; } else { clearError(phone); }

      if(!valid) return;

      // Attempt to download brochure. If a real PDF exists at assets/brochure/TrueLife-Brochure.pdf it will be used.
      const brochurePath = 'assets/brochure/TrueLife-Brochure.pdf';
      fetch(brochurePath, {method: 'GET'}).then(r=>{
        if(!r.ok) throw new Error('Missing brochure');
        return r.blob();
      }).catch(()=>{
        // Fallback: generate a lightweight PDF-ish file (as text) for demo
        const content = `TrueLife Home Health\nBrochure request\nName: ${name.value}\nEmail: ${email.value}\nPhone: ${phone.value}`;
        return new Blob([content], {type: 'application/octet-stream'});
      }).then(blob=>{
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'TrueLife-Brochure.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        close();
      });
    });
  }

  // Initialize brochure modal once DOM is ready
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', createBrochureModal);
  } else {
    createBrochureModal();
  }
})();
