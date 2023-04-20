// Opening code



// When the window is resized...
window.addEventListener("resize", updateCanvasSize);


navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
    // Get the canvas element and its context
    const canvas = document.getElementById("audio-visualization");
    const canvasContext = canvas.getContext("2d");

    // Update the canvas size and resolution
    updateCanvasSize();

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
    const parentDivPadding = 148; // Add the padding value here
    let x = parentDivPadding; // Add the padding value to the starting position
  
    const contentDiv = document.querySelector(".content");
    const contentRect = contentDiv.getBoundingClientRect();
    const minBarIndex = Math.floor((contentRect.left - canvas.getBoundingClientRect().left) / (barWidth + 4));
    const maxBarIndex = Math.ceil((contentRect.right - canvas.getBoundingClientRect().left) / (barWidth + 4));
  
    // Calculate the number of bars that can fit within the available width, considering the padding
    const availableWidth = canvasContainer.clientWidth - parentDivPadding * 2;
    const maxBars = Math.floor(availableWidth / (barWidth + 4));
  
    for (let i = 0; i < maxBars; i++) {
      if (i >= minBarIndex && i <= maxBarIndex) {
        barHeight = 4 + (dataArray[i] / 255) * (48 - 4);
      } else {
        barHeight = 4; // Set the default height for non-animated bars
      }
  
      const y = 36 - barHeight / 2;
      canvasContext.fillStyle = "rgb(" + (barHeight + 100) + ",50,50)";
      drawRoundedRect(canvasContext, x, y, barWidth, barHeight, 4);
  
      x += barWidth + 4;
    }
    requestAnimationFrame(() => drawBars(canvas, analyser, canvasContext));
}

    
  function drawRoundedRect(ctx, x, y, width, height, maxRadius) {
    const radius = Math.min(maxRadius, height / 2);
  
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
    ctx.fill();
  }

// Funcation to set the canvas size to the bottom bar
function updateCanvasSize() {
    const canvas = document.getElementById("audio-visualization");
    const canvasContainer = document.getElementById("canvas-container");
  
    // Set the canvas width and height to the parent's width and height
    canvas.style.width = canvasContainer.clientWidth + "px";
    canvas.style.height = canvasContainer.clientHeight + "px";
  
    // Adjust the canvas resolution based on the device pixel ratio
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = parseInt(canvas.style.width) * devicePixelRatio;
    canvas.height = parseInt(canvas.style.height) * devicePixelRatio;
  
    // Scale the canvas context to match the device pixel ratio
    const canvasContext = canvas.getContext("2d");
    canvasContext.scale(devicePixelRatio, devicePixelRatio);
}
