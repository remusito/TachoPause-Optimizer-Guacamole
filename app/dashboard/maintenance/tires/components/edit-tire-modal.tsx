'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Tire } from '../types';

type EditTireModalProps = {
  isOpen: boolean;
  onClose: () => void;
  tire: Tire | null;
  onSave: (updatedTire: Omit<Tire, 'status'>) => void;
};

export const EditTireModal = ({ isOpen, onClose, tire, onSave }: EditTireModalProps) => {
  const [tireId, setTireId] = useState('');
  const [installKm, setInstallKm] = useState(0);
  const [currentKm, setCurrentKm] = useState(0);

  useEffect(() => {
    if (tire) {
      setTireId(tire.tireId);
      setInstallKm(tire.installKm);
      setCurrentKm(tire.currentKm);
    }
  }, [tire]);

  const handleSave = () => {
    if (tire) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { status, ...rest } = tire; // Omit status before saving
      onSave({ ...rest, tireId, installKm, currentKm });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Neumático: {tire?.position}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tireId" className="text-right">ID Neumático</Label>
            <Input id="tireId" value={tireId} onChange={(e) => setTireId(e.target.value)} className="col-span-3"/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="installKm" className="text-right">KM de Instalación</Label>
            <Input id="installKm" type="number" value={installKm} onChange={(e) => setInstallKm(Number(e.target.value))} className="col-span-3"/>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="currentKm" className="text-right">KM Actuales</Label>
            <Input id="currentKm" type="number" value={currentKm} onChange={(e) => setCurrentKm(Number(e.target.value))} className="col-span-3"/>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
          <Button type="button" onClick={handleSave}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};