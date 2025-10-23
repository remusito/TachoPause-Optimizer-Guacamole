'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Tire } from '../types';

type RotateTiresModalProps = {
  isOpen: boolean;
  onClose: () => void;
  tires: Tire[];
  onSave: (rotatedTires: Tire[]) => void;
};

export const RotateTiresModal = ({ isOpen, onClose, tires, onSave }: RotateTiresModalProps) => {
  const [selectedTires, setSelectedTires] = useState<Tire[]>([]);

  useEffect(() => {
    setSelectedTires([]);
  }, [isOpen]);

  const handleSelectTire = (tire: Tire) => {
    setSelectedTires(prev => 
      prev.find(t => t.id === tire.id) 
        ? prev.filter(t => t.id !== tire.id) 
        : [...prev, tire]
    );
  };

  const handleRotate = () => {
    if (selectedTires.length < 2) return; // Need at least two tires to rotate

    const newTires = [...tires];
    const today = new Date().toISOString().split('T')[0];

    // Simple rotation: swap the positions of the first two selected tires
    // For a more complex rotation, you would need a more sophisticated UI
    const first = selectedTires[0];
    const second = selectedTires[1];

    const firstIndex = newTires.findIndex(t => t.id === first.id);
    const secondIndex = newTires.findIndex(t => t.id === second.id);

    if (firstIndex !== -1 && secondIndex !== -1) {
        // Swap positions
        [newTires[firstIndex].position, newTires[secondIndex].position] = [newTires[secondIndex].position, newTires[firstIndex].position];
        
        // Update rotation date
        newTires[firstIndex].lastRotationDate = today;
        newTires[secondIndex].lastRotationDate = today;
    }

    onSave(newTires);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Rotar Neumáticos</DialogTitle>
        </DialogHeader>
        <p>Selecciona dos neumáticos para intercambiar sus posiciones. La fecha de rotación se actualizará a hoy.</p>
        <div className="max-h-96 overflow-y-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Posición</TableHead>
                        <TableHead>ID Neumático</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tires.map(tire => (
                        <TableRow key={tire.id} onClick={() => handleSelectTire(tire)} className="cursor-pointer">
                            <TableCell><Checkbox checked={selectedTires.some(t => t.id === tire.id)} /></TableCell>
                            <TableCell>{tire.position}</TableCell>
                            <TableCell>{tire.tireId}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleRotate} disabled={selectedTires.length !== 2}>
            Rotar Seleccionados
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};