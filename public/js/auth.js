// Alternar entre abas Login e Cadastro
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        document.getElementById(`${tab}-form`).classList.add('active');
    });
});

// LOGIN
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            window.location.href = '/';
        } else {
            alert('Email ou senha incorretos');
        }
    } catch (error) {
        alert('Erro ao fazer login. Tente novamente.');
    }
});

// CADASTRO
document.getElementById('cadastro-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nome = document.getElementById('cadastro-nome').value;
    const email = document.getElementById('cadastro-email').value;
    const telefone = document.getElementById('cadastro-telefone').value;
    const senha = document.getElementById('cadastro-senha').value;
    const confirmar = document.getElementById('cadastro-confirmar').value;
    
    if (senha !== confirmar) {
        alert('As senhas não coincidem!');
        return;
    }
    
    try {
        const response = await fetch('/api/cadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha, telefone })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            window.location.href = '/';
        } else {
            alert(data.message || 'Erro ao cadastrar');
        }
    } catch (error) {
        alert('Erro ao cadastrar. Tente novamente.');
    }
});

// Verificar se já está logado
async function verificarSessao() {
    try {
        const response = await fetch('/api/sessao');
        const data = await response.json();
        
        if (data.logado) {
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
        }
    } catch (error) {
        console.log('Erro ao verificar sessão');
    }
}

verificarSessao();