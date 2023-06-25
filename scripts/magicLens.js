// magicLens.js


// $(document).ready(function () {

// Sound effects
const touchWord = new Audio('https://kdsaft.github.io/throughline/audio/ButtonDown.m4a');

// Text elements
const contentContainer = { jQ: $('.content') , native: $('.content').get(0) };
const highLightArea = { jQ: $('.highlight-area') , native: $('.highlight-area').get(0) };
const articleContainer = $('.article-container');
const articleContainerOffset = articleContainer.offset();
const standardText = { jQ: $('#standard-text'), native: $('#standard-text').get(0) }
const syllableText = { jQ: $('#syllable-text'), native: $('#syllable-text').get(0) }
const seperatorText = { jQ: $('.syllable-separator'), native: document.querySelectorAll('.syllable-separator') }

// MagicLens element
const magicLensWrapper = { jQ: $('.magic-lens-wrapper'), native: $('.magic-lens-wrapper').get(0) }
const magicLens = { jQ: $('.magic-lens'), native: $('.magic-lens').get(0) }
const magicLensDisplay = { jQ: $('.syllable-text-wrapper'), native: $('.syllable-text-wrapper').get(0) }
const magicLensHandle = { jQ: $('.grab-handle-top'), native: $('.grab-handle-top').get(0) }
const grabHandleArea = { jQ: $('.grab-handle-grab-area'), native: $('.grab-handle-grab-area').get(0) }

// Syllable overlay
const syllableOverlay = { jQ: $('.syllable-overlay'), native: $('.syllable-overlay').get(0) }

// tracking variables
let dragging = false; // is the magicLens being dragged?
let isAnimating = false; // is the magicLens being animated?
let isMagicLensVisible = false; // is the magicLens visible?
let wordId = 1; // the id of the magicLen's current word

let offsetTouchX;
let offsetTouchY;

// long press variables
let magicLensLongPressTimer = null;
let magicLensLongPress = false;

// set article bounding box
articleContainer.css({
    height: syllableText.jQ.height() + parseInt(syllableText.jQ.css('marginTop')) + parseInt(syllableText.jQ.css('marginBottom')) + 20
});
// width: syllableText.jQ.width() + parseInt(syllableText.jQ.css('marginLeft')) + parseInt(syllableText.jQ.css('marginRight')) + 20



function animateToWord(id) {
    // The magicLens stays in word view

    //wordFocus();

    let destinationId = id;

    if (id === 0) {
        // funcation to find nearest word
        const magicLensCenterX = magicLens.jQ.offset().left + (magicLens.jQ.width() / 2) - articleContainerOffset.left;
        const magicLensCenterY = magicLens.jQ.offset().top + (magicLens.jQ.height() / 2) - articleContainerOffset.top;

        destinationId = getNearestWord(magicLensCenterX, magicLensCenterY);
        wordId = destinationId;
    }

    const destinationWord = $('#word-' + destinationId);
    const destinationSyllable = $('#syllable-' + destinationId);


    if (destinationWord.length && destinationSyllable.length) {
        // Get the final positions, height and width of the MagicLens
        snapPositions = getSnapPosition(destinationId);
        const newLeftString = `${snapPositions.left}px`;
        const newTopString = `${snapPositions.top}px`;
        const newWidthString = `${snapPositions.width.word}px`;
        const newHeightString = `${snapPositions.height}px`;

        const toNewWordTimeline = anime.timeline();

        toNewWordTimeline
            .add({
                targets: magicLensWrapper.native,
                left: newLeftString,
                top: newTopString,
                duration: 200,
                easing: 'easeOutExpo',
            }, 0)

            .add({
                targets: magicLens.native,
                width: newWidthString,
                height: newHeightString,
                duration: 200,
                easing: 'easeOutExpo',
                complete: function (anim) {
                    // Get the new position of the syllableText
                    const deltaLeft = destinationSyllable.offset().left - destinationWord.offset().left;
                    const deltaTop = destinationSyllable.offset().top - destinationWord.offset().top;
                    const newSyllableLeft = syllableText.jQ.position().left - deltaLeft
                    const newSyllableTop = syllableText.jQ.position().top - deltaTop

                    // Update the syllable position relative to the word
                    syllableText.jQ.css({ top: newSyllableTop, left: newSyllableLeft });

                    isAnimating = false;
                    syllableFocus();
                },
            }, 0);

        // Play the timeline
        toNewWordTimeline.play();

    }
}

