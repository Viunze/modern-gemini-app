// public/script.js

const chatMessages = document.getElementById('chat-messages');
const promptInput = document.getElementById('prompt-input');
const sendButton = document.getElementById('send-button');

// Awal, aktifkan tombol
sendButton.disabled = false;
promptInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
sendButton.addEventListener('click', sendMessage);

// Fungsi untuk membuat elemen pesan baru
function createMessageElement(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user-message' : 'system-message');
    messageDiv.innerHTML = text.replace(/\n/g, '<br>'); // Mengganti baris baru
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll ke pesan terbaru
    return messageDiv;
}

// Fungsi untuk menampilkan loader saat menunggu AI
function showLoader() {
    const loaderDiv = document.createElement('div');
    loaderDiv.classList.add('message', 'system-message', 'loader');
    loaderDiv.innerHTML = `
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
    `;
    chatMessages.appendChild(loaderDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return loaderDiv;
}

// Fungsi utama mengirim pesan
async function sendMessage() {
    const prompt = promptInput.value.trim();
    if (!prompt) return;

    // 1. Tampilkan pesan pengguna
    createMessageElement(prompt, true);
    promptInput.value = '';
    
    // 2. Tampilkan loader dan nonaktifkan input
    sendButton.disabled = true;
    promptInput.disabled = true;
    const loader = showLoader();

    try {
        // 3. Panggil endpoint backend
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });

        // 4. Proses respons
        const data = await response.json();

        // Hapus loader
        chatMessages.removeChild(loader);

        if (response.ok) {
            // Tampilkan respons AI
            createMessageElement(data.text);
        } else {
            // Tampilkan pesan error
            createMessageElement(`Error: ${data.error || 'Terjadi kesalahan pada server.'}`);
        }

    } catch (error) {
        console.error('Network or communication error:', error);
        chatMessages.removeChild(loader);
        createMessageElement('Error koneksi: Tidak dapat menghubungi server.');
    } finally {
        // 5. Aktifkan kembali input
        sendButton.disabled = false;
        promptInput.disabled = false;
        promptInput.focus();
    }
}
