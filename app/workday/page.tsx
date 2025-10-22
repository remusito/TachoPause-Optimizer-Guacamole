'use client';

import { WorkdayTracker } from '@/app/components/workday-tracker';
import { WeeklyWorkdaySummary } from '@/app/components/weekly-workday-summary';

export default function WorkdayPage() {
  return (
    <div className="w-full max-w-md mx-auto py-6 flex flex-col gap-6">
      <WorkdayTracker />
      <WeeklyWorkdaySummary />
    </div>
  );
}
