# PI-2F-GRUPO-5



===================================================

Baixe e extraia a pasta zipada
Abra a pasta "Versão Final" no Visual Studio Code
No terminal do VS code, abra um Command Prompt.

instale vite:
  npm install vite@latest

espere o download completar, e execute o arquivo
de JavaScript chamado "server.js":
  node server.js

no terminal, vai ser disponibilizado um link
localhost para colocar no navegador, junto com
os emails de teste.

===================================================


BANCO DE DADOS:

# 🌱 Biodigestor Zenera

Sistema de gerenciamento para biodigestores com login, cadastro de usuários e carrinho de compras.

---

## 🧸 O que você precisa antes de começar?

- Computador com **Windows** (pode ser Linux/Mac também, mas esse tutorial é para Windows)
- Conexão com a internet

---

## 📦 Passo 1: Instalar o Node.js

O Node.js é o programa que vai rodar o servidor.

1. Baixe o Node.js no site oficial: **https://nodejs.org**
2. Escolha a versão **LTS** (é a mais estável)
3. Abra o arquivo baixado e clique em "Next" várias vezes (deixe tudo padrão)
4. No final, clique em "Install" e depois "Finish"

**Para testar se instalou certo:**
- Abra o **Prompt de Comando** (terminal)
- Digite: `node --version`
- Deve aparecer algo como `v20.x.x`

---

## 🗄️ Passo 2: Instalar o PostgreSQL (Banco de Dados)

O PostgreSQL é o "cofre" onde os dados ficam guardados.

1. Baixe o PostgreSQL em: **https://www.postgresql.org/download/windows/**
2. Clique no botão verde **"Download the installer"**
3. Escolha a versão mais recente (ex: PostgreSQL 17)
4. Abra o arquivo baixado e siga os passos:

   | Tela | O que fazer |
   |------|-------------|
   | Password | Digite **`ifc`** (anote essa senha!) |
   | Porta | Deixe **5432** (não mexa) |
   | Resto | Clique em "Next" até terminar |

5. No final, clique em **"Finish"**

---

## 🗃️ Passo 3: Criar o banco de dados

Agora vamos criar o "armário" onde os dados vão ficar.

1. Abra o **pgAdmin** (vai estar no Menu Iniciar)
2. No lado esquerdo, clique na setinha do **Servers** → **PostgreSQL 17**
3. Se pedir senha, digite **`ifc`**
4. Clique com botão direito em **Databases** → **Create** → **Database**
5. No campo **Database**, digite: `biodigestor_bd`
6. Clique em **Save**

### Criar as tabelas (as gavetas do armário)

1. Clique em **biodigestor_bd** → **Query Tool** (ou aperte Alt+Shift+Q)
2. **Cole** o código abaixo na janela branca:

```sql
-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    cpf VARCHAR(14),
    cep VARCHAR(10),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar colunas extras se não existirem
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cpf VARCHAR(14);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cep VARCHAR(10);

-- Tabela de pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    valor DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente',
    data_pagamento DATE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir usuários de exemplo
INSERT INTO usuarios (nome, email, senha) VALUES 
('João Silva', 'joao@email.com', '123456'),
('Maria Santos', 'maria@email.com', '123456')
ON CONFLICT (email) DO NOTHING;
