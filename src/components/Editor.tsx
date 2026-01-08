import React, { useRef, useImperativeHandle, forwardRef } from 'react';

interface EditorProps {
  content: string;
  onChange: (value: string) => void;
}

export interface EditorHandle {
  insertAtCursor: (text: string) => void;
  focus: () => void;
}

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

  return (
    <textarea
      ref={textareaRef}
      className="w-full h-full min-h-0 flex-1 bg-transparent text-[var(--text-body)] resize-none focus:outline-none font-body text-lg md:text-xl leading-[1.8] placeholder:text-[var(--text-muted)] placeholder:italic placeholder:opacity-40 scrollbar-thin"
      value={content}
      onChange={(e) => onChange(e.target.value)}
      spellCheck={false}
      placeholder="Start writing..."
    />
  );
});

Editor.displayName = 'Editor';

export default Editor;