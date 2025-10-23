'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/firebase';
import { useFirebase } from '@/firebase/provider';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Radio, Clock, Package, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

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

export default function EditLoadPage() {
  const { user, loading: authLoading } = useAuth();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const loadId = params.id as string;

  const [load, setLoad] = useState<Load | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    material: '',
    radioChannel: '',
    phone: '',
    schedule: '',
    location: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firestore || !loadId) return;

    const fetchLoad = async () => {
      try {
        const loadDoc = await getDoc(doc(firestore, 'loads', loadId));
        if (loadDoc.exists()) {
          const data = loadDoc.data() as Load;
          if (data.userId !== user?.uid) {
            setError('No tienes permiso para editar esta carga');
            return;
          }
          setLoad({ ...data, id: loadDoc.id } as Load);
          setFormData({
            name: data.name || '',
            material: data.material || '',
            radioChannel: data.radioChannel || '',
            phone: data.phone || '',
            schedule: data.schedule || '',
            location: data.location || '',
            notes: data.notes || '',
          });
        } else {
          setError('Carga no encontrada');
        }
      } catch (err) {
        setError('Error al cargar los datos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchLoad();
  }, [firestore, loadId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !loadId || !user) return;

    try {
      await updateDoc(doc(firestore, 'loads', loadId), {
        ...formData,
        updatedAt: new Date().toISOString(),
      });
      toast({
        title: '✅ Actualizado',
        description: 'La carga se ha actualizado correctamente.',
      });
      router.push(`/loads/${loadId}`);
    } catch (error) {
      console.error('Error updating load:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la carga.',
        variant: 'destructive',
      });
    }
  };

  if (authLoading || loading) {
    return <div className="flex flex-col min-h-dvh p-4 sm:p-6">Cargando...</div>;
  }

  if (!user) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground mb-4">Inicia sesión para editar cargas</p>
          <Button asChild>
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-dvh p-4 sm:p-6">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="py-8 text-center">
            <p className="text-red-500">{error}</p>
            <Button asChild className="mt-4">
              <Link href="/loads">Volver a la lista</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh p-4 sm:p-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Editar Carga</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Material</label>
              <Input
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Ubicación</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Teléfono</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Canal de Radio</label>
              <Input
                value={formData.radioChannel}
                onChange={(e) => setFormData({ ...formData, radioChannel: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Horario</label>
              <Input
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Notas</label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Guardar Cambios</Button>
              <Button variant="outline" asChild>
                <Link href={`/loads/${loadId}`}>Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
