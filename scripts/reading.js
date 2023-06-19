// Reading.js

let wordsToReadMap = new Map();
let jsonData;

let currentWordNumber = 1;

let content;
let uiSounds;
let scrollingTimeout;

function initReading() {
  content = document.querySelector('.content');
  initWordsToReadMap().then(() => {
  });

  updateSVGViewBox();

  uiSounds = loadUISounds();

  // When the window is resized...
  window.addEventListener("resize", updateSVGViewBox);

  // handling content scrolling
  content.addEventListener('scroll', () => {
    handleScrollbarFade();
  });
}


function updateSVGViewBox() {
  const svgViewBox = document.getElementById("highlight-viewport");
  const textArea = document.querySelector(".standard-text-container");
  const highlightArea = document.querySelector(".highlight-area");

  // Get the height and width of the text-area div
  const height = textArea.clientHeight;
  const width = textArea.clientWidth;

  // Set the highlight-area div's height to match the text-area div
  highlightArea.style.height = `${height}px`;

  // Set the SVG element's width to match the text-area div
  svgViewBox.setAttribute("width", width);

  // Update the viewBox with the correct dimensions
  svgViewBox.setAttribute("viewBox", `-2 -2 ${width} ${height}`);
}


function handleScrollbarFade() {
  clearTimeout(scrollingTimeout);
  content.classList.add('scrolling');

  scrollingTimeout = setTimeout(() => {
    content.classList.remove('scrolling');
  }, 1000); // Adjust the timeout value to control how long the scrollbar stays visible after scrolling stops
}


// Sammy convience functions

function stopReading() {
  updateWordState(currentWordNumber, "unread");
}

function startReading() {
  updateWordState(currentWordNumber, "reading");
}


//word style control functions

function updateWordState(wordId, newState, syllablesAssessment = null, phonemesAssessment = null) {
  const word = wordsToReadMap.get(wordId);
  if (!word) return;

  switch (newState) {
    case "reading":
      updateWordStyle(wordId, "reading");
      break;

    case "checking":
      updateWordStyle(wordId, "checking");
      break;

    case "trouble":
      updateWordStyle(wordId, "trouble");
      updateTroubleWordList(wordId, syllablesAssessment, phonemesAssessment);
      break;

    case "read":
      updateWordStyle(wordId, "read");
      break;

    case "unread":
      updateWordStyle(wordId, "unread");
      break;

    default:
      console.error("Invalid state:", newState);
  }
}

function readingWord(wordId) {
  updateWordState(wordId, "reading");
}

function troubleWithWord(wordId, syllablesAssessment, phonemesAssessment) {
  updateWordState(wordId, "trouble", syllablesAssessment, phonemesAssessment);
}

function checkingWord(wordId) {
  updateWordState(wordId, "checking");
}

function correctPronunciationOfWord(wordId) {
  updateWordState(wordId, "read");
}

function unreadWord(wordId) {
  updateWordState(wordId, "unread");
}

function insertedWord(wordId, insertedWord) {
  // updateWordState(wordId, "inserted", insertedWord);
}



function readingCurrentWord() {
  updateWordState(currentWordNumber, "reading");
}


function readNextWord() {
  updateWordState(currentWordNumber, "checking");

  // Update the counter and is if it is less than or equal to the total number of words
  let nextWordNumber = currentWordNumber + 1;
  if (nextWordNumber <= 341) {
    currentWordNumber = nextWordNumber;
    updateWordState(currentWordNumber, "reading");
  } else {
    console.log('No more words to read');
  }
}


// Audio functions

function playWordById(wordId) {
  const wordStartTime = wordsToReadMap.get(wordId).audioElement.startTime;
  const wordDuration = wordsToReadMap.get(wordId).audioElement.duration;
  console.log("wordStartTime:", wordStartTime);
  console.log("duration:", wordDuration);
  console.log("play word:", wordId);

  const sound = new Howl({
    src: ['https://kdsaft.github.io/throughline/audio/PieThatConquered.mp3'],
    sprite: {
      word: [wordStartTime * 100, wordDuration * 100]
    }
  });

  sound.play('word');

  sound.once('end', () => {
    resetPlaybutton();
    sound.unload();
  });
}


function playCurrentWord() {
  const wordStartTime = wordsToReadMap.get(currentWordNumber).audioElement.startTime;
  const wordDuration = wordsToReadMap.get(currentWordNumber).audioElement.duration;
  console.log("wordStartTime:", wordStartTime);
  console.log("duration:", wordDuration);
  console.log("currentWordNumber:", currentWordNumber);

  const sound = new Howl({
    src: ['https://kdsaft.github.io/throughline/audio/PieThatConquered.mp3'],
    sprite: {
      word: [wordStartTime * 100, wordDuration * 100]
    }
  });

  sound.play('word');

  sound.once('end', () => {
    resetPlaybutton();
    sound.unload();
  });
}