function jumpToWordAndShowMagicLens(id) {
    let destinationId = id;

    if (id === 0) {
        // funcation to find nearest word
        const magicLensCenterX = magicLens.jQ.offset().left + (magicLens.jQ.width() / 2) - articleContainerOffset.left;
        const magicLensCenterY = magicLens.jQ.offset().top + (magicLens.jQ.height() / 2) - articleContainerOffset.top;

        destinationId = getNearestWord(magicLensCenterX, magicLensCenterY);
        wordId = destinationId;
    }

    const destinationWord = $('#word-' + destinationId);
    const destinationSyllable = $('#syllable-' + destinationId);


    if (destinationWord.length && destinationSyllable.length) {
        // Get the final positions, height and width of the MagicLens
        snapPositions = getSnapPosition(destinationId);
        const newLeftString = `${snapPositions.left}px`;
        const newTopString = `${snapPositions.top}px`;
        const newWidthString = `${snapPositions.width.word}px`;
        const newHeightString = `${snapPositions.height}px`;

        // check to see if the magicLens needs to be moved
        magicLensWrapper.jQ.css({ left: newLeftString, top: newTopString });
        magicLens.jQ.css({ width: newWidthString, height: newHeightString });

        wordFocus();
        showMagicLens();

        // Update the position of the syllableText
        const deltaLeft = destinationSyllable.offset().left - destinationWord.offset().left;
        const deltaTop = destinationSyllable.offset().top - destinationWord.offset().top;
        const newSyllableLeft = syllableText.jQ.position().left - deltaLeft
        const newSyllableTop = syllableText.jQ.position().top - deltaTop
        syllableText.jQ.css({ top: newSyllableTop, left: newSyllableLeft });

        isAnimating = false;
        syllableFocus();
    }
}

function updateMagicLens(event) {
    if (isAnimating) return;

    const clientX = (event.type === 'touchmove' ? event.touches[0].pageX : event.pageX) - articleContainer.offset().left;
    const clientY = (event.type === 'touchmove' ? event.touches[0].pageY : event.pageY) - articleContainer.offset().top;
    const magicLensX = clientX - offsetTouchX;
    const magicLensY = clientY - offsetTouchY;

    const speedbumped = applySpeedBump(magicLensX, magicLensY, magicLens.jQ.height(), magicLens.jQ.width());

    if (speedbumped.id !== 0) {
        const snapPositions = getSnapPosition(speedbumped.id);

        magicLens.jQ.css({ width: snapPositions.width.word + 'px', height: snapPositions.height + 'px' });
    } else {
        magicLens.jQ.css({ width: '50px', height: '54px' });
    }

    wordId = speedbumped.id;
    magicLensWrapper.jQ.css({ left: speedbumped.left + 'px', top: speedbumped.top + 'px' });

}

