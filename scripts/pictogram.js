// pictogram.js


// Audio
const pictogramPhonemeSounds = new Howl({
    src: ['https://kdsaft.github.io/throughline/audio/phonemeSounds.m4a'],
    sprite: {
        hat: [0, 930],
        h: [0, 450],
        eye: [1180, 1260],
        ahy: [1180, 715],
        asleep: [2900, 1300],
        uh: [2900, 622],
        rabbit: [4400, 1020],
        r: [4400, 542],
        arch: [5760, 1150],
        ah: [5760, 527],
        cat: [7070, 770],
        k: [7070, 290],
        igloo: [8000, 1210],
        ee: [8000, 559],
        lion: [9510, 1250],
        l: [9510, 562]
    }
});

// Function to handle click event
function playPhonemeSound() {
    pictogramPhonemeSounds.play(this.id);
}

// Get all elements with class 'pictograph-tile'
const pictographTilesImage = document.getElementsByClassName('pictograph-image-container');
const pictographTilesText = document.getElementsByClassName('pictograph-text-container');

// Attach the click event listener to all the elements
for (let i = 0; i < pictographTilesImage.length; i++) {
    pictographTilesImage[i].addEventListener('click', playPhonemeSound);
    pictographTilesText[i].addEventListener('click', playPhonemeSound);
}