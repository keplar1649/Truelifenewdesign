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
    const slides = Array.from(document.querySelectorAll('.testimonial-slide'));
    const dotsContainer = document.querySelector('.testimonial-dots');
    const prevBtn = document.querySelector('.testimonial-prev');
    const nextBtn = document.querySelector('.testimonial-next');
    let dots = [];
    let currentSlide = 0;
    const totalSlides = slides.length;

    // Build dots dynamically with progress indicator
    function buildDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      slides.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
        dot.setAttribute('tabindex', '0');
        dot.dataset.index = String(i);
        
        // Add progress bar for active dot
        const progress = document.createElement('span');
        progress.className = 'dot-progress';
        dot.appendChild(progress);
        
        dotsContainer.appendChild(dot);
      });
      dots = Array.from(dotsContainer.querySelectorAll('.dot'));

      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          showSlide(index);
          restartAutoplay();
        });
        dot.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            showSlide(index);
            restartAutoplay();
          }
        });
      });
    }

    // Update slide visibility and ARIA
    function showSlide(index) {
      currentSlide = (index + totalSlides) % totalSlides;
      slides.forEach((slide, i) => {
        const active = i === currentSlide;
        slide.classList.toggle('active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      if (dots.length) {
        dots.forEach((dot, i) => {
          const active = i === currentSlide;
          dot.classList.toggle('active', active);
          dot.setAttribute('aria-selected', active ? 'true' : 'false');
          
          // Reset progress animation
          const progress = dot.querySelector('.dot-progress');
          if (progress) {
            progress.style.animation = 'none';
            setTimeout(() => {
              progress.style.animation = active ? 'dotProgress 5s linear' : 'none';
            }, 10);
          }
        });
      }
    }

    function nextSlide() { showSlide(currentSlide + 1); }
    function prevSlide() { showSlide(currentSlide - 1); }

    // Initialize
    buildDots();
    // Ensure first slide ARIA state
    slides.forEach((s, i) => s.setAttribute('aria-hidden', i === 0 ? 'false' : 'true'));
    showSlide(0);

    // Event listeners
    nextBtn?.addEventListener('click', () => {
      nextSlide();
      restartAutoplay();
    });
    prevBtn?.addEventListener('click', () => {
      prevSlide();
      restartAutoplay();
    });

    // Auto-advance slides every 5 seconds
    let slideInterval = setInterval(nextSlide, 5000);
    
    function restartAutoplay() {
      clearInterval(slideInterval);
      slideInterval = setInterval(nextSlide, 5000);
    }

    // Pause auto-advance on hover
    testimonialCarousel.addEventListener('mouseenter', () => {
      clearInterval(slideInterval);
      // Pause progress animation
      const activeDot = dotsContainer?.querySelector('.dot.active .dot-progress');
      if (activeDot) activeDot.style.animationPlayState = 'paused';
    });

    // Resume auto-advance when mouse leaves
    testimonialCarousel.addEventListener('mouseleave', () => {
      restartAutoplay();
      // Resume progress animation
      const activeDot = dotsContainer?.querySelector('.dot.active .dot-progress');
      if (activeDot) activeDot.style.animationPlayState = 'running';
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'Home') {
        showSlide(0);
      } else if (e.key === 'End') {
        showSlide(totalSlides - 1);
      }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    testimonialCarousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    testimonialCarousel.addEventListener('touchmove', (e) => {
      touchEndX = e.changedTouches[0].clientX;
    }, { passive: true });
    testimonialCarousel.addEventListener('touchend', () => {
      const dx = touchEndX - touchStartX;
      if (Math.abs(dx) > 40) {
        if (dx < 0) nextSlide(); else prevSlide();
      }
      touchStartX = touchEndX = 0;
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

  function linkifyParagraphs(){
    const currentPath = (window.location.pathname || '').split('/').pop().split('?')[0].split('#')[0] || 'index.html';
    if(currentPath === 'services.html') return;
    const linkSpecs = [
      { href: 'services.html#physio', patterns: [/(\bphysiotherapy\b)/ig, /(\bphysio\b)/ig] },
      { href: 'services.html#speech', patterns: [/(\bspeech therapy\b)/ig, /(\bspeech therapist\b)/ig] },
      { href: 'services.html#services-intro', patterns: [/(\boccupational therapy\b)/ig, /(\boccupational therapist\b)/ig, /(\bOT\b)/g] },
      { href: 'services.html#nursing', patterns: [/(\bhome nursing\b)/ig, /(\bnursing care\b)/ig, /(\bnursing\b)/ig] },
      { href: 'services.html#doctor', patterns: [/(\bdoctor's consultation\b)/ig, /(\bdoctor consultation\b)/ig, /(\bdoctor home visit\b)/ig] },
      { href: 'services.html#laboratory', patterns: [/(\blaboratory tests\b)/ig, /(\blab tests\b)/ig, /(\bblood tests\b)/ig] },
      { href: 'services.html#services-intro', patterns: [/(\bhome healthcare services\b)/ig] }
    ];

    function getBestMatch(text){
      let best = null;
      for(const spec of linkSpecs){
        if(spec.href.split('#')[0] === currentPath) continue;
        for(const pattern of spec.patterns){
          pattern.lastIndex = 0;
          const m = pattern.exec(text);
          if(!m) continue;
          const start = m.index;
          const end = start + m[0].length;
          if(!best || start < best.start){
            best = { start, end, label: m[0], href: spec.href };
          }
        }
      }
      return best;
    }

    const paragraphs = Array.from(document.querySelectorAll('main p'));
    for(const p of paragraphs){
      const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, {
        acceptNode(node){
          if(!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          const parentEl = node.parentElement;
          if(!parentEl) return NodeFilter.FILTER_REJECT;
          if(parentEl.closest('a')) return NodeFilter.FILTER_REJECT;
          if(parentEl.closest('script, style, noscript')) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });

      const textNodes = [];
      while(walker.nextNode()) textNodes.push(walker.currentNode);

      for(const node of textNodes){
        let text = node.nodeValue;
        let match = getBestMatch(text);
        if(!match) continue;

        const frag = document.createDocumentFragment();
        while(match){
          if(match.start > 0){
            frag.appendChild(document.createTextNode(text.slice(0, match.start)));
          }
          const a = document.createElement('a');
          a.href = match.href;
          a.className = 'content-link';
          a.textContent = match.label;
          frag.appendChild(a);

          text = text.slice(match.end);
          match = getBestMatch(text);
        }
        if(text) frag.appendChild(document.createTextNode(text));
        node.parentNode.replaceChild(frag, node);
      }
    }
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
    document.addEventListener('DOMContentLoaded', ()=>{
      linkifyParagraphs();
      createBrochureModal();
    });
  } else {
    linkifyParagraphs();
    createBrochureModal();
  }
})();
