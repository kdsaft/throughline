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

    const PronunciationAssessmentConfig = window.SpeechSDK.PronunciationAssessmentConfig;
    const PronunciationAssessmentGradingSystem = window.SpeechSDK.PronunciationAssessmentGradingSystem;
    const PronunciationAssessmentGranularity = window.SpeechSDK.PronunciationAssessmentGranularity;

    speechConfig = window.SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, region);
    speechConfig.speechRecognitionLanguage = language;
    recognizer = new window.SpeechSDK.SpeechRecognizer(speechConfig, window.SpeechSDK.AudioConfig.fromDefaultMicrophoneInput());

    const pronunciationAssessmentConfig = new PronunciationAssessmentConfig(
        PronunciationAssessmentGradingSystem.HundredMark,
        PronunciationAssessmentGranularity.Word,
        true, // EnableMispronunciation
        true // EnablePronunciation
    );
    pronunciationAssessmentConfig.applyTo(recognizer.properties);
    
    // Set the reference text
    const referenceText = getReferenceText(jsonData);
    pronunciationAssessmentConfig.referenceText = referenceText;

    // Add an event listener to the recognizer to handle the word-by-word evaluation
    recognizer.recognizing = (sender, event) => {
        const result = event.result;
        if (result.reason === window.SpeechSDK.ResultReason.RecognizingSpeech) {
            const pronunciationAssessmentResult = window.SpeechSDK.PronunciationAssessmentResult.fromResult(result);
            handlePronunciationAssessmentResult(pronunciationAssessmentResult);
        }
    };
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


function handlePronunciationAssessmentResult(pronunciationAssessmentResult) {
    const words = pronunciationAssessmentResult.words;
    const currentWord = words.find((word) => word.word === parseInt(document.getElementById("word-number").value));

    if (currentWord) {
        const pronunciationScore = currentWord.accuracyScore;
        if (pronunciationScore >= 0.8) {
            readNextWord();
        } else {
            troubleWithCurrentWord();
        }
    }
}