function applySpeedBump(currentLeft, currentTop, currentHeight, currentWidth) {
    const verticalSnapThreshold = 12;
    const horizontalSnapThreshold = 10;

    const midpointX = currentLeft + (currentWidth / 2);
    const midpointY = currentTop + (currentHeight / 2);

    let activeClauseId = 0;
    let activeWordId = 0;
    let newLeft = currentLeft;
    let newTop = currentTop;

    // Are the points in a clause?
    const clauses = Array.from(standardText.native.querySelectorAll('.clause'));

    // Adjusting the bounding box coordinates to be relative to articleContainer
    const containerOffsetLeft = articleContainer.offset().left;
    const containerOffsetTop = articleContainer.offset().top;

    // Find the active clause
    for (const clauseEl of clauses) {
        const rect = clauseEl.getBoundingClientRect();
        const left = rect.left - containerOffsetLeft;
        const top = rect.top - containerOffsetTop;
        const right = rect.right - containerOffsetLeft;
        const bottom = rect.bottom - containerOffsetTop;

        if (midpointX > left && midpointX < right && midpointY > top && midpointY < bottom) {
            activeClauseId = parseInt(clauseEl.getAttribute("id").split("-")[1]);
            break;
        }

        // If the midpointY is smaller than the top of the current clause, exit the loop
        if (midpointY < top) {
            break;
        }
    }

    // Are the points over a word?
    if (activeClauseId > 0) {
        const words = Array.from(document.querySelectorAll(`#clause-${activeClauseId} .word`));

        // Find the active word
        for (const wordEl of words) {
            const rect = wordEl.getBoundingClientRect();
            const left = rect.left - containerOffsetLeft - 6;
            const top = rect.top - containerOffsetTop - 6;
            const right = rect.right - containerOffsetLeft + 6;
            const bottom = rect.bottom - containerOffsetTop + 6;

            if (midpointX > left && midpointX < right && midpointY > top && midpointY < bottom) {
                activeWordId = parseInt(wordEl.getAttribute("id").split("-")[1]);
                break;
            }
        }
    }

    // Constrain to article container
    newTop = containWithinTopBottom(newTop, articleContainer.height(), currentHeight);
    newLeft = containWithinLeftRight(newLeft, articleContainer.width(), currentWidth);

    // Apply speed bumps
    snapPositions = getSnapPosition(activeWordId);

    // Apply a horizontal speed bump
    const leftThreshold = snapPositions.left - horizontalSnapThreshold / 2;
    const rightThreshold = snapPositions.left + horizontalSnapThreshold / 2;

    if ((currentLeft > leftThreshold) && (currentLeft < rightThreshold)) {
        newLeft = snapPositions.left;
    }

    // Apply a vertical speed bump
    const upperThreshold = snapPositions.top + verticalSnapThreshold / 2;
    const lowerThreshold = snapPositions.top - verticalSnapThreshold / 2;

    if ((currentTop > lowerThreshold) && (currentTop < upperThreshold)) {
        newTop = snapPositions.top;
    }

    return { left: newLeft, top: newTop, id: activeWordId };
}


// function for syllable overlay

function createSyllableOverlay() {
    const createSyllableOverlayTimeline = anime.timeline();

    syllableOverlay.jQ.css({ top: magicLensWrapper.jQ.position().top, left: magicLensWrapper.jQ.position().left, width: magicLens.jQ.width(), height: magicLens.jQ.height() });
    console.log('syllableOverlay.top', syllableOverlay.jQ.position().top, '.left', syllableOverlay.jQ.position().left, 'magicLens.width', magicLens.jQ.width(), '.height()', magicLens.jQ.height());

    createSyllableOverlayTimeline
        .add({
            targets: standardText.native,
            filter: 'blur(15px)',
            scale: 0.9,
            translateY: -100,
            opacity: 0.5,
            duration: 200,
            easing: 'easeOutExpo',
        }, 0)

        .add({
            targets: highLightArea.native,
            filter: 'blur(15px)',
            scale: 0.9,
            translateY: -100,
            opacity: 0.5,
            duration: 200,
            easing: 'easeOutExpo',
        }, 0)

        .add({
            targets: magicLensWrapper.native,
            scale: 0.97,
            duration: 100,
            easing: 'easeOutExpo',
            complete: function (anim) {
                syllableOverlay.jQ.css({ display: "block" });
            }
        }, 0)

        .add({
            targets: syllableOverlay.native,
            top: 96,
            left:96,
            width: 509,
            height: 244,
            duration: 200,
            easing: 'easeOutExpo',
        }, 150)

        createSyllableOverlayTimeline.play();
}

