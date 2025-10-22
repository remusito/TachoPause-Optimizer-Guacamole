'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
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
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from 'lucide-react';

// Estructura del menú con grupos y submenús
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
    label: 'Teléfonos',
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
    label: 'Información',
    icon: Icons.BookOpen,
    items: [
      { href: '/tutorial', icon: Icons.BookOpen, label: 'Tutorial', premium: false },
      { href: '/regulations', icon: Icons.FileText, label: 'Reglamento', premium: false },
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
                <Button variant="ghost" className="flex items-center justify-start gap-2 w-full p-2 h-auto">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                        <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start truncate">
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
      )
    }
    return (
      <Button className="w-full" onClick={() => router.push('/login')}>
        <Icons.Login className="mr-2" />
        Iniciar Sesión
      </Button>
    );
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Icons.Truck className="h-6 w-6 text-primary" />
          <h1 className="text-lg sm:text-xl font-bold text-foreground">
            TachoPause {isPremium ? <span className='text-primary'>Premium</span> : <span className='text-sm font-normal'>Optimizer</span>}
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuStructure.map((item) => {
            // Si tiene items, es un grupo collapsible
            if ('items' in item && Array.isArray(item.items)) {
              const isOpen = openGroups.includes(item.label);
              const hasActiveChild = item.items.some(child => pathname === child.href);
              
              return (
                <Collapsible
                  key={item.label}
                  open={isOpen || hasActiveChild}
                  onOpenChange={() => toggleGroup(item.label)}
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <item.icon />
                        <span>{item.label}</span>
                        <ChevronDown className={`ml-auto transition-transform ${isOpen || hasActiveChild ? 'rotate-180' : ''}`} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.href}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === subItem.href}
                            >
                              <Link href={subItem.href}>
                                <subItem.icon />
                                <span>{subItem.label}</span>
                                {(subItem.premium && !isPremium) && <Icons.Premium className="ml-auto" />}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            }
            
            // Si no tiene items, es un link simple
            if ('href' in item && item.href) {
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                      {(item.premium && !isPremium) && <Icons.Premium className="ml-auto" />}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }
            
            return null;
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <div className="p-2">
           <AuthButton />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
