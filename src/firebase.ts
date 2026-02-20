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

// ===== VALIDAÇÃO E SANITIZAÇÃO =====

// Valida email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Valida password
function isValidPassword(password: string): boolean {
  // Mínimo 6 caracteres, pelo menos 1 letra e 1 número
  return password.length >= 6 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
}

// Valida nome
function isValidName(name: string): boolean {
  return name.length >= 2 && name.length <= 100 && !/[<>'"\/\\]/g.test(name);
}

// Sanitiza strings (remove caracteres perigosos)
function sanitizeString(str: string): string {
  return str.trim().replace(/[<>&"']/g, (char) => {
    const escapeMap: { [key: string]: string } = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#x27;'
    };
    return escapeMap[char] || char;
  });
}

// Valida ID de usuário (UID do Firebase)
function isValidUserId(userId: string): boolean {
  return userId.length === 28 && /^[a-zA-Z0-9]*$/.test(userId);
}

// ===== FUNÇÕES DE AUTENTICAÇÃO =====

export const registerUser = async (email: string, password: string, name: string) => {
  try {
    // Validação rigorosa
    if (!isValidEmail(email)) {
      return { success: false, error: 'Email inválido' };
    }
    if (!isValidPassword(password)) {
      return { success: false, error: 'Senha deve ter 6+ caracteres, letra e número' };
    }
    if (!isValidName(name)) {
      return { success: false, error: 'Nome inválido' };
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Sanitiza e salva dados do usuário
    const sanitizedName = sanitizeString(name);
    await setDoc(doc(db, 'users', user.uid), {
      email: email.toLowerCase(),
      name: sanitizedName,
      level: 1,
      xp: 0,
      totalXP: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return { success: true, user: { id: user.uid, email: email.toLowerCase(), name: sanitizedName } };
  } catch (error: any) {
    // Não expõe mensagens de erro sensíveis
    const message = error.code === 'auth/email-already-in-use' 
      ? 'Email já cadastrado' 
      : 'Erro no registro. Tente novamente.';
    return { success: false, error: message };
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    if (!isValidEmail(email)) {
      return { success: false, error: 'Email inválido' };
    }

    const userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase(), password);
    const user = userCredential.user;

    // Busca dados do usuário com segurança
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      return { success: false, error: 'Perfil do usuário não encontrado' };
    }

    const userData = userDoc.data();
    return { success: true, user: { id: user.uid, email: user.email, name: userData?.name } };
  } catch (error: any) {
    // Mensagem genérica para não revelar se email existe
    const message = 'Email ou senha incorretos';
    return { success: false, error: message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Erro ao sair' };
  }
};

// ===== FUNÇÕES DE PROGRESSO =====

export const saveProgress = async (userId: string, unitId: string, lessonId: string, completed: boolean, score: number) => {
  try {
    // Validação de entrada
    if (!isValidUserId(userId)) {
      return { success: false, error: 'ID inválido' };
    }
    if (score < 0 || score > 100) {
      return { success: false, error: 'Score inválido' };
    }

    const progressRef = doc(db, 'progress', `${userId}_${unitId}_${lessonId}`);
    await setDoc(progressRef, {
      userId,
      unitId: sanitizeString(unitId),
      lessonId: sanitizeString(lessonId),
      completed: completed === true,
      score: Math.min(100, Math.max(0, score)),
      completedAt: new Date(),
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Erro ao salvar progresso' };
  }
};

export const getUserProgress = async (userId: string) => {
  try {
    if (!isValidUserId(userId)) {
      return { success: false, error: 'ID inválido', progress: [] };
    }

    const q = query(collection(db, 'progress'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const progress: any[] = [];
    
    querySnapshot.forEach((doc) => {
      progress.push(doc.data());
    });

    return { success: true, progress };
  } catch (error: any) {
    return { success: false, error: 'Erro ao buscar progresso', progress: [] };
  }
};

// ===== FUNÇÕES DO MINIGAME =====

export const saveMinigameScore = async (userId: string, gameType: string, score: number, accuracy: number) => {
  try {
    if (!isValidUserId(userId)) {
      return { success: false, error: 'ID inválido' };
    }
    if (score < 0 || accuracy < 0 || accuracy > 100) {
      return { success: false, error: 'Dados inválidos' };
    }

    await setDoc(doc(collection(db, 'minigame_scores')), {
      userId,
      gameType: sanitizeString(gameType),
      score: Math.max(0, score),
      accuracy: Math.min(100, Math.max(0, accuracy)),
      playedAt: new Date()
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Erro ao salvar pontuação' };
  }
};

export const getUserStats = async (userId: string) => {
  try {
    if (!isValidUserId(userId)) {
      return { success: false, error: 'ID inválido', stats: null };
    }

    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return { success: false, error: 'Usuário não encontrado', stats: null };
    }

    // Retorna apenas dados públicos/necessários
    const stats = userDoc.data();
    return { 
      success: true, 
      stats: {
        name: stats?.name,
        level: stats?.level,
        xp: stats?.xp,
        totalXP: stats?.totalXP,
        createdAt: stats?.createdAt
      }
    };
  } catch (error: any) {
    return { success: false, error: 'Erro ao buscar estatísticas', stats: null };
  }
};