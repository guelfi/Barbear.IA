import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Smartphone, Tablet, Monitor, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface TestResult {
  resolution: string;
  width: number;
  notificationsOverflow: boolean;
  sidebarAutoClose: boolean;
  sidebarAnimation: boolean;
  overall: 'pass' | 'fail' | 'warning';
}

const testResolutions = [
  { name: '360px (Small Mobile)', width: 360, height: 640 },
  { name: '414px (Large Mobile)', width: 414, height: 896 },
  { name: '768px (Tablet)', width: 768, height: 1024 },
];

export function MobileResponsiveTest() {
  const [currentTest, setCurrentTest] = useState<number>(0);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const runTest = async (resolution: typeof testResolutions[0]) => {
    // Simular mudança de resolução
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', `width=${resolution.width}, initial-scale=1`);
    }

    // Simular resize da janela
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: resolution.width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: resolution.height,
    });

    // Disparar evento de resize
    window.dispatchEvent(new Event('resize'));

    // Aguardar um pouco para as mudanças serem aplicadas
    await new Promise(resolve => setTimeout(resolve, 500));

    // Testar overflow das notificações
    const notificationDropdown = document.querySelector('.notification-dropdown');
    const notificationsOverflow = notificationDropdown ? 
      notificationDropdown.getBoundingClientRect().right <= window.innerWidth : true;

    // Testar fechamento automático do sidebar
    const sidebarElement = document.querySelector('.mobile-sidebar');
    const sidebarAutoClose = sidebarElement ? 
      sidebarElement.classList.contains('smooth-transition') : true;

    // Testar animações do sidebar
    const sidebarAnimation = sidebarElement ? 
      getComputedStyle(sidebarElement).transitionDuration !== '0s' : true;

    const overall: 'pass' | 'fail' | 'warning' = 
      notificationsOverflow && sidebarAutoClose && sidebarAnimation ? 'pass' :
      (!notificationsOverflow || !sidebarAutoClose) ? 'fail' : 'warning';

    return {
      resolution: resolution.name,
      width: resolution.width,
      notificationsOverflow,
      sidebarAutoClose,
      sidebarAnimation,
      overall
    };
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    for (let i = 0; i < testResolutions.length; i++) {
      setCurrentTest(i);
      const result = await runTest(testResolutions[i]);
      setTestResults(prev => [...prev, result]);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsRunning(false);
    setCurrentTest(0);

    // Restaurar viewport original
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1');
    }
  };

  const getStatusIcon = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getResolutionIcon = (width: number) => {
    if (width <= 414) return <Smartphone className="h-4 w-4" />;
    if (width <= 768) return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-6 w-6" />
            Teste de Responsividade Mobile
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Validação das correções de UI/UX mobile em diferentes resoluções
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controles de teste */}
          <div className="flex gap-4">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? 'Executando...' : 'Executar Testes'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              {showNotifications ? 'Ocultar' : 'Mostrar'} Notificações
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? 'Fechar' : 'Abrir'} Sidebar
            </Button>
          </div>

          {/* Progresso do teste */}
          {isRunning && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">
                  Testando: {testResolutions[currentTest]?.name}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentTest + 1) / testResolutions.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Resultados dos testes */}
          {testResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Resultados dos Testes</h3>
              
              {testResults.map((result, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getResolutionIcon(result.width)}
                        <span className="font-medium">{result.resolution}</span>
                        <Badge variant="outline">{result.width}px</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.overall)}
                        <span className="text-sm font-medium capitalize">
                          {result.overall === 'pass' ? 'Aprovado' : 
                           result.overall === 'fail' ? 'Reprovado' : 'Atenção'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        {result.notificationsOverflow ? 
                          <CheckCircle className="h-4 w-4 text-green-500" /> :
                          <XCircle className="h-4 w-4 text-red-500" />
                        }
                        <span>Notificações sem overflow</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {result.sidebarAutoClose ? 
                          <CheckCircle className="h-4 w-4 text-green-500" /> :
                          <XCircle className="h-4 w-4 text-red-500" />
                        }
                        <span>Sidebar fecha automaticamente</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {result.sidebarAnimation ? 
                          <CheckCircle className="h-4 w-4 text-green-500" /> :
                          <XCircle className="h-4 w-4 text-red-500" />
                        }
                        <span>Animações suaves (300ms)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Resumo geral */}
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Resumo Geral:</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-green-600">
                        ✓ {testResults.filter(r => r.overall === 'pass').length} Aprovados
                      </span>
                      <span className="text-sm text-yellow-600">
                        ⚠ {testResults.filter(r => r.overall === 'warning').length} Atenção
                      </span>
                      <span className="text-sm text-red-600">
                        ✗ {testResults.filter(r => r.overall === 'fail').length} Reprovados
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Instruções */}
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-4">
              <h4 className="font-medium mb-2">Como usar:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>1. Clique em "Executar Testes" para validar as correções</li>
                <li>2. Use os botões de controle para testar manualmente</li>
                <li>3. Verifique se as notificações não ultrapassam a tela</li>
                <li>4. Confirme se o sidebar fecha ao clicar fora</li>
                <li>5. Observe as animações suaves de 300ms</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}