import { Timestamp } from 'firebase/firestore';

// Base types with Firestore Timestamps
export type WorkdayEvent = {
  id: string;
  timestamp: Timestamp;
  type: 'WORKDAY_START' | 'WORKDAY_END' | 'MOVEMENT_START' | 'MOVEMENT_STOP' | 'DRIVING_PAUSE_START' | 'DRIVING_PAUSE_END';
};

export interface Workday {
  id: string; // YYYY-MM-DD
  userId: string;
  startTime: Timestamp;
  endTime: Timestamp | null;
  status: 'active' | 'finished';
  totalDrivingTimeSeconds: number;
  totalPauseTimeSeconds: number;
}

// Serializable types with ISO date strings for client components
export type SerializableWorkdayEvent = Omit<WorkdayEvent, 'timestamp'> & {
  timestamp: string;
};

export type SerializableWorkday = Omit<Workday, 'startTime' | 'endTime' | 'events'> & {
  startTime: string;
  endTime: string | null;
  events?: SerializableWorkdayEvent[];
};
