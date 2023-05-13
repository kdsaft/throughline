// loader.js
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", thingsToLoad);
} else {
    thingsToLoad();
}


async function thingsToLoad() {
    // CSS files
    loadCSS('https://kdsaft.github.io/throughline/scripts/story.css');

    // JS file URLs
    const scriptUrls = [
        'https://cdn.jsdelivr.net/npm/microsoft-cognitiveservices-speech-sdk@latest/distrib/browser/microsoft.cognitiveservices.speech.sdk.bundle-min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.3/howler.min.js',
        'https://kdsaft.github.io/throughline/scripts/word.js',
        'https://kdsaft.github.io/throughline/scripts/reading.js',
        'https://kdsaft.github.io/throughline/scripts/visualizer.js',
        'https://kdsaft.github.io/throughline/scripts/listening.js',
        'https://kdsaft.github.io/throughline/scripts/sammy.js'
    ];

    try {
        // Await the loading of all JS files
        await Promise.all(scriptUrls.map(url => loadJS(url)));

        // Call init functions after all scripts are loaded
        initReading();
        initListening();
        initSammy();

    } catch (error) {
        console.error('Error loading scripts:', error);
    }
}



function loadCSS(url) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
}

function loadJS(url) {
    return new Promise((resolve, reject) => {
        var script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
    });
}
