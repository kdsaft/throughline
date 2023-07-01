// pictogram.js


// Audio
const pictogramPhonemeSounds = new Howl({
    src: ['https://kdsaft.github.io/throughline/ssml/hierarchical.wav'],
    sprite: {
        h_ahy_sound: [50, 400],
        h_ahy_example: [1450, 2500],
        uh_r_sound: [4653, 287.5],
        uh_r_example: [5940, 2512],
        ah_r_sound: [8780, 325],
        ah_r_example: [10105, 2527],
        k_ee_sound: [13205, 337],
        k_ee_example: [14543, 2000],
        k_uh_l_sound: [17695, 288],
        k_uh_l_example: [18983, 5887],
    }
});


// Function to handle click event


function playPhonemeSound() {
    const phonemeSound = this.parentNode.id + '_sound';
    pictogramPhonemeSounds.play(phonemeSound);
    console.log('sound: ' + phonemeSound);
}

function playPhonemeExample() {
    const phonemeWord = this.parentNode.id + '_example';

    pictogramPhonemeSounds.play(phonemeWord);
    console.log('example: ' + phonemeWord);
}

function attachPhonemeSound() {
    // Get all elements with class 'pictograph-tile'
    const phoneticTileText = document.getElementsByClassName('phonetic-text-wrapper');
    const phoneticTileImage = document.getElementsByClassName('pictograms-wrapper');

    // Attach the click event listener to all the elements
    for (let i = 0; i < phoneticTileText.length; i++) {
        phoneticTileText[i].addEventListener('click', playPhonemeSound);
        phoneticTileImage[i].addEventListener('click', playPhonemeExample);
    }

    const overlayWindowTitle = document.getElementsByClassName('overlay-title')
    overlayWindowTitle[0].addEventListener('click', removePhonemeSound);
}

function removePhonemeSound() {
    // Get all elements with class 'pictograph-tile'
    const phoneticTileText = document.getElementsByClassName('phonetic-text-wrapper');
    const phoneticTileImage = document.getElementsByClassName('pictograms-wrapper');

    // Attach the click event listener to all the elements
    for (let i = 0; i < phoneticTileText.length; i++) {
        phoneticTileText[i].removeEventListener('click', playPhonemeSound);
        phoneticTileImage[i].removeEventListener('click', playPhonemeExample);
    }

    const overlayWindowTitle = document.getElementsByClassName('overlay-title')
    overlayWindowTitle[0].removeEventListener('click', removePhonemeSound);

    removeOverlayWindow();
}