function playCurrentLine() {
  const wordElement = document.querySelector(`span[class*="word-${currentWordNumber}"]`);
  if (!wordElement) {
    console.error('Word not found');
    return;
  }

  const wordElements = getWordsOnCurrentLine(wordElement);

  const firstWordClassName = wordElements[0].className;
  const firstWordNumber = parseInt(firstWordClassName.split('-')[1].split(' ')[0]);

  const lastWordClassName = wordElements[wordElements.length - 1].className;
  const lastWordNumber = parseInt(lastWordClassName.split('-')[1].split(' ')[0]);

  const startOfLineTime = wordsToReadMap.get(firstWordNumber).audioElement.startTime;
  const endOfLineTime = wordsToReadMap.get(lastWordNumber).audioElement.startTime + wordsToReadMap.get(lastWordNumber).audioElement.duration;

  /*   // Save original classes and set reading class
    const originalClasses = [];
    wordElements.forEach((element, index) => {
      originalClasses[index] = element.className;
    });
  
    // Set the first element to 'reading' and all other elements to 'unread'
    pathElement.style.opacity = 0.1; // Set highlight line's opacity to 20%
    updateWordStyle(wordElements[0], 'reading');
    for (let i = 1; i < wordElements.length; i++) {
      updateWordStyle(wordElements[i], 'unread');
    } */

  const sound = new Howl({
    src: ['https://kdsaft.github.io/throughline/audio/PieThatConquered.mp3'],
    sprite: {
      line: [startOfLineTime * 100, (endOfLineTime - startOfLineTime) * 100]
    }
  });

  sound.play('line');

  /*   wordElements.forEach((element, index) => {
      const startWordTime = wordsToReadMap.get(firstWordNumber+ index).audioElement.startTime;
      const endWordTime = wordsToReadMap.get(firstWordNumber + index).audioElement.stopTime;
      
      setTimeout(() => {
        updateWordStyle(element, 'reading');
      }, (startWordTime - startOfLineTime) * 1000);
  
      setTimeout(() => {
        updateWordStyle(element, 'read');
      }, (endWordTime - startOfLineTime) * 1000);
    }); */

  sound.once('end', () => {
    resetPlaybutton();

    // Reset word elements to their original classes
    /*     pathElement.style.opacity = 1; // Set highlight line's opacity to 100%
        wordElements.forEach((element, index) => {
          element.className = originalClasses[index];
        }); */

    sound.unload();
  });
}

function loadUISounds() {
  const sound = new Howl({
    src: ['https://kdsaft.github.io/throughline/audio/uiSounds.m4a'],
    sprite: {
      pressDown: [0, 14],
      pressAndHold: [15, 241],
      chirp: [255, 255],
      erase: [510, 930]
    }
  });

  return sound;
}

function getWordsOnCurrentLine(element) {
  const parentElement = element.parentNode;
  const words = Array.from(parentElement.children);
  return words;
}


// Funcations to update the display
function updateWordStyle(wordId, mode) {
  wordsToReadMap.get(wordId).wordElement.classList.remove("unread", "reading", "trouble", "read", "checking");
  wordsToReadMap.get(wordId).wordElement.classList.add(mode);

  wordsToReadMap.get(wordId).state = mode;

  wordsToReadMap.get(wordId).updateAnimationStartValues();
  wordsToReadMap.get(wordId).svgElement.animation[mode].style.beginElement();
  wordsToReadMap.get(wordId).svgElement.animation[mode].color.beginElement();
  wordsToReadMap.get(wordId).svgElement.animation[mode].width.beginElement();
  wordsToReadMap.get(wordId).svgElement.animation[mode].opacity.beginElement();
}

