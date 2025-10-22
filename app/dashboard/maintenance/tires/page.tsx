'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { AppLayout } from '@/components/app-layout';
import { Truck, Wrench, FilePlus, RotateCw } from 'lucide-react';
import { Tire } from './types';
import { EditTireModal } from './components/edit-tire-modal';
import { AddReviewModal } from './components/add-review-modal';
import { RotateTiresModal } from './components/rotate-tires-modal';

// --- Tire Status Logic ---
const getTireStatus = (tire: Omit<Tire, 'status'>): 'good' | 'warning' | 'alert' => {
  const km = tire.currentKm - tire.installKm;
  if (km > 100000) return 'alert';
  if (km > 80000) return 'warning';
  return 'good';
};

const initialTiresData: Omit<Tire, 'status'>[] = [
  // Tractor
  { id: 'dir-izq', position: 'Dirección Izquierda', tireId: 'T-001', installKm: 10000, currentKm: 105000, lastRotationDate: '2024-01-15' },
  { id: 'dir-der', position: 'Dirección Derecha', tireId: 'T-002', installKm: 10000, currentKm: 105000, lastRotationDate: '2024-01-15' },
  { id: 'dif-izq-ext', position: 'Diferencial Izq. Exterior', tireId: 'T-003', installKm: 95000, currentKm: 105000, lastRotationDate: '2024-01-15' },
  { id: 'dif-izq-int', position: 'Diferencial Izq. Interior', tireId: 'T-004', installKm: 95000, currentKm: 105000, lastRotationDate: '2024-01-15' },
  { id: 'dif-der-ext', position: 'Diferencial Der. Exterior', tireId: 'T-005', installKm: 110000, currentKm: 125000, lastRotationDate: '2024-01-15' },
  { id: 'dif-der-int', position: 'Diferencial Der. Interior', tireId: 'T-006', installKm: 110000, currentKm: 125000, lastRotationDate: '2024-01-15' },
  // Trailer
  { id: 'eje1-izq', position: '1er Eje Izquierda', tireId: 'T-007', installKm: 40000, currentKm: 105000, lastRotationDate: '2024-02-01' },
  { id: 'eje1-der', position: '1er Eje Derecha', tireId: 'T-008', installKm: 40000, currentKm: 105000, lastRotationDate: '2024-02-01' },
  { id: 'eje2-izq', position: '2º Eje Izquierda', tireId: 'T-009', installKm: 82000, currentKm: 105000, lastRotationDate: '2024-02-01' },
  { id: 'eje2-der', position: '2º Eje Derecha', tireId: 'T-010', installKm: 82000, currentKm: 105000, lastRotationDate: '2024-02-01' },
  { id: 'eje3-izq', position: '3er Eje Izquierda', tireId: 'T-011', installKm: 101000, currentKm: 105000, lastRotationDate: '2024-02-01' },
  { id: 'eje3-der', position: '3er Eje Derecha', tireId: 'T-012', installKm: 101000, currentKm: 105000, lastRotationDate: '2024-02-01' },
];

const getInitialTires = (): Tire[] => initialTiresData.map(t => ({ ...t, status: getTireStatus(t) }));

