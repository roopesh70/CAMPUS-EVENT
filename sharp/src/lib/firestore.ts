import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  increment,
  writeBatch,
  type QueryConstraint,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Typed collection reference
export function typedCollection(path: string) {
  return collection(db, path);
}

// Typed doc reference
export function typedDoc(path: string, id: string) {
  return doc(db, path, id);
}

// Query helper
export async function queryDocs<T>(
  collectionPath: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  const q = query(collection(db, collectionPath), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
}

// Get single doc
export async function getDocument<T>(
  collectionPath: string,
  docId: string
): Promise<T | null> {
  const snap = await getDoc(doc(db, collectionPath, docId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as T;
}

// Add doc with server timestamp
export async function addDocument(
  collectionPath: string,
  data: DocumentData
) {
  return addDoc(collection(db, collectionPath), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

// Set doc (create or overwrite with specific ID)
export async function setDocument(
  collectionPath: string,
  docId: string,
  data: DocumentData
) {
  return setDoc(doc(db, collectionPath, docId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// Update doc
export async function updateDocument(
  collectionPath: string,
  docId: string,
  data: Partial<DocumentData>
) {
  return updateDoc(doc(db, collectionPath, docId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// Merge doc (create or update)
export async function mergeDocument(
  collectionPath: string,
  docId: string,
  data: Partial<DocumentData>
) {
  return setDoc(doc(db, collectionPath, docId), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// Delete doc
export async function deleteDocument(
  collectionPath: string,
  docId: string
) {
  return deleteDoc(doc(db, collectionPath, docId));
}

// Real-time listener
export function listenToCollection<T>(
  collectionPath: string,
  constraints: QueryConstraint[],
  callback: (items: T[]) => void
): Unsubscribe {
  const q = query(collection(db, collectionPath), ...constraints);
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
    callback(items);
  });
}

// Listen to single doc
export function listenToDoc<T>(
  collectionPath: string,
  docId: string,
  callback: (item: T | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, collectionPath, docId), (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() } as T);
    } else {
      callback(null);
    }
  });
}

// Re-exports for convenience
export {
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  writeBatch,
  doc,
  collection,
};
export { db };
