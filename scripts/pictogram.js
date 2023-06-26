// pictogram.js


// Audio
const pictogramPhonemeSounds = new Howl({
    src: ['https://kdsaft.github.io/throughline/ssml/hierarchical.wav'],
    sprite: {
        h_ahy_sound: [50, 400],
        h_ahy_example: [1450, 788],
        uh_r_sound: [4653, 287.5],
        uh_r_example: [5940, 1300],
        ah_r_sound: [8780, 325],
        ah_r_example: [10105, 4302],
        k_ee_sound: [13205, 337],
        k_ee_example: [14543, 739],
        k_uh_l_sound: [17695, 288],
        k_uh_l_example: [18983, 2140],
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
    const phonemeSound = this.parentNode.id + '_sound';
    pictogramPhonemeSounds.play(phonemeSound);
    console.log('sound: ' + phonemeSound);
}

function playPhonemeWord() {
    const phonemeWord = this.parentNode.id + '_word';

    pictogramPhonemeSounds.play(phonemeWord);
    console.log('word: ' + phonemeWord);
}

function attachPhonemeSound() {
    // Get all elements with class 'pictograph-tile'
    const phoneticTileText = document.getElementsByClassName('phonetic-text-wrapper');
    const phoneticTileImage = document.getElementsByClassName('pictograms-wrapper');

    // Attach the click event listener to all the elements
    for (let i = 0; i < phoneticTileText.length; i++) {
        phoneticTileText[i].addEventListener('click', playPhonemeSound);
        phoneticTileImage[i].addEventListener('click', playPhonemeWord);
    }

/*     const overlayWindow = document.getElementsByClassName('overlay-window')
    overlayWindow[0].addEventListener('click', removePhonemeSound); */
}

function removePhonemeSound() {
    // Get all elements with class 'pictograph-tile'
    const phoneticTileText = document.getElementsByClassName('phonetic-text-wrapper');
    const phoneticTileImage = document.getElementsByClassName('pictograms-wrapper');

    // Attach the click event listener to all the elements
    for (let i = 0; i < phoneticTileText.length; i++) {
        phoneticTileText[i].removeEventListener('click', playPhonemeSound);
        phoneticTileImage[i].removeEventListener('click', playPhonemeWord);
    }

/*     const overlayWindow = document.getElementsByClassName('overlay-window')
    overlayWindow[0].removeEventListener('click', removePhonemeSound); */
}