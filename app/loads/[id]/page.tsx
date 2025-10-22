'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/firebase';
import { useFirebase } from '@/firebase/provider';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MapPin, Phone, Radio, Clock, Package, Edit, Trash2, FileText, Map } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
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
  createdAt: any;
}

export default function LoadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [load, setLoad] = useState<Load | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!firestore || !params.id) return;

    const fetchLoad = async () => {
      try {
        const loadRef = doc(firestore, 'loads', params.id as string);
        const loadSnap = await getDoc(loadRef);

        if (loadSnap.exists()) {
          setLoad({ id: loadSnap.id, ...loadSnap.data() } as Load);
        } else {
          toast({
            title: 'No encontrado',
            description: 'La carga solicitada no existe.',
            variant: 'destructive',
          });
          router.push('/loads');
        }
      } catch (error) {
        console.error('Error fetching load:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar la información.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLoad();
  }, [firestore, params.id, router, toast]);

  const handleDelete = async () => {
    if (!firestore || !load || !user) return;

    setIsDeleting(true);
    try {
      const loadRef = doc(firestore, 'loads', load.id);
      await deleteDoc(loadRef);

      toast({
        title: '✅ Eliminado',
        description: 'La información se ha eliminado correctamente.',
      });

      router.push('/loads');
    } catch (error) {
      console.error('Error deleting load:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la información.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwner = user && load && user.uid === load.userId;

  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <header className="w-full p-4 sm:p-6 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/loads">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-lg sm:text-xl font-bold">Detalle de Carga</h1>
        </div>
      </header>

      <main className="flex-1 w-full p-4 sm:p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {loading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ) : load ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">{load.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      {load.material}
                    </CardDescription>
                  </div>
                  {isOwner && (
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/loads/edit/${load.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" disabled={isDeleting}>
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
                            <AlertDialogAction onClick={handleDelete}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Información de contacto</h3>
                  <div className="grid gap-4">
                    {load.location && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">Ubicación</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">{load.location}</p>
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
                                Abrir en Google Maps
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    {load.phone && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">Teléfono</p>
                          <a href={`tel:${load.phone}`} className="text-sm text-muted-foreground hover:text-primary">
                            {load.phone}
                          </a>
                        </div>
                      </div>
                    )}
                    {load.radioChannel && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Radio className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">Canal de Radio</p>
                          <p className="text-sm text-muted-foreground">{load.radioChannel}</p>
                        </div>
                      </div>
                    )}
                    {load.schedule && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">Horario</p>
                          <p className="text-sm text-muted-foreground">{load.schedule}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {load.notes && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Notas adicionales
                    </h3>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm whitespace-pre-wrap">{load.notes}</p>
                    </div>
                  </div>
                )}
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Agregado por: {load.createdBy}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </main>
    </div>
  );
}
