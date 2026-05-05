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
 * Generate a quick, cheap hash from a base64 string for use as a cache key.
 * Uses a 100-char substring — good enough for demo / hackathon purposes.
 * @param {string} base64String
 * @returns {Promise<string>}
 */
export async function generateHash(base64String) {
  return base64String.substring(50, 150).replace(/[^a-zA-Z0-9]/g, '');
}
