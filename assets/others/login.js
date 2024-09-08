// Função para conectar ao WebSocket
function connectWebSocket() {
    const socket = new SockJS("/ws");
    stompClient = Stomp.over(socket);

    stompClient.connect({
        Authorization: `Bearer ${localStorage.getItem("Bearer Token")}`
    }, (frame) => {
        console.log('Connected: ' + frame);
        setConnected(true);

        // Inscreve-se no canal de mensagens
        stompClient.subscribe("/topic/messages", (message) => {
            const data = JSON.parse(message.body);
            let imageTag = '';

            // Verifica se há uma imagem e cria uma tag <img>
            if (data.image) {
                imageTag = `<img src="${data.image}" alt="User Image" width="100">`;
            }

            $("#tbody").append(`<tr><td>${data.message}</td><td>${data.from}</td><td>${imageTag}</td></tr>`);
        });
    }, (error) => {
        console.error('Error during WebSocket connection:', error);
    });
}

// Função para controlar a conexão visualmente
function setConnected(connected) {
    if (connected) {
        $("#connect").text("Connected").attr("disabled", true);
        $("#send").attr("disabled", false);
    }
}

// Função de login que também conecta ao WebSocket
function loginAndConnect() {

    // Atualiza os valores do usuário e senha
    var username = document.querySelector('#username').value;
    var password = document.querySelector('#password').value;

    // Cria um objeto com os dados de login
    var data = {
        userName: username,
        password: password,
    };

    // Envia a requisição de login
    fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(response => {
        if (!response.ok) {
            throw new Error('Login failed.');
        }
        return response.json();
    }).then(data => {
        // Armazena o token e o nome de usuário
        localStorage.setItem('Bearer Token', data.token);
        localStorage.setItem("username", username);

        // Redireciona para a página de chat
        window.location.href = 'chat.html';

        // Conecta automaticamente ao WebSocket após o login
        connectWebSocket();
    }).catch(err => {
        alert("Invalid username or password");
    });
}
