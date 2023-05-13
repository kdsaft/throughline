// Reading.js

let wordsToReadMap = new Map();
console.log("wordsToReadMap:", wordsToReadMap);
let jsonData;

let currentWordNumber = 1;

let content;
let scrollingTimeout;

function initReading() {
  content = document.querySelector('.content');
  initWordsToReadMap().then(() => {
  });

  updateSVGViewBox();

  // When the window is resized...
  window.addEventListener("resize", updateSVGViewBox);

  // handling content scrolling
  content.addEventListener('scroll', () => {
    handleScrollbarFade();
  });  
}


function updateSVGViewBox() {
  const svgViewBox = document.getElementById("highlight-viewport");
  const textArea = document.querySelector(".text-area");
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

function playCurrentWord() {
  const wordStartTime = wordsToReadMap.get(currentWordNumber).audioElement.startTime;
  const wordDuration = wordsToReadMap.get(currentWordNumber).audioElement.duration;
console.log("wordStartTime:", wordStartTime);
console.log("duration:", wordDuration);
console.log("currentWordNumber:", currentWordNumber);

  const sound = new Howl({
    src: ['https://kdsaft.github.io/throughline/audio/PieThatConquered.mp3'],
    sprite: {
      word: [wordStartTime * 1000, wordDuration * 1000]
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
      line: [startOfLineTime * 1000, (endOfLineTime - startOfLineTime) * 1000]
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

function updateTroubleWordList(wordId, syllablesAccuracyScores, phonemesAccuracyScores) {
  const showPhonemes = true;

  var wordList = document.getElementById("word-list");
  if (wordList.innerHTML.trim() !== "") {
      wordList.innerHTML += '<br>';
    }
    wordList.innerHTML += '<strong>' + wordsToReadMap.get(wordId).word.withoutPunctuation + '</strong>';
    wordList.innerHTML += '<br>';

    if (showPhonemes) {
      phonemesAccuracyScores.forEach(phonemeResult => {
        wordList.innerHTML += phonemeResult.accuracyScore + " " + phonemeResult.phoneme + '<br>';
      });
  
    } else {
    syllablesAccuracyScores.forEach(syllableResult => {
      wordList.innerHTML += syllableResult.accuracyScore + " " + syllableResult.syllable + '<br>';
    });
  }
}


// Funcations to handle JSON data

async function initWordsToReadMap() {
  jsonData = await readJsonFile("https://kdsaft.github.io/throughline/text/PieThatConquered.json");
  if (!jsonData) {
    console.error("Error initializing JSON data");
    return;
  }
  for (const wordData of jsonData.words) {
    const wordId = wordData.id;
    const word = new Word(wordId);

    const { startTime, duration } = getStartAndStopTime(jsonData, wordId);
    word.audioElement.startTime = startTime;
    word.audioElement.duration = duration;

    word.word.withoutPunctuation = getWordWithoutPunctuation(jsonData, wordId);
    word.word.syllables = getSyllablesAsString(jsonData, wordId);

    word.drawLine();
    word.createAnimationElements();

    wordsToReadMap.set(wordId, word);
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



function getStartAndStopTime(data, id) {
  const wordData = data.words.find((word) => word.id === id);
  if (wordData) {
    return {
      startTime: wordData.startTime,
      duration: wordData.duration,
    };
  } else {
    console.error("Word not found with given ID:", id);
  }
}



function getWordWithoutPunctuation(data, id) {
  const wordData = data.words.find((word) => word.id === id);

  if (wordData) {
    const word = wordData.word;
    const wordWithoutPunctuation = word.replace(/^[^\w]+|[^\w]+$/g, '');
    return wordWithoutPunctuation; // Return only the word without punctuation
  } else {
    console.error("Word not found with given ID:", id);
  }
}


function getSyllablesAsString(data, id) {
  const word = data.words.find((word) => word.id === id);
  if (word) {
    return word.syllables.map((syllable) => syllable.syllable).join("-");
  } else {
    console.error("Word not found with given ID:", id);
  }
}
