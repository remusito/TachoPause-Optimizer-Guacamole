'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { AppLayout } from '@/components/app-layout';
import { Wrench, RotateCw, Truck } from 'lucide-react';

// Define the type for a single maintenance item
type MaintenanceItem = {
  id: string;
  label: string;
  checked: boolean;
  lastChecked: string; // Date string
  notes: string;
};

// Initial state for the maintenance checklist
const initialMaintenanceItems: MaintenanceItem[] = [
  { id: 'tires', label: 'Presión y Desgaste de Neumáticos', checked: false, lastChecked: '', notes: '' },
  { id: 'oil', label: 'Nivel de Aceite del Motor', checked: false, lastChecked: '', notes: '' },
  { id: 'brakes', label: 'Líquido y Desgaste de Frenos', checked: false, lastChecked: '', notes: '' },
  { id: 'lights', label: 'Funcionamiento de Luces y Señales', checked: false, lastChecked: '', notes: '' },
  { id: 'fluids', label: 'Niveles de Refrigerante y Limpiaparabrisas', checked: false, lastChecked: '', notes: '' },
  { id: 'fifth_wheel', label: 'Engrase de la Quinta Rueda', checked: false, lastChecked: '', notes: '' },
  { id: 'tacho', label: 'Revisión del Tacógrafo', checked: false, lastChecked: '', notes: '' },
  { id: 'docs', label: 'Documentación del Vehículo y Carga', checked: false, lastChecked: '', notes: '' },
];

export default function MaintenancePage() {
  const [vehicleId, setVehicleId] = useState('');
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([]);
  const { toast } = useToast();

  // Load state from localStorage when the component mounts
  useEffect(() => {
    const savedVehicleId = localStorage.getItem('maintenance_vehicleId');
    const savedItems = localStorage.getItem('maintenance_items');
    if (savedVehicleId) {
      setVehicleId(savedVehicleId);
    }
    if (savedItems) {
      setMaintenanceItems(JSON.parse(savedItems));
    } else {
      setMaintenanceItems(initialMaintenanceItems);
    }
  }, []);

  // Function to save the current state to localStorage
  const saveData = () => {
    localStorage.setItem('maintenance_vehicleId', vehicleId);
    localStorage.setItem('maintenance_items', JSON.stringify(maintenanceItems));
    toast({
      title: '✅ Guardado',
      description: 'El estado de mantenimiento se ha guardado localmente.',
    });
  };
  
  const handleItemChange = (id: string, field: keyof MaintenanceItem, value: any) => {
    setMaintenanceItems(
      maintenanceItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const resetAll = () => {
    setVehicleId('');
    setMaintenanceItems(initialMaintenanceItems.map(item => ({...item, checked: false, lastChecked: '', notes: ''})));
    localStorage.removeItem('maintenance_vehicleId');
    localStorage.removeItem('maintenance_items');
    toast({
      title: '🔄 Restablecido',
      description: 'Se ha limpiado toda la lista de mantenimiento.',
      variant: 'destructive',
    });
  };

  return (
    <AppLayout title="Mantenimiento Preventivo">
      <div className="w-full max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-6 w-6 text-primary" />
              <span>Registro de Mantenimiento del Vehículo</span>
            </CardTitle>
            <CardDescription>
              Usa esta lista para llevar un control de las revisiones pre-viaje. Los datos se guardan en tu dispositivo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle-id">Matrícula del Camión</Label>
                <Input 
                  id="vehicle-id" 
                  placeholder="Ej: 1234-ABC" 
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-6 w-6 text-primary" />
              <span>Gestión de Neumáticos</span>
            </CardTitle>
            <CardDescription>
              Accede a la sección para registrar el kilometraje, rotaciones y cambios de cada neumático.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/maintenance/tires" passHref>
              <Button>Gestionar Neumáticos</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Verificación</CardTitle>
            <CardDescription>
              Marca cada punto, anota la fecha de revisión y cualquier observación relevante.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {maintenanceItems.map(item => (
              <div key={item.id} className="p-4 border rounded-lg bg-muted/50 space-y-4">
                <div className="flex items-start gap-4">
                  <Checkbox 
                    id={item.id} 
                    checked={item.checked}
                    onCheckedChange={(checked) => handleItemChange(item.id, 'checked', checked)}
                    className="mt-1"
                  />
                  <div className="flex-1 grid gap-2">
                    <Label htmlFor={item.id} className="text-base font-medium">
                      {item.label}
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor={`date-${item.id}`} className="text-sm">Última Revisión</Label>
                            <Input
                                type="date"
                                id={`date-${item.id}`}
                                value={item.lastChecked}
                                onChange={(e) => handleItemChange(item.id, 'lastChecked', e.target.value)}
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor={`notes-${item.id}`} className="text-sm">Notas</Label>
                            <Input
                                id={`notes-${item.id}`}
                                placeholder="Ej: OK, cambiar en 5000km..."
                                value={item.notes}
                                onChange={(e) => handleItemChange(item.id, 'notes', e.target.value)}
                            />
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Button onClick={saveData} className="flex-1">
            <Wrench className="mr-2 h-4 w-4" /> Guardar Progreso
          </Button>
          <Button onClick={resetAll} variant="destructive" className="flex-1">
            <RotateCw className="mr-2 h-4 w-4" /> Restablecer Lista
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
