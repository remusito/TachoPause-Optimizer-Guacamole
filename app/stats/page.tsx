'use client';

import React, { useState, useEffect } from 'react';
import { MainSidebar } from '@/components/main-sidebar';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/firebase/auth/provider';
import { getWorkdays, getWorkdayEvents, exportWorkdayToCSV } from '@/app/workdays/actions';
import { SerializableWorkday, SerializableWorkdayEvent } from '@/types/workday';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

// --- Helper Functions & Components ---

function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
}

const EventIcon = ({ type }: { type: SerializableWorkdayEvent['type'] }) => {
    const iconMap = {
        WORKDAY_START: <Icons.Play className="text-green-500" />,
        WORKDAY_END: <Icons.close className="text-red-500" />,
        MOVEMENT_START: <Icons.arrowRight className="text-blue-500" />,
        MOVEMENT_STOP: <Icons.MapPin className="text-orange-500" />,
        DRIVING_PAUSE_START: <Icons.Pause className="text-purple-500" />,
        DRIVING_PAUSE_END: <Icons.Pause className="text-purple-500 opacity-50" />,
    };
    return iconMap[type] || null;
};

const EventDescription = ({ event }: { event: SerializableWorkdayEvent }) => {
    const descriptions = {
        WORKDAY_START: 'Inicio de la jornada',
        WORKDAY_END: 'Fin de la jornada',
        MOVEMENT_START: 'Inicio de movimiento',
        MOVEMENT_STOP: 'Vehículo detenido',
        DRIVING_PAUSE_START: 'Inicio de pausa de conducción',
        DRIVING_PAUSE_END: 'Fin de pausa de conducción',
    };
    return <p>{descriptions[event.type]}</p>;
};


// --- Main Stats Page Component ---

export default function StatsPage() {
  const { user } = useAuth();
  const [workdays, setWorkdays] = useState<SerializableWorkday[]>([]);
  const [selectedWorkday, setSelectedWorkday] = useState<SerializableWorkday | null>(null);
  const [events, setEvents] = useState<SerializableWorkdayEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getWorkdays(user.uid)
        .then(data => {
            setWorkdays(data);
            if (data.length > 0) {
                handleSelectWorkday(data[0]);
            }
        })
        .catch(err => toast.error("Error al cargar las jornadas."))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleSelectWorkday = (workday: SerializableWorkday) => {
    setSelectedWorkday(workday);
    setEventsLoading(true);
    getWorkdayEvents(workday.userId, workday.id)
        .then(setEvents)
        .catch(err => toast.error(`Error al cargar los eventos del día ${workday.id}.`))
        .finally(() => setEventsLoading(false));
  }

  const handleExport = async () => {
      if (!user || !selectedWorkday) return;
      setExporting(true);
      toast.info("Generando el archivo CSV...");

      try {
          const csvContent = await exportWorkdayToCSV(user.uid, selectedWorkday.id);
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', `jornada-${selectedWorkday.id}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success("La exportación se ha completado.");
      } catch (error) {
          console.error("Export failed:", error);
          toast.error("No se pudo exportar la jornada.");
      } finally {
          setExporting(false);
      }
  }

  return (
    <div className="flex min-h-dvh bg-background">
      <MainSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 flex h-16 items-center justify-between border-b px-4 sm:px-6">
            <div className="flex items-center gap-2">
                <Icons.BarChart className="h-6 w-6 text-primary" />
                <h1 className="text-lg font-bold">Historial de Jornadas</h1>
            </div>
            <Button onClick={handleExport} disabled={!selectedWorkday || exporting}>
                {exporting ? <Icons.spinner className="animate-spin h-4 w-4 mr-2"/> : <Icons.share className="h-4 w-4 mr-2"/>}
                Exportar a CSV
            </Button>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:grid md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            
            <Card className="md:col-span-1 lg:col-span-1 mb-6 md:mb-0 h-fit sticky top-24">
                <CardHeader>
                    <CardTitle>Jornadas Recientes</CardTitle>
                    <CardDescription>Selecciona un día para ver sus detalles.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 p-2">
                    {loading && <div className="p-4 text-center"><Icons.spinner className="animate-spin h-6 w-6 mx-auto" /></div>}
                    {!loading && workdays.map(workday => (
                        <Button 
                            key={workday.id} 
                            variant={selectedWorkday?.id === workday.id ? 'secondary' : 'ghost'}
                            onClick={() => handleSelectWorkday(workday)}
                            className="w-full justify-start"
                        >
                           {format(new Date(workday.id), "EEEE, d 'de' MMMM", { locale: es })}
                        </Button>
                    ))}
                     {!loading && workdays.length === 0 && <p className="p-4 text-sm text-center text-muted-foreground">No se han encontrado jornadas.</p>}
                </CardContent>
            </Card>

            <div className="md:col-span-2 lg:col-span-3">
                {!selectedWorkday && !loading && (
                     <div className="flex flex-col items-center justify-center text-center py-16">
                        <Icons.History className="h-12 w-12 text-muted-foreground mb-4"/>
                        <p className="text-muted-foreground">Selecciona una jornada de la lista para ver los detalles.</p>
                    </div>
                )}
                {selectedWorkday && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Detalles del {format(new Date(selectedWorkday.id), "d 'de' MMMM, yyyy", { locale: es })}</CardTitle>
                            <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 pt-1">
                                <span><strong className="font-medium">Inicio:</strong> {format(new Date(selectedWorkday.startTime), 'HH:mm')}</span>
                                <span><strong className="font-medium">Fin:</strong> {selectedWorkday.endTime ? format(new Date(selectedWorkday.endTime), 'HH:mm') : 'En curso'}</span>
                                <span className="text-primary font-bold"><strong className="font-medium">Conducción:</strong> {formatDuration(selectedWorkday.totalDrivingTimeSeconds)}</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <h3 className="font-semibold mb-3">Cronología de Eventos</h3>
                            {eventsLoading && <div className="py-8 text-center"><Icons.spinner className="animate-spin h-6 w-6 mx-auto" /></div>}
                            {!eventsLoading && events.length > 0 && (
                                <ul className="space-y-4">
                                    {events.map(event => (
                                        <li key={event.id} className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                                <EventIcon type={event.type} />
                                            </div>
                                            <div className="flex-1">
                                                <EventDescription event={event} />
                                            </div>
                                            <time className="text-sm text-muted-foreground">
                                                {format(new Date(event.timestamp), 'HH:mm:ss')}
                                            </time>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {!eventsLoading && events.length === 0 && <p className="text-center text-muted-foreground py-8">No hay eventos registrados para este día.</p>}
                        </CardContent>
                    </Card>
                )}
            </div>
        </main>
      </div>
    </div>
  );
}
