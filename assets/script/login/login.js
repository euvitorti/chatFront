// Obtém o formulário de login pelo seu ID
const loginForm = document.getElementById('login-form');

// Função assíncrona que lida com o envio do formulário
const submitForm = async (event) => {
    // Previne o comportamento padrão do formulário
    event.preventDefault();

    // Cria um objeto de dados com o nome de usuário e a senha
    const data = {
        userName: loginForm.username.value,
        password: loginForm.password.value
    };

    try {
        // Envia uma solicitação POST para a URL de login
        const response = await fetch('http://localhost:8080/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data) // Converte o objeto de dados para uma string JSON
        });

        // Verifica se a resposta não foi bem-sucedida
        if (!response.ok) throw new Error('Login failed.');

        // Converte a resposta em JSON
        const result = await response.json();
        // Armazena o token e o nome de usuário no localStorage
        localStorage.setItem('Bearer Token', result.token);
        localStorage.setItem('username', data.userName);

        // Redireciona para a página de chat após um breve atraso
        setTimeout(() => window.location.href = '../chat/chat.html', 500);
    } catch (error) {
        // Exibe um alerta em caso de erro
        alert("Invalid username or password");
    }
};

// Adiciona um ouvinte de evento ao formulário para lidar com o envio
loginForm.addEventListener('submit', submitForm);
