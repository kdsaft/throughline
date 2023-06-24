// sammy.js

let sammy;
let isAwake = false;



function initSammy() {

    let timer = null;
    let longPress = false;
    sammy = document.getElementById("sammy");

    sammy.addEventListener("mousedown", handleSammyInteractionStart);
    sammy.addEventListener("mouseup", handelSammyInteractionEnd);

    sammy.addEventListener("touchstart", handleSammyInteractionStart);
    sammy.addEventListener("touchend", handelSammyInteractionEnd);


    positionSammy()
    sleep();

    // When the window is resized...
    window.addEventListener("resize", positionSammy);
}

// Functions to handle short and long presses

function handleSammyInteractionStart(event) {
    event.preventDefault(); // Prevent default behavior like scrolling on touch devices
    longPress = false;
    talk()
    uiSounds.play('chirp');

    timer = setTimeout(() => {
        longPress = true;
        uiSounds.play('erase');
      
        //buttonIcon.setAttribute('aria-label', 'Long press activated');
        resetText();
        resetTimer = setTimeout(() => {
            wakeUp();
            isAwake = true;
        }, 400);
    }, 750); // 1000ms = 1 second
};

function handelSammyInteractionEnd(event) {
    event.preventDefault(); // Prevent default behavior like scrolling on touch devices
    clearTimeout(timer);
   // buttonIcon.setAttribute('aria-label', 'Short press activated');

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
    setState(['Beak Closed', 'Right Eye Asleep', 'Left Eye Awake']);
    setBodyColor('reset');
}


function setBodyColor(state) {
    sammyBody = document.getElementById('Body');

    switch (state) {
        case "sleep":
            sammyBody.setAttribute('fill', '#445DBE');
            break;

        case "awake":
            sammyBody.setAttribute('fill', '#1A79C7');
            break;

        case "talk":
            sammyBody.setAttribute('fill', '#1A79C7');
            break;


        case "worry":
            sammyBody.setAttribute('fill', '#D40F67');
            break;

        case "reset":
            sammyBody.setAttribute('fill', '#74125D');
            break;

        default:
            console.error("Invalid state:", state);
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