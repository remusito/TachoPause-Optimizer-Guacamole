'use client';

import { useState } from 'react';
import { MainSidebar } from '@/components/main-sidebar';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/firebase/auth/provider';
import { useRouter } from 'next/navigation';
import { addLoad } from '@/app/loads/actions';
import { toast } from 'sonner';

export default function AddLoadPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [rate, setRate] = useState<number | ''>('');
  const [payout, setPayout] = useState<number | ''>('');
  const [distance, setDistance] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [status, setStatus] = useState('pending');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Debes iniciar sesión para agregar una carga.');
      return;
    }

    setIsSubmitting(true);
    toast.info("Guardando la carga...");

    try {
      await addLoad(user.uid, {
        origin,
        destination,
        pickupDate,
        deliveryDate,
        rate: Number(rate),
        payout: Number(payout),
        distance: Number(distance),
        weight: Number(weight),
        status,
        notes,
      });
      toast.success("Carga guardada exitosamente.");
      router.push('/loads');
    } catch (error) {
      console.error("Error al agregar la carga:", error);
      toast.error('No se pudo guardar la carga. Inténtalo de nuevo.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <MainSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 flex h-16 items-center border-b px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Icons.add className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold">Añadir Nueva Carga</h1>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Carga</CardTitle>
              <CardDescription>Rellena la información de la nueva carga.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-2">
                  <Label htmlFor="origin">Origen</Label>
                  <Input id="origin" value={origin} onChange={(e) => setOrigin(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination">Destino</Label>
                  <Input id="destination" value={destination} onChange={(e) => setDestination(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pickupDate">Fecha de Recogida</Label>
                  <Input id="pickupDate" type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Fecha de Entrega</Label>
                  <Input id="deliveryDate" type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate">Tarifa ($)</Label>
                  <Input id="rate" type="number" value={rate} onChange={(e) => setRate(e.target.value === '' ? '' : Number(e.target.value))} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payout">Pago ($)</Label>
                  <Input id="payout" type="number" value={payout} onChange={(e) => setPayout(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="distance">Distancia (millas)</Label>
                  <Input id="distance" type="number" value={distance} onChange={(e) => setDistance(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Peso (lbs)</Label>
                  <Input id="weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="in-transit">En Tránsito</SelectItem>
                      <SelectItem value="delivered">Entregada</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="notes">Notas Adicionales</Label>
                  <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Cualquier detalle importante sobre la carga..." />
                </div>

                <div className="md:col-span-2 flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <><Icons.spinner className="animate-spin h-4 w-4 mr-2" /> Guardando...</> : 'Guardar Carga'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
