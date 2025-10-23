'use client';

import { useState, useEffect } from 'react';
import { useCollection } from '@/hooks/use-collection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getWorkdaySummary, getBiweeklyDrivingHours } from '@/lib/workday-helpers';
import { useAuth } from '@/firebase';
import { getFirestore, collection, query, where, Query } from 'firebase/firestore';

export function WeeklyWorkdaySummary() {
  const { user } = useAuth();
  const [workdaysQuery, setWorkdaysQuery] = useState<Query | null>(null);

  useEffect(() => {
    if (user) {
      const firestore = getFirestore();
      const today = new Date();
      const day = today.getDay() || 7; // Get day of week (1-7), where 1 is Monday.
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - day + 1);
      startDate.setHours(0, 0, 0, 0);

      const q = query(
        collection(firestore, `users/${user.uid}/workdays`),
        where('startTime', '>=', startDate.getTime())
      );
      setWorkdaysQuery(q);
    } else {
      setWorkdaysQuery(null);
    }
  }, [user]);

  const { data: workdays, loading } = useCollection(workdaysQuery);
  const [weeklySummary, setWeeklySummary] = useState<any>(null);
  const [biweeklyHours, setBiweeklyHours] = useState(0);

  useEffect(() => {
    if (workdays) {
      const summary = getWorkdaySummary(workdays);
      setWeeklySummary(summary);
      
      // Simplification: This should fetch previous week's data for an accurate bi-weekly count
      const biweekly = getBiweeklyDrivingHours(workdays, []);
      setBiweeklyHours(biweekly);
    }
  }, [workdays]);

  const renderDay = (day: string, data: any) => {
    const hours = data?.totalDriving / 3600000 || 0;
    const dayAbbreviation = day.substring(0, 3);

    return (
      <div key={day} className="flex items-center justify-between py-1 text-sm border-b last:border-b-0">
        <span className="font-medium capitalize w-12">{dayAbbreviation}</span>
        <span className="text-xs text-center text-muted-foreground">
          {data ? `${new Date(data.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(data.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'Sin registro'}
        </span>
        <span className="font-semibold text-right w-16">{hours.toFixed(1)}h</span>
      </div>
    );
  };

  const weeklyHours = weeklySummary?.totalDriving / 3600000 || 0;
  const weeklyLimit = 56;
  const biweeklyLimit = 90;
  const weekDays = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle>Resumen Semanal</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        {loading && !workdays ? (
          <p className="text-center text-sm text-muted-foreground">Cargando datos...</p>
        ) : (
          <>
            <div className="space-y-1">
              {weekDays.map(day => renderDay(day, weeklySummary?.days[day.charAt(0).toUpperCase() + day.slice(1)]))}
            </div>
            
            <div className="mt-3 pt-3 border-t">
              <h3 className="font-bold mb-2 text-base">Totales</h3>
              <div>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span>Semanal:</span>
                  <span className={`${weeklyHours > weeklyLimit ? 'text-destructive' : ''}`}>
                    {weeklyHours.toFixed(1)}h / {weeklyLimit}h
                  </span>
                </div>
                <Progress value={(weeklyHours / weeklyLimit) * 100} className={`h-2 ${weeklyHours > weeklyLimit ? '[&>div]:bg-destructive' : ''}`} />
                {weeklyHours > weeklyLimit && 
                  <p className="text-xs text-destructive text-right mt-0.5">Límite superado</p>
                }
              </div>
              <div className="mt-2">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span>Bisemanal:</span>
                  <span className={`${biweeklyHours > biweeklyLimit ? 'text-destructive' : ''}`}>
                    {biweeklyHours.toFixed(1)}h / {biweeklyLimit}h
                  </span>
                </div>
                <Progress value={(biweeklyHours / biweeklyLimit) * 100} className={`h-2 ${biweeklyHours > biweeklyLimit ? '[&>div]:bg-destructive' : ''}`} />
                {biweeklyHours > biweeklyLimit && 
                  <p className="text-xs text-destructive text-right mt-0.5">Límite superado</p>
                }
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
