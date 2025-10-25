import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('theme') as Theme;
        console.log('ThemeContext: Tema carregado do localStorage:', stored);
        if (stored && (stored === 'light' || stored === 'dark')) {
          setTheme(stored);
        } else {
          // Check system preference
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const systemTheme = prefersDark ? 'dark' : 'light';
          console.log('ThemeContext: Usando preferência do sistema:', systemTheme);
          setTheme(systemTheme);
        }
      } catch (error) {
        console.error('ThemeContext: Erro ao acessar localStorage:', error);
        // Fallback para tema claro
        setTheme('light');
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const root = window.document.documentElement;
    
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    try {
      localStorage.setItem('theme', theme);
      console.log('ThemeContext: Tema salvo no localStorage:', theme);
    } catch (error) {
      console.error('ThemeContext: Erro ao salvar tema no localStorage:', error);
    }
  }, [theme, mounted]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const value = useMemo(() => ({
    theme,
    toggleTheme,
    setTheme,
    mounted,
  }), [theme, toggleTheme, mounted]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}
