// Reading.js

let wordsToReadMap = new Map();
let jsonData;

let currentWordNumber = 1;

let content;
let scrollingTimeout;

function initReading() {
  content = document.querySelector('.content');
  initWordsToReadMap().then(() => {
    //console.log(wordsToReadMap);
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


// Button for Bubble functions

function resetStory() {
  const wordsRead = currentWordNumber;

  // Reset the current word number to 1
  currentWordNumber = 1;


  // Loop through all the words and set their style to "unread"
  for (let i = 1; i <= wordsRead; i++) {
    updateWordState(currentWordNumber, "unread");
  }

  readingCurrentWord()
}

function stopReading() {
  updateWordState(currentWordNumber, "unread");

}


//word style functions

function updateWordState(wordId, newState, assessment = null) {
  const word = wordsToReadMap.get(wordId);
  if (!word) return;

  switch (newState) {
    case "reading":
      updateWordStyle(wordId, "reading");
      wordsToReadMap.get(wordId).drawLine();
      wordsToReadMap.get(wordId).createCheckingAnimationElement();
      break;

    case "checking":
      updateWordStyle(wordId, "checking");
      wordsToReadMap.get(wordId).svgElement.animateToCheckingLineColor.beginElement();
      break;

    case "trouble":
      updateWordStyle(wordId, "trouble");
      wordsToReadMap.get(wordId).createTroubleAnimationElements();
      wordsToReadMap.get(wordId).svgElement.animateToTroubleLineStyle.beginElement();
      wordsToReadMap.get(wordId).svgElement.animateToTroubleLineColor.beginElement();
      wordsToReadMap.get(wordId).svgElement.animateToTroubleLineStroke.beginElement();
      
      updateTroubleWordList(wordId, assessment);
      break;

    case "read":
      updateWordStyle(wordId, "read");
      wordsToReadMap.get(wordId).hideLine();
      break;

    case "unread":
      updateWordStyle(wordId, "unread");
      wordsToReadMap.get(wordId).hideLine();
      break;

    default:
      console.error("Invalid state:", newState);
  }
}



function readingWord(wordId) {
  console.log('Function: readingWord');
  updateWordState(wordId, "reading");
}

function troubleWithWord(wordId, syllablesAssessment, phonemesAssessment) {
  console.log('Function: troubleWithWord');
  updateWordState(wordId, "trouble", syllablesAssessment, phonemesAssessment);
}

function checkingWord(wordId) {
  console.log('Function: checkingWord');
  updateWordState(wordId, "checking");
}

function correctPronunciationOfWord(wordId) {
  console.log('Function: correctPronunciationOfWord');
  updateWordState(wordId, "read");
}

function unreadWord(wordId) {
  console.log('Function: unreadWord');
  updateWordState(wordId, "unread");
}



function readingCurrentWord() {
  console.log('Function: readingCurrentWord');
  updateWordState(currentWordNumber, "reading");
}

function troubleWithCurrentWord() {
  console.log('Function: troubleWithCurrentWord');
  updateWordState(currentWordNumber, "trouble");
}


function readNextWord() {
  console.log('Function: readNextWord, checking');
  updateWordState(currentWordNumber, "checking");

  // Update the counter and is if it is less than or equal to the total number of words
  let nextWordNumber = currentWordNumber + 1;
  if (nextWordNumber <= 341) {
    currentWordNumber = nextWordNumber;
    console.log('Function: readNextWord, reading');
    updateWordState(currentWordNumber, "reading");
  } else {
    console.log('No more words to read');
  }
}



function playCurrentWord() {
  const { start_time, stop_time } = getStartAndEndTime(jsonData, currentWordNumber);

  const sound = new Howl({
    src: ['https://kdsaft.github.io/throughline/audio/PieThatConquered.mp3'],
    sprite: {
      word: [start_time * 1000, (stop_time - start_time) * 1000]
    }
  });

  sound.play('word');

  sound.once('end', () => {
    resetPlaybutton();
    sound.unload();
  });
}

function playCurrentLine() {
  const wordId = parseInt(document.getElementById("word-number").value);

  const wordElement = document.querySelector(`span[class*="word-${wordId}"]`);
  if (!wordElement) {
    console.error('Word not found');
    return;
  }

  const wordElements = getWordsOnCurrentLine(wordElement);

  const firstWordClassName = wordElements[0].className;
  const firstWordNumber = parseInt(firstWordClassName.split('-')[1].split(' ')[0]);

  const lastWordClassName = wordElements[wordElements.length - 1].className;
  const lastWordNumber = parseInt(lastWordClassName.split('-')[1].split(' ')[0]);

  const { start_time: startTime } = getStartAndEndTime(jsonData, firstWordNumber);
  const { stop_time: endTime } = getStartAndEndTime(jsonData, lastWordNumber);

  // Save original classes and set reading class
  const originalClasses = [];
  wordElements.forEach((element, index) => {
    originalClasses[index] = element.className;
  });

  // Set the first element to 'reading' and all other elements to 'unread'
  pathElement.style.opacity = 0.1; // Set highlight line's opacity to 20%
  updateWordStyle(wordElements[0], 'reading');
  for (let i = 1; i < wordElements.length; i++) {
    updateWordStyle(wordElements[i], 'unread');
  }

  const sound = new Howl({
    src: ['https://kdsaft.github.io/throughline/audio/PieThatConquered.mp3'],
    sprite: {
      line: [startTime * 1000, (endTime - startTime) * 1000]
    }
  });

  sound.play('line');

  wordElements.forEach((element, index) => {
    const startWordTime = getStartAndEndTime(jsonData, firstWordNumber + index).start_time;
    const endWordTime = getStartAndEndTime(jsonData, firstWordNumber + index).stop_time;

    setTimeout(() => {
      updateWordStyle(element, 'reading');
    }, (startWordTime - startTime) * 1000);

    setTimeout(() => {
      updateWordStyle(element, 'read');
    }, (endWordTime - startTime) * 1000);
  });

  sound.once('end', () => {
    resetPlaybutton();

    // Reset word elements to their original classes
    pathElement.style.opacity = 1; // Set highlight line's opacity to 100%
    wordElements.forEach((element, index) => {
      element.className = originalClasses[index];
    });

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
  console.log(wordId + ' set to ' + mode);
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
        console.log(phonemeResult.phoneme);
      });
  
    } else {
    syllablesAccuracyScores.forEach(syllableResult => {
      wordList.innerHTML += syllableResult.accuracyScore + " " + syllableResult.syllable + '<br>';
    });
  }
}



/* function getWordProperties(wordNumber) {
  const wordElement = document.querySelector(".word-" + wordNumber);
  const wordRect = wordElement.getBoundingClientRect();
  const parentDiv = wordElement.parentNode;
  const parentRect = parentDiv.getBoundingClientRect();
  const contentElement = document.querySelector(".content");
  const contentRect = contentElement.getBoundingClientRect();


  // Get the position and size of the punctuation element (if exists)
  const endPunctuation = wordElement.querySelector('.endPunctuation');
  const startPunctuation = wordElement.querySelector('.startPunctuation');

  let punctuationStartWidth = 0;
  if (startPunctuation) {
    const startPunctuationRect = startPunctuation.getBoundingClientRect();
    punctuationStartWidth = startPunctuationRect.width;
  }
  let punctuationWidth = 0;
  if (endPunctuation) {
    const endPunctuationRect = endPunctuation.getBoundingClientRect();
    punctuationWidth = endPunctuationRect.width - punctuationStartWidth;
  }

  const startX = wordRect.left - contentRect.left - 2 + punctuationStartWidth;
  const endX = wordRect.right - contentRect.left - 1 - punctuationWidth;

  // Determine yCoordinate offset based on the parent div's class
  let yOffset;
  if (parentDiv.classList.contains("text-headline")) {
    yOffset = 36;
  } else {
    yOffset = 24; // Default value paragraphs
  }

  const yCoordinate = wordRect.top - parentRect.top + parentRect.top - contentRect.top + yOffset + contentElement.scrollTop;


  return { wordElement, startX, endX, yCoordinate };
}

function drawLine(svg, startX, endX, yCoordinate, color, wordID) {
  let length = endX - startX;
  let pathStart = '';
  for (let x = startX; x < endX; x++) {
    pathStart += (x === startX ? 'M' : 'L') + x + ',' + yCoordinate;
  }

  const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathElement.setAttribute('d', pathStart);
  pathElement.setAttribute('stroke', color);
  pathElement.setAttribute('stroke-width', 4);
  pathElement.setAttribute('fill', 'none');
  pathElement.setAttribute('stroke-linecap', 'round');
  pathElement.setAttribute('stroke-linejoin', 'round');
  pathElement.setAttribute('data-word-id', wordID);

  svg.appendChild(pathElement);
  return pathElement;

}


function animateToSineWave(pathElement, startX, endX, yCoordinate, referenceLength, referenceFrequency, duration, endColor) {
  let length = endX - startX;
  const frequency = (referenceFrequency * length) / referenceLength;
  const amplitude = 2;

  const startColor = pathElement.getAttribute("stroke");

  let pathEnd = '';
  for (let x = startX; x < endX; x++) {
    const yEnd = yCoordinate + amplitude * Math.sin((2 * Math.PI * frequency * (x - startX)) / length);
    pathEnd += (x === startX ? 'M' : 'L') + x + ',' + yEnd;
  }

  const animateElement = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
  animateElement.setAttribute('attributeName', 'd');
  animateElement.setAttribute('from', pathElement.getAttribute('d'));
  animateElement.setAttribute('to', pathEnd);
  animateElement.setAttribute('dur', duration + 's');
  animateElement.setAttribute('begin', 'indefinite');
  animateElement.setAttribute('repeatCount', '1');
  animateElement.setAttribute('fill', 'freeze');

  const animateColorElement = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
  animateColorElement.setAttribute('attributeName', 'stroke');
  animateColorElement.setAttribute('from', startColor);
  animateColorElement.setAttribute('to', endColor);
  animateColorElement.setAttribute('dur', duration + 's');
  animateColorElement.setAttribute('begin', 'indefinite');
  animateColorElement.setAttribute('repeatCount', '1');
  animateColorElement.setAttribute('fill', 'freeze');

  pathElement.appendChild(animateElement);
  pathElement.appendChild(animateColorElement);

  return { animateElement, animateColorElement };
}

function animateToNewColor(pathElement, duration, endColor) {
  const startColor = pathElement.getAttribute("stroke");

  const animateColorElement = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
  animateColorElement.setAttribute('attributeName', 'stroke');
  animateColorElement.setAttribute('from', startColor);
  animateColorElement.setAttribute('to', endColor);
  animateColorElement.setAttribute('dur', duration + 's');
  animateColorElement.setAttribute('begin', 'indefinite');
  animateColorElement.setAttribute('repeatCount', '1');
  animateColorElement.setAttribute('fill', 'freeze');

  pathElement.appendChild(animateColorElement);
  console.log("Function: animateToNewColor " + animateColorElement);
  return animateColorElement;
}


function hideLine(pathElement) {
  pathElement.style.display = 'none';
} */


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

    const { start_time, stop_time } = getStartAndEndTime(jsonData, wordId);
    word.audioElement.startTime = start_time;
    word.audioElement.endTime = stop_time;

    word.word.withoutPunctuation = getWordWithoutPunctuation(jsonData, wordId);
    word.word.syllables = getSyllablesAsString(jsonData, wordId);

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



function getStartAndEndTime(data, id) {
  const word = data.words.find((word) => word.id === id);
  if (word) {
    return {
      start_time: word.start_time,
      stop_time: word.stop_time,
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
