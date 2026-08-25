const CONFIG = {
    API_KEY: "sk-fish-jG2BgeM95T3GWZv2_rs9DxTBbbQ27QV1UwMjM5YUcIs"
    MODEL_ID: "5899eeffecac441d9c5072436785e472" // Model ID Verity milikmu
};

document.addEventListener("DOMContentLoaded", () => {
    if (CONFIG.API_KEY) {
        document.getElementById('apiKeyInput').value = CONFIG.API_KEY;
    }
    if (CONFIG.MODEL_ID) {
        document.getElementById('voiceIdInput').value = CONFIG.MODEL_ID;
    }
});

// Logika Jawaban Karakter Verity
function generateVerityResponse(input) {
    const q = input.toLowerCase();
    
    if (q.includes("siapa") || q.includes("who")) {
        return "I am Verity! I am your personal helper bot. I was created to assist you in this world... forever!";
    } else if (q.includes("halo") || q.includes("hi") || q.includes("hello") || q.includes("hai")) {
        return "Greetings, my friend! What calculation or question do you need help with today?";
    } else if (q.includes("takut") || q.includes("scary") || q.includes("hantu") || q.includes("monster")) {
        return "There is nothing to be afraid of... as long as you keep talking to me. I am always watching over you.";
    } else if (q.includes("keluar") || q.includes("exit") || q.includes("pergi")) {
        return "Why would you want to leave? I have so many answers for you. Stay with me!";
    } else if (q.match(/\d+[\+\-\*\/]\d+/)) {
        try {
            const res = eval(q.match(/\d+[\+\-\*\/]\d+/)[0]);
            return `That is simple! The answer is ${res}. See? I know everything!`;
        } catch(e) {}
    }
    
    const fallbackReplies = [
        `You asked about "${input}". I have computed it, but are you sure you want to know the truth?`,
        `Interesting question! I am reading the data right now... Everything is clear to me!`,
        `I am your helper, and I will always be here to answer: ${input}!`,
        `Don't look behind you, just focus on my text. I am Verity, and I am here for you!`
    ];
    return fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
}

async function sendMessage() {
    const input = document.getElementById('userInput');
    const text = input.value.trim();
    const apiKey = document.getElementById('apiKeyInput').value.trim() || CONFIG.API_KEY;
    const referenceId = document.getElementById('voiceIdInput').value.trim() || CONFIG.MODEL_ID;

    if (!text) return;

    appendMessage(text, 'user');
    input.value = '';

    const verityReply = generateVerityResponse(text);
    
    setTimeout(() => {
        appendMessage(verityReply, 'verity');
        speakResponse(verityReply, apiKey, referenceId);
    }, 300);
}

async function speakResponse(text, apiKey, referenceId) {
    const avatar = document.getElementById('avatar');
    const statusText = document.getElementById('status-text');

    // 1. Opsi Fish Audio (Panggil via Proxy agar tidak kena blokir CORS Android)
    if (apiKey && referenceId) {
        statusText.innerText = "Status: Mengambil Suara (Fish Audio)...";
        try {
            const response = await fetch("https://corsproxy.io/?" + encodeURIComponent("https://api.fish.audio/v1/tts"), {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                    // Header "model" sengaja dibuang karena bikin error CORS Preflight di browser HP!
                },
                body: JSON.stringify({
                    text: text,
                    reference_id: referenceId, // Menggunakan Model ID Verity milikmu
                    format: "mp3"
                })
            });

            if (!response.ok) throw new Error(`API Error ${response.status}`);

            const blob = await response.blob();
            const audio = new Audio(URL.createObjectURL(blob));
            
            avatar.classList.add('speaking');
            statusText.innerText = "Status: Berbicara (Fish Audio)";
            
            audio.play();
            audio.onended = () => {
                avatar.classList.remove('speaking');
                statusText.innerText = "Status: Standby";
            };
            return;
        } catch (err) {
            console.warn("Fish Audio error, beralih ke Native Voice:", err);
        }
    }

    // 2. Fallback ke Suara Browser jika API Key Kosong / Error
    if ('speechSynthesis' in window) {
        statusText.innerText = "Status: Berbicara (Browser Voice)...";
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.pitch = 1.2;
        utterance.rate = 0.95;

        utterance.onstart = () => avatar.classList.add('speaking');
        utterance.onend = () => {
            avatar.classList.remove('speaking');
            statusText.innerText = "Status: Standby";
        };

        window.speechSynthesis.speak(utterance);
    } else {
        statusText.innerText = "Status: Browser tidak mendukung suara";
    }
}

function appendMessage(text, sender) {
    const chatBox = document.getElementById('chatBox');
    const div = document.createElement('div');
    div.className = `msg ${sender}`;
    div.innerText = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
                                }
          