function updateTroubleWordList(wordId, syllablesAssessment, phonemesAssessment) {
  console.log("updateTroubleWordList");
  const showPhonemes = true;

  const confidenceData = calculateConfidence(syllablesAssessment, phonemesAssessment);
  console.log("confidenceData:", confidenceData);

  var wordList = document.getElementById("word-list");
  if (wordList.innerHTML.trim() !== "") {
    wordList.innerHTML += '<br>';
  }
  wordList.innerHTML += '<strong>' + wordsToReadMap.get(wordId).withoutPunctuation + '</strong>';
  wordList.innerHTML += '<br>';

  if (showPhonemes) {
    confidenceData.forEach(syllableData => {
      const syllable = syllableData.syllable;
      const avgPhonemeConfidence = syllableData.avgPhonemeConfidence;

      // Display the syllable and its average phoneme confidence
      wordList.innerHTML += `${syllable}➔${avgPhonemeConfidence}<br>`;

      if (avgPhonemeConfidence < 80) {
        // Loop through the phonemes of the current syllable
        syllableData.phonemes.forEach(phonemeData => {
          const phoneme = phonemeData.phoneme;
          const confidence = phonemeData.confidence;

          // Display the confidence and the phoneme
          wordList.innerHTML += `  ${confidence} ${phoneme}<br>`;
        });
      }
    });

  } else {
    syllablesAssessment.forEach(syllableResult => {
      wordList.innerHTML += syllableResult.accuracyScore + " " + syllableResult.syllable + '<br>';
    });
  }
}

function calculateConfidence(syllableAccuracyScore, phonemeAccuracyScore) {
  const confidenceByPhoneme = phonemeAccuracyScore.map(({ phoneme, nBestPhonemes }) => {
    const positionWeights = [1, 0.5, 0.25];
    const correctPositionIndex = nBestPhonemes.findIndex(item => item.Phoneme === phoneme);
    const correctPhonemeScore = nBestPhonemes[correctPositionIndex]?.Score || 0;
    const scoreDiffPercentage = correctPhonemeScore === 0 ? 0 : nBestPhonemes.reduce((sum, item, index) => {
      if (index === correctPositionIndex) return sum;
      return sum + Math.abs(correctPhonemeScore - item.Score) / 2;
    }, 0) / correctPhonemeScore;
    const confidence = (positionWeights[correctPositionIndex] || 0) * (1 + scoreDiffPercentage) * 50;
    return {
      phoneme: phoneme,
      confidence: Math.max(0, Math.min(100, Math.round(confidence))),
    };
  });

  let phonemeIndex = 0;
  const confidenceBySyllable = syllableAccuracyScore.map(({ syllable }) => {
    const syllableCopy = syllable.slice();
    const syllablePhonemes = [];

    while (phonemeIndex < confidenceByPhoneme.length) {
      const { phoneme, confidence } = confidenceByPhoneme[phonemeIndex];
      if (!syllable.startsWith(phoneme)) break;
      syllable = syllable.slice(phoneme.length);
      syllablePhonemes.push({ phoneme, confidence });
      phonemeIndex++;
    }

    const avgPhonemeConfidence = Math.round(syllablePhonemes.reduce((sum, { confidence }) => sum + confidence, 0) / syllablePhonemes.length);

    return {
      syllable: syllableCopy,
      phonemes: syllablePhonemes,
      avgPhonemeConfidence: avgPhonemeConfidence,
    };
  });

  return confidenceBySyllable;
}


function calculateConfidencePrevious(syllablesAssessment, phonemesAssessment) {
  let phonemeIndex = 0;

  // For each syllable
  const confidenceBySyllable = syllablesAssessment.map(({ syllable }) => {
    const syllablePhonemes = [];
    let remainingSyllable = syllable;

    // Extract the phonemes that belong to the current syllable
    while (phonemeIndex < phonemesAssessment.length) {
      const { phoneme, nBestPhonemes } = phonemesAssessment[phonemeIndex];

      if (!remainingSyllable.startsWith(phoneme)) break;

      remainingSyllable = remainingSyllable.slice(phoneme.length);

      // Find the correct phoneme position
      const correctPositionIndex = nBestPhonemes.findIndex(item => item.Phoneme === phoneme);

      // Calculate phoneme confidence for the correct position
      let confidence;
      switch (correctPositionIndex) {
        case 0:
          confidence = nBestPhonemes[0].Score - (nBestPhonemes[1].Score + nBestPhonemes[2].Score) / 2;
          break;
        case 1:
          confidence = nBestPhonemes[1].Score - (nBestPhonemes[0].Score + nBestPhonemes[2].Score) / 2;
          break;
        case 2:
          confidence = nBestPhonemes[2].Score / (nBestPhonemes[0].Score + nBestPhonemes[1].Score + nBestPhonemes[2].Score);
          break;
        default:
          confidence = 0; // any differentiating value/text to indicate none of the phonemes were correct
          break;
      }

      syllablePhonemes.push({
        phoneme: phoneme,
        confidence: confidence,
      });

      phonemeIndex++;
    }

    // Calculate the average confidence of phonemes in the syllable
    const avgPhonemeConfidence = syllablePhonemes.reduce((sum, { confidence }) => sum + confidence, 0) / syllablePhonemes.length;

    return {
      syllable: syllable,
      phonemes: syllablePhonemes,
      avgPhonemeConfidence: avgPhonemeConfidence,
    };
  });

  console.log("new confidence:", confidenceBySyllable);
  return confidenceBySyllable;
}