// --- Components ---
const TruckSchema = ({ tires, onTireClick }: { tires: Tire[], onTireClick: (tire: Tire) => void }) => {
    const getTireById = (id: string) => tires.find(t => t.id === id);

    const statusColors = {
        good: 'bg-green-500',
        warning: 'bg-yellow-500',
        alert: 'bg-red-500',
    };

    const TireCircle = ({ id, label }: { id: string, label: string }) => {
        const tire = getTireById(id);
        if (!tire) return null;

        return (
            <div 
                className="flex flex-col items-center gap-1 cursor-pointer group"
                onClick={() => onTireClick(tire)}
            >
                <div className={`w-8 h-8 rounded-full ${statusColors[tire.status]} transition-transform group-hover:scale-110`}></div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{label}</span>
            </div>
        );
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-4 bg-gray-100 dark:bg-gray-800 rounded-lg flex justify-center">
            <div className="w-[320px]">
                {/* Tractor */}
                <div className="relative border-4 border-gray-400 dark:border-gray-600 rounded-t-3xl h-48 mb-2">
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-24 h-20 bg-gray-300 dark:bg-gray-700 rounded-t-xl p-2">
                        <div className="w-full h-full bg-gray-400/50 dark:bg-gray-800/50 rounded-md"></div>
                    </div>
                    {/* Axle 1 */}
                    <div className="absolute top-5 left-0 right-0 h-1 bg-gray-500 dark:bg-gray-400 mx-auto w-[90%]"></div>
                    <div className="absolute top-5 left-0 right-0 flex justify-between px-2"><TireCircle id="dir-izq" label="DI" /><TireCircle id="dir-der" label="DD" /></div>
                     {/* Axle 2 */}
                    <div className="absolute bottom-5 left-0 right-0 h-1 bg-gray-500 dark:bg-gray-400 mx-auto w-[90%]"></div>
                    <div className="absolute bottom-5 left-0 right-0 flex justify-between px-2">
                        <div className="flex gap-1"><TireCircle id="dif-izq-ext" label="DI.E" /><TireCircle id="dif-izq-int" label="DI.I" /></div>
                        <div className="flex gap-1"><TireCircle id="dif-der-ext" label="DD.E" /><TireCircle id="dif-der-int" label="DD.I" /></div>
                    </div>
                </div>
                {/* Trailer */}
                 <div className="relative border-4 border-gray-400 dark:border-gray-600 h-64 rounded-b-lg">
                    {/* Axle 3 */}
                    <div className="absolute top-8 left-0 right-0 h-1 bg-gray-500 dark:bg-gray-400 mx-auto w-[90%]"></div>
                    <div className="absolute top-8 left-0 right-0 flex justify-between px-2"><TireCircle id="eje1-izq" label="1E.I" /><TireCircle id="eje1-der" label="1E.D" /></div>
                    {/* Axle 4 */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-gray-500 dark:bg-gray-400 mx-auto w-[90%]"></div>
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-2"><TireCircle id="eje2-izq" label="2E.I" /><TireCircle id="eje2-der" label="2E.D" /></div>
                    {/* Axle 5 */}
                    <div className="absolute bottom-8 left-0 right-0 h-1 bg-gray-500 dark:bg-gray-400 mx-auto w-[90%]"></div>
                     <div className="absolute bottom-8 left-0 right-0 flex justify-between px-2"><TireCircle id="eje3-izq" label="3E.I" /><TireCircle id="eje3-der" label="3E.D" /></div>
                </div>
            </div>
        </div>
    );
};

export default function TiresPage() {
  const [tires, setTires] = useState<Tire[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isRotateModalOpen, setIsRotateModalOpen] = useState(false);
  const [selectedTire, setSelectedTire] = useState<Tire | null>(null);
  const { toast } = useToast();

  const updateTiresWithStatus = (tiresToUpdate: Omit<Tire, 'status'>[]): Tire[] => {
      return tiresToUpdate.map(t => ({...t, status: getTireStatus(t)}));
  }

  useEffect(() => {
    const savedTires = localStorage.getItem('truck_tires_12_status'); // New key
    if (savedTires) {
      setTires(updateTiresWithStatus(JSON.parse(savedTires)));
    } else {
      setTires(getInitialTires());
    }
  }, []);

  const saveTires = (updatedTires: Tire[]) => {
    setTires(updatedTires);
    localStorage.setItem('truck_tires_12_status', JSON.stringify(updatedTires));
    toast({ title: '✅ Guardado', description: 'La información de los neumáticos ha sido guardada.' });
  };

  const handleTireClick = (tire: Tire) => {
    setSelectedTire(tire);
    setIsEditModalOpen(true);
  };

  const handleSaveTire = (updatedTireData: Omit<Tire, 'status'>) => {
    const updatedWithStatus = {...updatedTireData, status: getTireStatus(updatedTireData) };
    const updatedTires = tires.map(t => (t.id === updatedWithStatus.id ? updatedWithStatus : t));
    saveTires(updatedTires);
    setIsEditModalOpen(false);
  };

  const handleSaveReview = (newKm: number) => {
    const tiresWithNewKm = tires.map(tire => ({ ...tire, currentKm: newKm }));
    const updatedTires = updateTiresWithStatus(tiresWithNewKm);
    saveTires(updatedTires);
    toast({ title: '📝 Revisión Añadida', description: `Kilometraje actualizado a ${newKm.toLocaleString()} km.` });
    setIsReviewModalOpen(false);
  };
  
  const handleSaveRotation = (rotatedTiresData: Tire[]) => {
    const updatedTires = updateTiresWithStatus(rotatedTiresData);
    saveTires(updatedTires);
    toast({ title: '🔄 Rotación Completada', description: 'Las posiciones de los neumáticos han sido actualizadas.' });
    setIsRotateModalOpen(false);
  };

  const maxCurrentKm = useMemo(() => tires.length > 0 ? Math.max(...tires.map(t => t.currentKm)) : 0, [tires]);

  return (
    <AppLayout title="Gestión de Neumáticos">
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Truck className="h-6 w-6 text-primary" />Esquema del Camión</CardTitle>
                <CardDescription>Vista cenital del vehículo. Haz clic en una rueda para ver/editar sus detalles.</CardDescription>
            </CardHeader>
            <CardContent>
                <TruckSchema tires={tires} onTireClick={handleTireClick}/>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Tabla de Estado y Acciones</CardTitle>
                <CardDescription>Revisa el detalle de cada neumático. Los colores indican su estado (Verde: OK, Amarillo: Aviso, Rojo: Alerta).</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Posición</TableHead><TableHead>ID Neumático</TableHead><TableHead className="text-right">KM Recorridos</TableHead><TableHead>Estado</TableHead><TableHead className="text-center">Acciones</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {tires.map((tire) => (
                            <TableRow key={tire.id}>
                                <TableCell className="font-medium">{tire.position}</TableCell>
                                <TableCell>{tire.tireId}</TableCell>
                                <TableCell className="text-right">{(tire.currentKm - tire.installKm).toLocaleString()} km</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full ${{
                                            good: 'bg-green-500',
                                            warning: 'bg-yellow-500',
                                            alert: 'bg-red-500',
                                        }[tire.status]}`}></span>
                                        <span>{{
                                            good: 'Bueno',
                                            warning: 'Aviso',
                                            alert: 'Alerta'
                                        }[tire.status]}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center"><Button variant="outline" size="sm" onClick={() => handleTireClick(tire)}><Wrench className="h-4 w-4 mr-1" /> Editar</Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Button onClick={() => setIsReviewModalOpen(true)} className="flex-1"><FilePlus className="mr-2 h-4 w-4"/> Añadir Revisión de KM</Button>
            <Button onClick={() => setIsRotateModalOpen(true)} variant="secondary" className="flex-1"><RotateCw className="mr-2 h-4 w-4" /> Rotar Neumáticos</Button>
        </div>
      </div>
      <EditTireModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} tire={selectedTire} onSave={handleSaveTire} />
      <AddReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} onSave={handleSaveReview} currentKm={maxCurrentKm} />
      <RotateTiresModal isOpen={isRotateModalOpen} onClose={() => setIsRotateModalOpen(false)} tires={tires} onSave={handleSaveRotation} />
    </AppLayout>
  );
}