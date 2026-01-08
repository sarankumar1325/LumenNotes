export const SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export const isClipboardImage = (event: ClipboardEvent): boolean => {
  if (!event.clipboardData) return false;
  
  const items = event.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.startsWith('image/')) {
      return true;
    }
  }
  return false;
};

export const readClipboardImage = async (event: ClipboardEvent): Promise<Blob | null> => {
  if (!event.clipboardData) return null;
  
  const items = event.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.startsWith('image/')) {
      const blob = item.getAsFile();
      return blob;
    }
  }
  return null;
};

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        resolve(reader.result as string);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const isValidImageType = (mimeType: string): boolean => {
  return SUPPORTED_IMAGE_TYPES.includes(mimeType);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export const createImageMarkdown = (base64String: string, mimeType: string): string => {
  return `![Image](${base64String})`;
};
