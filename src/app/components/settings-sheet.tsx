'use client';

import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Icons } from '@/components/icons';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';
import { usePremium } from '@/hooks/use-premium';
import { useAchievements } from '@/hooks/use-achievements';
import { PayPalButton } from '@/app/components/paypal-button';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Mail } from 'lucide-react';

export function SettingsSheet() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { isPremium } = usePremium();
  const auth = useAuth();
  const user = auth?.user;
  const loading = auth?.loading;
  const router = useRouter();
  const { unlockAchievement } = useAchievements();
  const [activationCode, setActivationCode] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  
  const appVersion = '1.0.1-dev';

  const handleActivatePremium = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para activar premium.',
        variant: 'destructive',
      });
      return;
    }

    if (activationCode.trim().toUpperCase() !== 'DESMAYAO2025') {
      toast({
        title: 'Código incorrecto',
        description: 'El código de activación no es válido.',
        variant: 'destructive',
      });
      return;
    }

    setIsActivating(true);
    try {
      if (auth.purchasePremium) {
        await auth.purchasePremium();
      }
      
      toast({
        title: '🎉 ¡Premium activado!',
        description: 'Has desbloqueado todas las funciones premium.',
      });
      setActivationCode('');
    } catch (error) {
      console.error('Error activando premium:', error);
      toast({
        title: 'Error',
        description: 'No se pudo activar premium. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsActivating(false);
    }
  };

  const handleContact = () => {
    const email = 'tachopauseoptimizer@gmail.com';
    const subject = 'Contacto desde TachoPause Optimizer';
    const body = `Hola,

Me gustaría ponerme en contacto contigo sobre TachoPause Optimizer.

---
Usuario: ${user?.email || 'No autenticado'}
Versión: ${appVersion}`;

    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.location.href = mailtoLink;
    
    toast({
      title: 'Abriendo cliente de correo',
      description: 'Se abrirá tu aplicación de correo predeterminada.',
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: 'TachoPause Optimizer',
      text: '¡Ey! Echa un vistazo a esta app para optimizar los tiempos de descanso de los camioneros. ¡Es genial!',
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        unlockAchievement('sharer');
      } catch (err: any) {
        if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
          console.error('Error al compartir:', err);
           try {
            await navigator.clipboard.writeText(shareData.url);
            toast({
              title: 'Enlace copiado',
              description: '¡No se pudo compartir, pero se ha copiado el enlace al portapapeles!',
            });
            unlockAchievement('sharer');
          } catch (clipErr) {
            console.error('Error al copiar al portapapeles:', clipErr);
            toast({
              title: 'Error',
              description: 'No se pudo compartir ni copiar el enlace.',
              variant: 'destructive',
            });
          }
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: 'Enlace copiado',
          description: '¡El enlace a la aplicación se ha copiado a tu portapapeles!',
        });
        unlockAchievement('sharer');
      } catch (err) {
        console.error('Error al copiar al portapapeles:', err);
        toast({
          title: 'Error',
          description: 'No se pudo copiar el enlace.',
          variant: 'destructive',
        });
      }
    }
  };
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Icons.settings className="h-6 w-6" />
          <span className="sr-only">Abrir ajustes</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Ajustes</SheetTitle>
           {isPremium && (
            <SheetDescription className="text-primary font-bold">
              Modo Premium activado. ¡Gracias por tu apoyo!
            </SheetDescription>
          )}
        </SheetHeader>
        <div className="grid gap-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="theme-selector">
              Tema
            </Label>
            <Select
              defaultValue={theme}
              onValueChange={(value) => setTheme(value)}
            >
              <SelectTrigger id="theme-selector" className="w-full">
                <SelectValue placeholder="Seleccionar tema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Oscuro</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {!isPremium && (
            <>
              <div className="space-y-4 rounded-lg border p-4">
                <Label className='text-lg font-semibold flex items-center gap-2'>
                  <Icons.Award className='text-primary'/> Desbloquear Premium
                </Label>
                <p className="text-sm text-muted-foreground">
                  Consigue acceso a todas las funciones y apoya el desarrollo de la app con un único pago.
                </p>
                {user ? (
                  <PayPalButton />
                ) : (
                  <Button className='w-full' onClick={() => {
                    const trigger = document.querySelector('[data-radix-collection-item] > button');
                    if (trigger instanceof HTMLElement) {
                      trigger.click();
                    }
                    router.push('/login')
                  }}>
                    Iniciar Sesión para comprar
                  </Button>
                )}
              </div>

              {/* Código de activación secreto */}
              {user && (
                <div className="space-y-4 rounded-lg border border-dashed p-4">
                  <Label htmlFor="activation-code" className="text-sm font-medium">
                    Código de activación
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="activation-code"
                      type="text"
                      placeholder="Ingresa el código"
                      value={activationCode}
                      onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                      disabled={isActivating}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleActivatePremium} 
                      disabled={isActivating || !activationCode.trim()}
                      size="sm"
                    >
                      {isActivating ? 'Activando...' : 'Activar'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ¿Tienes un código de activación? Ingrésalo aquí.
                  </p>
                </div>
              )}
            </>
          )}

           <div className="space-y-2">
             <Label>Compartir</Label>
             <Button onClick={handleShare} className="w-full" variant="outline">
                <Icons.share className="mr-2" /> Compartir App
            </Button>
          </div>

          {/* Nueva sección de contacto */}
          <div className="space-y-2">
            <Label>Soporte y Contacto</Label>
            <Button onClick={handleContact} className="w-full" variant="outline">
              <Mail className="mr-2 h-4 w-4" /> Contactar por Email
            </Button>
          </div>
        </div>
        <SheetFooter>
          <div className="text-center text-xs text-muted-foreground w-full">
            Versión de la aplicación: {appVersion}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
