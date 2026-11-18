document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     1. NAVEGAÇÃO SPA (TROCA DE PÁGINAS) E MENU MOBILE
     ========================================================================== */
  const navLinks = document.querySelectorAll('.nav-link');
  const pageTriggers = document.querySelectorAll('[data-page]');
  const pageSections = document.querySelectorAll('.page-section');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mainNav = document.getElementById('main-nav');

  function navigateToPage(pageId) {
    // Oculta todas as seções e exibe apenas a selecionada
    pageSections.forEach(section => {
      section.classList.remove('active');
    });

    const targetSection = document.getElementById(`page-${pageId}`);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    // Atualiza indicador ativo no menu principal
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.page === pageId);
    });

    // Fecha menu mobile se estiver aberto e rola para o topo
    mainNav.classList.remove('open');
    hamburgerBtn.classList.remove('active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  pageTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPage = trigger.dataset.page;
      if (targetPage) {
        navigateToPage(targetPage);
      }
    });
  });

  hamburgerBtn.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    hamburgerBtn.classList.toggle('active');
    hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
  });

  /* ==========================================================================
     2. CARROSSEL HERO ANIMADO
     ========================================================================== */
  const carousel = document.getElementById('hero-carousel');
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.getElementById('prev-slide');
  const nextBtn = document.getElementById('next-slide');

  let currentSlide = 0;
  let slideInterval;

  function showSlide(index) {
    if (index >= slides.length) currentSlide = 0;
    else if (index < 0) currentSlide = slides.length - 1;
    else currentSlide = index;

    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentSlide);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  function startAutoSlide() {
    slideInterval = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 5000);
  }

  function stopAutoSlide() {
    clearInterval(slideInterval);
  }

  nextBtn.addEventListener('click', () => {
    showSlide(currentSlide + 1);
  });

  prevBtn.addEventListener('click', () => {
    showSlide(currentSlide - 1);
  });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const slideIndex = parseInt(dot.dataset.slide, 10);
      showSlide(slideIndex);
    });
  });

  // Pausa rotação automática ao passar o mouse
  carousel.addEventListener('mouseenter', stopAutoSlide);
  carousel.addEventListener('mouseleave', startAutoSlide);
  startAutoSlide();

  /* ==========================================================================
     3. CARRINHO DE COMPRAS LATERAL (DRAWER)
     ========================================================================== */
  let cart = [];

  const cartDrawer = document.getElementById('cart-drawer');
  const cartBackdrop = document.getElementById('cart-backdrop');
  const openCartBtn = document.getElementById('open-cart-btn');
  const closeCartBtn = document.getElementById('close-cart-btn');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartCountBadge = document.getElementById('cart-count');
  const cartSubtotalValue = document.getElementById('cart-subtotal-value');
  const checkoutBtn = document.getElementById('checkout-btn');
  const toastEl = document.getElementById('toast-notification');

  function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2800);
  }

  function toggleCart(open) {
    cartDrawer.classList.toggle('active', open);
    cartBackdrop.classList.toggle('active', open);
  }

  openCartBtn.addEventListener('click', () => toggleCart(true));
  closeCartBtn.addEventListener('click', () => toggleCart(false));
  cartBackdrop.addEventListener('click', () => toggleCart(false));

  function updateCartUI() {
    const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

    cartCountBadge.textContent = totalItems;
    cartSubtotalValue.textContent = formatCurrency(subtotal);

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Seu carrinho está vazio no momento.</p>';
      return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <span>${formatCurrency(item.price)}</span>
        </div>
        <div class="cart-item-actions">
          <button class="qty-btn" data-action="decrease" data-id="${item.id}" aria-label="Diminuir quantidade">-</button>
          <span>${item.qty}</span>
          <button class="qty-btn" data-action="increase" data-id="${item.id}" aria-label="Aumentar quantidade">+</button>
          <button class="remove-item-btn" data-action="remove" data-id="${item.id}" title="Remover item">Remover</button>
        </div>
      </div>
    `).join('');
  }

  // Delegação de eventos para botões de adicionar ao carrinho nos cards
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-add-cart')) {
      const card = e.target.closest('.product-card');
      const id = card.dataset.id;
      const name = card.dataset.name;
      const price = parseFloat(card.dataset.price);

      const existingItem = cart.find(item => item.id === id);
      if (existingItem) {
        existingItem.qty += 1;
      } else {
        cart.push({ id, name, price, qty: 1 });
      }

      updateCartUI();
      showToast(`"${name}" adicionado ao carrinho!`);
    }
  });

  // Controles internos do carrinho (+, -, remover)
  cartItemsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const { action, id } = btn.dataset;
    const itemIndex = cart.findIndex(item => item.id === id);
    if (itemIndex === -1) return;

    if (action === 'increase') {
      cart[itemIndex].qty += 1;
    } else if (action === 'decrease') {
      cart[itemIndex].qty -= 1;
      if (cart[itemIndex].qty <= 0) cart.splice(itemIndex, 1);
    } else if (action === 'remove') {
      cart.splice(itemIndex, 1);
    }

    updateCartUI();
  });

  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Adicione produtos antes de finalizar a compra.');
      return;
    }
    cart = [];
    updateCartUI();
    toggleCart(false);
    showToast('Pedido simulado realizado com sucesso! Obrigado.');
  });

  /* ==========================================================================
     4. PÁGINAS FUNCIONAIS DO RODAPÉ (MODAL INFORMATIVO)
     ========================================================================== */
  const modalContents = {
    privacidade: {
      title: 'Política de Privacidade',
      body: `
        <p>A <strong>NexusTech</strong> respeita a sua privacidade e cumpre integralmente a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).</p>
        <h4>Coleta de Dados</h4>
        <p>Coletamos apenas informações estritamente necessárias para processamento de pedidos, emissão de nota fiscal e suporte técnico.</p>
        <h4>Segurança</h4>
        <p>Todos os tráfegos de dados são protegidos por protocolos TLS/SSL de 256 bits. Nunca compartilhamos ou comercializamos seus dados com terceiros.</p>
      `
    },
    termos: {
      title: 'Termos de Uso',
      body: `
        <p>Ao navegar e realizar compras na plataforma NexusTech, você concorda com as condições descritas abaixo:</p>
        <h4>Preços e Estoque</h4>
        <p>As ofertas promocionais são válidas enquanto durarem os estoques. Os preços exibidos para pagamento à vista no PIX já contemplam desconto aplicado.</p>
        <h4>Garantia Oficial</h4>
        <p>Todos os produtos comercializados possuem garantia legal e contratual fornecida diretamente pelos fabricantes oficiais no Brasil.</p>
      `
    },
    trocas: {
      title: 'Trocas e Devoluções',
      body: `
        <h4>Direito de Arrependimento (7 dias)</h4>
        <p>Conforme o Art. 49 do Código de Defesa do Consumidor, você tem até 7 (sete) dias corridos após o recebimento para solicitar a devolução por arrependimento, desde que o produto esteja na embalagem original sem sinais de mau uso.</p>
        <h4>Defeito Técnico (RMA)</h4>
        <p>Caso apresente defeito de fabricação dentro de 30 dias, realizamos a substituição imediata após análise técnica em nosso laboratório.</p>
      `
    },
    faq: {
      title: 'Perguntas Frequentes (FAQ)',
      body: `
        <h4>Qual o prazo de envio após a compra?</h4>
        <p>Pedidos aprovados até às 14h em dias úteis são despachados no mesmo dia via transportadora expressa.</p>
        <h4>Os PCs montados já vêm com sistema operacional?</h4>
        <p>Sim, todos os computadores montados acompanham Windows 11 Trial instalado, drivers atualizados e BIOS configurada.</p>
        <h4>Vocês emitem Nota Fiscal?</h4>
        <p>Sim, 100% das vendas acompanham NF-e emitida automaticamente para Pessoa Física ou Jurídica.</p>
      `
    }
  };

  const infoModalBackdrop = document.getElementById('info-modal-backdrop');
  const modalTitle = document.getElementById('modal-title');
  const modalBodyContent = document.getElementById('modal-body-content');
  const closeModalBtn = document.getElementById('close-modal-btn');

  document.querySelectorAll('[data-modal]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const key = link.dataset.modal;
      if (modalContents[key]) {
        modalTitle.textContent = modalContents[key].title;
        modalBodyContent.innerHTML = modalContents[key].body;
        infoModalBackdrop.classList.add('active');
      }
    });
  });

  closeModalBtn.addEventListener('click', () => {
    infoModalBackdrop.classList.remove('active');
  });

  infoModalBackdrop.addEventListener('click', (e) => {
    if (e.target === infoModalBackdrop) {
      infoModalBackdrop.classList.remove('active');
    }
  });

  /* ==========================================================================
     5. VALIDAÇÃO DO FORMULÁRIO DE CONTATO
     ========================================================================== */
  const contactForm = document.getElementById('contact-form');
  const formFeedback = document.getElementById('form-feedback');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    const nome = document.getElementById('nome');
    const email = document.getElementById('email');
    const assunto = document.getElementById('assunto');
    const mensagem = document.getElementById('mensagem');

    // Limpa erros anteriores
    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
    formFeedback.textContent = '';

    if (nome.value.trim().length < 3) {
      document.getElementById('error-nome').textContent = 'Informe seu nome completo (mínimo 3 caracteres).';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value.trim())) {
      document.getElementById('error-email').textContent = 'Insira um endereço de e-mail válido.';
      isValid = false;
    }

    if (!assunto.value) {
      document.getElementById('error-assunto').textContent = 'Selecione um assunto para o atendimento.';
      isValid = false;
    }

    if (mensagem.value.trim().length < 10) {
      document.getElementById('error-mensagem').textContent = 'A mensagem deve conter pelo menos 10 caracteres.';
      isValid = false;
    }

    if (isValid) {
      formFeedback.style.color = 'var(--success)';
      formFeedback.textContent = 'Mensagem enviada com sucesso! Nossa equipe responderá em breve.';
      contactForm.reset();
    }
  });
});