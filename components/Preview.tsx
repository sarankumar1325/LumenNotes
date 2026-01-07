import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import mermaid from 'mermaid';
import { Layers } from 'lucide-react';

interface PreviewProps {
  content: string;
}

// Initialize Mermaid with a clean, monochrome theme
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  fontFamily: '"Work Sans", sans-serif',
  themeVariables: {
    fontFamily: '"Work Sans", sans-serif',
    primaryColor: '#F5F5F4',
    primaryTextColor: '#292524',
    primaryBorderColor: '#78716C',
    lineColor: '#57534E',
    secondaryColor: '#FFFFFF',
    tertiaryColor: '#FFFFFF',
  }
});

const MermaidBlock = ({ code }: { code: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const renderChart = async () => {
      if (ref.current) {
        try {
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, code);
          setSvg(svg);
          setError(false);
        } catch (error) {
          console.error("Mermaid Render Error", error);
          setError(true);
        }
      }
    };
    renderChart();
  }, [code]);

  if (error) return (
    <div className="p-4 border border-red-200 bg-red-50 text-red-800 text-sm font-ui rounded mb-6">
      Unable to render diagram. Check syntax.
    </div>
  );

  return (
    <figure className="my-10 flex flex-col items-center">
      <div 
        className="p-6 md:p-10 bg-white border border-[var(--border-subtle)] rounded-sm shadow-sm w-full flex justify-center overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: svg }} 
        ref={ref}
      />
      <figcaption className="mt-3 text-xs font-ui text-[var(--text-muted)] tracking-wider uppercase flex items-center gap-1.5">
        <Layers size={12} />
        Structural Diagram
      </figcaption>
    </figure>
  );
};

const CodeBlock = ({ children, className, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || '');
  const lang = match ? match[1] : '';
  const codeContent = String(children).replace(/\n$/, '');

  if (lang === 'mermaid') {
    return <MermaidBlock code={codeContent} />;
  }

  // Inline Code
  if (!match) {
    return (
      <code className="bg-[#F5F5F4] text-[var(--text-body)] px-1.5 py-0.5 rounded text-[0.85em] font-mono border border-[var(--border-subtle)]" {...props}>
        {children}
      </code>
    );
  }

  // Block Code
  return (
    <div className="my-8 rounded-sm overflow-hidden border border-[var(--border-subtle)] bg-[#F5F5F4]">
      <div className="px-4 py-1.5 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[#E7E5E4]/30">
        <span className="text-[10px] font-ui uppercase tracking-widest text-[var(--text-muted)]">{lang || 'Code'}</span>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code className={`language-${lang} font-mono text-[var(--text-body)]`} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
};

const Preview: React.FC<PreviewProps> = ({ content }) => {
  return (
    <article className="prose prose-stone prose-lg md:prose-xl max-w-none 
      prose-headings:font-body prose-headings:font-semibold prose-headings:text-[var(--text-body)]
      prose-h1:text-4xl prose-h1:mb-8
      prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:font-medium prose-h2:tracking-tight
      prose-p:text-[var(--text-body)] prose-p:leading-[1.8] prose-p:font-light
      prose-a:text-[var(--accent)] prose-a:no-underline prose-a:border-b prose-a:border-[var(--accent)]/30 hover:prose-a:border-[var(--accent)] prose-a:transition-colors
      prose-strong:font-semibold prose-strong:text-[var(--text-body)]
      prose-blockquote:border-l-2 prose-blockquote:border-[var(--accent)] prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-[var(--text-muted)] prose-blockquote:font-body
      prose-ul:list-disc prose-ul:pl-6 prose-li:marker:text-[var(--text-muted)]
      prose-img:rounded-sm prose-img:shadow-sm
    ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code: CodeBlock,
          // Custom renderers to strip extra margin if needed or add classes
          p: ({node, ...props}) => <p className="mb-6" {...props} />,
          hr: ({node, ...props}) => <hr className="my-12 border-t border-[var(--border-subtle)] w-1/3 mx-auto" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
};

export default Preview;