function removeSyllableOverlay() {
    const removeSyllableOverlayTimeline = anime.timeline();

    syllableOverlay.jQ.css({ display: "none" });

    removeSyllableOverlayTimeline
        .add({
            targets: standardText.native,
            filter: 'blur(0px)',
            opacity: 1,
            scale: 1,
            translateY: 0,
            duration: 200,
            easing: 'easeOutExpo',
        }, 0)

        .add({
            targets: highLightArea.native,
            filter: 'blur(0px)',
            opacity: 1,
            scale: 1,
            translateY: 0,
            duration: 200,
            easing: 'easeOutExpo',
        }, 0)

        .add({
            targets: magicLensWrapper.native,
            scale: 1.055,
            duration: 50,
            easing: 'easeOutExpo',
        }, 0)

        removeSyllableOverlayTimeline.play();
}


// Helper functions

function getNearestWord(posX, posY) {
    const allWords = Array.from(document.querySelectorAll('.word'));
    let nearestDistance = Infinity;
    let nearestWordId;

    // Adjusting the bounding box coordinates to be relative to articleContainer
    const containerOffsetLeft = articleContainer.offset().left;
    const containerOffsetTop = articleContainer.offset().top;

    allWords.forEach(wordEl => {
        const rect = wordEl.getBoundingClientRect();
        const elementPosX = rect.left - containerOffsetLeft;
        const elementPosY = rect.top - containerOffsetTop;

        const centerX = elementPosX + rect.width / 2;
        const centerY = elementPosY + rect.height / 2;

        const distance = Math.sqrt(
            Math.pow(posX - centerX, 2) + Math.pow(posY - centerY, 2)
        );

        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestWordId = parseInt(wordEl.getAttribute("id").split("-")[1]);
        }
    });

    return nearestWordId;
}

function getPaddedDimensions(id) {
    const extraWidth = 20;
    const extraHeight = 32;

    const wordElement = $('#word-' + id);
    const syllableElement = $('#syllable-' + id);

    const newWidth = { word: wordElement.width() + extraWidth, syllable: syllableElement.width() + extraWidth };
    const newHeight = wordElement.height() + extraHeight;

    return ({ width: newWidth, height: newHeight });
}

function getSnapPosition(id) {
    const wordElement = $('#word-' + id);
    const elementDimensions = getPaddedDimensions(id);

    // Calculate the extra padding
    const topHeightRatio = 0.4;
    const extraWidthPadding = (elementDimensions.width.word - wordElement.width()) / 2;
    const extraHeightPadding = Math.round((elementDimensions.height - wordElement.height()) * topHeightRatio);

    // Calculate the new values
    const newWidth = { word: elementDimensions.width.word, syllable: elementDimensions.width.syllable };
    const newHeight = elementDimensions.height;
    const newLeft = wordElement.offset().left - articleContainer.offset().left - extraWidthPadding;
    const newTop = wordElement.offset().top - articleContainer.offset().top - extraHeightPadding;

    return ({ left: newLeft, top: newTop, width: newWidth, height: newHeight });
}

function containWithinTopBottom(Y, containerHeight, objectHeight) {
    let newY = Y;

    // top bounds
    if (newY < 4) {
        newY = 4;
    }

    // bottom bounds
    if (newY > (containerHeight - (objectHeight / 3) - 4)) {
        newY = containerHeight - (objectHeight / 3) - 4;
    }
    return newY;
}

function containWithinLeftRight(X, containerWidth, objectWidth) {
    let newX = X;

    if (newX < 4) {
        newX = 4;
    }

    let rightEdge = newX + objectWidth;
    if (rightEdge > containerWidth + 34) {
        newX = containerWidth + 34 - objectWidth;
    }
    return newX;
}

function isFirstOrLastWord(id) {
    const syllableElement = $('#syllable-' + id);
    const isFirstWord = syllableElement.is(':first-child');
    const isLastWord = syllableElement.is(':last-child');
    return { isFirstWord, isLastWord };
}

