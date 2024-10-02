let stompClient; // Variável para armazenar a conexão com o servidor via WebSocket

// Função para selecionar um elemento do DOM com base no seletor passado
function select(selector) {
    return document.querySelector(selector);
}

// Função para exibir uma mensagem de alerta ao usuário
function showAlert(message) {
    alert(message);
}

// Função para criar um elemento de mensagem para exibir no chat
function createMessageElement(data, username) {
    const messageDiv = document.createElement('div');
    // Define a classe CSS com base no remetente da mensagem (se é o usuário ou outra pessoa)
    messageDiv.className = `message ${data.from === username ? 'message-sent' : 'message-received'}`;

    // Se houver uma imagem anexada à mensagem, insere a tag <img>
    const imageTag = data.image ? `<img src="${data.image}" alt="User Image" width="500">` : '';
    // Monta o conteúdo da mensagem (imagem, texto, e timestamp)
    messageDiv.innerHTML = `${imageTag} ${data.message || ''} <div class="message-timestamp">${new Date().toLocaleTimeString()}</div>`;

    return messageDiv; // Retorna o elemento de mensagem criado
}

// Função para conectar ao WebSocket e inicializar o cliente STOMP
function connect() {
    const token = localStorage.getItem('Bearer Token'); // Obtém o token de autenticação armazenado localmente
    const username = localStorage.getItem('username'); // Obtém o nome de usuário

    // Se o token ou o nome de usuário não estiverem presentes, redireciona para a página de login
    if (!token || !username) {
        window.location.href = '../login/login.html';
        return;
    }

    const socket = new SockJS('http://localhost:8080/ws'); // Inicializa a conexão WebSocket
    stompClient = Stomp.over(socket);  // Cria o cliente STOMP sobre o WebSocket

    // Conecta ao servidor STOMP com o token de autenticação
    stompClient.connect({ Authorization: `Bearer ${token}` }, (frame) => {
        console.log('Connected: ' + frame); // Exibe no console a confirmação de conexão
        select("#send").disabled = false; // Habilita o botão de envio de mensagens

        // Inscreve-se no tópico para receber mensagens em tempo real
        stompClient.subscribe('/topic/messages', (message) => {
            const data = JSON.parse(message.body); // Converte a mensagem recebida de JSON para objeto
            const messageElement = createMessageElement(data, username); // Cria o elemento de mensagem
            select("#messages").appendChild(messageElement); // Adiciona a mensagem ao DOM
            // Rola para o fim da lista de mensagens automaticamente
            select("#messages").scrollTop = select("#messages").scrollHeight;
        });

        // Envia uma mensagem para adicionar o usuário ao chat
        stompClient.send('/app/chat.addUser', {}, JSON.stringify({ username }));
    }, (error) => {
        console.error('Connection error: ' + error); // Exibe no console o erro de conexão
        showAlert('Unable to connect. Please try again.'); // Alerta o usuário sobre o erro
    });
}

// Função para redimensionar uma imagem antes de enviá-la
function resizeImage(file, callback) {
    const img = new Image(); // Cria um novo objeto de imagem
    const reader = new FileReader(); // Cria um leitor de arquivos

    // Quando o arquivo for carregado, define o src da imagem
    reader.onload = function (e) {
        img.src = e.target.result;
    };

    // Quando a imagem estiver pronta, redimensiona-a
    img.onload = function () {
        const canvas = document.createElement('canvas'); // Cria um canvas para redimensionamento
        const ctx = canvas.getContext('2d'); // Obtém o contexto 2D do canvas

        const maxWidth = 500; // Define a largura máxima
        const maxHeight = 500; // Define a altura máxima
        let width = img.width;
        let height = img.height;

        // Calcula a nova largura e altura com base nas proporções
        if (width > height) {
            if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
            }
        } else {
            if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
            }
        }

        // Define as dimensões do canvas e desenha a imagem redimensionada
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Chama o callback com a imagem em formato base64
        callback(canvas.toDataURL('image/jpeg')); // Ajuste o formato conforme necessário
    };

    reader.readAsDataURL(file); // Lê o arquivo de imagem como URL base64
}

// Quando o documento estiver carregado, executa o código abaixo
document.addEventListener('DOMContentLoaded', function () {
    connect(); // Conecta ao WebSocket

    // Adiciona um evento de clique para o ícone de anexar arquivo
    select("#attach-file-icon").addEventListener("click", function () {
        select("#fileInput").click(); // Simula um clique no input de arquivo
    });

    // Adiciona um evento de envio para o formulário de mensagens
    select("#send-form").addEventListener("submit", (e) => {
        e.preventDefault(); // Impede o comportamento padrão do formulário (recarregar a página)

        const messageValue = select("#message").value.trim(); // Obtém o valor da mensagem
        const fileInput = select('#fileInput').files[0]; // Obtém o arquivo selecionado
        const username = localStorage.getItem('username'); // Obtém o nome de usuário

        // Se não houver mensagem nem arquivo, exibe um alerta
        if (!messageValue && !fileInput) {
            showAlert("Por favor, digite uma mensagem ou envie um arquivo.");
            return;
        }

        // Se houver um arquivo selecionado, redimensiona a imagem e envia
        if (fileInput) {
            resizeImage(fileInput, (base64Image) => {
                stompClient.send('/app/chat', {}, JSON.stringify({
                    to: username,
                    message: '', // Limpa a mensagem se a imagem for enviada
                    from: username,
                    image: base64Image // Envia a imagem em base64
                }));
            });
        } else {
            // Se não houver arquivo, envia apenas a mensagem de texto
            stompClient.send('/app/chat', {}, JSON.stringify({
                to: username,
                message: messageValue,
                from: username
            }));
        }

        // Limpa os campos de mensagem e arquivo
        select("#message").value = '';
        select("#fileInput").value = '';
    });
});