function calculateConfidenceNotWorking(syllablesAssessment, phonemesAssessment) {
  let phonemeIndex = 0;

  console.log("syllablesAssessment:", syllablesAssessment);
  console.log("phonemesAssessment:", phonemesAssessment);


  // For each syllable
  const confidenceBySyllable = syllablesAssessment.map(({ syllable }) => {
    const syllablePhonemes = [];
    let remainingSyllable = syllable;
    console.log("remainingSyllable:", remainingSyllable);
    console.log(`phonemeIndex: ${phonemeIndex}, phonemesAssessment.length: ${phonemesAssessment.length}`);

    // Extract the phonemes that belong to the current syllable
    while (phonemeIndex < phonemesAssessment.length) {
      const { phoneme, nBestPhonemes } = phonemesAssessment[phonemeIndex];
      console.log("phoneme:", phoneme);
      console.log("nBestPhonemes:", nBestPhonemes);

      console.log("remainingSyllable.startsWith(phoneme):", remainingSyllable.startsWith(phoneme));

      if (!remainingSyllable.startsWith(phoneme)) break;

      remainingSyllable = remainingSyllable.slice(phoneme.length);
      console.log("remainingSyllable:", remainingSyllable);

      // Find the correct phoneme position
      const correctPositionIndex = nBestPhonemes.findIndex(item => item.Phoneme === phoneme);

      // Define weights for each position
      const positionWeights = [1, 0.5, 0.25];

      // Calculate the score differences
      const correctPhonemeScore = nBestPhonemes[correctPositionIndex].Score;
      const otherGuessIndices = [0, 1, 2].filter((idx) => idx !== correctPositionIndex);
      const scoreDifference1 = Math.abs(correctPhonemeScore - nBestPhonemes[otherGuessIndices[0]].Score);
      const scoreDifference2 = Math.abs(correctPhonemeScore - nBestPhonemes[otherGuessIndices[1]].Score);

      // Calculate the average score difference
      const averageScoreDifference = (scoreDifference1 + scoreDifference2) / 2;

      // Calculate the percentage contribution to confidence from score differences
      const scoreDiffPercentage = averageScoreDifference / correctPhonemeScore;

      // Calculate confidence by combining the position weight, and considering the score differences
      let confidence = positionWeights[correctPositionIndex] * (1 + scoreDiffPercentage) * 50;

      // Ensure confidence is within the range of 0 to 100
      confidence = Math.max(0, Math.min(100, confidence));
      console.log("confidence:", confidence);

      // In case the correct phoneme is not in any of the guesses, set confidence to 0
      if (correctPositionIndex === -1) {
        confidence = 0;
      }

      syllablePhonemes.push({
        phoneme: phoneme,
        confidence: confidence,
      });

      phonemeIndex++;
      console.log("phonemeIndex:", phonemeIndex);
    }

    // Calculate the average confidence of phonemes in the syllable
    const avgPhonemeConfidence = syllablePhonemes.reduce((sum, { confidence }) => sum + confidence, 0) / syllablePhonemes.length;
    console.log("avgPhonemeConfidence:", avgPhonemeConfidence);

    return {
      syllable: syllable,
      phonemes: syllablePhonemes,
      avgPhonemeConfidence: avgPhonemeConfidence,
    };
  });

  console.log("new confidence:", confidenceBySyllable);
  return confidenceBySyllable;
}



// Functions to handle JSON data

async function readJsonFile(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error reading JSON file:", error);
  }
}

// Functions to handle JSON data

async function initWordsToReadMap() {
  jsonData = await readJsonFile("https://kdsaft.github.io/throughline/text/PieThatConquered.json");
  if (!jsonData) {
    console.error("Error initializing JSON data");
    return;
  }

  // Get the clauses from both the title and body sections
  const titleClauses = jsonData.title.map((section) => section.clauses).flat();
  const bodyClauses = jsonData.body.map((section) => section.clauses).flat();
  const allClauses = [...titleClauses, ...bodyClauses];

  for (const clause of allClauses) {
    // Check if clause.words exists and is an array
    if (!Array.isArray(clause.words)) {
      console.error("Error: clause.words is not iterable. Please check the JSON data structure.", clause);
      continue;
    }

    for (const wordData of clause.words) {
      const wordId = wordData.id;
      const word = new Word(wordData);

      word.drawLine();
      word.createAnimationElements();

      wordsToReadMap.set(wordId, word);
    }
  }
}



async function readJsonFile(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error reading JSON file:", error);
  }
}