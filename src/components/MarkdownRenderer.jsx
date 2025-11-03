import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from './CodeBlock';
import './MarkdownRenderer.css';

function MarkdownRenderer({ content }) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            return !inline && language ? (
              <CodeBlock language={language}>{children}</CodeBlock>
            ) : (
              <code className="inline-code" {...props}>
                {children}
              </code>
            );
          },
          p: ({ children }) => <p className="markdown-paragraph">{children}</p>,
          h1: ({ children }) => <h1 className="markdown-heading markdown-h1">{children}</h1>,
          h2: ({ children }) => <h2 className="markdown-heading markdown-h2">{children}</h2>,
          h3: ({ children }) => <h3 className="markdown-heading markdown-h3">{children}</h3>,
          ul: ({ children }) => <ul className="markdown-list">{children}</ul>,
          ol: ({ children }) => <ol className="markdown-list markdown-ordered">{children}</ol>,
          li: ({ children }) => <li className="markdown-list-item">{children}</li>,
          blockquote: ({ children }) => <blockquote className="markdown-blockquote">{children}</blockquote>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="markdown-link">
              {children}
            </a>
          ),
          table: ({ children }) => <table className="markdown-table">{children}</table>,
          thead: ({ children }) => <thead className="markdown-table-head">{children}</thead>,
          tbody: ({ children }) => <tbody className="markdown-table-body">{children}</tbody>,
          tr: ({ children }) => <tr className="markdown-table-row">{children}</tr>,
          th: ({ children }) => <th className="markdown-table-header">{children}</th>,
          td: ({ children }) => <td className="markdown-table-cell">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownRenderer;


