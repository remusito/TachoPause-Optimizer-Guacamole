'use server';

import { firestore } from "@/firebase/server"; // Correctly import the initialized firestore instance
import { FieldValue } from "firebase-admin/firestore";

// Define the type for a new load based on the form fields
interface NewLoad {
  origin: string;
  destination: string;
  pickupDate: string;
  deliveryDate: string;
  rate: number;
  payout?: number;
  distance?: number;
  weight?: number;
  status: string;
  notes?: string;
}

/**
 * Adds a new load document to Firestore for a specific user.
 * @param userId The ID of the user creating the load.
 * @param loadData The load data to be saved.
 */
export async function addLoad(userId: string, loadData: NewLoad) {
  if (!userId) {
    throw new Error("User ID is required to add a load.");
  }

  try {
    // Use the imported firestore instance directly
    const db = firestore;
    
    // Add a server-side timestamp
    const loadWithTimestamp = {
      ...loadData,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      userId: userId, // Store the userId with the load
    };

    // Add the new document to the 'loads' collection
    const loadRef = await db.collection("loads").add(loadWithTimestamp);
    
    console.log(`New load with ID: ${loadRef.id} added for user: ${userId}`);
    
    return { id: loadRef.id };

  } catch (error) {
    console.error("Error adding load to Firestore:", error);
    // Re-throw the error to be caught by the calling function on the client
    throw new Error("Failed to save the load to the database.");
  }
}
