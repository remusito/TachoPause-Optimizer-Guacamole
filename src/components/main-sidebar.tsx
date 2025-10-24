'use client';

import { Icons } from '@/components/icons';
import { useAuth } from '@/firebase';
import { usePremium } from '@/hooks/use-premium';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from 'lucide-react';

const menuStructure = [
  { 
    href: '/', 
    icon: Icons.Play, 
    label: 'Temporizador',
    premium: false 
  },
  {
    label: 'Vehículo',
    icon: Icons.Truck,
    items: [
      { href: '/speedometer', icon: Icons.Speedometer, label: 'Velocímetro GPS', premium: false },
      { href: '/maintenance', icon: Icons.Wrench, label: 'Mantenimiento', premium: true },
    ]
  },
  {
    label: 'Rutas',
    icon: Icons.Route,
    items: [
      { href: '/route-calculator', icon: Icons.Calculator, label: 'Calculadora', premium: true },
      { href: '/route-optimizer', icon: Icons.MapPin, label: 'Buscador de Paradas', premium: true },
    ]
  },
  {
    href: '/loads', 
    icon: Icons.Package, 
    label: 'Mercancías',
    premium: false
  },
  {
    href: '/telephones', 
    icon: Icons.Phone, 
    label: 'Contactos',
    premium: true
  },
  {
    label: 'Mis Datos',
    icon: Icons.BarChart,
    items: [
      { href: '/history', icon: Icons.History, label: 'Historial', premium: false },
      { href: '/stats', icon: Icons.BarChart, label: 'Estadísticas', premium: false },
    ]
  },
  {
    label: 'Guías y Reglamento',
    icon: Icons.BookOpen,
    items: [
      // { href: '/tutorial', icon: Icons.BookOpen, label: 'Guía de Uso', premium: false },
      { href: '/regulations', icon: Icons.FileText, label: 'Reglamento', premium: false },
    ]
  },
  {
    label: "Información Legal",
    icon: Icons.FileText,
    items: [
        { href: '/privacy-policy', icon: Icons.FileText, label: 'Política de Privacidad', premium: false },
        { href: '/terms-of-service', icon: Icons.FileText, label: 'Términos de Uso', premium: false },
    ]
  },
  { 
    href: '/rewards', 
    icon: Icons.Award, 
    label: 'Recompensas',
    premium: false 
  },
];

export function MainSidebar() {
  const { isPremium } = usePremium();
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => 
      prev.includes(label) 
        ? prev.filter(g => g !== label)
        : [...prev, label]
    );
  };

  const AuthButton = () => {
    if (loading) {
      return <Skeleton className="h-10 w-full" />;
    }
    if (user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center justify-start gap-3 w-full p-2 h-auto">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start truncate min-w-0">
                <span className="font-medium text-sm truncate">{user.displayName || user.email}</span>
                {user.displayName && <span className="text-xs text-muted-foreground truncate">{user.email}</span>}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium leading-none truncate">{user.displayName || user.email}</p>
              {user.displayName && <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={async (e) => {
                e.preventDefault();
                try {
                  await signOut();
                  router.push('/login');
                } catch (error) {
                  console.error('Error al cerrar sesión:', error);
                }
              }}
              className="cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    return (
      <Button className="w-full" onClick={() => router.push('/login')}>
        <Icons.Login className="mr-2" />
        Iniciar Sesión
      </Button>
    );
  };

  return (
    <nav className="h-full w-64 bg-background border-r flex flex-col">
      <div className="flex items-center gap-2 p-4 border-b">
        <Icons.Truck className="h-6 w-6 text-primary" />
        <h1 className="text-lg sm:text-xl font-bold text-foreground">
          TachoPause
        </h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2 p-4">
          {menuStructure.map((item) => {
            if ('items' in item && Array.isArray(item.items)) {
              const isOpen = openGroups.includes(item.label);
              const hasActiveChild = item.items.some(child => pathname === child.href);
              
              return (
                <Collapsible
                  key={item.label}
                  open={isOpen || hasActiveChild}
                  onOpenChange={() => toggleGroup(item.label)}
                  className="w-full"
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start gap-3 px-3 py-2">
                      <item.icon className="h-5 w-5" />
                      <span className="flex-1 text-left truncate min-w-0">{item.label}</span>
                      <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${isOpen || hasActiveChild ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-6 space-y-2 py-2">
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm ${
                          pathname === subItem.href
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <subItem.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1 truncate min-w-0">{subItem.label}</span>
                        {(subItem.premium && !isPremium) && <Icons.Premium className="ml-auto h-4 w-4" />}
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            }
            
            if ('href' in item && item.href) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm ${
                    pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1 truncate min-w-0">{item.label}</span>
                  {(item.premium && !isPremium) && <Icons.Premium className="ml-auto h-4 w-4" />}
                </Link>
              );
            }
            
            return null;
          })}
        </div>
      </div>
      <div className="border-t mt-auto p-2">
        <AuthButton />
      </div>
    </nav>
  );
}
