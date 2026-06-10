let carrinho = [];

// Carregar carrinho do localStorage
function carregarCarrinho() {
    const carrinhoSalvo = localStorage.getItem('carrinho');
    if (carrinhoSalvo) {
        carrinho = JSON.parse(carrinhoSalvo);
    }
    atualizarResumo();
}

function atualizarResumo() {
    const container = document.getElementById('resumo-items');
    const totalEl = document.getElementById('resumo-total');
    
    if (carrinho.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999;">Carrinho vazio</p>';
        totalEl.innerHTML = 'R$ 0,00';
        return;
    }
    
    container.innerHTML = carrinho.map(item => `
        <div class="resumo-item">
            <span>${item.name}</span>
            <strong>R$ ${item.price.toLocaleString('pt-BR')}</strong>
        </div>
    `).join('');
    
    const total = carrinho.reduce((acc, item) => acc + item.price, 0);
    totalEl.innerHTML = `R$ ${total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
}

// Verificar usuário logado
async function verificarUsuario() {
    try {
        const response = await fetch('/api/sessao');
        const data = await response.json();
        
        if (data.logado) {
            document.getElementById('user-nome').innerHTML = `Olá, ${data.usuario.nome}`;
        } else {
            window.location.href = '/login';
        }
    } catch (error) {
        window.location.href = '/login';
    }
}

// Formatar número do cartão
document.getElementById('cartao-numero')?.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    e.target.value = value.substring(0, 19);
});

// Formatar validade
document.getElementById('cartao-validade')?.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0,2) + '/' + value.substring(2);
    }
    e.target.value = value.substring(0, 7);
});

// Selecionar método de pagamento
document.querySelectorAll('.method-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.method-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        
        const metodo = card.querySelector('input').value;
        const cartaoFields = document.getElementById('cartao-fields');
        
        if (metodo === 'cartao') {
            cartaoFields.style.display = 'block';
        } else {
            cartaoFields.style.display = 'none';
        }
    });
});

// Finalizar pagamento
document.getElementById('finalizar-btn')?.addEventListener('click', async () => {
    const metodo = document.querySelector('input[name="metodo"]:checked').value;
    const total = carrinho.reduce((acc, item) => acc + item.price, 0);
    
    // Validar endereço
    const endereco = {
        cep: document.getElementById('endereco-cep').value,
        rua: document.getElementById('endereco-rua').value,
        numero: document.getElementById('endereco-numero').value,
        complemento: document.getElementById('endereco-complemento').value,
        bairro: document.getElementById('endereco-bairro').value,
        cidade: document.getElementById('endereco-cidade').value,
        uf: document.getElementById('endereco-uf').value
    };
    
    if (!endereco.rua || !endereco.cidade) {
        alert('Preencha o endereço de entrega!');
        return;
    }
    
    let dadosPagamento = { metodo, endereco, total };
    
    if (metodo === 'cartao') {
        const cartao = {
            numero: document.getElementById('cartao-numero').value,
            validade: document.getElementById('cartao-validade').value,
            cvv: document.getElementById('cartao-cvv').value,
            nome: document.getElementById('cartao-nome').value
        };
        
        if (!cartao.numero || !cartao.validade || !cartao.cvv) {
            alert('Preencha os dados do cartão!');
            return;
        }
        
        dadosPagamento.cartao = cartao;
    }
    
    try {
        const response = await fetch('/api/pagamento', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosPagamento)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Limpar carrinho
            localStorage.removeItem('carrinho');
            document.getElementById('success-modal').classList.add('active');
        } else {
            alert(data.message || 'Erro no pagamento');
        }
    } catch (error) {
        alert('Erro ao processar pagamento. Tente novamente.');
    }
});

// Atualizar o addToCart original para salvar no localStorage
const originalAddToCart = window.addToCart;
if (typeof originalAddToCart === 'function') {
    window.addToCart = function(name, price) {
        originalAddToCart(name, price);
        salvarCarrinho();
    };
}

function salvarCarrinho() {
    if (typeof cart !== 'undefined') {
        localStorage.setItem('carrinho', JSON.stringify(cart));
    }
}

// Inicializar
carregarCarrinho();
verificarUsuario();