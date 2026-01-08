import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';

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

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text');
      
      if (text && isImageUrl(text)) {
        e.preventDefault();
        const imageMarkdown = `\n![Image](${text})\n`;
        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const currentVal = textarea.value;
          
          const newVal = 
            currentVal.substring(0, start) + 
            imageMarkdown + 
            currentVal.substring(end);
          
          onChange(newVal);

          setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = start + imageMarkdown.length;
          }, 0);
        }
      }
    };

    textarea.addEventListener('paste', handlePaste);
    return () => textarea.removeEventListener('paste', handlePaste);
  }, [onChange]);

  return (
    <textarea
      ref={textareaRef}
      className="w-full h-full min-h-0 flex-1 bg-transparent text-[var(--text-body)] resize-none focus:outline-none font-body text-lg md:text-xl leading-[1.8] placeholder:text-[var(--text-muted)] placeholder:italic placeholder:opacity-40 scrollbar-thin"
      value={content}
      onChange={(e) => onChange(e.target.value)}
      spellCheck={false}
      placeholder="Start writing... Paste an image URL to insert it."
    />
  );
});

Editor.displayName = 'Editor';

export default Editor;