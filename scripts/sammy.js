
// opening code
positionSammy()
sleep();

// When the window is resized...
window.addEventListener("resize", positionSammy);



function positionSammy() {
    // Move Sammy close to the text
    const contentDiv = document.querySelector(".content");
    const contentRect = contentDiv.getBoundingClientRect();
    const sammyLeft = contentRect.left - 100 - 48;

    const sammy = document.getElementById("sammy");

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

function sleep() {
    setState(['Beak Closed', 'Right Eye Asleep', 'Left Eye Asleep']);
}

function wakeUp() {
    setState(['Beak Closed', 'Right Eye Awake', 'Left Eye Awake']);
}

function talk() {
    setState(['Beak Closed', 'Beak Tongue', 'Right Eye Awake', 'Left Eye Awake']);
}
