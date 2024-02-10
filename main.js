document.addEventListener("DOMContentLoaded", function() {
    // Create and append style for voice chat interface
    var style = document.createElement('style');
    style.innerHTML = `
        html, body {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #f0f0f0;
        }
        .card {
            position: fixed;
            right: -300px; /* Start off-screen */
            width: 300px;
            height: 600px;
            background-color: white;
            background-image: url('https://i.ibb.co/kJSbC5z/glass.png'); /* Replace with your image path */
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            border-radius: 30px;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            transition: right 0.5s;
        }
        .card.open {
            right: 0; /* Slide in */
        }
        .callText, .phoneText {
            position: absolute;
            width: 80%;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 15px;
            text-align: center;
            font-size: 1.5em;
            color: rgb(0, 47, 255);
            padding: 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .phoneText {
            top: 10px;
        }
        .callText {
            bottom: 10px;
        }
        .startStopButton {
            font-size: 2em;
            padding: 15px;
            width: 75px;
            height: 75px;
            border-radius: 50%;
            background: green;
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .icon-container {
            position: fixed;
            left: 10px;
            bottom: 10px;
            cursor: pointer;
            z-index: 9999; /* Ensure the icon is on top */
        }
        .icon {
            width: 50px;
            height: 50px;
            display: none; /* Initially hide the icons */
        }
        .icon-dropdown {
            display: none;
            position: absolute;
            top: 60px;
            left: 0;
            background-color: white;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
            z-index: 9999;
        }
        .icon-container:hover .icon-dropdown {
            display: block;
        }
        .icon-option {
            padding: 10px;
            cursor: pointer;
        }
        .icon-option:hover {
            background-color: #f0f0f0;
        }
        @media (max-width: 500px) {
            .startStopButton {
                font-size: 1.5em;
                width: 60px;
                height: 60px;
            }
            .card {
                width: 90%;
                height: 90%;
            }
            .phoneText {
                font-size: 1em; /* Adjust font size for smaller devices */
            }
        }
    `;
    document.head.appendChild(style);

    // Create and append the voice chat card
    var card = document.createElement('div');
    card.id = 'card';
    card.className = 'card';
    document.body.appendChild(card);

    // Create and append startStopButton for voice chat
    var startStopButton = document.createElement('button');
    startStopButton.id = 'startStopButton';
    startStopButton.className = 'startStopButton';
    startStopButton.textContent = 'Call';
    card.appendChild(startStopButton);

    // Create and append callText for voice chat
    var callText = document.createElement('div');
    callText.id = 'callText';
    callText.className = 'callText';
    callText.textContent = 'Start Call';
    card.appendChild(callText);

    // Icon container for dropdown menu
    var iconContainer = document.createElement('div');
    iconContainer.className = 'icon-container';
    document.body.appendChild(iconContainer);

    // Create and append voice chat icon
    var voiceIcon = document.createElement('img');
    voiceIcon.src = 'https://i.ibb.co/x2Znbr6/free-chat-2639493-2187526.png'; // Replace with your icon path
    voiceIcon.className = 'icon';
    iconContainer.appendChild(voiceIcon);

    // Dropdown menu for icon
    var iconDropdown = document.createElement('div');
    iconDropdown.className = 'icon-dropdown';
    iconContainer.appendChild(iconDropdown);

    // Create and append options for dropdown menu
    var voiceBotOption = document.createElement('div');
    voiceBotOption.className = 'icon-option';
    voiceBotOption.textContent = 'Voice Bot';
    iconDropdown.appendChild(voiceBotOption);

    var chatBotOption = document.createElement('div');
    chatBotOption.className = 'icon-option';
    chatBotOption.textContent = 'Chat Bot';
    iconDropdown.appendChild(chatBotOption);

    // Icon click event to open the voice chat card and show options
    voiceIcon.addEventListener('click', function() {
    card.classList.toggle('open');
    toggleIconDropdown(); // Call the function to toggle the dropdown menu
});

    // Function to toggle the dropdown menu for icon options
    function toggleIconDropdown() {
    iconDropdown.style.display = iconDropdown.style.display === 'none' ? 'block' : 'none';
    }

    // Event listener to toggle the dropdown menu when clicking on the icon container
    iconContainer.addEventListener('click', toggleIconDropdown);

    // Speech Recognition Logic for voice chat
    let initialized = false;
    let started = false;
    let voiceSession = null; // Renamed session to avoid conflict
    let sending_message = false;

    try {
        var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition || null;
    } catch(e) {
        document.querySelector("#startStopButton").textContent = "Sorry, your browser doesn't support speech recognition :(";
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    const send_message = async (message) => {
        if (sending_message) {
            return false;
        }

        sending_message = true;

        const response = await fetch("https://simplified-assistant.onrender.com/voice", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "message": message,
                "session": voiceSession // Updated to voiceSession
            })
        });

        const json = await response.json();
        voiceSession = json.session;
        const duration = json.duration - 300;
        const audio_uri = "data:audio/wav;base64," + json.audio;

        const audio = new Audio(audio_uri);
        setTimeout(() => {
            sending_message = false;
            if (started) {
                recognition.start();
            }
        }, duration);

        audio.play();
    }

    const toggleStartStop = () => {
        if (!started) {
            start();
        } else {
            stop();
        }
    };

    const start = () => {
        started = true;
        recognition.start();
        
        const button = document.querySelector("#startStopButton");
        button.style.background = 'red';
        button.textContent = "End";

        if (!initialized) {
            initialized = true;

            recognition.onresult = function (event) {
                const message = event.results[0][0].transcript;
                send_message(message);
            };

            recognition.onspeechend = function () {
                recognition.stop();
            };

            recognition.onerror = function (event) {
                console.error(event.error);
            };
        }
    };

    const stop = () => {
        recognition.stop();
        
        const button = document.querySelector("#startStopButton");
        button.style.background = 'green';
        button.textContent = "Call";

        started = false;
    }

    // Now bind the toggle function to the click event of the startStopButton
    startStopButton.addEventListener('click', toggleStartStop);

    // Function to add styles for text chat interface
    const addStyles = () => {
        const style = document.createElement('style');
        document.head.appendChild(style);
        style.textContent = `
            body, html { height: 100%; margin: 0; font-family: Arial, sans-serif; }
            .chat-container { 
                position: fixed; 
                bottom: 10px; 
                right: 10px; 
                width: 300px; 
                max-height: 80%; 
                overflow-y: auto; 
                border: 1px solid #ccc; 
                background: #FFF; 
                border-radius: 10px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.2); 
                display: none; 
                flex-direction: column; 
            }
            .chat-header { 
                background: #4e8cff; 
                color: white; 
                padding: 10px; 
                border-top-left-radius: 10px; 
                border-top-right-radius: 10px; 
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                font-size: 0.9em; 
            }
            .chat-messages { 
                flex-grow: 1; 
                padding: 10px; 
                background: #f4f7f6; 
                overflow-y: auto; 
            }
            .message { 
                border-radius: 20px; 
                padding: 10px; 
                margin: 10px; 
                color: white; 
                max-width: 80%; 
            }
            .human { background: #007bff; align-self: flex-end; }
            .bot { background: #0f4d92; align-self: flex-start; }
            .input-container { 
                padding: 10px; 
                background: white; 
                border-bottom-left-radius: 10px; 
                border-bottom-right-radius: 10px; 
                display: flex; 
            }
            .chat-input { 
                flex-grow: 1; 
                border-radius: 15px; 
                border: 1px solid #ccc; 
                padding: 10px; 
                margin-right: 10px; 
            }
            .send-button { 
                background: #4e8cff; 
                color: white; 
                border: none; 
                border-radius: 15px; 
                padding: 10px 15px; 
                cursor: pointer; 
            }
            .minimize { 
                background: transparent; 
                border: none; 
                color: white; 
                font-size: 1.2em; 
                cursor: pointer; 
            }
            .chat-icon {
                position: fixed;
                bottom: 10px;
                right: 10px;
                width: 50px;
                height: 50px;
                background-image: url('https://i.ibb.co/x2Znbr6/free-chat-2639493-2187526.png'); /* Replace with the path to your ChatGPT icon */
                background-size: cover;
                cursor: pointer;
                z-index: 9999; /* Ensure the icon is on top */
            }
        `;
    }

    let session = null;

    // Function to create message element for text chat
    function createMessageElement(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        messageDiv.textContent = text;
        return messageDiv;
    }

    // Function to add message to text chat interface
    function addMessage(text, sender) {
        const chatMessages = document.querySelector('.chat-messages');
        const messageElement = createMessageElement(text, sender);
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the latest message
    }

    // Function to send message for text chat
    async function sendMessage() {
        const input = document.querySelector('.chat-input');
        const text = input.value.trim();

        if (text) {
            addMessage(text, 'human');
            
            const response = await fetch("https://simplified-assistant.onrender.com/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "message": text,
                    "session": session
                })
            });

            const jsonResponse = await response.json(); // Use a different variable name here
            session = jsonResponse.session;
            const botResponse = jsonResponse.response; // Store the response text in a separate variable
            
            input.value = '';
            setTimeout(() => addMessage(botResponse, 'bot'), 500); // Use the separate variable for the bot's message
        }
    }

    // Function to toggle text chat interface
    function toggleChat() {
        const chatContainer = document.querySelector('.chat-container');
        chatContainer.style.display = chatContainer.style.display === 'none' ? 'flex' : 'none';
    }

    // Function to build text chat interface
    function buildChatInterface() {
        addStyles();

        const chatIcon = document.createElement('div');
        chatIcon.classList.add('chat-icon');
        chatIcon.addEventListener('click', toggleChat);
        document.body.appendChild(chatIcon);

        const chatContainer = document.createElement('div');
        chatContainer.classList.add('chat-container');
        document.body.appendChild(chatContainer);

        const chatHeader = document.createElement('div');
        chatHeader.classList.add('chat-header');
        chatHeader.innerHTML = `
            <span>Chat with Jessica Cowles</span>
            <button class="minimize">_</button>
        `;
        chatHeader.querySelector('.minimize').addEventListener('click', toggleChat);
        chatContainer.appendChild(chatHeader);

        const chatMessages = document.createElement('div');
        chatMessages.classList.add('chat-messages');
        chatContainer.appendChild(chatMessages);

        const inputContainer = document.createElement('div');
        inputContainer.classList.add('input-container');
        chatContainer.appendChild(inputContainer);

        const chatInput = document.createElement('input');
        chatInput.classList.add('chat-input');
        chatInput.type = 'text';
        chatInput.placeholder = 'Type a message...';
        chatInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        inputContainer.appendChild(chatInput);

        const sendButton = document.createElement('button');
        sendButton.classList.add('send-button');
        sendButton.textContent = 'Send';
        sendButton.addEventListener('click', sendMessage);
        inputContainer.appendChild(sendButton);
    }

    // Build the text chat interface
    buildChatInterface();
});
        
