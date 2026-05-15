const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ========== USUÁRIOS (fixos para teste) ==========
const usuarios = [
  { id: 1, nome: "João Silva", email: "joao@email.com", senha: "123456" },
  { id: 2, nome: "Maria Santos", email: "maria@email.com", senha: "123456" }
];

// ========== ROTA DE LOGIN ==========
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;
  console.log('📝 Tentativa de login:', email);
  
  const usuario = usuarios.find(u => u.email === email && u.senha === senha);
  
  if (usuario) {
    console.log('✅ Login sucesso:', usuario.nome);
    res.json({ 
      success: true, 
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } 
    });
  } else {
    console.log('❌ Login falhou:', email);
    res.status(401).json({ success: false, message: "Email ou senha incorretos" });
  }
});

// ========== DADOS DOS SENSORES ==========
// ========== DADOS DOS SENSORES (APENAS 3) ==========
let sensoresData = {
  temperatura: 35.2,    // °C
  pressao: 0.75,        // bar
  densidade: 0.62,      // kg/m³ (densidade do biogás)
  ultima_atualizacao: new Date().toISOString()
};

app.get('/api/sensores', (req, res) => {
  res.json(sensoresData);
});

app.post('/api/sensores', (req, res) => {
  const { temperatura, pressao, densidade } = req.body;
  
  if (temperatura !== undefined) sensoresData.temperatura = temperatura;
  if (pressao !== undefined) sensoresData.pressao = pressao;
  if (densidade !== undefined) sensoresData.densidade = densidade;
  
  sensoresData.ultima_atualizacao = new Date().toISOString();
  io.emit('sensores-update', sensoresData);
  
  res.json({ success: true, data: sensoresData });
});

app.get('/api/arduino/simular', (req, res) => {
  const novosDados = {
    temperatura: Number((30 + Math.random() * 12).toFixed(1)),     // 30-42°C
    pressao: Number((0.5 + Math.random() * 0.8).toFixed(2)),       // 0.5-1.3 bar
    densidade: Number((0.5 + Math.random() * 0.5).toFixed(2))      // 0.5-1.0 kg/m³
  };
  
  sensoresData = { ...sensoresData, ...novosDados, ultima_atualizacao: new Date().toISOString() };
  io.emit('sensores-update', sensoresData);
  res.json({ success: true, data: sensoresData });
});

// ========== PRODUTOS ==========
let products = [
  { id: 1, name: "Biodigestor Zenera 2.0", price: 4990, stock: 10, category: "kit", description: "Biodigestor completo para residências" },
  { id: 2, name: "Sensor de Temperatura Digital", price: 89, stock: 25, category: "sensor", description: "Monitora a temperatura interna" },
  { id: 3, name: "Sensor de Pressão", price: 120, stock: 15, category: "sensor", description: "Mede a pressão do biogás" },
  { id: 4, name: "Sensor de pH", price: 95, stock: 20, category: "sensor", description: "Monitora a acidez do efluente" },
  { id: 5, name: "Válvula de Segurança", price: 45, stock: 30, category: "acessorio", description: "Válvula de alívio de pressão" },
  { id: 6, name: "Kit de Mangueiras", price: 35, stock: 40, category: "acessorio", description: "Mangueiras para conexão" },
  { id: 7, name: "Queimador de Biogás", price: 180, stock: 12, category: "acessorio", description: "Fogão adaptado para biogás" },
  { id: 8, name: "Kit Instalação Completa", price: 350, stock: 8, category: "kit", description: "Tudo que você precisa para instalar" }
];

app.get('/api/produtos', (req, res) => {
  res.json(products);
});

app.post('/api/pedidos', (req, res) => {
  const { items, total } = req.body;
  console.log('📦 Pedido recebido:', { items, total });
  res.json({ success: true, message: "Pedido registrado!" });
});

app.post('/api/pagamento', (req, res) => {
  const { metodo, endereco, total } = req.body;
  console.log('💳 Pagamento:', { metodo, endereco, total });
  res.json({ success: true, message: "Pagamento aprovado!" });
});

// ========== SERVIR PÁGINAS ==========
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/pagamento', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pagamento.html'));
});

// ========== WEBSOCKET ==========
io.on('connection', (socket) => {
  console.log('📡 Cliente conectado');
  socket.emit('sensores-update', sensoresData);
});

// ========== INICIAR SERVIDOR ==========
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║     🚀 BIODIGESTOR ZENERA - SERVIDOR INICIADO       ║
╠══════════════════════════════════════════════════════╣
║  📡 Servidor: http://localhost:${PORT}                ║
║  🔐 Contas demo:                                     ║
║     joao@email.com / 123456                         ║
║     maria@email.com / 123456                        ║
╚══════════════════════════════════════════════════════╝
  `);
});