// Opening code

class ListenToUser {
    constructor(source, analyser) {
        this.source = source;
        this.analyser = analyser;
        this.isListening = false;
    }

    toggleListening() {
        this.isListening = !this.isListening;

        if (this.isListening) {
            this.source.connect(this.analyser);
        } else {
            this.source.disconnect(this.analyser);
        }
    }

    turnListeningOff() {
        this.isListening = false;
        this.source.disconnect(this.analyser);
    }

    turnListeningOn() {
        this.isListening = true;
        this.source.connect(this.analyser);
    }
}

let listenToUser;

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

        // Create an instance of AudioVisualizer
        listenToUser = new ListenToUser(source, analyser);

        // Turn listening off by default
        listenToUser.turnListeningOff();

        // Start drawing the bars
        drawBars(canvas, analyser, canvasContext, audioContext);
    })
    .catch(error => {
        console.error("Error accessing the microphone:", error);
    });


// When the window is resized...
window.addEventListener("resize", updateCanvasSize);



// Functions to draw the bars 

function drawBars(canvas, analyser, canvasContext, audioContext) {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = 8;
    let barHeight;
    const leftPadding = 88; // Add the left padding value here
    const devicePixelRatio = window.devicePixelRatio || 1;
    const rightPadding = 148;
    const totalWidth = (canvas.width / devicePixelRatio) - leftPadding - rightPadding;

    const contentDiv = document.querySelector(".content");
    const contentRect = contentDiv.getBoundingClientRect();
    const contentStart = contentRect.left - leftPadding;
    const contentWidth = 712; // Set the width of the animated area

    const minFrequency = 0; // Adjust this value as needed
    const maxFrequency = 3400; // Adjust this value as needed
    const frequencyStep = (audioContext.sampleRate / 2) / bufferLength;
    const minBarIndex = Math.floor(minFrequency / frequencyStep);
    const maxBarIndex = Math.ceil(maxFrequency / frequencyStep);

    const numAnimatedBars = Math.floor(contentWidth / (barWidth + 4));
    const animatedBarStartIndex = Math.floor(contentStart / (barWidth + 4));

    const numBarsBeforeContent = Math.floor(contentStart / (barWidth + 4));
    const numBarsAfterContent = Math.floor((totalWidth - contentWidth - contentStart) / (barWidth + 4));
    const numBars = numBarsBeforeContent + numAnimatedBars + numBarsAfterContent;

    let x = leftPadding;

    const animatedFrequencyStep = (maxFrequency - minFrequency) / numAnimatedBars; // used for logging the frequency range


    for (let i = 0; i < numBars; i++) {
        if (i >= animatedBarStartIndex && i < animatedBarStartIndex + numAnimatedBars) {
            const dataIndex = minBarIndex + Math.floor((i - animatedBarStartIndex) * ((maxBarIndex - minBarIndex + 1) / numAnimatedBars));

            //How to scale the bars
            const powerExponent = 3; // 0-1 = compress the higher values, 1 = linear, >1 = compress the lower values
            const powerScaledValue = Math.pow(dataArray[dataIndex] / 255, powerExponent);
            const logScaledValue = logScale(dataArray[dataIndex], 1, 256);

            const scaledValue = powerScaledValue;
            barHeight = 4 + scaledValue * (48 - 4);


            //    // Logging
            //     const lowerFrequencyLimit = minFrequency + (i - animatedBarStartIndex) * animatedFrequencyStep;
            //     const upperFrequencyLimit = lowerFrequencyLimit + animatedFrequencyStep;

            //     if (i === animatedBarStartIndex) console.log("First bar frequency range:", lowerFrequencyLimit, "Hz -", upperFrequencyLimit, "Hz");

            //    if (i === animatedBarStartIndex) console.log("First bar amplitude:", dataArray[dataIndex]);

        } else {
            barHeight = 4;
        }

        const y = 48 - barHeight / 2;
        canvasContext.fillStyle = "#EBEFF9";
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


function logScale(value, min, max) {
    const minValue = Math.log(min);
    const maxValue = Math.log(max);
    const scale = (Math.log(value) - minValue) / (maxValue - minValue);
    return Math.max(0, scale);
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
