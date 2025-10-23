'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/firebase';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { useFirebase } from '@/firebase/provider';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { MapPin, Phone, Radio, Clock, Package, Plus, Edit, Trash2, Map } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Load {
  id: string;
  name: string;
  material: string;
  radioChannel?: string;
  phone?: string;
  schedule?: string;
  location?: string;
  notes?: string;
  createdBy: string;
  userId: string;
  createdAt: string;
}

export default function LoadsPage() {
  const { user, loading: authLoading } = useAuth();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [loads, setLoads] = useState<Load[]>([]);
  const [filteredLoads, setFilteredLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!firestore) return;

    const fetchLoads = async () => {
      try {
        const loadsRef = collection(firestore, 'loads');
        const q = query(loadsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const loadsData: Load[] = [];
        querySnapshot.forEach((doc) => {
          loadsData.push({ id: doc.id, ...doc.data() } as Load);
        });
        
        setLoads(loadsData);
        setFilteredLoads(loadsData);
      } catch (error) {
        console.error('Error fetching loads:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar la lista de cargas.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLoads();
  }, [firestore, toast]);

  useEffect(() => {
    const filtered = loads.filter(load =>
      load.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLoads(filtered);
  }, [searchTerm, loads]);

  const handleDelete = async (loadId: string) => {
    if (!firestore || !user) return;
    try {
      await deleteDoc(doc(firestore, 'loads', loadId));
      setLoads(loads.filter((load) => load.id !== loadId));
      setFilteredLoads(filteredLoads.filter((load) => load.id !== loadId));
      toast({
        title: '✅ Eliminado',
        description: 'La carga se ha eliminado correctamente.',
      });
    } catch (error) {
      console.error('Error deleting load:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la carga.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <header className="w-full p-4 sm:p-6 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-lg sm:text-xl font-bold text-foreground">
            Mercancías
          </h1>
        </div>
      </header>

      <main className="flex-1 w-full p-4 sm:p-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="w-full sm:w-auto flex-1">
              <Input
                placeholder="Buscar por nombre, material o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            {user && (
              <Button asChild>
                <Link href="/loads/add">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Carga
                </Link>
              </Button>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Información de Puntos de Carga</CardTitle>
              <CardDescription>
                Encuentra información sobre canteras, puntos de carga y descarga. 
                {user ? ' Puedes agregar nuevos lugares y compartir información con otros conductores.' : ' Inicia sesión para agregar nuevos lugares.'}
              </CardDescription>
            </CardHeader>
          </Card>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : filteredLoads.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  {searchTerm ? 'No se encontraron resultados' : 'No hay cargas registradas'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Sé el primero en agregar información de un punto de carga'}
                </p>
                {user && !searchTerm && (
                  <Button asChild>
                    <Link href="/loads/add">
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Primera Carga
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredLoads.map((load) => (
                <Card key={load.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">{load.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          {load.material}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/loads/${load.id}`}>
                            Ver detalles
                          </Link>
                        </Button>
                        {user && load.userId === user.uid && (
                          <>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/loads/edit/${load.id}`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se eliminará permanentemente la información de esta carga.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(load.id)}>
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="grid sm:grid-cols-2 gap-3 text-sm">
                    {load.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{load.location}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(load.location)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Map className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    )}
                    {load.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>{load.phone}</span>
                      </div>
                    )}
                    {load.radioChannel && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Radio className="h-4 w-4 flex-shrink-0" />
                        <span>Canal {load.radioChannel}</span>
                      </div>
                    )}
                    {load.schedule && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span>{load.schedule}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!user && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-center text-muted-foreground mb-4">
                  Inicia sesión para agregar información de puntos de carga
                </p>
                <Button asChild>
                  <Link href="/login">Iniciar Sesión</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
