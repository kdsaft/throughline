// sammy.js

let sammy;
let isAwake = false;



function initSammy() {
    sammy = document.getElementById("sammy");

    positionSammy()
    sleep();
    
    // When the window is resized...
    window.addEventListener("resize", positionSammy);
    
    
    
    // When the user clicks on Sammy...
    sammy.addEventListener('click', () => {
        if (typeof toggleSleep === 'function') {
            toggleSleep();
        }
    });
    sammy.addEventListener('touchend', (event) => {
        event.preventDefault();
        if (typeof toggleSleep === 'function') {
            toggleSleep();
        }
    });
}


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
    setState(['Beak Closed', 'Beak Tongue', 'Right Eye Awake', 'Left Eye Awake']);
    setBodyColor('talk');
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