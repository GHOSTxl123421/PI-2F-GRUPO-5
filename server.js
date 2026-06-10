const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();

// ========== CONEXÃO COM O BANCO DE DADOS ==========
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'biodigestor_bd',  // ✅ Nome corrigido!
    password: 'ifc',              // sua senha
    port: 5432,
});

// Testar conexão com o banco
pool.connect((err) => {
    if (err) {
        console.error('❌ Erro ao conectar no PostgreSQL:', err.message);
    } else {
        console.log('✅ Conectado ao PostgreSQL com sucesso!');
        console.log('📦 Banco: biodigestor_bd');
    }
});

// ========== CONFIGURAÇÕES DO SERVIDOR ==========
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ========== ROTAS DE USUÁRIOS ==========

// Cadastrar novo usuário
app.post('/cadastrar', async (req, res) => {
    const { nome, email, telefone, cpf, cep, senha } = req.body;
    
    if (!nome || !email || !senha) {
        return res.status(400).json({ success: false, message: 'Preencha nome, email e senha!' });
    }
    
    try {
        const resultado = await pool.query(
            `INSERT INTO usuarios (nome, email, telefone, cpf, cep, senha) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING id, nome, email`,
            [nome, email, telefone || null, cpf || null, cep || null, senha]
        );
        res.json({ 
            success: true, 
            message: 'Usuário cadastrado com sucesso!',
            usuario: resultado.rows[0]
        });
    } catch (erro) {
        if (erro.code === '23505') {
            res.status(400).json({ success: false, message: 'Email já cadastrado!' });
        } else {
            res.status(500).json({ success: false, message: 'Erro ao cadastrar: ' + erro.message });
        }
    }
});

// Listar todos os usuários (só para teste/admin)
app.get('/usuarios', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT id, nome, email, telefone, criado_em FROM usuarios');
        res.json({ success: true, usuarios: resultado.rows });
    } catch (erro) {
        res.status(500).json({ success: false, message: 'Erro ao buscar usuários: ' + erro.message });
    }
});

// Verificar login
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
        return res.status(400).json({ success: false, message: 'Preencha email e senha!' });
    }
    
    try {
        const resultado = await pool.query(
            'SELECT id, nome, email FROM usuarios WHERE email = $1 AND senha = $2',
            [email, senha]
        );
        
        if (resultado.rows.length > 0) {
            res.json({ 
                success: true, 
                usuario: resultado.rows[0],
                message: 'Login realizado com sucesso!'
            });
        } else {
            res.status(401).json({ success: false, message: 'Email ou senha incorretos!' });
        }
    } catch (erro) {
        res.status(500).json({ success: false, message: 'Erro ao fazer login: ' + erro.message });
    }
});

// ========== ROTAS DE PRODUTOS ==========
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
    res.json({ success: true, produtos: products });
});

// ========== ROTAS DE PEDIDOS E PAGAMENTOS ==========
app.post('/api/pedidos', (req, res) => {
    const { items, total } = req.body;
    console.log('📦 Pedido recebido:', { items, total });
    res.json({ success: true, message: "Pedido registrado com sucesso!" });
});

app.post('/api/pagamento', (req, res) => {
    const { metodo, endereco, total } = req.body;
    console.log('💳 Pagamento:', { metodo, endereco, total });
    res.json({ success: true, message: "Pagamento aprovado com sucesso!" });
});

// ========== SERVIR PÁGINAS HTML ==========
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cadastro.html'));
});

app.get('/pagamento', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pagamento.html'));
});

// ========== INICIAR SERVIDOR ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════╗
║     🚀 BIODIGESTOR ZENERA - SERVIDOR INICIADO       ║
╠══════════════════════════════════════════════════════╣
║  📡 Servidor: http://localhost:${PORT}                ║
║  💾 Banco de dados: PostgreSQL (biodigestor_bd)      ║
║  ✅ Status: Online e funcionando!                    ║
╚══════════════════════════════════════════════════════╝
  `);
});