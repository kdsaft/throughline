// pictogram.js


// Audio
const pictogramPhonemeSounds = new Howl({
    src: ['https://kdsaft.github.io/throughline/audio/phonemeSoundsMS.m4a'],
    sprite: {
        hat: [0, 1995],
        h: [0, 493],
        eye: [2600, 1933],
        ahy: [2600, 514],
        asleep: [5111, 2307],
        uh: [5111, 516],
        rabbit: [7945, 2037],
        r: [7945, 563],
        arch: [10721, 1901],
        ah: [10721, 498],
        cat: [13438, 1984],
        k: [13438, 524],
        igloo: [16064, 2020],
        ee: [16064, 464],
        lion: [18761, 2054],
        l: [18761, 584]
    }
});

/* const pictogramPhonemeSounds = new Howl({
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
 */
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