import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { useToast } from './Toast';
import { 
  isClipboardImage, 
  readClipboardImage, 
  blobToBase64, 
  createImageMarkdown,
  MAX_IMAGE_SIZE,
  formatFileSize,
  isValidImageType
} from '../utils/clipboardImage';

interface EditorProps {
  content: string;
  onChange: (value: string) => void;
}

export interface EditorHandle {
  insertAtCursor: (text: string) => void;
  focus: () => void;
}

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];

const isImageUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname.toLowerCase();
    return IMAGE_EXTENSIONS.some(ext => pathname.endsWith(ext)) || 
           parsedUrl.searchParams.get('format')?.startsWith('image/') ||
           parsedUrl.hostname.includes('unsplash') ||
           parsedUrl.hostname.includes('images.unsplash');
  } catch {
    return false;
  }
};

const Editor = forwardRef<EditorHandle, EditorProps>(({ content, onChange }, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { showToast } = useToast();

  useImperativeHandle(ref, () => ({
    focus: () => {
      textareaRef.current?.focus();
    },
    insertAtCursor: (text: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentVal = textarea.value;
      
      const newVal = 
        currentVal.substring(0, start) + 
        text + 
        currentVal.substring(end);
      
      onChange(newVal);

      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
      }, 0);
    }
  }));

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;
    
    const newVal = 
      currentVal.substring(0, start) + 
      text + 
      currentVal.substring(end);
    
    onChange(newVal);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
    }, 0);
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handlePaste = async (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text');
      
      if (text && isImageUrl(text)) {
        e.preventDefault();
        insertAtCursor(`\n![Image](${text})\n`);
        showToast('success', 'Image pasted');
        return;
      }

      if (isClipboardImage(e)) {
        e.preventDefault();
        
        const blob = await readClipboardImage(e);
        if (!blob) {
          showToast('error', 'Failed to read image');
          return;
        }

        if (blob.size > MAX_IMAGE_SIZE) {
          showToast('error', `Image too large (max ${formatFileSize(MAX_IMAGE_SIZE)})`);
          return;
        }

        if (!isValidImageType(blob.type)) {
          showToast('error', 'Invalid image type');
          return;
        }

        try {
          const base64 = await blobToBase64(blob);
          const mimeType = blob.type;
          const imageMarkdown = `\n![Image](${base64})\n`;
          insertAtCursor(imageMarkdown);
          showToast('success', 'Image pasted');
        } catch (error) {
          showToast('error', 'Failed to paste image');
        }
      }
    };

    textarea.addEventListener('paste', handlePaste);
    return () => textarea.removeEventListener('paste', handlePaste);
  }, [onChange, showToast]);

  return (
    <textarea
      ref={textareaRef}
      className="w-full h-full min-h-0 flex-1 bg-transparent text-[var(--text-body)] resize-none focus:outline-none font-body text-lg md:text-xl leading-[1.8] placeholder:text-[var(--text-muted)] placeholder:italic placeholder:opacity-40 scrollbar-thin"
      value={content}
      onChange={(e) => onChange(e.target.value)}
      spellCheck={false}
      placeholder="Start writing... Paste an image URL or copy-paste an image directly."
    />
  );
});

Editor.displayName = 'Editor';

export default Editor;
