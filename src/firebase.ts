import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth functions
export const registerUser = async (email: string, password: string, name: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user profile to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email,
      name,
      level: 1,
      xp: 0,
      createdAt: new Date()
    });

    return { success: true, user: { id: user.uid, email, name } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user profile from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();

    return { success: true, user: { id: user.uid, email, name: userData?.name } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Progress functions
export const saveProgress = async (userId: string, unitId: string, lessonId: string, completed: boolean, score: number) => {
  try {
    const progressRef = doc(db, 'progress', `${userId}_${unitId}_${lessonId}`);
    await setDoc(progressRef, {
      userId,
      unitId,
      lessonId,
      completed,
      score,
      completedAt: new Date()
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getUserProgress = async (userId: string) => {
  try {
    const q = query(collection(db, 'progress'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const progress: any[] = [];
    querySnapshot.forEach((doc) => {
      progress.push(doc.data());
    });
    return { success: true, progress };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Minigame scores
export const saveMinigameScore = async (userId: string, gameType: string, score: number, accuracy: number) => {
  try {
    const scoreRef = collection(db, 'minigameScores');
    await setDoc(doc(scoreRef), {
      userId,
      gameType,
      score,
      accuracy,
      playedAt: new Date()
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getUserStats = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return { success: true, stats: userDoc.data() };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};