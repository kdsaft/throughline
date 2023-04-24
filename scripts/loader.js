// loader.js


function thingsToLoad() {
    // CSS files
    loadCSS('https://kdsaft.github.io/throughline/scripts/story.css');


    // JS files
    loadJS('https://kdsaft.github.io/throughline/scripts/reading.js');
    loadJS('https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.3/howler.min.js');
    loadJS('https://kdsaft.github.io/throughline/scripts/listening.js');
    loadJS('https://kdsaft.github.io/throughline/scripts/visualizer.js');
    loadJS('https://kdsaft.github.io/throughline/scripts/sammy.js');
}


if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", thingsToLoad);
} else {
    thingsToLoad();
}





function loadCSS(url) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
}

function loadJS(url) {
    var script = document.createElement('script');
    script.src = url;
    document.body.appendChild(script);
}

