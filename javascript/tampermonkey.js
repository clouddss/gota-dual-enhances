// ==UserScript==
// @name         Dual - Testing
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description
// @match        https://gota.io/web/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gota.io
// @grant        GM_webRequest
// @grant        GM_log
// @connect      localhost       // Or the domain where your files are hosted
// @connect      127.0.0.1     // Or the domain where your files are hosted
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // --- Block original Gota.io CSS ---
    const cssBlockPattern = '*://gota.io/web/style.css*'; // Match the base URL and ignore query params like version
    try {
        GM_webRequest(
            { url: cssBlockPattern, type: 'stylesheet' }, // Filter for stylesheets matching the pattern
            function(details) {
                console.log(`[DualEnhances] Blocking original Gota.io CSS: ${details.url}`);
                return { cancel: true }; // Block the request
            }
        );
        console.log(`[DualEnhances] WebRequest rule added to block: ${cssBlockPattern}`);
    } catch (e) {
        console.error("[DualEnhances] Failed to set up GM_webRequest for CSS blocking:", e);
        alert("Error: Failed to set up CSS blocking. The userscript might not work correctly. Check console for details.");
    }
    // --- End CSS Blocking ---

 Object.defineProperty(window, 'build', { configurable: true, writable: true, value: undefined });

    const REPLACEMENT_BASE_URL = 'http://localhost:5500'; // <-- Ensure trailing slash
    const ORIGINAL_SCRIPT_URL = 'gota.js?v=3.6.5';



    /** Injects a temporary script defining the 'version' variable. */
    function injectTemporaryVersion() {
        // Check if it already exists to prevent multiple injections
        if (document.getElementById('temp-version-script')) return;
        try {
            const versionScript = document.createElement('script');
            versionScript.id = 'temp-version-script';
            versionScript.textContent = 'var version = "3.6.5";'; // Match original script version if needed by replacement
            // Append as early as possible, but check for head/documentElement existence
            (document.head || document.documentElement).appendChild(versionScript);
            console.log("Temporary version script injected.");
        } catch (e) {
            // Log error but don't necessarily stop the script
            console.error("Error injecting temporary version script:", e);
        }
    }

    /** Replaces the original script with one loaded from the provided URL. */
    function replaceScript(scriptUrl) {
        if (!scriptUrl) {
            console.error("replaceScript called without a valid scriptUrl.");
            // Optionally inform the user more visibly
            alert("Error: Cannot load game script (invalid URL provided). Please contact support.");
            return;
        }
        // Clean up potential existing 'build' variable from previous runs or original script
        if (window.build) {
            try { delete window.build; } catch (e) { console.warn("Could not delete existing build variable:", e); }
        }


        console.log(`Attempting to load replacement script from: ${scriptUrl}`);
        const script = document.createElement('script');
        script.src = scriptUrl; // This should be the bootstrapper URL fetched from backend

        const cleanup = () => {
             // Only cleanup version script now, as token/decoder are not passed via window
             const tempVersionScript = document.getElementById('temp-version-script');
             if (tempVersionScript) {
                 try {
                    tempVersionScript.remove();
                    console.log("Temporary version script removed.");
                 } catch(e) { console.error("Error removing temp version script:", e); }
             }
        };

        script.onload = () => {
            console.log('Replacement script loaded successfully.');
            cleanup();
        };
        script.onerror = (error) => {
            console.error('Failed to load replacement script from:', scriptUrl, 'Error:', error);
            cleanup();
            alert('Error: Failed to load the necessary game script. Please check the script URL or contact support.');
        };
        // Append to head or body to execute
        (document.head || document.documentElement).appendChild(script);
    }

    /** Sets up a MutationObserver to remove the original script if added. */
    function setupObserver() {
         const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    // Check if the added node is a SCRIPT tag
                    if (node && node.tagName === 'SCRIPT') {
                        // Check if node.src exists AND is a string before calling .includes()
                        if (node.src && typeof node.src === 'string' && node.src.includes(ORIGINAL_SCRIPT_URL)) {
                            console.warn('MutationObserver: Detected and removing original script:', node.src);
                            try {
                                node.remove(); // Remove the script node
                            } catch(e) { console.error("Error removing script via observer:", e); }
                        }
                    }
                });
            });
        });
        // Observe the entire document for node additions/removals in the subtree
        try {
            observer.observe(document.documentElement, {
                 childList: true,
                 subtree: true
            });
            console.log("MutationObserver setup complete (at document-start).");
        } catch(e) {
            console.error("Failed to setup MutationObserver:", e);
        }
    }


    function injectCSS(url) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
}


    // --- Early Execution (@run-at document-start) ---
    setupObserver(); // Only setup observer early
    injectTemporaryVersion(); // Inject version script now DOM is ready


 async function test (url) {

     const response = await fetch(url);
     const newHTML = await response.text();
  // Disable drag and drop
  document.ondragstart = () => false;
  document.ondrop = () => false;
    // Replace body content
// Inject styles
injectCSS('http://localhost:5500/styles.css');
// injectCSS('http://localhost:5500/gota.css'); // Temporarily disable gota.css injection



   // Wrap the injected HTML in a container div
   document.getElementsByTagName('body')[0].innerHTML = `<div id="dual-enhances-wrapper">${newHTML}</div>`;

   // Inject the main game logic script first
   replaceScript("http://localhost:5500/dual.js")
   // Then inject the UI script
 }


 window.addEventListener('DOMContentLoaded', () => {
     test("http://localhost:5500/index.txt")

 });

})();


