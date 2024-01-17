document.addEventListener("DOMContentLoaded", function() {
    // Create and append style
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
        .icon {
            position: fixed;
            left: 10px;
            bottom: 10px;
            cursor: pointer;
            widht: 50px;
            height: 50px;
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

    // Create and append the card
    var card = document.createElement('div');
    card.id = 'card';
    card.className = 'card';
    document.body.appendChild(card);

    // Create and append icon
    var icon = document.createElement('img');
    icon.src = 'https://i.ibb.co/x2Znbr6/free-chat-2639493-2187526.png'; // Replace with your icon path
    icon.className = 'icon';
    document.body.appendChild(icon);

    // Create and append phoneText
    var phoneText = document.createElement('div');
    phoneText.id = 'phoneText';
    phoneText.className = 'phoneText';
    phoneText.textContent = 'Phone';
    card.appendChild(phoneText);

    // Create and append startStopButton
    var startStopButton = document.createElement('button');
    startStopButton.id = 'startStopButton';
    startStopButton.className = 'startStopButton';
    startStopButton.textContent = 'Call';
    card.appendChild(startStopButton);

    // Create and append callText
    var callText = document.createElement('div');
    callText.id = 'callText';
    callText.className = 'callText';
    callText.textContent = 'Start Call';
    card.appendChild(callText);

    // Icon click event to open the card
    icon.addEventListener('click', function() {
        card.classList.toggle('open');
    });

    // Speech Recognition Logic
    let initialized = false;
    let started = false;
    let session = null;
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
                "session": session
            })
        });

        const json = await response.json();
        session = json.session;
        const duration = json.duration - 300;
        const audio_uri = "data:audio/wav;base64," + json.audio;

        const audio = new Audio(audio_uri);
        setTimeout(() => {
            sending_message = false;
            if (started            ) {
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

});
