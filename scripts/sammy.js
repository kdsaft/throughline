// sammy.js

let sammy;
let isAwake = false;



function initSammy() {

        // Create the audio objects for the sound effects
        const buttonDownSound = new Audio('https://kdsaft.github.io/throughline/audio/ButtonDown.m4a');
        const pressAndHoldSound = new Audio('https://kdsaft.github.io/throughline/audio/PressAndHold.m4a');
    

    let timer = null;
    let longPress = false;
    sammy = document.getElementById("sammy");

    sammy.addEventListener("mousedown", handleInteractionStart);
    sammy.addEventListener("mouseup", handelInteractionEnd);

    sammy.addEventListener("touchstart", handleInteractionStart);
    sammy.addEventListener("touchend", handelInteractionEnd);

  
     positionSammy()
    sleep();
    
    // When the window is resized...
    window.addEventListener("resize", positionSammy);
}

// Functions to handle short and long presses

function handleInteractionStart(event){
    event.preventDefault(); // Prevent default behavior like scrolling on touch devices
    longPress = false;
    buttonDownSound.play();

    timer = setTimeout(() => {
        longPress = true;
        pressAndHoldSound.play();
        buttonIcon.setAttribute('aria-label', 'Long press activated');
        resetText();
        resetTimer = setTimeout(() => {
            wakeUp();
            isAwake = true;
        }, 3000);
    }, 1500); // 1000ms = 1 second
};

function handelInteractionEnd(event) {
    event.preventDefault(); // Prevent default behavior like scrolling on touch devices
    clearTimeout(timer);
    buttonIcon.setAttribute('aria-label', 'Short press activated');

    if (longPress) {
        longPress = false;
    } else {
        if (typeof toggleSleep === 'function') {
            toggleSleep();
        }
    }
};



// Functions to change Sammy's state

function sleep() {
    setState(['Beak Closed', 'Right Eye Asleep', 'Left Eye Asleep']);
    setBodyColor('sleep');
    stopListening();
    stopReading();
}

function wakeUp() {
    setState(['Beak Closed', 'Right Eye Awake', 'Left Eye Awake']);
    setBodyColor('awake');
    startListening();
    startReading();
    }

function talk() {
    setState(['Beak Opened', 'Beak Tongue', 'Right Eye Awake', 'Left Eye Awake']);
    setBodyColor('talk');
}

function resetText() {
    setState(['Beak Opened', 'Right Eye Awake', 'Left Eye Awake']);
    setBodyColor('worry');
}


function setBodyColor(state) {
    sammyBody = document.getElementById('Body');
    if (state === 'sleep') {
        sammyBody.setAttribute('fill', '#445DBE');
    } else if (state === 'worry') {
        sammyBody.setAttribute('fill', '#D40F67');
    } else {
        sammyBody.setAttribute('fill', '#1A79C7');
    }
}


// Utility functions

function positionSammy() {
    // Move Sammy close to the text
    const contentDiv = document.querySelector(".content");
    const contentRect = contentDiv.getBoundingClientRect();
    const sammyLeft = contentRect.left - 100 - 48;

    sammy.style.left = sammyLeft + "px";
}

function setState(visibleElements) {
    const allElements = ['Beak Opened', 'Beak Tongue', 'Beak Closed', 'Right Eye Asleep', 'Right Eye Awake', 'Left Eye Asleep', 'Left Eye Awake'];

    allElements.forEach((id) => {
        const element = document.getElementById(id);
        if (visibleElements.includes(id)) {
            element.classList.remove('hidden');
        } else {
            element.classList.add('hidden');
        }
    });
}


function toggleSleep() {
    if (isAwake) {
        sleep();
    } else {
        wakeUp();
    }
    isAwake = !isAwake;
}