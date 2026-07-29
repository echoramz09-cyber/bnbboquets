/**
 * Utility to process uploaded image files and compress them to base64 Data URLs
 * suitable for storing directly in Firebase Firestore documents.
 */

export function compressImageFile(
  file: File,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select a valid image file.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error('Failed to parse uploaded image file.'));
      img.src = e.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export function formatPrice(price: string | number): string {
  if (!price && price !== 0) return '₹0';
  let str = String(price).trim();
  if (!str) return '₹0';

  // Replace INR / Rs / Rs. with ₹
  str = str.replace(/INR\s*/gi, '₹').replace(/Rs\.?\s*/gi, '₹');

  // If no currency symbol is present, prepend ₹
  if (!str.includes('₹')) {
    str = `₹${str}`;
  }

  return str;
}
