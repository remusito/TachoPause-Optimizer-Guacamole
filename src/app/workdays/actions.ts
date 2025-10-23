'use server';

import { firestore } from "@/firebase/server";
import { Workday, WorkdayEvent, SerializableWorkday, SerializableWorkdayEvent } from "@/types/workday";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import { format } from 'date-fns';

// --- Data Serialization Helper ---
function serializeFirestoreData<T>(doc: FirebaseFirestore.DocumentSnapshot): T {
    const data = doc.data()!;
    const id = doc.id;
    const serializedData: { [key: string]: any } = { id };

    for (const [key, value] of Object.entries(data)) {
        if (value instanceof Timestamp) {
            serializedData[key] = value.toDate().toISOString();
        } else if (value) { // Ensure value is not null or undefined
            serializedData[key] = value;
        }
    }
    return serializedData as T;
}

// --- Actions for Client Components ---

export async function startWorkday(userId: string): Promise<SerializableWorkday> {
  const today = new Date();
  const workdayId = today.toISOString().split('T')[0];

  const workdayRef = firestore.collection('users').doc(userId).collection('workdays').doc(workdayId);
  const workdayDoc = await workdayRef.get();

  if (workdayDoc.exists) {
    await logWorkdayEvent(userId, workdayId, 'WORKDAY_START');
    return serializeFirestoreData<SerializableWorkday>(workdayDoc);
  }

  const newWorkday: Workday = {
    id: workdayId,
    userId,
    startTime: Timestamp.fromDate(today),
    endTime: null,
    status: 'active',
    totalDrivingTimeSeconds: 0,
    totalPauseTimeSeconds: 0,
  };

  await workdayRef.set(newWorkday);
  await logWorkdayEvent(userId, workdayId, 'WORKDAY_START');
  const newWorkdayDoc = await workdayRef.get();
  return serializeFirestoreData<SerializableWorkday>(newWorkdayDoc);
}

export async function logWorkdayEvent(userId: string, workdayId: string, eventType: WorkdayEvent['type']): Promise<void> {
  const event: Omit<WorkdayEvent, 'id'> = {
    timestamp: Timestamp.now(),
    type: eventType,
  };
  
  const eventsCollectionRef = firestore.collection('users').doc(userId).collection('workdays').doc(workdayId).collection('events');
  await eventsCollectionRef.add(event);

  if (eventType === 'WORKDAY_END') {
      const workdayRef = firestore.collection('users').doc(userId).collection('workdays').doc(workdayId);
      await workdayRef.update({ 
          endTime: event.timestamp,
          status: 'finished'
      });
  }
}

export async function updateWorkdayTimes(userId: string, workdayId: string, { drivingTime, pauseTime }: { drivingTime?: number, pauseTime?: number }): Promise<void> {
    const workdayRef = firestore.collection('users').doc(userId).collection('workdays').doc(workdayId);
    const updates: { [key: string]: FieldValue } = {};
    if (drivingTime) updates.totalDrivingTimeSeconds = FieldValue.increment(drivingTime);
    if (pauseTime) updates.totalPauseTimeSeconds = FieldValue.increment(pauseTime);
    if (Object.keys(updates).length > 0) {
        await workdayRef.update(updates);
    }
}

// --- Data Fetching & Exporting for Stats Page ---

export async function getWorkdays(userId: string): Promise<SerializableWorkday[]> {
    const workdaysCollection = firestore.collection('users').doc(userId).collection('workdays').orderBy('id', 'desc').limit(30);
    const snapshot = await workdaysCollection.get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => serializeFirestoreData<SerializableWorkday>(doc));
}

export async function getWorkdayEvents(userId: string, workdayId: string): Promise<SerializableWorkdayEvent[]> {
    const eventsCollection = firestore.collection('users').doc(userId).collection('workdays').doc(workdayId).collection('events').orderBy('timestamp', 'asc');
    const snapshot = await eventsCollection.get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => serializeFirestoreData<SerializableWorkdayEvent>(doc));
}

export async function exportWorkdayToCSV(userId: string, workdayId: string): Promise<string> {
    const workdayRef = firestore.collection('users').doc(userId).collection('workdays').doc(workdayId);
    const workdayDoc = await workdayRef.get();
    if (!workdayDoc.exists) {
        throw new Error("Workday not found");
    }
    const workday = workdayDoc.data() as Workday;

    const events = await getWorkdayEvents(userId, workdayId);

    // Event descriptions
    const eventDescriptions: { [key in WorkdayEvent['type']]: string } = {
        WORKDAY_START: 'Inicio de la jornada',
        WORKDAY_END: 'Fin de la jornada',
        MOVEMENT_START: 'Inicio de movimiento',
        MOVEMENT_STOP: 'Vehículo detenido',
        DRIVING_PAUSE_START: 'Inicio de pausa de conducción',
        DRIVING_PAUSE_END: 'Fin de pausa de conducción',
    };

    // Build CSV content
    let csvContent = "";
    csvContent += `"Jornada","${workday.id}"\n`;
    csvContent += `"Hora de Inicio","${format(new Date(workday.startTime.toDate()), 'HH:mm:ss')}"\n`;
    if (workday.endTime) {
        csvContent += `"Hora de Fin","${format(new Date(workday.endTime.toDate()), 'HH:mm:ss')}"\n`;
    }
    csvContent += `"Tiempo de Conducción (s)","${workday.totalDrivingTimeSeconds}"\n`;
    csvContent += `"Tiempo de Pausa (s)","${workday.totalPauseTimeSeconds}"\n`;
    csvContent += "\n"; // Spacer
    csvContent += "\"ID Evento\",\"Fecha\",\"Hora\",\"Tipo\",\"Descripción\"\n"; // CSV Header

    for (const event of events) {
        const date = new Date(event.timestamp);
        const row = [
            `"${event.id}"`, // Enclose in quotes
            `"${format(date, 'yyyy-MM-dd')}"`, 
            `"${format(date, 'HH:mm:ss')}"`, 
            `"${event.type}"`, 
            `"${eventDescriptions[event.type]}"`
        ].join(',');
        csvContent += row + "\n";
    }

    return csvContent;
}
