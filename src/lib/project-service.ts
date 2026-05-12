import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Project } from '../types/furniture';

const COLLECTION_NAME = 'projects';

export const ProjectService = {
  async getAllProjects(userId: string): Promise<Project[]> {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
  },

  async saveProject(project: Omit<Project, 'id'> & { id?: string }): Promise<string> {
    if (project.id) {
      const docRef = doc(db, COLLECTION_NAME, project.id);
      await updateDoc(docRef, {
        ...project,
        updatedAt: Date.now()
      });
      return project.id;
    } else {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...project,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      return docRef.id;
    }
  },

  async deleteProject(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  }
};
