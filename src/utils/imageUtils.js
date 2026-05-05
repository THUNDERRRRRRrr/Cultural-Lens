/**
 * Resizes and compresses an image file using Canvas.
 * Returns a Promise that resolves to the Base64 representation (without the data:image/jpeg;base64, prefix).
 * @param {File} file 
 * @param {number} maxSize 
 * @param {number} quality 
 * @returns {Promise<string>}
 */
export const compressImage = (file, maxSize = 1024, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Get base64 string
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Strip out the prefix
        const base64Data = dataUrl.split(',')[1];
        resolve(base64Data);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Generate a reliable hash from a base64 string using SHA-256 (Web Crypto API).
 * Falls back to a multi-sample substring approach if crypto is unavailable.
 * @param {string} base64String
 * @returns {Promise<string>}
 */
export async function generateHash(base64String) {
  try {
    // Use SHA-256 for a collision-free hash
    const encoder = new TextEncoder();
    const data = encoder.encode(base64String);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback: sample multiple parts of the string for uniqueness
    const len = base64String.length;
    const sample = [
      base64String.substring(0, 32),
      base64String.substring(Math.floor(len * 0.25), Math.floor(len * 0.25) + 32),
      base64String.substring(Math.floor(len * 0.5), Math.floor(len * 0.5) + 32),
      base64String.substring(Math.floor(len * 0.75), Math.floor(len * 0.75) + 32),
      base64String.substring(len - 32),
      String(len)
    ].join('');
    return sample.replace(/[^a-zA-Z0-9]/g, '');
  }
}
