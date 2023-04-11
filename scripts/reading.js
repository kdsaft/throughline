// Opening code

let jsonData;
let pathElement;
let animateElements;

init();



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
    const audioPlayer = document.getElementById("audio-player");
    const wordId = parseInt(document.getElementById("word-number").value);

    const { start_time, stop_time } = getStartAndEndTime(jsonData, wordId);
  
    audioPlayer.currentTime = start_time;
    audioPlayer.play();
  
    setTimeout(() => {
      audioPlayer.pause();
    }, (stop_time - start_time) * 1000);
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
    const contentRect = document.querySelector(".content").getBoundingClientRect();

    // Get the position and size of the punctuation element (if exists)
    const punctuation = wordElement.querySelector('.punctuation');
    let punctuationWidth = 0;
    if (punctuation) {
        const punctuationRect = punctuation.getBoundingClientRect();
        punctuationWidth = punctuationRect.width;
    }

    const startX = wordRect.left - contentRect.left - 2;
    const endX = wordRect.right - contentRect.left - 1 - punctuationWidth;

    // Determine yCoordinate based on the parent div's class
    let yOffset;
    if (parentDiv.classList.contains("text-headline")) {
        yOffset = 36;
    } else {
        yOffset = 24; // Default value paragraphs
    }

    const yCoordinate = wordRect.top - parentRect.top + parentRect.top - contentRect.top + yOffset;

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

async function init() {
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
  