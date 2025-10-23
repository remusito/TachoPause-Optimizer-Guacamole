import { Workday } from '@/types/workday';

export const getWorkdaySummary = (workdays: Workday[]) => {
  const summary = {
    totalDriving: 0,
    days: {},
  };

  workdays.forEach(wd => {
    // Ensure startTime is a number (milliseconds) before creating a Date
    const startTimeMs = wd.startTime instanceof Date ? wd.startTime.getTime() : (wd.startTime.seconds * 1000);
    const date = new Date(startTimeMs);
    const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });
    const dayKey = dayName.charAt(0).toUpperCase() + dayName.slice(1);

    if (!summary.days[dayKey]) {
      summary.days[dayKey] = { 
        startTime: wd.startTime, 
        endTime: wd.endTime, 
        totalDriving: 0 
      };
    }
    
    // Use totalDrivingTimeSeconds for calculations
    const drivingTime = wd.totalDrivingTimeSeconds * 1000; // convert to ms
    summary.days[dayKey].totalDriving += drivingTime;
    summary.totalDriving += drivingTime;
  });

  return summary;
};

export const getBiweeklyDrivingHours = (currentWeekWorkdays: Workday[], previousWeekWorkdays: Workday[]) => {
  // Convert totalDrivingTimeSeconds to hours
  const currentWeekHours = currentWeekWorkdays.reduce((total, wd) => total + (wd.totalDrivingTimeSeconds / 3600), 0);
  const previousWeekHours = previousWeekWorkdays.reduce((total, wd) => total + (wd.totalDrivingTimeSeconds / 3600), 0);

  return currentWeekHours + previousWeekHours;
};
