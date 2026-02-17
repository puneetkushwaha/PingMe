import CryptoJS from "crypto-js";

// 🔐 Secret Key for Encryption
// In a production app, this should be unique per user/conversation and derived securely (e.g., Diffie-Hellman).
// For this feature MVP, we use a fixed app-level secret combined with dynamic salts if needed, 
// OR we can make it user-configurable. 
// To keep it simple and functional for now (as requested), we'll use a consistent key mechanism.
const SECRET_KEY = "pingme-super-secret-key-v1";

export const encryptMessage = (text) => {
    if (!text) return text;
    try {
        return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
    } catch (error) {
        console.error("Encryption Failed:", error);
        return text;
    }
};

export const decryptMessage = (cipherText) => {
    if (!cipherText) return cipherText;
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        // If decryption produces empty string (wrong key or invalid cipher), return original (fallback)
        return originalText || cipherText;
    } catch (error) {
        // console.error("Decryption Failed:", error);
        // Return original text if it wasn't encrypted (backward compatibility)
        return cipherText;
    }
};
