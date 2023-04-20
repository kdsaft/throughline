// Opening code
updateCanvasSize() 

// When the window is resized...
window.addEventListener("resize", updateCanvasSize);
  

function updateCanvasSize() {
    const canvas = document.getElementById("audio-visualization");
    const canvasContainer = document.getElementById("canvas-container");

    // Set the canvas width to the parent's width+height
    canvas.width = canvasContainer.clientWidth;
    canvas.height = canvasContainer.clientHeight;
}