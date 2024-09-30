const loginForm = document.getElementById('login-form');

const submitForm = async (event) => {
    event.preventDefault();

    const data = {
        userName: loginForm.username.value,
        password: loginForm.password.value
    };

    try {
        const response = await fetch('http://localhost:8080/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('Login failed.');

        const result = await response.json();
        localStorage.setItem('Bearer Token', result.token);
        localStorage.setItem('username', data.userName);

        // Redirecionamento após salvar o token
        setTimeout(() => window.location.href = '../chat/chat.html', 500);
    } catch (error) {
        alert("Invalid username or password");
    }
};

loginForm.addEventListener('submit', submitForm);
