let stopTypingFlag = false;

function sendMessage() {
    let userInput = document.getElementById("user-input").value.trim();
    if (userInput === "") return;

    let chatBody = document.getElementById("chat-body");

    // Add user message
    let userMessage = document.createElement("div");
    userMessage.classList.add("user-message");
    userMessage.textContent = userInput;
    chatBody.appendChild(userMessage);

    // Enable stop button
    let stopButton = document.getElementById("stop-button");
    stopButton.classList.add("enabled");
    stopButton.disabled = false;
    stopTypingFlag = false;

    // Send request to backend
    fetch("/chat", {
        method: "POST",
        body: JSON.stringify({ message: userInput }),
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        showBotResponse(data.reply);
    });

    // Clear input field
    document.getElementById("user-input").value = "";
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Show bot response with typing effect
function showBotResponse(response) {
    let chatBody = document.getElementById("chat-body");

    let botMessage = document.createElement("div");
    botMessage.classList.add("bot-message");
    chatBody.appendChild(botMessage);

    let i = 0;
    function typeWriter() {
        if (stopTypingFlag) {
            botMessage.innerHTML += " [Stopped]";
            return;
        }
        if (i < response.length) {
            botMessage.innerHTML += response.charAt(i);
            i++;
            setTimeout(typeWriter, 20); // Adjust speed here
        } else {
            // Disable stop button after response is completed
            let stopButton = document.getElementById("stop-button");
            stopButton.classList.remove("enabled");
            stopButton.disabled = true;
        }
    }
    typeWriter();
    
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Stop button functionality
function stopTyping() {
    stopTypingFlag = true;
    let stopButton = document.getElementById("stop-button");
    stopButton.classList.remove("enabled");
    stopButton.disabled = true;
}

// Allow sending message with "Enter" key
function handleKeyPress(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}
