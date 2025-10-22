
interface Workday {
  startTime: number;
  endTime: number;
  totalDriving: number;
}

export const getWorkdaySummary = (workdays: Workday[]) => {
  const summary = {
    totalDriving: 0,
    days: {},
  };

  workdays.forEach(wd => {
    const date = new Date(wd.startTime);
    const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });
    const dayKey = dayName.charAt(0).toUpperCase() + dayName.slice(1);

    if (!summary.days[dayKey]) {
      summary.days[dayKey] = { startTime: wd.startTime, endTime: wd.endTime, totalDriving: 0 };
    }
    summary.days[dayKey].totalDriving += wd.totalDriving;
    summary.totalDriving += wd.totalDriving;
  });

  return summary;
};

export const getBiweeklyDrivingHours = (currentWeekWorkdays: Workday[], previousWeekWorkdays: Workday[]) => {
  const currentWeekHours = currentWeekWorkdays.reduce((total, wd) => total + wd.totalDriving, 0);
  const previousWeekHours = previousWeekWorkdays.reduce((total, wd) => total + wd.totalDriving, 0);

  return (currentWeekHours + previousWeekHours) / 3600000; // Convertir a horas
};
