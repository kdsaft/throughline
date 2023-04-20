// Opening code
updateCanvasSize() 

// When the window is resized...
window.addEventListener("resize", updateCanvasSize);


// Get the canvas element and its context
const canvas = document.getElementById("audio-visualization");
const canvasContext = canvas.getContext("2d");

// Create an audio context and a media stream source
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const source = audioContext.createMediaStreamSource(MediaStream);

// Create an analyser node to analyze the audio frequency data
const analyser = audioContext.createAnalyser();
analyser.fftSize = 256; // Change this value to control the number of bars
source.connect(analyser);

// Function to draw the bars on the canvas
function drawBars() {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);

  canvasContext.clearRect(0, 0, canvas.width, canvas.height);

  const barWidth = (canvas.width / bufferLength) * 2.5;
  let barHeight;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i] / 2;

    canvasContext.fillStyle = "rgb(" + (barHeight + 100) + ",50,50)";
    canvasContext.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

    x += barWidth + 1;
  }

  requestAnimationFrame(drawBars);
}

// Start drawing the bars
drawBars();

  

navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    // The rest of the visualization code goes here
  })
  .catch(error => {
    console.error("Error accessing the microphone:", error);
  });


function updateCanvasSize() {
    const canvas = document.getElementById("audio-visualization");
    const canvasContainer = document.getElementById("canvas-container");

    // Set the canvas width to the parent's width+height
    canvas.width = canvasContainer.clientWidth;
    canvas.height = canvasContainer.clientHeight;
}