function isFirstOrLastClause(id) {
    const syllableId = "syllable-" + id;
    const syllableElement = document.getElementById(syllableId);
    const clauseElement = syllableElement.closest(".clause");

    const syllableTextContainer = document.getElementById("syllable-text");
    const allClauses = Array.from(syllableTextContainer.querySelectorAll(".clause"));

    const isFirstClause = (clauseElement === allClauses[0]);
    const isLastClause = (clauseElement === allClauses[allClauses.length - 1]);

    return { isFirstClause, isLastClause };
}


// Animation functions

function syllableFocus() {
    const syllableWidth = getPaddedDimensions(wordId).width.syllable;
    const syllableWidthString = `${syllableWidth}px`;

    const toSyllableFocusTimeline = anime.timeline();

    toSyllableFocusTimeline
        .add({
            targets: magicLensWrapper.native,
            scale: 1.055,
            duration: 200,
            easing: 'easeOutExpo',
        }, 0)

        .add({
            targets: magicLensDisplay.native,
            backdropFilter: 'blur(15px)',
            duration: 100,
            easing: 'easeOutExpo'
        }, 0)

        .add({
            targets: seperatorText.native,
            color: 'rgba(181, 204, 255, 1)',
            duration: 200,
            easing: 'easeOutExpo'
        }, 0)

        .add({
            targets: magicLensHandle.native,
            borderColor: 'rgba(231, 242, 251, 1)',
            backgroundColor: 'rgba(255, 255, 255, 1)',
            duration: 200,
            easing: 'easeOutExpo'
        }, 0)

        .add({
            targets: magicLens.native,
            width: syllableWidthString,
            duration: 200,
            easing: 'easeOutExpo'
        }, 0)

        .add({
            targets: magicLensDisplay.native,
            borderColor: 'rgba(231, 242, 251, 1)',
            backgroundColor: 'rgba(255, 255, 255, 1)',
            color: 'rgba(0, 84, 153, 1)',
            duration: 200,
            easing: 'easeOutExpo'
        }, 0);


    // Play the timeline
    toSyllableFocusTimeline.play();
}

function wordFocus() {
    const wordWidth = getPaddedDimensions(wordId).width.word;
    const wordWidthString = `${wordWidth}px`;

    const toWordFocusTimeline = anime.timeline();

    toWordFocusTimeline
        .add({
            targets: magicLensDisplay.native,
            backdropFilter: 'blur(0px)',
            duration: 100,
            easing: 'easeOutExpo'
        })

        .add({
            targets: seperatorText.native,
            color: 'rgba(181, 204, 255, 0)',
            duration: 200,
            easing: 'easeOutExpo'
        }, 0)

        .add({
            targets: magicLensDisplay.native,
            borderColor: 'rgba(0, 84, 153, 1)',
            backgroundColor: 'rgba(255, 255, 255, 0)',
            color: 'rgba(0, 84, 153, 0)',
            duration: 200,
            easing: 'easeOutExpo'
        }, 0)

        .add({
            targets: magicLensHandle.native,
            borderColor: 'rgba(0, 84, 153, 1)',
            backgroundColor: 'rgba(0, 84, 153, 1)',
            duration: 200,
            easing: 'easeOutExpo'
        }, 0)

        .add({
            targets: magicLens.native,
            width: wordWidthString,
            duration: 200,
            easing: 'easeOutExpo'
        }, 0)

        .add({
            targets: magicLensWrapper.native,
            scale: 1.0,
            duration: 200,
            easing: 'easeOutExpo'
        }, 0);

    // Play the timeline
    toWordFocusTimeline.play();
}


// control functions

function initPositionMagicLens() {

    if (wordId === 0) {
        wordId = 1;
    }

    jumpToWordAndShowMagicLens(wordId);
    hideMagicLens();
}

function hideMagicLens() {
    isMagicLensVisible = false;
    magicLensWrapper.jQ.hide();
}

