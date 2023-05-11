//word.js

class Word {
    constructor(wordId) {
        this.wordId = wordId;
        this.state = "unread";

        this.wordElement = document.querySelector(`.word-${wordId}`);

        this.svgElement = {
            highlightLine: null,
            animateToTroubleLineStyle: null,
            animateToTroubleLineColor: null,
            animateToTroubleLineStroke: null,
            animateToCheckingLineColor: null
        };

        this.audioElement = {
            startTime: null,
            stopTime: null
        };
        this.word = {
            withoutPunctuation: null,
            syllables: null
        };
    }


    // Methods

    getWordProperties() {
        /*  
        Words are within a span with a class of "word-<wordId>"
        This method returns the coorinates of the span with any punctuation removed
        It also takes into account the Y position of the parent div
        */

        const wordElement = this.wordElement;
        const wordRect = wordElement.getBoundingClientRect();
        const parentDiv = wordElement.parentNode;
        const parentRect = parentDiv.getBoundingClientRect();
        const contentElement = document.querySelector(".content");
        const contentRect = contentElement.getBoundingClientRect();


        // Get the position and size of the punctuation element (if exists)
        const endPunctuation = wordElement.querySelector('.endPunctuation');
        const startPunctuation = wordElement.querySelector('.startPunctuation');

        let punctuationStartWidth = 0;
        if (startPunctuation) {
            const startPunctuationRect = startPunctuation.getBoundingClientRect();
            punctuationStartWidth = startPunctuationRect.width;
        }
        let punctuationWidth = 0;
        if (endPunctuation) {
            const endPunctuationRect = endPunctuation.getBoundingClientRect();
            punctuationWidth = endPunctuationRect.width - punctuationStartWidth;
        }

        const startX = wordRect.left - contentRect.left - 2 + punctuationStartWidth;
        const endX = wordRect.right - contentRect.left - 1 - punctuationWidth;

        // Determine yCoordinate offset based on the parent div's class
        let yOffset;
        yOffset = parentDiv.classList.contains("text-headline") ? 36 : 24;

        const yCoordinate = wordRect.top - parentRect.top + parentRect.top - contentRect.top + yOffset + contentElement.scrollTop;


        return { startX, endX, yCoordinate };
    }

    drawLine() {
        /*  
        Removes any existing line and draws a new line
        */

        const svgViewBox = document.getElementById("highlight-viewport");
        const { startX, endX, yCoordinate } = this.getWordProperties();
        const lineColor = "#1A79C7";
        const lineWidth = 4;
        const wordID = this.wordId;

        if (this.svgElement.highlightLine) {
            svgViewBox.removeChild(this.svgElement.highlightLine);
        }

        let length = endX - startX;
        let pathStart = "";
        for (let x = startX; x < endX; x++) {
            pathStart += (x === startX ? "M" : "L") + x + "," + yCoordinate;
        }

        const pathElement = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
        );
        pathElement.setAttribute("d", pathStart);
        pathElement.setAttribute("stroke", lineColor);
        pathElement.setAttribute("stroke-width", lineWidth);
        pathElement.setAttribute("fill", "none");
        pathElement.setAttribute("stroke-linecap", "round");
        pathElement.setAttribute("stroke-linejoin", "round");
        pathElement.setAttribute("data-word-id", wordID);

        pathElement.style.display = "block"

        svgViewBox.appendChild(pathElement);
        this.svgElement.highlightLine = pathElement;
    }

    createTroubleAnimationElements() {
        /*  
        Creates the end state of the trouble (sine wave) animation
        */

        // settings
        const { startX, endX, yCoordinate } = this.getWordProperties()
        const pathElement = this.svgElement.highlightLine;
        const referenceLength = 48;
        const referenceFrequency = 5;
        const duration = 0.25;
        const endColor = "#E7C3DE";
        const endStrokeWidth = 2;

        // sine wave line
        let length = endX - startX;
        const frequency = (referenceFrequency * length) / referenceLength;
        const amplitude = 2;

        let pathEnd = '';
        for (let x = startX; x < endX; x++) {
            const yEnd = yCoordinate + amplitude * Math.sin((2 * Math.PI * frequency * (x - startX)) / length);
            pathEnd += (x === startX ? 'M' : 'L') + x + ',' + yEnd;
        }
        const animateStyleElement =  Word.createAnimateElement('d', pathElement.getAttribute('d'), pathEnd, duration);

       
       // stroke width
        const startStrokeWidth = pathElement.getAttribute("stroke-width");
        const animateStrokeWidthElement = Word.createAnimateElement('stroke-width', startStrokeWidth, endStrokeWidth, duration);
    
        // stroke color
        const startColor = pathElement.getAttribute("stroke");
        const animateColorElement = Word.createAnimateElement('stroke', startColor, endColor, duration);

        pathElement.appendChild(animateStyleElement);
        pathElement.appendChild(animateColorElement);
        pathElement.appendChild(animateStrokeWidthElement);


        this.svgElement.animateToTroubleLineStyle = animateStyleElement;
        this.svgElement.animateToTroubleLineColor = animateColorElement;
        this.svgElement.animateToTroubleLineStroke = animateStrokeWidthElement;
    }

    createCheckingAnimationElement() {
        /*  
        Creates the end state of the checking (light colored line) animation
        */

        const duration = 0.25;
        const endColor = "#E3F3FE";
        const pathElement = this.svgElement.highlightLine;

        const startColor = pathElement.getAttribute("stroke");

        const animateColorElement = Word.createAnimateElement('stroke', startColor, endColor, duration);

        pathElement.appendChild(animateColorElement);
        this.svgElement.animateToCheckingLineColor = animateColorElement;
    }

    hideLine() {
        /*  
        Hides the line
        */
        const svgViewBox = document.getElementById("highlight-viewport");
        if (this.svgElement.highlightLine) {
            svgViewBox.removeChild(this.svgElement.highlightLine);
        }

        // const pathElement = this.svgElement.highlightLine;
        // pathElement.style.display = 'none';
    }

    static createAnimateElement(attributeName, fromValue, toValue, duration) {
        /*  
        Helper function to create an animate element
        */
        const animateElement = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animateElement.setAttribute('attributeName', attributeName);
        animateElement.setAttribute('from', fromValue);
        animateElement.setAttribute('to', toValue);
        animateElement.setAttribute('dur', duration + 's');
        animateElement.setAttribute('begin', 'indefinite');
        animateElement.setAttribute('repeatCount', '1');
        animateElement.setAttribute('fill', 'freeze');
        return animateElement;
    }
}