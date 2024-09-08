export function getToken() {
    return localStorage.getItem('Bearer Token');
}

export function getDefaultHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': getToken().trim()
    };
}