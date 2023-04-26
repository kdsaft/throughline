// listening.js

let audioContext;
let source;
let analyser;
let canvas;
let canvasContext;
let animationId;
let recognizer;
let speechConfig;

function initListening() {
    // When the window is resized...
    window.addEventListener("resize", () => {
        updateCanvasSize();
        drawBars(canvas, canvasContext);
    });

    // Initialize the Speech SDK
    initSpeechSDK();

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


function initSpeechSDK() {
    const subscriptionKey = "bdb8bfbfafa74fa39e46d676edf2787b";
    const region = "eastus";
    const language = "en-US";

    const version = 2; // 1 - basic speech recognition; 2 - pronunciation assessment

    if (version === 1) {
        speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, region);
        speechConfig.speechRecognitionLanguage = language;
    } else if (version === 2) {
        // Create a pronunciation assessment config
        const referenceText = getReferenceText();
        const pronunciationAssessmentConfig = new SpeechSDK.PronunciationAssessmentConfig(
            referenceText,
            SpeechSDK.PronunciationAssessmentGradingSystem.HundredMark,
            SpeechSDK.PronunciationAssessmentGranularity.Word,
            true
        );

        // Create a speech config
        speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, region);
        speechConfig.speechRecognitionLanguage = language;

        // Save the pronunciation assessment config for later use in startListening()
        window.pronunciationAssessmentConfig = pronunciationAssessmentConfig;
    }
}



async function startListening() {
    console.log("Starting to listen...");

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Resume the audioContext if necessary
        if (audioContext.state === "suspended") {
            await audioContext.resume();
        }

        // Create a media stream source
        source = audioContext.createMediaStreamSource(stream);

        // Create the SpeechRecognizer instance
        const audioConfig = SpeechSDK.AudioConfig.fromStreamInput(source.mediaStream);
        recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

        // If pronunciation assessment config is available, apply it to the recognizer
        if (window.pronunciationAssessmentConfig) {
            console.log('window.pronunciationAssessmentConfig is available');

            window.pronunciationAssessmentConfig.applyTo(recognizer);

        // Add an event listener to the recognizer to handle the word-by-word evaluation
        recognizer.recognized = (sender, event) => {
            console.log("Recognized event triggered"); 
            const result = event.result;
            if (result.reason === window.SpeechSDK.ResultReason.RecognizedSpeech) {
                const pronunciationAssessmentResult = window.SpeechSDK.PronunciationAssessmentResult.fromResult(result);

                // Iterate through the recognized words and call the handlePronunciationAssessmentResult function
                pronunciationAssessmentResult.words.forEach((wordDetails) => {
                    handlePronunciationAssessmentResult(pronunciationAssessmentResult, wordDetails.word);
                });
            }
        };

        // Use the recognizer.recognizing event to process the recognized words
        recognizer.recognizing = (sender, event) => {
            const result = event.result;
            if (result.reason === window.SpeechSDK.ResultReason.RecognizingSpeech) {
                console.log("Recognizing event triggered:", result.text);
                const pronunciationAssessmentResult = window.SpeechSDK.PronunciationAssessmentResult.fromResult(result);

                // Split the recognized text into words and filter out any undefined or empty string values
                const recognizedWords = result.text.split(" ").filter((word) => word);

                // Iterate through the recognized words and call the handlePronunciationAssessmentResult function
                recognizedWords.forEach((word) => {
                    handlePronunciationAssessmentResult(pronunciationAssessmentResult, word);
                });
            }
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


function getReferenceText() {
    const words = document.querySelectorAll(".unread");
    let referenceText = "";

    for (let i = 0; i < words.length; i++) {
        referenceText += words[i].textContent + " ";
    }

    return referenceText.trim();
}




function handlePronunciationAssessmentResult(pronunciationAssessmentResult, word) {
    console.log("Handling pronunciation assessment result for word:", word);
    const words = pronunciationAssessmentResult.words;
    const currentWordElement = document.querySelector(".reading");

    if (currentWordElement) {
        const currentWordText = currentWordElement.textContent.trim();

        // Check if the recognized word matches the current word text
        if (word === currentWordText) {
            console.log("Recognized word matches the current word text:", word);
            const currentWord = words.find((word) => word.word === currentWordText);

            if (currentWord) {
                const pronunciationScore = currentWord.accuracyScore;
                if (pronunciationScore >= 0.8) {
                    console.log("Pronunciation score is above 0.8:", pronunciationScore);
                    readNextWord();
                } else {
                    console.log("Pronunciation score is below 0.8:", pronunciationScore);
                    troubleWithCurrentWord();
                }
            }
        } else {
            console.log("Recognized word does not match the current word text:", word, currentWordText);
        }
    } else {
        console.log("No current word element found with the 'reading' class");
    }
}
