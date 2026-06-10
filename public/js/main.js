// ========== HEADER SCROLL EFFECT ==========
const header = document.getElementById('main-header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 80) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
});

// ========== CARRINHO ==========
let cart = [];
const cartDrawer = document.getElementById('cart-drawer');
const overlay = document.getElementById('overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotalContainer = document.getElementById('cart-total');

function toggleCart() {
    cartDrawer.classList.toggle('active');
    overlay.classList.toggle('active');
}

if (overlay) {
    overlay.addEventListener('click', toggleCart);
}

function addToCart(name, price) {
    cart.push({ name, price, id: Date.now() });
    updateCartUI();
    if (!cartDrawer.classList.contains('active')) toggleCart();
    showNotification(`${name} adicionado ao carrinho!`);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function updateCartUI() {
    cartCount.innerText = cart.length;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="cart-empty">🛒 Seu carrinho está vazio</div>';
        cartTotalContainer.innerText = 'Total: R$ 0,00';
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div>
                <div style="font-weight:600">${item.name}</div>
                <div style="font-size:0.85rem; color:var(--green-primary)">R$ ${item.price.toLocaleString('pt-BR')}</div>
            </div>
            <i class="fa-solid fa-trash-can" style="color:#ff4d4d; cursor:pointer" onclick="removeFromCart(${index})"></i>
        </div>
    `).join('');
    
    const total = cart.reduce((acc, item) => acc + item.price, 0);
    cartTotalContainer.innerText = `Total: R$ ${total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
}

function finalizarPedido() {
    if (cart.length === 0) {
        showNotification('Seu carrinho está vazio!', 'error');
        return;
    }
    
    const total = cart.reduce((acc, item) => acc + item.price, 0);
    
    fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            items: cart,
            total: total,
            customer: { name: "Cliente", email: "cliente@email.com" }
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showNotification('Pedido finalizado com sucesso! 🎉', 'success');
            cart = [];
            updateCartUI();
            toggleCart();
        }
    })
    .catch(err => {
        showNotification('Erro ao finalizar pedido. Tente novamente.', 'error');
    });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#2d5a27' : '#ef4444'};
        color: white;
        padding: 12px 24px;
        border-radius: 10px;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    notification.innerHTML = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Adicionar animações CSS dinamicamente
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ========== DASHBOARD DE SENSORES (WEBSOCKET) ==========
const socket = io();

function updateDashboard(data) {
    const tempEl = document.getElementById('temp-value');
    const pressEl = document.getElementById('press-value');
    const phEl = document.getElementById('ph-value');
    const producaoEl = document.getElementById('producao-value');
    const metanoEl = document.getElementById('metano-value');
    const updateTimeEl = document.getElementById('update-time');
    
    if (tempEl) tempEl.innerHTML = data.temperatura?.toFixed(1) || '--';
    if (pressEl) pressEl.innerHTML = data.pressao?.toFixed(2) || '--';
    if (phEl) phEl.innerHTML = data.ph?.toFixed(1) || '--';
    if (producaoEl) producaoEl.innerHTML = data.producao_gas?.toFixed(2) || '--';
    if (metanoEl) metanoEl.innerHTML = data.qualidade_metano?.toFixed(0) || '--';
    
    if (updateTimeEl && data.ultima_atualizacao) {
        const updateTime = new Date(data.ultima_atualizacao).toLocaleString('pt-BR');
        updateTimeEl.innerHTML = updateTime;
    }
    
    checkStatus('temp', data.temperatura, 30, 40, 25, 45);
    checkStatus('press', data.pressao, 0.6, 1.2, 0.4, 1.5);
    checkStatus('ph', data.ph, 6.5, 7.5, 6.0, 8.0);
    checkStatus('producao', data.producao_gas, 0.6, 0.9, 0.3, 1.2);
    checkStatus('metano', data.qualidade_metano, 60, 75, 50, 80);
}

function checkStatus(element, value, idealMin, idealMax, warnMin, warnMax) {
    const statusEl = document.getElementById(`${element}-status`);
    if (!statusEl || value === undefined || value === null) return;
    
    if (value >= idealMin && value <= idealMax) {
        statusEl.innerHTML = ' Ideal';
        statusEl.className = 'sensor-status status-ok';
    } else if (value >= warnMin && value <= warnMax) {
        statusEl.innerHTML = ' Atenção';
        statusEl.className = 'sensor-status status-warning';
    } else {
        statusEl.innerHTML = ' Crítico';
        statusEl.className = 'sensor-status status-danger';
    }
}

if (socket) {
    socket.on('sensores-update', (data) => {
        console.log(' Dados dos sensores atualizados:', data);
        updateDashboard(data);
    });
}

// Buscar dados iniciais
fetch('/api/sensores')
    .then(res => res.json())
    .then(data => updateDashboard(data))
    .catch(err => console.log(' Backend não disponível, usando dados simulados'));

// Botão para simular dados do Arduino
const simularBtn = document.getElementById('simular-btn');
if (simularBtn) {
    simularBtn.addEventListener('click', () => {
        fetch('/api/arduino/simular')
            .then(res => res.json())
            .then(data => {
                console.log('🎮 Dados simulados enviados:', data);
                showNotification('Dados dos sensores simulados!', 'success');
            })
            .catch(err => showNotification('Erro ao simular dados', 'error'));
    });
}

// ========== CARREGAR PRODUTOS DA LOJA ==========
function loadProducts() {
    fetch('/api/produtos')
        .then(res => res.json())
        .then(products => {
            const container = document.getElementById('produtos-container');
            if (!container) return;
            
            container.innerHTML = products.map(prod => `
                <div class="produto-card reveal">
                    <i class="fa-solid ${getIconByCategory(prod.category)}" style="font-size: 2.5rem; color: var(--green-primary);"></i>
                    <h3>${prod.name}</h3>
                    <p class="produto-desc">${prod.description}</p>
                    <div class="produto-preco">R$ ${prod.price.toLocaleString('pt-BR')}</div>
                    <button class="btn btn-green" onclick="addToCart('${prod.name}', ${prod.price})">
                        <i class="fa-solid fa-cart-plus"></i> Comprar
                    </button>
                </div>
            `).join('');
            
            // Reaplicar animação reveal nos novos elementos
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) entry.target.classList.add('visible');
                });
            }, { threshold: 0.1 });
            
            document.querySelectorAll('.produto-card.reveal').forEach(el => observer.observe(el));
        })
        .catch(err => console.log('Erro ao carregar produtos:', err));
}

function getIconByCategory(category) {
    const icons = {
        kit: 'fa-cube',
        sensor: 'fa-microchip',
        acessorio: 'fa-tools'
    };
    return icons[category] || 'fa-box';
}

// ========== FORMULÁRIO DE CONTATO ==========
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification('Mensagem enviada! Entraremos em contato em breve.', 'success');
        contactForm.reset();
    });
}

// ========== ANIMAÇÃO DE SCROLL (REVEAL) ==========
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ========== INICIAR CARREGAMENTO ==========
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    console.log('🚀 Site Zenera carregado com sucesso!');
});