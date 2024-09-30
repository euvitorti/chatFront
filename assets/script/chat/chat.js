let stompClient;

function select(selector) {
    return document.querySelector(selector);
}

function showAlert(message) {
    alert(message);
}

function createMessageElement(data, username) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${data.from === username ? 'message-sent' : 'message-received'}`;

    const imageTag = data.image ? `<img src="${data.image}" alt="User Image" width="100">` : '';
    messageDiv.innerHTML = `${imageTag} ${data.message} <div class="message-timestamp">${new Date().toLocaleTimeString()}</div>`;

    return messageDiv;
}

function connect() {
    const token = localStorage.getItem('Bearer Token');
    const username = localStorage.getItem('username');

    if (!token || !username) {
        window.location.href = '../login/login.html';
        return;
    }

    const socket = new SockJS('http://localhost:8080/ws');
    stompClient = Stomp.over(socket);  // Atribuir a conexão ao stompClient

    stompClient.connect({ Authorization: `Bearer ${token}` }, (frame) => {
        console.log('Connected: ' + frame);
        select("#send").disabled = false;

        stompClient.subscribe('/topic/messages', (message) => {
            const data = JSON.parse(message.body);
            const messageElement = createMessageElement(data, username);
            select("#messages").appendChild(messageElement);
            select("#messages").scrollTop = select("#messages").scrollHeight;
        });

        stompClient.send('/app/chat.addUser', {}, JSON.stringify({ username }));
    }, (error) => {
        console.error('Connection error: ' + error);
        showAlert('Unable to connect. Please try again.');
    });
}

document.addEventListener('DOMContentLoaded', function () {
    connect();

    select("#attach-file-icon").addEventListener("click", function () {
        select("#fileInput").click();
    });

    select("#send-form").addEventListener("submit", (e) => {
        e.preventDefault();

        const messageValue = select("#message").value.trim();
        if (!messageValue) {
            showAlert("Por favor, digite uma mensagem.");
            return;
        }

        const fileInput = select('#fileInput').files[0];
        const reader = new FileReader();

        reader.onload = function (event) {
            const base64Image = event.target.result;

            stompClient.send('/app/chat', {}, JSON.stringify({
                to: localStorage.getItem('username'),
                message: messageValue,
                from: localStorage.getItem('username'),
                image: base64Image
            }));
        };

        if (fileInput) {
            reader.readAsDataURL(fileInput);
        } else {
            stompClient.send('/app/chat', {}, JSON.stringify({
                to: localStorage.getItem('username'),
                message: messageValue,
                from: localStorage.getItem('username')
            }));
        }

        select("#message").value = '';
        select("#fileInput").value = '';
    });
});
