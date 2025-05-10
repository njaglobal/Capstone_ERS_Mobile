import { db } from './firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export async function submitIncident({
  type,
  photoUrl,
  location,
}: {
  type: 'fire' | 'road';
  photoUrl: string;
  location: { lat: number; lng: number };
}) {
  await addDoc(collection(db, 'incidents'), {
    type,
    photoUrl,
    location,
    status: 'pending',
    createdAt: Timestamp.now(),
  });
}
