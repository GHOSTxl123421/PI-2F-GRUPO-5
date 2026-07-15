// ===================================================
// entregador.js — Lógica da tela do entregador (SayWay)
// ===================================================

// ---------- Autenticação ----------
const token = localStorage.getItem('token');
const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

if (!token || !usuario || usuario.tipo !== 'entregador') {
    window.location.href = '/login';
}

// ---------- Estado ----------
let pedidoAtivoId = null;   // id do pedido sendo entregue no momento
let watchId = null;         // controla o rastreamento real via GPS
let intervalTeste = null;   // controla a simulação do modo teste

// ---------- Envio de localização ----------
async function enviarLocalizacao(pedidoId, latitude, longitude) {
    try {
        await fetch('/api/entregador/localizacao', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ pedido_id: pedidoId, latitude, longitude })
        });
    } catch (error) {
        console.error('Erro ao enviar localização:', error);
    }
}

// ---------- Rastreamento real (GPS do navegador) ----------
function iniciarRastreamentoReal(pedidoId) {
    if (!navigator.geolocation) {
        alert('Geolocalização não suportada neste navegador');
        return;
    }
    watchId = navigator.geolocation.watchPosition(
        (position) => {
            enviarLocalizacao(pedidoId, position.coords.latitude, position.coords.longitude);
        },
        (erro) => console.error('Erro de geolocalização:', erro),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
}

function pararRastreamento() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
    if (intervalTeste !== null) {
        clearInterval(intervalTeste);
        intervalTeste = null;
    }
}

// ---------- Modo teste (apenas conta dev) ----------
// Em vez de depender do GPS real, simula o movimento do entregador
// seguindo a rota calculada pela API — útil pra testar sem sair de casa.
async function iniciarModoTeste(pedidoId, origem, destino) {
    if (!usuario.is_dev) {
        alert('Modo teste disponível apenas para contas de desenvolvedor');
        return;
    }

    const resposta = await fetch('/api/rotas/calcular', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ origem, destino })
    });
    const dados = await resposta.json();

    if (!dados.success) {
        alert('Erro ao calcular rota de teste');
        return;
    }

    const pontos = dados.geometria.coordinates; // [[lng, lat], [lng, lat], ...]
    let i = 0;

    intervalTeste = setInterval(() => {
        if (i >= pontos.length) {
            clearInterval(intervalTeste);
            return;
        }
        const [lng, lat] = pontos[i]; // GeoJSON vem invertido: [longitude, latitude]
        enviarLocalizacao(pedidoId, lat, lng);
        i++;
    }, 2000); // avança um ponto da rota a cada 2s
}

// ---------- Carregar pedidos disponíveis ----------
async function carregarPedidosDisponiveis() {
    try {
        const resposta = await fetch('/api/pedidos/entregador/disponiveis');
        const dados = await resposta.json();
        if (!dados.success) return;

        // TODO: confirmar se esse id existe no entregador-pedidos.html
        const lista = document.getElementById('listaPedidos');
        if (!lista) return;

        lista.innerHTML = '';
        dados.pedidos.forEach((pedido) => {
            const item = document.createElement('div');
            item.className = 'pedido-item';
            item.innerHTML = `
                <p><strong>${pedido.empresa_nome}</strong> — ${pedido.codigo_rastreamento}</p>
                <p>Entrega: ${pedido.endereco_entrega}</p>
                <button data-id="${pedido.id}" class="btn-aceitar">Aceitar</button>
            `;
            lista.appendChild(item);
        });

        document.querySelectorAll('.btn-aceitar').forEach((btn) => {
            btn.addEventListener('click', () => aceitarPedido(btn.dataset.id));
        });
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
    }
}

// ---------- Aceitar pedido e iniciar rastreamento ----------
async function aceitarPedido(pedidoId) {
    try {
        const resposta = await fetch(`/api/pedidos/${pedidoId}/entregador`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const dados = await resposta.json();
        if (!dados.success) {
            alert(dados.message || 'Erro ao aceitar pedido');
            return;
        }

        pedidoAtivoId = pedidoId;
        iniciarRastreamentoReal(pedidoId);

        // Mostra o botão de modo teste, se a conta for dev
        // TODO: confirmar id real do botão no HTML
        const btnTeste = document.getElementById('btnModoTeste');
        if (btnTeste && usuario.is_dev) {
            btnTeste.style.display = 'inline-block';
        }
    } catch (error) {
        console.error('Erro ao aceitar pedido:', error);
    }
}

// ---------- Inicialização ----------
document.addEventListener('DOMContentLoaded', () => {
    carregarPedidosDisponiveis();

    // TODO: confirmar id real do botão de modo teste no HTML
    const btnTeste = document.getElementById('btnModoTeste');
    if (btnTeste) {
        btnTeste.addEventListener('click', () => {
            if (!pedidoAtivoId) {
                alert('Aceite um pedido antes de iniciar o modo teste');
                return;
            }
            // TODO: origem/destino reais devem vir do endereço da empresa e do cliente do pedido ativo.
            // Valores abaixo são só um exemplo pra teste inicial — ajustar depois.
            const origem = { lat: -26.3044, lng: -48.8487 };
            const destino = { lat: -26.9194, lng: -49.0661 };
            iniciarModoTeste(pedidoAtivoId, origem, destino);
        });
    }
});