function showMagicLens() {
    isMagicLensVisible = true;
    magicLensInteraction = false;
    magicLensWrapper.jQ.show();
}

function getMagicLensVisibility() {
    return isMagicLensVisible;
}


// onEvents

// for handling motion events
magicLensHandle.jQ.on('mousedown', handleDragStart);
grabHandleArea.jQ.on('touchstart', handleDragStart);
articleContainer.on('mousedown touchstart', '.word', handleJumpStart);

articleContainer.on('mousemove touchmove', function (event) {
    if (dragging) {
        event.preventDefault();
        updateMagicLens(event);
    }
})

function handleMovementEnd() {
    magicLensHandle.jQ.removeClass('grabbed');
    dragging = false;

    if (isMagicLensVisible) {
        animateToWord(wordId);
    } else {
        jumpToWordAndShowMagicLens(wordId);
    }

    if (getAutoPlay()) {
        playWordById(wordId);
    }

    $(document).off('mousemove touchmove', updateMagicLens);
}

function handleDragStart(event) {
    event.preventDefault();

    const clientX = (event.type === 'touchmove' ? event.touches[0].pageX : event.pageX) - articleContainer.offset().left;
    const clientY = (event.type === 'touchmove' ? event.touches[0].pageY : event.pageY) - articleContainer.offset().top;

    offsetTouchX = clientX - (magicLensWrapper.jQ.offset().left - articleContainer.offset().left);
    offsetTouchY = clientY - (magicLensWrapper.jQ.offset().top - articleContainer.offset().top);

    wordFocus();
    dragging = true;
    magicLensHandle.jQ.addClass('grabbed');

    // Define the closure function
    function handleDragEnd(event) {
        handleMovementEnd();
        $(document).off('mouseup touchend', handleDragEnd); // Remove the event listener after it's triggered
    }

    $(document).on('mousemove touchmove', updateMagicLens);
    $(document).on('mouseup touchend', handleDragEnd);
}

function handleJumpStart(event) {
    event.preventDefault();

    // Get the id from the clicked word element
    const elementID = $(this).attr('id').split('-')[1];

    wordFocus();
    wordId = parseInt(elementID, 10);
    turnSyllableButtonOn();
    touchWord.play();

    // Define the closure function
    function handleJumpEnd(event) {
        handleMovementEnd();
        $(document).off('mouseup touchend', handleJumpEnd);
    }

    $(document).on('mouseup touchend', handleJumpEnd);
}


// for handling click events
magicLensDisplay.jQ.on('touchstart mousedown', handleTapStart);


function handleTapStart(event) {
    event.preventDefault();

    magicLensLongPress = false;

    const clientX = event.type === 'touchstart' ? event.touches[0].pageX : event.pageX;
    const relativeClickPointX = clientX - magicLensWrapper.jQ.offset().left;

    magicLensLongPressTimer = setTimeout(() => {
        magicLensLongPress = true;
        pressAndHoldSound.play();
        createSyllableOverlay();
    }, 1500);

    function handleTapEnd(event) {
        handelInteractionEnd(relativeClickPointX);
        $(document).off('mouseup touchend', handleTapEnd);
    }

    $(document).on('mouseup touchend', handleTapEnd);
}



function handelInteractionEnd(relativeClickPointX) {
    const { isFirstWord, isLastWord } = isFirstOrLastWord(wordId);
    const { isFirstClause, isLastClause } = isFirstOrLastClause(wordId);

    clearTimeout(magicLensLongPressTimer);

    if (magicLensLongPress) {
        magicLensLongPress = false;
        removeSyllableOverlay();

    } else {
        wordFocus();
        if (relativeClickPointX < 24) {
            if (!(isFirstWord && isFirstClause)) {
                wordId -= 1;
            }
        } else if (relativeClickPointX > (magicLens.jQ.width() - 24)) {
            if (!(isLastWord && isLastClause)) {
                wordId += 1;
            }
        }
        handleMovementEnd();
    }
}

