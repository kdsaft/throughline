// Opening code
let audioContext;
let source;
let analyser;
let canvas;
let canvasContext;
let animationId;
let recognizer;
let speechConfig


if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

// When the window is resized...
window.addEventListener("resize", () => {
    updateCanvasSize();
    drawBars(canvas, canvasContext);
});

function initSpeechSDK() {
    // Replace with your own authorization token
    const authorizationToken = "58bb436e2df14a129076349790de9cb0";
    const region = "eastus";
    const language = "en-US";

    speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(authorizationToken, region);
    speechConfig.speechRecognitionLanguage = language;
}



function init() {
    const useVersion = 2;

    if (useVersion == 1) {
        console.log("Using version 1");
        // Get the canvas element and its context
        canvas = document.getElementById("audio-visualization");
        canvasContext = canvas.getContext("2d");

        // Update the canvas size and resolution
        updateCanvasSize();

        // Create an audio context
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        drawBars(canvas, canvasContext);

    } else {
        console.log("Using version 2");
        // Get the canvas element and its context
        canvas = document.getElementById("audio-visualization");
        canvasContext = canvas.getContext("2d");

        // Update the canvas size and resolution
        updateCanvasSize();

        // Create an audio context with compatibility for different browsers
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext || false;

            if (AudioContext) {
                audioContext = new AudioContext();

            } else {
                alert("Audio context not supported");
            }
        } catch (e) {
            console.log("no sound context found, no audio output. " + e);
        }

        drawBars(canvas, canvasContext);
    }
}

async function startListening() {
    console.log("Starting to listen...");

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        initSpeechSDK();

        // Resume the audioContext if necessary
        if (audioContext.state === "suspended") {
            await audioContext.resume();
        }

        // Create a media stream source
        source = audioContext.createMediaStreamSource(stream);

        // Connect the media stream source to the Speech SDK
        const audioConfig = SpeechSDK.AudioConfig.fromStreamInput(source.mediaStream);
        recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

        // Add an event listener to the recognizer to log the recognized text
        recognizer.recognizing = (sender, event) => {
            console.log(`Recognizing: ${event.result.text}`);
        };

        // Start the recognizer
        recognizer.startContinuousRecognitionAsync();


        // Create an analyser node to analyze the audio frequency data
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256; // Change this value to control the number of bars
        source.connect(analyser);

        // Start animating the bars
        animateBars(canvas, analyser, canvasContext, audioContext);
    } catch (error) {
        console.error("Error accessing the microphone:", error);
    }
}


function stopListening() {
    console.log("Stopping to listen...");

    if (source) {
        source.disconnect();
        source.mediaStream.getTracks().forEach(track => track.stop());
        source = null;
    }

    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    if (recognizer) {
        recognizer.stopContinuousRecognitionAsync(
            () => {
                recognizer.close();
                recognizer = undefined;
            },
            (err) => {
                recognizer.close();
                recognizer = undefined;
            }
        );
    }

    // Clear the canvas
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the default bars again
    drawBars(canvas, canvasContext);
}


