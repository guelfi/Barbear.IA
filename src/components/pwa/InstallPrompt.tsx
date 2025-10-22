import { useState } from 'react';
import { Download, X, Share, Smartphone } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AnimatedIcon } from '../ui/animated-icon';
import { usePWA } from '../../hooks/usePWA';

export function InstallPrompt() {
  const { showInstallPrompt, installApp, dismissInstallPrompt, shareApp, canShare } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);

  if (!showInstallPrompt) return null;

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await installApp();
    } finally {
      setIsInstalling(false);
    }
  };

  const handleShare = async () => {
    const shared = await shareApp();
    if (shared) {
      dismissInstallPrompt();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-300 lg:animate-in lg:slide-in-from-bottom-0 lg:fade-in">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <AnimatedIcon
                  icon={Smartphone}
                  animation="bounce"
                  category="interactive"
                  size="md"
                  intensity="medium"
                  className="text-primary"
                />
              </div>
              <div>
                <CardTitle className="text-lg">Instalar Barbear.IA</CardTitle>
                <CardDescription className="text-sm">
                  Acesse rapidamente como um app nativo
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissInstallPrompt}
              className="h-8 w-8 p-0"
              aria-label="Fechar prompt de instalação"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Benefícios do app:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                <span>Acesso rápido sem abrir o navegador</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                <span>Funciona offline para consultas</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                <span>Notificações de agendamentos</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                <span>Interface otimizada para mobile</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleInstall}
              disabled={isInstalling}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <AnimatedIcon
                icon={Download}
                animation={isInstalling ? "spin" : "bounce"}
                category="action"
                size="sm"
                intensity="medium"
                className="mr-2"
              />
              {isInstalling ? 'Instalando...' : 'Instalar App'}
            </Button>
            
            {canShare && (
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex-1 sm:flex-initial"
              >
                <Share className="mr-2 h-4 w-4" />
                Compartilhar
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Você pode instalar ou remover o app a qualquer momento
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
