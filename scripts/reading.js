// Opening code

let jsonData;
let pathElement;
let animateElements;


initTimingData();
updateSVGViewBox();


// When the window is resized...
window.addEventListener("resize", updateSVGViewBox);




function onDocumentReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

function updateSVGViewBox() {
  const svg = document.getElementById("highlight-viewport");
  const textArea = document.querySelector(".text-area");
  const highlightArea = document.querySelector(".highlight-area");
  
  // Get the height and width of the text-area div
  const height = textArea.clientHeight;
  const width = textArea.clientWidth;
  
  // Set the highlight-area div's height to match the text-area div
  highlightArea.style.height = `${height}px`;

  // Set the SVG element's width to match the text-area div
  svg.setAttribute("width", width);
  
  // Update the viewBox with the correct dimensions
  svg.setAttribute("viewBox", `-2 -2 ${width} ${height}`);
}




// handling content scrolling
const content = document.querySelector('.content');
let scrollingTimeout;

content.addEventListener('scroll', () => {
  handleScrollbarFade();
});

function handleScrollbarFade() {
  clearTimeout(scrollingTimeout);
  content.classList.add('scrolling');

  scrollingTimeout = setTimeout(() => {
    content.classList.remove('scrolling');
  }, 1000); // Adjust the timeout value to control how long the scrollbar stays visible after scrolling stops
}


// Button for Bubble functions

function resetStory() {
  const wordElements = document.querySelectorAll('[class^="word-"]');
  const numOfSpans = document.getElementById("word-number").value;
  const wordsRead = parseInt(document.getElementById("word-number").value);

  // Reset the counter to 1
  document.getElementById("word-number").value = 1;

  // Hide the line if it exists
  if (pathElement) {
    hideLine(pathElement);
  }

  // Loop through all the words and set their style to "unread"
  for (let i = 1; i <= wordsRead; i++) {
    const wordElement = document.querySelector(".word-" + i);
    updateWordStyle(wordElement, "unread");
  }
}

function stopReading() {
  const wordNumber = parseInt(document.getElementById("word-number").value);
  const wordElement = document.querySelector(".word-" + wordNumber);

  // set the active word to unread and hide the line
  updateWordStyle(wordElement, "unread");

  if (pathElement) {
      hideLine(pathElement);
    }
}

function readingCurrentWord() {
  const wordNumber = parseInt(document.getElementById("word-number").value);
  const { wordElement, startX, endX, yCoordinate } = getWordProperties(wordNumber);
  const svg = document.getElementById("highlight-viewport");

  // Hide the pre-existing line if it exists
  if (pathElement) {
    hideLine(pathElement);
  }

  // Draw a new line
  pathElement = drawLine(svg, startX, endX, yCoordinate, '#1A79C7');
  wordElement.classList.remove("unread", "trouble", "read");
  wordElement.classList.add("reading");
  if (pathElement) {
    pathElement.style.display = "block";
  }
}

function troubleWithCurrentWord() {
  const wordNumber = parseInt(document.getElementById("word-number").value);
  const { wordElement, startX, endX, yCoordinate } = getWordProperties(wordNumber);
  animateElements = animateSineWave(pathElement, startX, endX, yCoordinate, 48, 5, 0.25, '#1A79C7', '#9F0F7B');
  animateElements.animateElement.beginElement();
  animateElements.animateColorElement.beginElement();
  wordElement.classList.remove("unread", "reading", "read");
  wordElement.classList.add("trouble");
}

function readNextWord() {
  const wordNumber = parseInt(document.getElementById("word-number").value);
  const wordElement = document.querySelector(".word-" + wordNumber);
  updateWordStyle(wordElement, "read");
  if (pathElement) {
    hideLine(pathElement);
  }

  // Update the word number by 1 and activate the reading mode
  let nextWordNumber = wordNumber + 1;
  if (nextWordNumber <= 341) {
    document.getElementById("word-number").value = nextWordNumber;
    const nextWordElement = document.querySelector(".word-" + nextWordNumber);
    const { startX, endX, yCoordinate } = getWordProperties(nextWordNumber);
    const svg = document.getElementById("highlight-viewport");
    pathElement = drawLine(svg, startX, endX, yCoordinate, '#1A79C7');
    updateWordStyle(nextWordElement, "reading");
    if (pathElement) {
      pathElement.style.display = "block";
    }
  }
}


function playCurrentWord() {
  const wordId = parseInt(document.getElementById("word-number").value);
  const { start_time, stop_time } = getStartAndEndTime(jsonData, wordId);

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


// Funcation to update the display
function updateWordStyle(wordElement, mode) {
  wordElement.classList.remove("unread", "reading", "trouble", "read");
  wordElement.classList.add(mode);
}

function getWordProperties(wordNumber) {
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

function drawLine(svg, startX, endX, yCoordinate, color) {
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

  svg.appendChild(pathElement);
  return pathElement;

}


function animateSineWave(pathElement, startX, endX, yCoordinate, referenceLength, referenceFrequency, duration, startColor, endColor) {
  let length = endX - startX;
  const frequency = (referenceFrequency * length) / referenceLength;
  const amplitude = 2;

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

function hideLine(pathElement) {
  pathElement.style.display = 'none';
}

// Funcations to handle JSON data

async function initTimingData() {
  jsonData = await readJsonFile("https://kdsaft.github.io/throughline/text/PieThatConquered.json");
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

function getSyllablesAsString(data, id) {
  const word = data.words.find((word) => word.id === id);
  if (word) {
    return word.syllables.map((syllable) => syllable.syllable).join("-");
  } else {
    console.error("Word not found with given ID:", id);
  }
}
