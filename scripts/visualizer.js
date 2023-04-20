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
        drawBars(canvas, analyser, canvasContext, audioContext);
    })
    .catch(error => {
      console.error("Error accessing the microphone:", error);
    });

// Function to draw the bars on the canvas
function drawBars(canvas, analyser, canvasContext, audioContext) { 
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
  
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  
    const barWidth = 8;
    let barHeight;
    const leftPadding = 88; // Add the left padding value here
    const rightPadding = 148; // Add the right padding value here
    let x = leftPadding; // Set the starting position based on the left padding

    const canvasContainer = document.getElementById("canvas-container");

    const contentDiv = document.querySelector(".content");
    const contentRect = contentDiv.getBoundingClientRect();

    // Calculate the frequency step
    const frequencyStep = (audioContext.sampleRate / 2) / bufferLength;

    // Set the minFrequency and maxFrequency values based on the desired frequency range
    const minFrequency = 300; // Adjust this value as needed
    const maxFrequency = 3400; // Adjust this value as needed

    // Calculate the minBarIndex and maxBarIndex based on the minFrequency and maxFrequency values
    const minBarIndex = Math.floor(minFrequency / frequencyStep);
    const maxBarIndex = Math.ceil(maxFrequency / frequencyStep);

    for (let i = minBarIndex; i <= maxBarIndex; i++) {
        barHeight = 4 + (dataArray[i] / 255) * (48 - 4);

        const y = 36 - barHeight / 2;
        canvasContext.fillStyle = "rgb(" + (barHeight + 100) + ",50,50)";
        drawRoundedRect(canvasContext, x, y, barWidth, barHeight, 4);

        x += barWidth + 4;
    }
    requestAnimationFrame(() => drawBars(canvas, analyser, canvasContext, audioContext)); 
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
