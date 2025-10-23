export type Tire = {
  id: string;
  position: string;
  tireId: string;
  installKm: number;
  currentKm: number;
  lastRotationDate: string;
  status: 'good' | 'warning' | 'alert';
};