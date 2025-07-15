import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'prismjs/themes/prism.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer = ({ content, className = '' }: MarkdownRendererProps) => {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg font-bold mb-2 text-current border-b border-gray-300 pb-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold mb-2 text-current">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold mb-1 text-current">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-medium mb-1 text-current">
              {children}
            </h4>
          ),
          
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 leading-relaxed">
              {children}
            </p>
          ),
          
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-2 space-y-0.5 pl-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-2 space-y-0.5 pl-2">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">
              {children}
            </li>
          ),
          
          code: ({ inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code 
                  className="bg-black/10 text-current px-1.5 py-0.5 rounded text-sm font-mono border"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            
            return (
              <code 
                className={`block bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto text-sm font-mono my-2 ${className || ''}`}
                {...props}
              >
                {children}
              </code>
            );
          },
          
          pre: ({ children }) => (
            <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto my-2 text-sm">
              {children}
            </pre>
          ),
          
          a: ({ href, children }) => (
            <a 
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 underline font-medium"
            >
              {children}
            </a>
          ),
          
          strong: ({ children }) => (
            <strong className="font-semibold text-current">
              {children}
            </strong>
          ),
          
          em: ({ children }) => (
            <em className="italic text-current">
              {children}
            </em>
          ),
          
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-gray-400 pl-3 py-1 my-2 italic text-current/80 bg-black/5 rounded-r">
              {children}
            </blockquote>
          ),
          
          table: ({ children }) => (
            <div className="overflow-x-auto my-2">
              <table className="min-w-full border border-gray-300 rounded text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-100">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-gray-200">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr>
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-1 text-left text-xs font-medium text-gray-600 uppercase border-b border-gray-300">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-1 text-sm text-current border-b border-gray-200">
              {children}
            </td>
          ),
          
          hr: () => (
            <hr className="my-3 border-gray-300" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer; 