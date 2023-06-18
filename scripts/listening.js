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
                // Create a pronunciation assessment config
        speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, region);
        speechConfig.speechRecognitionLanguage = language;
    } else if (version === 2) {
        const referenceText = getReferenceText();
        const pronunciationAssessmentConfigJson = {
            referenceText: referenceText,
            gradingSystem: "HundredMark",
            granularity: "Phoneme",
            enableMiscue: true,
            phonemeAlphabet: "IPA",
            nBestPhonemeCount: 3
        };
        const pronunciationAssessmentConfig = SpeechSDK.PronunciationAssessmentConfig.fromJSON(JSON.stringify(pronunciationAssessmentConfigJson));

        // Create a speech config
        speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, region);
        speechConfig.speechRecognitionLanguage = language;

        // Save the pronunciation assessment config for later use in startListening()
        window.pronunciationAssessmentConfig = pronunciationAssessmentConfig;
    }

}



async function startListening() {

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
            // console.log('window.pronunciationAssessmentConfig is available');

            window.pronunciationAssessmentConfig.applyTo(recognizer);

            // Add an event listener to the recognizer to handle the word-by-word evaluation
            recognizer.recognized = (sender, event) => {
                const result = event.result;
                console.log("Text recognized: ", result.text);


                if (result.reason === window.SpeechSDK.ResultReason.RecognizedSpeech) {
                    const pronunciationAssessmentResult = window.SpeechSDK.PronunciationAssessmentResult.fromResult(result);

                    // Extract the words array from the detailResult.Words property
                    const words = pronunciationAssessmentResult.detailResult.Words;

                    // Iterate over words
                    for (let i = 0; i < words.length; i++) {
                        const wordDetails = words[i];
                        console.log("Word handled: ", wordDetails.Word);

                        const word = wordDetails.Word;

                        const wordAccuracyScore = wordDetails.PronunciationAssessment.AccuracyScore

                        const syllableAssessment = wordDetails.Syllables.map(syllableDetails => ({
                            syllable: syllableDetails.Syllable,
                            accuracyScore: syllableDetails.PronunciationAssessment.AccuracyScore
                        }));

                        const phonemesAssessment = wordDetails.Phonemes.map(phonemeDetails => ({
                            phoneme: phonemeDetails.Phoneme,
                            accuracyScore: phonemeDetails.PronunciationAssessment.AccuracyScore,
                            nBestPhonemes: phonemeDetails.PronunciationAssessment.NBestPhonemes
                        }));
                        
                        console.log("wordDetails: ", wordDetails);
                        console.log("syllable: ", syllableAssessment);
                        console.log("phoneme: ", phonemesAssessment);
                        console.log("wordAccuracyScore: ", wordAccuracyScore);

                        handlePronunciationAssessmentResult(word, wordAccuracyScore, syllableAssessment, phonemesAssessment);
                    }
                }
            };
        }

        // Use the recognizer.recognizing event for quick highlight of the current word
        recognizer.recognizing = (sender, event) => {
            const result = event.result;
            if (result.reason === window.SpeechSDK.ResultReason.RecognizingSpeech) {
                console.log("Recognizing:", result.text);
                highlightNextWord(result.text.trim());
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


function highlightNextWord(wordsSpoken) {
    const wordsArray = wordsSpoken.split(' ');
    let lastRecognizedWord = null;

    wordsArray.forEach(wordSpoken => {
        const lowercaseCurrentWord = wordsToReadMap.get(currentWordNumber).withoutPunctuation.toLowerCase();
        //console.log("++ Current word:", lowercaseCurrentWord);
        const lowercaseWordSpoken = wordSpoken.toLowerCase();
        // console.log("++ Word spoken:", lowercaseWordSpoken);

        if (lowercaseWordSpoken === lowercaseCurrentWord) {
            lastRecognizedWord = lowercaseCurrentWord;
            //  console.log("++ Match");
            readNextWord();
        }
    })
}

function handlePronunciationAssessmentResult(wordSpoken, wordAccuracyScore, syllablesAssessment, phonemesAssessment) {
    const lowercaseWordSpoken = wordSpoken.trim().toLowerCase();
    const wordsToCheck = Array.from(wordsToReadMap.values()).filter(word => word.state === "checking");

    // Iterate over words
    for (let i = 0; i < wordsToCheck.length; i++) {
        const wordInstance = wordsToCheck[i];
        console.log("Word handled: ", wordInstance.withoutPunctuation + " " + wordInstance.wordId);

        // Get the word without punctuation and convert to lowercase
        const lowercaseCurrentWord = wordInstance.withoutPunctuation.toLowerCase();

        if (lowercaseWordSpoken === lowercaseCurrentWord) {
            if (wordAccuracyScore >= 80) {
                console.log("Pronunciation score is above 80:", wordAccuracyScore);
                correctPronunciationOfWord(wordInstance.wordId);
            } else {
                console.log("Pronunciation score is below 80:", wordAccuracyScore);
                troubleWithWord(wordInstance.wordId, syllablesAssessment, phonemesAssessment);
            }
            break; // End the loop since a match is found
        }
    }
}

// Gather data from audio file
async function processAudioFile(fileUrl) {
    try {
        const response = await fetch(fileUrl);
        const audioBlob = await response.blob();
        console.log("Audio file loaded:", audioBlob);

        // Create a temporary File object
        const audioFile = new File([audioBlob], "temp.wav", { type: "audio/wav" });


        const audioConfig = SpeechSDK.AudioConfig.fromWavFileInput(audioFile);
        const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

        // If pronunciation assessment config is available, apply it to the recognizer
        if (window.pronunciationAssessmentConfig) {
            window.pronunciationAssessmentConfig.applyTo(recognizer);
        }

        // Recognize the audio file
        recognizer.recognizeOnceAsync(async (result) => {
            if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
                const pronunciationAssessmentResult = SpeechSDK.PronunciationAssessmentResult.fromResult(result);
                const detailResult = pronunciationAssessmentResult.detailResult;
                console.log("Pronunciation assessment result:", detailResult);

                // Download the JSON file
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(detailResult));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", dataStr);
                downloadAnchorNode.setAttribute("download", "pronunciation_assessment_result.json");
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
            } else {
                console.error("Error processing the audio file:", result.errorDetails);
            }

            recognizer.close();
        });
    } catch (error) {
        console.error("Error downloading the audio file:", error);
    }
}  