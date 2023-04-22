
// opening code
const sammy = document.getElementById("sammy");

positionSammy()
sleep();
let isAwake = false;

// When the window is resized...
window.addEventListener("resize", positionSammy);



// Add a click event listener to toggle between sleep and awake states

sammy.addEventListener('click', toggleSleep);
sammy.addEventListener('touchend', (event) => {
    event.preventDefault();
    toggleSleep();
  });
    

// Functions to change Sammy's state

function sleep() {
    setState(['Beak Closed', 'Right Eye Asleep', 'Left Eye Asleep']);
}

function wakeUp() {
    setState(['Beak Closed', 'Right Eye Awake', 'Left Eye Awake']);
}

function talk() {
    setState(['Beak Closed', 'Beak Tongue', 'Right Eye Awake', 'Left Eye Awake']);
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
    
    