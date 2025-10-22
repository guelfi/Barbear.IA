import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  element?: string;
  suggestion?: string;
}

export function AccessibilityChecker() {
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    const checkAccessibility = () => {
      const foundIssues: AccessibilityIssue[] = [];

      // Check for missing alt attributes on images
      const images = document.querySelectorAll('img:not([alt])');
      images.forEach((_img, index) => {
        foundIssues.push({
          type: 'error',
          message: `Imagem sem atributo alt`,
          element: `img[${index}]`,
          suggestion: 'Adicione um atributo alt descritivo para a imagem'
        });
      });

      // Check for buttons without accessible names
      const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
      buttons.forEach((button, index) => {
        if (!button.textContent?.trim()) {
          foundIssues.push({
            type: 'error',
            message: `Botão sem nome acessível`,
            element: `button[${index}]`,
            suggestion: 'Adicione aria-label ou texto visível ao botão'
          });
        }
      });

      // Check for low contrast (simplified check)
      const elements = document.querySelectorAll('*');
      elements.forEach((element, index) => {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        // Simple contrast check (this is a basic implementation)
        if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
          // This would need a proper contrast ratio calculation
          // For now, just check for common low contrast combinations
          if ((color.includes('rgb(128') || color.includes('rgb(169')) && 
              (backgroundColor.includes('rgb(255') || backgroundColor.includes('rgb(248'))) {
            foundIssues.push({
              type: 'warning',
              message: `Possível baixo contraste detectado`,
              element: `${element.tagName.toLowerCase()}[${index}]`,
              suggestion: 'Verifique se o contraste atende ao mínimo de 4.5:1'
            });
          }
        }
      });

      // Check for missing form labels
      const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
      inputs.forEach((input, index) => {
        const id = input.getAttribute('id');
        if (id) {
          const label = document.querySelector(`label[for="${id}"]`);
          if (!label) {
            foundIssues.push({
              type: 'error',
              message: `Input sem label associado`,
              element: `input[${index}]`,
              suggestion: 'Adicione um label com for="" ou aria-label'
            });
          }
        }
      });

      // Check for missing heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let lastLevel = 0;
      headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1));
        if (level > lastLevel + 1) {
          foundIssues.push({
            type: 'warning',
            message: `Hierarquia de cabeçalhos quebrada`,
            element: `${heading.tagName.toLowerCase()}[${index}]`,
            suggestion: 'Mantenha a sequência lógica dos cabeçalhos (h1 → h2 → h3...)'
          });
        }
        lastLevel = level;
      });

      // Check for keyboard navigation
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      focusableElements.forEach((element, index) => {
        if (element.getAttribute('tabindex') === '-1' && 
            !element.hasAttribute('aria-hidden')) {
          foundIssues.push({
            type: 'info',
            message: `Elemento removido da navegação por teclado`,
            element: `${element.tagName.toLowerCase()}[${index}]`,
            suggestion: 'Verifique se isso é intencional para a acessibilidade'
          });
        }
      });

      setIssues(foundIssues);
    };

    // Initial check
    setTimeout(checkAccessibility, 1000);

    // Check on DOM changes
    const observer = new MutationObserver(() => {
      setTimeout(checkAccessibility, 500);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });

    // Keyboard shortcut to toggle visibility
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setIsVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  if (process.env.NODE_ENV !== 'development' || !isVisible) {
    return null;
  }

  const errorCount = issues.filter(issue => issue.type === 'error').length;
  const warningCount = issues.filter(issue => issue.type === 'warning').length;
  const infoCount = issues.filter(issue => issue.type === 'info').length;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Verificador de Acessibilidade
            </CardTitle>
            <button
              onClick={() => setIsVisible(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Fechar verificador"
            >
              ×
            </button>
          </div>
          <CardDescription className="text-xs">
            Pressione Ctrl+Shift+A para alternar
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            {errorCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {errorCount} erros
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {warningCount} avisos
              </Badge>
            )}
            {infoCount > 0 && (
              <Badge variant="outline" className="text-xs">
                {infoCount} infos
              </Badge>
            )}
            {issues.length === 0 && (
              <Badge variant="default" className="text-xs bg-green-500">
                Nenhum problema encontrado
              </Badge>
            )}
          </div>

          {issues.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-2">
              {issues.slice(0, 5).map((issue, index) => (
                <div key={index} className="text-xs p-2 rounded border">
                  <div className="flex items-start gap-2">
                    {issue.type === 'error' && (
                      <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                    )}
                    {issue.type === 'warning' && (
                      <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                    )}
                    {issue.type === 'info' && (
                      <Info className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{issue.message}</p>
                      {issue.element && (
                        <p className="text-muted-foreground">{issue.element}</p>
                      )}
                      {issue.suggestion && (
                        <p className="text-green-600 dark:text-green-400 mt-1">
                          💡 {issue.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {issues.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{issues.length - 5} problemas adicionais
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}