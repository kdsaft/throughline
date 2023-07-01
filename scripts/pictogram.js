// pictogram.js

const pictogramPath = "https://kdsaft.github.io/throughline/icons/pictogram-";
const menuIconPath = "https://kdsaft.github.io/throughline/icons/menu-icon-";

// Variables that store focus content
let phonemeTilesData = [
    {
        title: 'hi',
        pictogram: [
            {
                icon: (pictogramPath + 'hi.svg'),
                phonetics: ['h', 'ahy'],
                position: "full",
            },
        ],
    },
    {
        title: 'er',
        pictogram: [
            {
                icon: (pictogramPath + 'timber.svg'),
                phonetics: ['uh', 'r'],
                position: "end",
            },
        ],
    },
    {
        title: 'ar',
        pictogram: [
            {
                icon: (pictogramPath + 'arch.svg'),
                phonetics: ['ah', 'r'],
                position: "start",
            },
        ],
    },
    {
        title: 'chi',
        pictogram: [
            {
                icon: (pictogramPath + 'key.svg'),
                phonetics: ['k', 'ee'],
                position: "full",
            },
        ],
    },
    {
        title: 'cal',
        pictogram: [
            {
                icon: (pictogramPath + 'cat.svg'),
                phonetics: ['k'],
                position: "start",
            },
            {
                icon: (pictogramPath + 'camel.svg'),
                phonetics: ['uh', 'l'],
                position: "end",
            },
        ],
    }
];

let contextMenuItemsData = [
    {
        id: 'speakWord',
        icon: (menuIconPath + 'speak.svg'),
        title: ['hierarchical']
    },
    {
        id: 'speakSyllables',
        icon: (menuIconPath + 'speak.svg'),
        title: ['hi', 'er', 'ar', 'chi', 'cal']
    },
];


// Audio
const pictogramPhonemeSounds = new Howl({
    src: ['https://kdsaft.github.io/throughline/ssml/hierarchical.wav'],
    sprite: {
        h_ahy_sound: [50, 400],
        h_ahy_example: [50, 3900],
        uh_r_sound: [4653, 287.5],
        uh_r_example: [4653, 3800],
        ah_r_sound: [8780, 325],
        ah_r_example: [8780, 3852],
        k_ee_sound: [13205, 337],
        k_ee_example: [13205, 3338],
        k_uh_l_sound: [17695, 288],
        k_uh_l_example: [17695, 7175],
    }
});

const wordSounds = new Howl({
    src: ['https://kdsaft.github.io/throughline/audio/hierarachical.mp3'],
    sprite: {
        word: [0, 1011],
        syllables: [1611, 3900],
    }
});


function generateTiles() {
    const phonemeTiles = phonemeTilesData;
    const focusAreaId = 'focusMode-panel';

    const targetDiv = document.getElementById(focusAreaId);

    // Clear the targetDiv content
    targetDiv.innerHTML = '';

    phonemeTiles.forEach(tileInfo => {
        const tile = document.createElement('div');
        tile.className = 'tile-container';

        const titleWrapper = document.createElement('div');
        titleWrapper.className = 'tile-title-wrapper';

        const title = document.createElement('div');
        title.className = 'tile-title';
        title.innerText = tileInfo.title;

        titleWrapper.appendChild(title);
        tile.appendChild(titleWrapper);

        const pictogramsWrapper = document.createElement('div');
        pictogramsWrapper.className = 'tile-pictograms-wrapper';

        const width = 108 + ((tileInfo.pictogram.length - 1) * 60.5);
        tile.style.width = `${width}px`;

        // Create an array to store the ids for each pictogram
        let ids = [];

        tileInfo.pictogram.forEach(pictogramInfo => {
            const pictogram = document.createElement('div');
            pictogram.className = 'pictogram';

            const icon = document.createElement('img');
            icon.className = 'phonetic-icon';
            icon.src = pictogramInfo.icon;

            // Push the id for each pictogram into the ids array
            ids.push(pictogramInfo.phonetics.join('_'));

            pictogram.appendChild(icon);

            const textWrapper = document.createElement('div');
            textWrapper.className = 'phonetic-text-wrapper';

            if (tileInfo.pictogram.length > 1) {
                textWrapper.style.paddingLeft = '8px';
                textWrapper.style.paddingRight = '8px';
            }

            if (pictogramInfo.position === 'start') {
                textWrapper.style.justifyContent = "flex-start";
            }
            else if (pictogramInfo.position === 'end') {
                textWrapper.style.justifyContent = "flex-end";
                textWrapper.innerHTML = "<span class='phonetic-ellipsis'>…</span>";
            }
            else if (pictogramInfo.position === 'mid') {
                textWrapper.style.justifyContent = "center";
                textWrapper.innerHTML = "<span class='phonetic-ellipsis'>…</span>";
            }
            else {
                textWrapper.style.justifyContent = "center";
            }

            const combinedText = pictogramInfo.phonetics.map((text, idx, phoneticsArr) =>
                `<span class="phonetic-text">${text}</span>${idx < phoneticsArr.length - 1 ? '<span class="phonetic-dash">-</span>' : ''}`
            );

            textWrapper.innerHTML += combinedText.join('');

            if (pictogramInfo.position === 'start' || pictogramInfo.position === 'mid') {
                textWrapper.innerHTML += "<span class='phonetic-ellipsis'>…</span>";
            }

            pictogram.appendChild(textWrapper);
            pictogramsWrapper.appendChild(pictogram);
        });

        // Join the ids with an underscore and set the id of tile
        tile.id = ids.join('_');

        tile.appendChild(pictogramsWrapper);
        targetDiv.appendChild(tile);
    });
}

