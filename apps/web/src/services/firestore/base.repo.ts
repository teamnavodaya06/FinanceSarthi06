import { db, auth } from '../../config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  onSnapshot,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';

export abstract class BaseRepository {
  protected getUserId(): string {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      throw new Error('Unauthorized: User session is missing or expired');
    }
    return uid;
  }

  protected getSubcollectionRef(subcollectionName: string) {
    const uid = this.getUserId();
    return collection(db, 'users', uid, subcollectionName);
  }

  protected getDocRef(subcollectionName: string, docId: string) {
    const uid = this.getUserId();
    return doc(db, 'users', uid, subcollectionName, docId);
  }

  protected async getSingleDocument(subcollectionName: string, docId = 'current'): Promise<DocumentData | null> {
    const docRef = this.getDocRef(subcollectionName, docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  }

  protected async setSingleDocument(subcollectionName: string, data: any, docId = 'current'): Promise<void> {
    const docRef = this.getDocRef(subcollectionName, docId);
    await setDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  }

  protected async createInSubcollection(subcollectionName: string, data: any): Promise<string> {
    const collRef = this.getSubcollectionRef(subcollectionName);
    const docRef = await addDoc(collRef, {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  }

  protected async updateInSubcollection(subcollectionName: string, docId: string, data: any): Promise<void> {
    const docRef = this.getDocRef(subcollectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }

  protected async deleteFromSubcollection(subcollectionName: string, docId: string): Promise<void> {
    const docRef = this.getDocRef(subcollectionName, docId);
    await deleteDoc(docRef);
  }

  protected getSubcollectionSnapshot(
    subcollectionName: string,
    callback: (snapshot: QuerySnapshot<DocumentData>) => void,
    errorCallback?: (error: any) => void
  ) {
    const collRef = this.getSubcollectionRef(subcollectionName);
    const q = query(collRef);
    return onSnapshot(q, callback, errorCallback || ((err) => console.error(`Error on subcollection listener: ${subcollectionName}`, err)));
  }

  protected getDocumentSnapshot(
    subcollectionName: string,
    docId: string,
    callback: (docSnap: any) => void,
    errorCallback?: (error: any) => void
  ) {
    const docRef = this.getDocRef(subcollectionName, docId);
    return onSnapshot(docRef, (snap) => {
      callback(snap.exists() ? snap.data() : null);
    }, errorCallback || ((err) => console.error(`Error on document listener: ${subcollectionName}/${docId}`, err)));
  }
}
