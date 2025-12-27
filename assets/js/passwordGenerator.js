/*
 * Password Generator Logic
 * Handles both character-based and passphrase generation (XKCD style)
 */

function generatePassword(options) {
    if (options.mode === "phrase") {
        return generatePassphrase(options);
    } else {
        return generateCharPassword(options);
    }
}

function generateCharPassword(options) {
    const { length, useLower, useUpper, useNumbers, useSymbols } = options;

    let charset = "";
    if (useLower) charset += "abcdefghijklmnopqrstuvwxyz";
    if (useUpper) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (useNumbers) charset += "0123456789";
    if (useSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    // Fallback if nothing selected (should be prevented by UI, but safety first)
    if (charset === "") charset = "abcdefghijklmnopqrstuvwxyz";

    let password = "";
    const cryptoObj = window.crypto || window.msCrypto;

    // Ensure strict inclusion rules if requested (at least one of each selected type)
    // We build a guaranteed pool first
    let guaranteed = "";
    if (useLower) guaranteed += "abcdefghijklmnopqrstuvwxyz".charAt(Math.floor(Math.random() * 26));
    if (useUpper) guaranteed += "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(Math.floor(Math.random() * 26));
    if (useNumbers) guaranteed += "0123456789".charAt(Math.floor(Math.random() * 10));
    if (useSymbols) guaranteed += "!@#$%^&*()_+-=[]{}|;:,.<>?".charAt(Math.floor(Math.random() * 26));

    // Fill the rest
    const remainingLength = length - guaranteed.length;
    if (remainingLength > 0) {
        const randomValues = new Uint32Array(remainingLength);
        cryptoObj.getRandomValues(randomValues);

        for (let i = 0; i < remainingLength; i++) {
            password += charset[randomValues[i] % charset.length];
        }
    }

    // Combine and shuffle
    password += guaranteed;
    return shuffleString(password);
}

function generatePassphrase(options) {
    // Extract options matching the flat structure sent by main.js
    const wordCount = options.wordCount || 5;
    const separator = options.separator !== undefined ? options.separator : '-';
    const capitalize = !!options.capitalize;
    const includeNumber = !!options.includeNumber;

    // WORD_LIST should be loaded globally from wordlist.js
    // Fallback list if missing
    const list = (typeof WORD_LIST !== 'undefined') ? WORD_LIST : ["correct", "horse", "battery", "staple", "security", "privacy", "web", "crypto"];

    const words = [];
    const cryptoObj = window.crypto || window.msCrypto;
    const randomValues = new Uint32Array(wordCount);
    cryptoObj.getRandomValues(randomValues);

    for (let i = 0; i < wordCount; i++) {
        const index = randomValues[i] % list.length;
        let word = list[index];

        if (capitalize) {
            word = word.charAt(0).toUpperCase() + word.slice(1);
        }

        words.push(word);
    }

    if (includeNumber) {
        // Append a random number (0-99) to a random word in the phrase
        const num = Math.floor(Math.random() * 100); 
        // Use crypto for index selection to ensure uniform distribution
        const randIndex = cryptoObj.getRandomValues(new Uint32Array(1))[0] % wordCount;
        words[randIndex] += num;
    }

    return words.join(separator);
}

function shuffleString(str) {
    const arr = str.split('');
    const cryptoObj = window.crypto || window.msCrypto;

    for (let i = arr.length - 1; i > 0; i--) {
        const j = cryptoObj.getRandomValues(new Uint32Array(1))[0] % (i + 1);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr.join('');
}
