'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';

type AddReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (currentKm: number, notes: string) => void;
  currentKm: number;
};

export const AddReviewModal = ({ isOpen, onClose, onSave, currentKm }: AddReviewModalProps) => {
  const [newKm, setNewKm] = useState(currentKm);
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    onSave(newKm, notes);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Añadir Revisión de Kilometraje</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="currentKm" className="text-right">
              KM Actuales
            </Label>
            <Input
              id="currentKm"
              type="number"
              value={newKm}
              onChange={(e) => setNewKm(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notas
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
              className="col-span-3"
              placeholder="Añade aquí tus observaciones sobre la revisión..."
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>
            Guardar Revisión
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};