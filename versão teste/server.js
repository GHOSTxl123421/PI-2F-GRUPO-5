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

// Dados dos sensores
let sensoresData = {
  temperatura: 35.2,
  pressao: 0.75,
  ph: 6.9,
  producao_gas: 0.62,
  qualidade_metano: 64,
  ultima_atualizacao: new Date().toISOString()
};

// Produtos
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

let orders = [];

// ========== ROTAS API ==========

app.get('/api/sensores', (req, res) => {
  res.json(sensoresData);
});

app.post('/api/sensores', (req, res) => {
  const { temperatura, pressao, ph, producao_gas, qualidade_metano } = req.body;
  
  if (temperatura !== undefined) sensoresData.temperatura = temperatura;
  if (pressao !== undefined) sensoresData.pressao = pressao;
  if (ph !== undefined) sensoresData.ph = ph;
  if (producao_gas !== undefined) sensoresData.producao_gas = producao_gas;
  if (qualidade_metano !== undefined) sensoresData.qualidade_metano = qualidade_metano;
  
  sensoresData.ultima_atualizacao = new Date().toISOString();
  
  io.emit('sensores-update', sensoresData);
  
  if (!fs.existsSync('./data')) fs.mkdirSync('./data');
  fs.writeFileSync('./data/sensores.json', JSON.stringify(sensoresData, null, 2));
  
  res.json({ success: true, data: sensoresData });
});

app.get('/api/produtos', (req, res) => {
  res.json(products);
});

app.get('/api/produtos/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (product) res.json(product);
  else res.status(404).json({ error: "Produto não encontrado" });
});

app.post('/api/pedidos', (req, res) => {
  const { items, total, customer } = req.body;
  const order = {
    id: orders.length + 1,
    items,
    total,
    customer,
    date: new Date().toISOString(),
    status: 'pending'
  };
  orders.push(order);
  res.json({ success: true, orderId: order.id, message: "Pedido registrado com sucesso!" });
});

app.get('/api/pedidos', (req, res) => {
  res.json(orders);
});

app.get('/api/arduino/simular', (req, res) => {
  const novosDados = {
    temperatura: Number((30 + Math.random() * 12).toFixed(1)),
    pressao: Number((0.5 + Math.random() * 0.7).toFixed(2)),
    ph: Number((6.2 + Math.random() * 1.3).toFixed(1)),
    producao_gas: Number((0.4 + Math.random() * 0.6).toFixed(2)),
    qualidade_metano: Number((55 + Math.random() * 25).toFixed(0))
  };
  
  sensoresData = { ...sensoresData, ...novosDados, ultima_atualizacao: new Date().toISOString() };
  io.emit('sensores-update', sensoresData);
  
  res.json({ success: true, data: sensoresData });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
  console.log('📡 Cliente conectado ao WebSocket');
  socket.emit('sensores-update', sensoresData);
  
  socket.on('disconnect', () => {
    console.log('📡 Cliente desconectado');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
  ══════════════════════════════════════════════════
     BIODIGESTOR ZENERA - SERVIDOR INICIADO       
  ══════════════════════════════════════════════════
   Servidor: http://localhost:${PORT}                
  ══════════════════════════════════════════════════
  `);
  
  if (!fs.existsSync('./data')) fs.mkdirSync('./data');
});