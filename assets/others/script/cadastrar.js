async function cadastrar(event) {

    let route = async (req, data) => {
        return await fetch(`http://localhost:8080/${req}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    };

    // Previne o comportamento padrão do formulário
    event.preventDefault();

    // Captura os valores dos campos de entrada
    var userName = document.querySelector('#username').value;
    var password = document.querySelector('#password').value;

    // Cria um objeto com os dados de login
    var data = {
        login: userName,
        password: password
    };

    try {
        let response = route("users", data);

        // Verifica se a resposta não é bem-sucedida
        if (!response.ok) {
            throw new Error('Sign in failed.');
        } else {
            response = route("users/login", data);
        }

        // Processa a resposta JSON
        let result = await response.json();

        // Armazena o token JWT localmente
        localStorage.setItem('Bearer Token', result.token);

        // Redireciona após o login bem-sucedido
        window.location.href = '../../index.html';
    } catch (error) {
        // Exibe uma mensagem de erro na interface
        document.getElementById('error-message').innerText = 'Login failed. Please check your credentials.';
        console.error('Login error:', error);
    }
}

// Adiciona um event listener para o evento 'submit' do formulário de login
document.querySelector('#login-form').addEventListener('submit', cadastrar);
