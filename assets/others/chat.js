// Manipulador de envio do formulário de mensagens
$("#send-form").submit((e) => {
    e.preventDefault();

    const fileInput = document.querySelector('#fileInput').files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const base64Image = event.target.result;  // Imagem convertida em Base64

        // Envia mensagem com a imagem em Base64
        stompClient.send("/app/chat", {}, JSON.stringify({
            message: $("#message").val(),  // Mensagem de texto
            from: localStorage.getItem("username"),  // Nome do remetente
            image: base64Image  // Imagem em Base64
        }));
    };

    // Se um arquivo for selecionado, ele será convertido em Base64
    if (fileInput) {
        reader.readAsDataURL(fileInput);
    } else {
        // Se não houver imagem, envie apenas a mensagem de texto
        stompClient.send("/app/chat", {}, JSON.stringify({
            to: $("#login").val(),
            message: $("#message").val(),
            from: localStorage.getItem("username")
        }));
    }
});
