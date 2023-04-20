// Opening code
updateCanvasSize()



// When the window is resized...
window.addEventListener("resize", updateCanvasSize);


navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        // Get the canvas element and its context
        const canvas = document.getElementById("audio-visualization");
        const canvasContext = canvas.getContext("2d");

        // Create an audio context and a media stream source
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);

        // Create an analyser node to analyze the audio frequency data
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256; // Change this value to control the number of bars
        source.connect(analyser);

        // Start drawing the bars
        drawBars(canvas, analyser, canvasContext);
    })
    .catch(error => {
      console.error("Error accessing the microphone:", error);
    });
  
   
      

// Function to draw the bars on the canvas
function drawBars(canvas, analyser, canvasContext) {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
  
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  
    const barWidth = 8;
    let barHeight;
    let x = 0;
  
    for (let i = 0; i < bufferLength; i++) {
      barHeight = 3 + (dataArray[i] / 255) * (36 - 3);
      const y = (canvas.height - barHeight) / 2;
  
      canvasContext.fillStyle = "rgb(" + (barHeight + 100) + ",50,50)";
      canvasContext.fillRect(x, y, barWidth, barHeight);
  
      x += barWidth + 4;
    }
    requestAnimationFrame(() => drawBars(canvas, analyser, canvasContext));
  }


// Funcation to set the canvas size to the bottom bar
function updateCanvasSize() {
    const canvas = document.getElementById("audio-visualization");
    const canvasContainer = document.getElementById("canvas-container");

    // Set the canvas width to the parent's width+height
    canvas.width = canvasContainer.clientWidth;
    canvas.height = canvasContainer.clientHeight;
}