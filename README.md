============================================================================
============================================================================

SayWay Web Site e App:

instale e extraia o arquivo zip
tenha o node instalado no PC e o PostgreSQL
instale vite : install vite@latest

============================================================================
============================================================================

Banco de dados Atual: 



CREATE DATABASE fasttrack_db;

\c fasttrack_db;

-- ========== USUÁRIOS ==========
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    tipo VARCHAR(20) DEFAULT 'cliente',
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_login TIMESTAMP
);

-- ========== EMPRESAS ==========
CREATE TABLE empresas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    nome VARCHAR(100) NOT NULL,
    endereco TEXT,
    telefone VARCHAR(20),
    categoria VARCHAR(50),
    descricao TEXT,
    logo VARCHAR(255),
    horario_abertura TIME,
    horario_fechamento TIME,
    ativo BOOLEAN DEFAULT TRUE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== CATEGORIAS ==========
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    nome VARCHAR(50) NOT NULL,
    descricao TEXT,
    ordem INTEGER DEFAULT 0
);

-- ========== PRODUTOS ==========
CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    categoria_id INTEGER REFERENCES categorias(id),
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    imagem VARCHAR(255),
    estoque INTEGER DEFAULT 0,
    disponivel BOOLEAN DEFAULT TRUE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== PEDIDOS ==========
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES usuarios(id),
    empresa_id INTEGER REFERENCES empresas(id),
    entregador_id INTEGER REFERENCES usuarios(id),
    status VARCHAR(30) DEFAULT 'recebido',
    total DECIMAL(10,2) NOT NULL,
    codigo_rastreamento VARCHAR(20) UNIQUE,
    endereco_entrega TEXT NOT NULL,
    observacoes TEXT,
    taxa_entrega DECIMAL(10,2) DEFAULT 0,
    forma_pagamento VARCHAR(30),
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_preparo TIMESTAMP,
    data_pronto TIMESTAMP,
    data_saida TIMESTAMP,
    data_entrega TIMESTAMP
);

-- ========== ITENS DO PEDIDO ==========
CREATE TABLE pedido_itens (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id),
    produto_id INTEGER REFERENCES produtos(id),
    quantidade INTEGER NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    observacoes TEXT
);

-- ========== AVALIAÇÕES ==========
CREATE TABLE avaliacoes (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id),
    cliente_id INTEGER REFERENCES usuarios(id),
    empresa_id INTEGER REFERENCES empresas(id),
    nota INTEGER CHECK (nota >= 1 AND nota <= 5),
    comentario TEXT,
    data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== LOCALIZAÇÃO ENTREGADOR ==========
CREATE TABLE entregador_localizacao (
    id SERIAL PRIMARY KEY,
    entregador_id INTEGER REFERENCES usuarios(id),
    pedido_id INTEGER REFERENCES pedidos(id),
    latitude DECIMAL(10,8),
    longitude DECIMAL(10,8),
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== DADOS DE TESTE ==========
-- Criar uma empresa de teste
INSERT INTO usuarios (nome, email, senha, telefone, tipo) 
VALUES ('Burger King', 'burger@fasttrack.com', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cZx3QyX5WZxYxWxYxWxYxWxYxW', '(11) 99999-9999', 'empresa');

INSERT INTO empresas (usuario_id, nome, endereco, telefone, categoria, descricao) 
VALUES (1, 'Burger King', 'Av. Paulista, 1000', '(11) 99999-9999', 'Hambúrguer', 'O melhor hambúrguer da cidade');

-- Criar um cliente de teste
INSERT INTO usuarios (nome, email, senha, telefone, tipo) 
VALUES ('João Silva', 'joao@email.com', '$2b$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cZx3QyX5WZxYxWxYxWxYxWxYxW', '(11) 88888-8888', 'cliente');

-- Criar produtos de teste
INSERT INTO categorias (empresa_id, nome) VALUES (1, 'Hambúrgueres');
INSERT INTO categorias (empresa_id, nome) VALUES (1, 'Bebidas');
INSERT INTO categorias (empresa_id, nome) VALUES (1, 'Acompanhamentos');

INSERT INTO produtos (empresa_id, categoria_id, nome, descricao, preco, estoque) 
VALUES (1, 1, 'Whopper', 'Hambúrguer com carne grelhada', 29.90, 50);

INSERT INTO produtos (empresa_id, categoria_id, nome, descricao, preco, estoque) 
VALUES (1, 1, 'Double Whopper', 'Hambúrguer com duas carnes', 39.90, 40);

INSERT INTO produtos (empresa_id, categoria_id, nome, descricao, preco, estoque) 
VALUES (1, 2, 'Coca-Cola 500ml', 'Refrigerante gelado', 8.90, 100);

INSERT INTO produtos (empresa_id, categoria_id, nome, descricao, preco, estoque) 
VALUES (1, 3, 'Batata Frita', 'Batata crocante', 12.90, 60);
 
============================================================================
============================================================================
