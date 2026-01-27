import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
}

/**
 * CodeBlock component - Renders syntax-highlighted code with copy functionality
 * Displays code examples in tutorial steps with language-specific styling
 */
export function CodeBlock({
  code,
  language = 'typescript',
  title,
  showLineNumbers = true,
  maxHeight = '400px',
}: CodeBlockProps) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Silent fail - clipboard API might not be available
    }
  };

  const lines = code.split('\n');

  const languageColors: Record<string, { background: string; text: string }> = {
    typescript: { background: '#2d3748', text: '#3178c6' },
    javascript: { background: '#2d3748', text: '#f7df1e' },
    python: { background: '#2d3748', text: '#3776ab' },
    json: { background: '#2d3748', text: '#00d4aa' },
    bash: { background: '#2d3748', text: '#4eaa25' },
    sql: { background: '#2d3748', text: '#e38c00' },
  };

  const langColor = languageColors[language.toLowerCase()] || languageColors.typescript;

  return (
    <div
      style={{
        borderRadius: '0.75rem',
        border: `1px solid ${theme.border}`,
        backgroundColor: theme.card,
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          backgroundColor: theme.backgroundSecondary,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Language Badge */}
          <span
            style={{
              padding: '0.25rem 0.625rem',
              borderRadius: '0.375rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: langColor.background,
              color: langColor.text,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {language}
          </span>
          {title && (
            <span
              style={{
                fontSize: '0.875rem',
                color: theme.textSecondary,
                fontWeight: 500,
              }}
            >
              {title}
            </span>
          )}
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.375rem 0.75rem',
            borderRadius: '0.375rem',
            border: 'none',
            backgroundColor: copied ? '#10b98120' : theme.backgroundSecondary,
            color: copied ? '#10b981' : theme.textSecondary,
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!copied) {
              e.currentTarget.style.backgroundColor = theme.border;
            }
          }}
          onMouseLeave={(e) => {
            if (!copied) {
              e.currentTarget.style.backgroundColor = theme.backgroundSecondary;
            }
          }}
        >
          {copied ? (
            <>
              <Check style={{ width: '1rem', height: '1rem' }} />
              Copied
            </>
          ) : (
            <>
              <Copy style={{ width: '1rem', height: '1rem' }} />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div
        style={{
          overflowX: 'auto',
          overflowY: 'auto',
          maxHeight: maxHeight,
          backgroundColor: '#1e293b',
          padding: '1rem',
        }}
      >
        <pre
          style={{
            margin: 0,
            fontFamily: "'Fira Code', 'Courier New', monospace",
            fontSize: '0.875rem',
            lineHeight: '1.5',
            color: '#e2e8f0',
          }}
        >
          {lines.map((line, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                minHeight: '1.5rem',
              }}
            >
              {showLineNumbers && (
                <span
                  style={{
                    display: 'inline-block',
                    width: '3rem',
                    textAlign: 'right',
                    marginRight: '1rem',
                    color: '#64748b',
                    userSelect: 'none',
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </span>
              )}
              <code
                style={{
                  flex: 1,
                  whiteSpace: 'pre',
                  color: '#e2e8f0',
                }}
              >
                {line}
              </code>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

export default CodeBlock;
