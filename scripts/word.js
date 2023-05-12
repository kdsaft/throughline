//word.js

class Word {
    constructor(wordId) {
      this.wordId = wordId;
      this.state = "unread";
  
      this.wordElement = document.querySelector(`.word-${wordId}`);
  
      this.svgElement = {
        highlightLine: null,
        animation: {
          reading: {},
          trouble: {},
          checking: {},
          unread: {},
          read: {},
        },
      };
  
      this.audioElement = {
        startTime: null,
        stopTime: null,
      };
      this.word = {
        withoutPunctuation: null,
        syllables: null,
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
        const lineOpacity = 0;
        const wordID = this.wordId;

        if (this.svgElement.highlightLine) {
            svgViewBox.removeChild(this.svgElement.highlightLine);
        }

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
        pathElement.setAttribute("stroke-opacity", lineOpacity);
        pathElement.setAttribute("fill", "none");
        pathElement.setAttribute("stroke-linecap", "round");
        pathElement.setAttribute("stroke-linejoin", "round");
        pathElement.setAttribute("data-word-id", wordID);

        pathElement.style.display = "display"

        svgViewBox.appendChild(pathElement);
        this.svgElement.highlightLine = pathElement;
    }

  // create the final state of the line for each word style
    createAnimationElements() {
      this.createAnimationElement("reading", {
        duration: 0.01,
        endColor: "#1A79C7",
        endStrokeWidth: 4,
        endStrokeOpacity: 1,
      });
  
      this.createAnimationElement("trouble", {
        duration: 0.25,
        endColor: "#F6E6F2",
        endStrokeWidth: 3,
        endStrokeOpacity: 1,
        sineWave: true,
      });
  
      this.createAnimationElement("checking", {
        duration: 0.25,
        endColor: "#E7F2FB",
        endStrokeWidth: 3,
        endStrokeOpacity: 1,
      });
  
      this.createAnimationElement("unread", {
        duration: 0.01,
        endColor: "#1A79C7",
        endStrokeWidth: 4,
        endStrokeOpacity: 0.0,
      });
  
      this.createAnimationElement("read", {
        duration: 0.1,
        endColor: "#1A79C7",
        endStrokeWidth: 2,
        endStrokeOpacity: 0.0,
      });
    }
  
    createAnimationElement(type, settings) {
      const { startX, endX, yCoordinate } = this.getWordProperties();
      const pathElement = this.svgElement.highlightLine;
  
      const pathStart = pathElement.getAttribute("d");
      let pathEnd = "";
  
      if (settings.sineWave) {
        const referenceLength = 48;
        const referenceFrequency = 5;
        const length = endX - startX;
        const frequency = (referenceFrequency * length) / referenceLength;
        const amplitude = 2;
        for (let x = startX; x < endX; x++) {
          const yEnd = yCoordinate + amplitude * Math.sin((2 * Math.PI * frequency * (x - startX)) / length);
          pathEnd += (x === startX ? "M" : "L") + x + "," + yEnd;
        }
      } else {
        for (let x = startX; x < endX; x++) {
          pathEnd += (x === startX ? "M" : "L") + x + "," + yCoordinate;
        }
      }
  
      const animateStyleElement = Word.createAnimateElement("d", pathStart, pathEnd, settings.duration);
      const animateStrokeWidthElement = Word.createAnimateElement("stroke-width", pathElement.getAttribute("stroke-width"), settings.endStrokeWidth, settings.duration);
      const animateColorElement = Word.createAnimateElement("stroke", pathElement.getAttribute("stroke"), settings.endColor, settings.duration);
      const animateOpacityElement = Word.createAnimateElement("stroke-opacity", pathElement.getAttribute("stroke-opacity"), settings.endStrokeOpacity, settings.duration);
  
      pathElement.appendChild(animateStyleElement);
      pathElement.appendChild(animateColorElement);
      pathElement.appendChild(animateStrokeWidthElement);
      pathElement.appendChild(animateOpacityElement);
  
      this.svgElement.animation[type].style = animateStyleElement;
      this.svgElement.animation[type].color = animateColorElement;
      this.svgElement.animation[type].width = animateStrokeWidthElement;
      this.svgElement.animation[type].opacity = animateOpacityElement;
    }

    hideLine() {
        /*  
        Hides the line
        */
        this.svgElement.highlightLine.style.display = "none";
    }

    showLine() {
        /*  
        Shows the line
        */
        this.svgElement.highlightLine.style.display = "display";

        
    }

    updateAnimationStartValues() {
        const { startX, endX, yCoordinate } = this.getWordProperties();
        const pathElement = this.svgElement.highlightLine;
        const pathStart = pathElement.getAttribute("d");
      
      
        for (const animationType in this.svgElement.animation) {
          this.svgElement.animation[animationType].style.setAttribute("from", pathStart);
          this.svgElement.animation[animationType].color.setAttribute("from", pathElement.getAttribute("stroke"));
          this.svgElement.animation[animationType].width.setAttribute("from", pathElement.getAttribute("stroke-width"));
          this.svgElement.animation[animationType].opacity.setAttribute("from", pathElement.getAttribute("stroke-opacity"));
        }
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