function clearTiles() {
    const focusAreaId = 'focusMode-panel';

    const targetDiv = document.getElementById(focusAreaId);

    // Clear the targetDiv content
    targetDiv.innerHTML = '';
}


function generateContextMenu() {
    const contextMenuItems = contextMenuItemsData;
    const menuID = 'focusMode-menu';

    // Get the div using provided ID
    let menuDiv = document.getElementById(menuID);

    // Clear the current contents
    menuDiv.innerHTML = '';

    // Loop over each menu item
    contextMenuItems.forEach((item) => {

        // Create main item div
        let menuItemDiv = document.createElement('div');
        menuItemDiv.className = 'contextMenu-item';
        menuItemDiv.id = item.id;

        // Create image area div and append icon
        let imageAreaDiv = document.createElement('div');
        imageAreaDiv.className = 'contextMenu-image-area';
        let img = document.createElement('img');
        img.src = item.icon;
        img.className = 'menu-icon';
        imageAreaDiv.appendChild(img);

        // Create text area div
        let textAreaDiv = document.createElement('div');
        textAreaDiv.className = 'contextMenu-text-area';

        // Create clause div
        let clauseDiv = document.createElement('div');
        clauseDiv.className = 'contextMenu-clause';

        // Loop over each title (multiple if array)
        for (let i = 0; i < item.title.length; i++) {
            // Create span for title
            let textSpan = document.createElement('span');
            textSpan.className = 'contextMenu-text';
            textSpan.textContent = item.title[i];
            clauseDiv.appendChild(textSpan);

            // If not the last title, append separator
            if (i < item.title.length - 1) {
                let separatorSpan = document.createElement('span');
                separatorSpan.className = 'contextMenu-text-separator';
                separatorSpan.textContent = '•';
                clauseDiv.appendChild(separatorSpan);
            }
        }

        // Append clause div to text Area div
        textAreaDiv.appendChild(clauseDiv);

        // Append image and text divs to main item div
        menuItemDiv.appendChild(imageAreaDiv);
        menuItemDiv.appendChild(textAreaDiv);

        // Append the main item div to the menu div
        menuDiv.appendChild(menuItemDiv);
    });
}

function clearContextMenu() {
    const menuID = 'focusMode-menu';

    // Get the div using provided ID
    let menuDiv = document.getElementById(menuID);

    // Clear the targetDiv content
    menuDiv.innerHTML = '';
}


// Function to handle click event

function playPhonemeSound() {
    const phonemeSound = this.parentNode.id + '_sound';
    pictogramPhonemeSounds.play(phonemeSound);
}

function playPhonemeExample() {
    const phonemeWord = this.parentNode.id + '_example';

    pictogramPhonemeSounds.play(phonemeWord);
}

function playWord() {
    wordSounds.play('word');
}

function playSyllables() {
    wordSounds.play('syllables');
}

function attachPhonemeSound() {
    // Get all elements with class 'pictograph-tile'
    const phoneticTileText = document.getElementsByClassName('tile-title-wrapper');
    const phoneticTileImage = document.getElementsByClassName('tile-pictograms-wrapper');

    // Attach the click event listener to all the elements
    for (let i = 0; i < phoneticTileText.length; i++) {
        phoneticTileText[i].addEventListener('click', playPhonemeSound);
        phoneticTileImage[i].addEventListener('click', playPhonemeExample);
    }

    // menu items
    const speakWord = document.getElementById('speakWord');
    const speakSyllables = document.getElementById('speakSyllables');
    speakWord.addEventListener('click', playWord);
    speakSyllables.addEventListener('click', playSyllables);

    // close button
    const closeButton = document.getElementById('focusMode-close')
    closeButton.addEventListener('click', removePhonemeSound);
}



function removePhonemeSound() {
    // Get all elements with class 'pictograph-tile'
    const phoneticTileText = document.getElementsByClassName('tile-title-wrapper');
    const phoneticTileImage = document.getElementsByClassName('tile-pictograms-wrapper');

    // Remove the click event listener to all the elements
    for (let i = 0; i < phoneticTileText.length; i++) {
        phoneticTileText[i].removeEventListener('click', playPhonemeSound);
        phoneticTileImage[i].removeEventListener('click', playPhonemeExample);
    }

        // menu items
        const speakWord = document.getElementById('speakWord');
        const speakSyllables = document.getElementById('speakSyllables');
        speakWord.removeEventListener('click', playWord);
        speakSyllables.removeEventListener('click', playSyllables);
    
        // close button
    const closeButton = document.getElementById('focusMode-close')
    closeButton.removeEventListener('click', removePhonemeSound);
    removeFocusMode()
}