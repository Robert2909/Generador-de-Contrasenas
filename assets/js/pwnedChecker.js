/*
 * Pwned Checker Module
 * Verifies if a password has been exposed in data breaches using the HaveIBeenPwned API (k-anonymity model).
 * Does NOT send the full password, only the first 5 characters of its SHA-1 hash.
 */

const PwnedChecker = {
    /**
     * Checks a password against the Pwned Passwords database.
     * @param {string} password - The password to check.
     * @returns {Promise<number>} - The number of times the password has been seen in breaches. -1 if error.
     */
    async check(password) {
        if (!password) return 0;

        try {
            const hash = await this.sha1(password);
            const prefix = hash.substring(0, 5);
            const suffix = hash.substring(5).toUpperCase();

            const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
            if (!response.ok) throw new Error("API Error");

            const text = await response.text();
            const matches = text.split('\n');

            for (let line of matches) {
                const [lineSuffix, count] = line.split(':');
                if (lineSuffix.trim() === suffix) {
                    return parseInt(count, 10);
                }
            }

            return 0; // Not found
        } catch (e) {
            console.error("PwnedChecker Error:", e);
            return -1; // Error state
        }
    },

    /**
     * Helper to compute SHA-1 hash of a string.
     */
    async sha1(str) {
        const buffer = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-1', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    }
};
