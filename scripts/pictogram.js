// pictogram.js

const pictogramPath = "https://kdsaft.github.io/throughline/icons/pictogram-";
const menuIconPath = "https://kdsaft.github.io/throughline/icons/menu-icon-";



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


function generateTiles(phonemeTiles, focusAreaId) {
    const targetDiv = document.getElementById(focusAreaId);

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

        tileInfo.pictogram.forEach(pictogramInfo => {
            const pictogram = document.createElement('div');
            pictogram.className = 'pictogram';

            const icon = document.createElement('img');
            icon.className = 'phonetic-icon';
            icon.src = pictogramInfo.icon;

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

        tile.appendChild(pictogramsWrapper);
        targetDiv.appendChild(tile);
    });
}

function generateContextMenu(contextMenuItems, menuID) {

    // Get the div using provided ID
    let menuDiv = document.getElementById(menuID);

    // Clear the current contents
    menuDiv.innerHTML = '';

    // Loop over each menu item
    contextMenuItems.forEach((item) => {

        // Create main item div
        let menuItemDiv = document.createElement('div');
        menuItemDiv.className = 'contextMenu-item';

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