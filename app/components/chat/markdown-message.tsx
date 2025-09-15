"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

interface MarkdownMessageProps {
  content: string;
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  const normalized = React.useMemo(() => {
    if (!content) return "";
    // Normalize CRLF to LF and convert escaped newlines ("\\n") to real newlines
    return content.replace(/\r\n/g, "\n").replace(/\\n/g, "\n");
  }, [content]);
  return (
    <div className={`text-sm leading-relaxed max-w-none whitespace-pre-wrap break-words`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        // Do NOT enable rehypeRaw to avoid rendering raw HTML for safety
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-xl font-bold leading-tight mt-3 mb-2" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-lg font-semibold leading-tight mt-3 mb-2" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-base font-semibold leading-snug mt-3 mb-2" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="leading-relaxed my-2" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-6 my-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-6 my-2" {...props} />
          ),
          li: ({ node, ...props }) => <li className="my-0.5" {...props} />,
          a: ({ node, ...props }) => (
            <a className="underline underline-offset-2 hover:opacity-90" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-2 pl-4 italic opacity-90" {...props} />
          ),
          code: (props) => {
            const { inline, className, children, ...rest } = props as any;
            if (inline) {
              return (
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]" {...rest}>
                  {children}
                </code>
              );
            }
            return (
              <code className="block rounded bg-muted p-4 font-mono text-sm overflow-x-auto my-3" {...rest}>
                {children}
              </code>
            );
          },
          pre: ({ node, ...props }) => (
            <pre className="my-3" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-4 border-border" {...props} />
          )
        }}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
}
