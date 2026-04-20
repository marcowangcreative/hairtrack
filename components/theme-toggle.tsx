'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const cur = document.documentElement.classList.contains('light')
      ? 'light'
      : 'dark';
    setTheme(cur);
  }, []);

  function toggle() {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    if (next === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    try {
      localStorage.setItem('ht.theme', next);
    } catch {
      // ignore storage errors (private browsing etc.)
    }
    setTheme(next);
  }

  // Avoid hydration mismatch — render a neutral spot until we read the DOM.
  if (theme == null) {
    return (
      <button
        className="btn ghost sm"
        style={{
          padding: '0 6px',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
        }}
        aria-label="Theme"
        disabled
      >
        …
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="btn ghost sm"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      style={{
        padding: '0 6px',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
      }}
    >
      {theme === 'light' ? (
        <svg
          width={12}
          height={12}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      ) : (
        <svg
          width={12}
          height={12}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      )}
    </button>
  );
}
