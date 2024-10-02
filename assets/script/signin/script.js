// Função que lida com o evento de login
function login(event) {
    // Previne o comportamento padrão do formulário
    event.preventDefault();

    // Captura os valores dos campos de entrada para nome de usuário e senha
    var username = document.querySelector('#username').value;
    var password = document.querySelector('#password').value;

    // Cria um objeto com os dados de login
    var data = {
        userName: username,
        password: password
    };

    // Envia uma requisição POST para '/users' com os dados em formato JSON
    fetch('http://localhost:8080/users', {
        method: 'POST', // Método da requisição
        headers: {
            'Content-Type': 'application/json' // Define o tipo de conteúdo como JSON
        },
        body: JSON.stringify(data) // Converte o objeto de dados para uma string JSON
    })
    .then(response => {
        // Verifica se a resposta não foi bem-sucedida
        if (!response.ok) {
            throw new Error('Login failed.'); // Lança um erro se o login falhar
        }
        return response.json(); // Converte a resposta em JSON se for bem-sucedida
    })
    .then(data => {
        // Armazena o token JWT localmente
        localStorage.setItem('Bearer Token', data.token);
        // Redireciona para a página de login após o cadastro bem-sucedido
        window.location.href = '../login/login.html';
    })
    .catch(error => {
        // Exibe uma mensagem de erro se ocorrer algum problema
        document.getElementById('error-message').innerText = 'Login failed. Please check your credentials.';
        console.error('Login error:', error); // Registra o erro no console
    });
}

// Adiciona um event listener para o evento 'submit' do formulário de login
document.querySelector('#login-form').addEventListener('submit', login);
