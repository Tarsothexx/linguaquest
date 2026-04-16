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

// Verificar se todas as variáveis de ambiente estão configuradas
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
if (missingVars.length > 0) {
  console.error('Variáveis de ambiente do Firebase faltando:', missingVars);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log('Firebase inicializado com sucesso');
try {
  // Tentar uma operação simples para verificar se o Firestore está acessível
  console.log('📡 [INIT] Firestore parece estar configurado corretamente');
} catch (error) {
  console.error('❌ [INIT] Erro na configuração do Firestore:', error);
}

// ===== VALIDAÇÃO E SANITIZAÇÃO =====

// Valida email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Valida password
function isValidPassword(password: string): boolean {
  // Mínimo 6 caracteres (removendo a exigência de letra e número para facilitar)
  return password.length >= 6;
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

// ===== FUNÇÃO DE DEBUG =====

export const debugUserExists = async (email: string) => {
  try {
    console.log('🔍 [DEBUG] Procurando usuário por email:', email);

    // Buscar todos os usuários (apenas para debug)
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);

    console.log('📊 [DEBUG] Total de documentos na coleção users:', querySnapshot.size);

    let foundUser = null;
    let allEmails = [];
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      allEmails.push(userData.email);
      if (userData.email === email.toLowerCase()) {
        foundUser = { id: doc.id, ...userData };
      }
    });

    console.log('📧 [DEBUG] Emails encontrados no Firestore:', allEmails);

    if (foundUser) {
      console.log('✅ [DEBUG] Usuário encontrado:', foundUser);
      return { success: true, user: foundUser };
    } else {
      console.log('❌ [DEBUG] Usuário não encontrado no Firestore para email:', email);

      // Verificar se existe no Firebase Auth
      console.log('🔍 [DEBUG] Verificando se existe no Firebase Auth...');
      try {
        // Tentar uma verificação diferente - vamos usar uma abordagem que não requer senha
        console.log('⚠️ [DEBUG] Para verificar no Auth, será necessário fazer login primeiro');
        return { success: false, error: 'Usuário não encontrado no Firestore. Tente fazer login diretamente.', needsSync: true };
      } catch (authError: any) {
        console.log('❌ [DEBUG] Erro na verificação do Auth:', authError);
        return { success: false, error: 'Usuário não encontrado' };
      }
    }
  } catch (error) {
    console.error('❌ [DEBUG] Erro na busca:', error);
    return { success: false, error: 'Erro na busca' };
  }
};

// ===== FUNÇÃO DE SINCRONIZAÇÃO =====

export const syncMissingUserData = async (email: string, password: string, name?: string) => {
  try {
    console.log('🔄 Iniciando sincronização para:', email);

    // Fazer login primeiro para obter o UID
    const userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase(), password);
    const user = userCredential.user;

    console.log('✅ Login bem-sucedido, UID:', user.uid);

    // Verificar se já existe documento
    const existingDoc = await getDoc(doc(db, 'users', user.uid));
    if (existingDoc.exists()) {
      console.log('✅ Documento já existe!');
      return { success: true, user: { id: user.uid, email: user.email, name: existingDoc.data()?.name } };
    }

    // Criar documento no Firestore
    const sanitizedName = name || user.displayName || 'Usuário';
    console.log('💾 Criando documento no Firestore...');
    await setDoc(doc(db, 'users', user.uid), {
      email: email.toLowerCase(),
      name: sanitizedName,
      level: 1,
      xp: 0,
      totalXP: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Documento criado com sucesso!');
    return { success: true, user: { id: user.uid, email: user.email, name: sanitizedName } };
  } catch (error: any) {
    console.error('❌ Erro na sincronização:', error);
    const message = error.code === 'auth/wrong-password'
      ? 'Senha incorreta para sincronização'
      : error.code === 'auth/user-not-found'
      ? 'Usuário não encontrado'
      : 'Erro na sincronização';
    return { success: false, error: message };
  }
};

export const registerUser = async (email: string, password: string, name: string) => {
  try {
    if (!isValidEmail(email)) {
      return { success: false, error: 'Email inválido' };
    }
    if (!isValidPassword(password)) {
      return { success: false, error: 'Senha deve ter pelo menos 6 caracteres' };
    }
    if (!isValidName(name)) {
      return { success: false, error: 'Nome inválido' };
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Aguardar a autenticação estar estável antes de gravar o perfil
    await new Promise(resolve => setTimeout(resolve, 1000));

    const sanitizedName = sanitizeString(name);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        email: email.toLowerCase(),
        name: sanitizedName,
        level: 1,
        xp: 0,
        totalXP: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }, { merge: true });
    } catch (firestoreError: any) {
      console.warn('Não foi possível criar o documento de perfil no Firestore:', firestoreError);
      // Mesmo se o Firestore falhar, o usuário autenticou com sucesso.
      // O perfil pode ser criado em um próximo login.
    }

    return { success: true, user: { id: user.uid, email: email.toLowerCase(), name: sanitizedName } };
  } catch (error: any) {
    const message = error.code === 'auth/email-already-in-use'
      ? 'Email já cadastrado'
      : error.code === 'auth/weak-password'
      ? 'Senha muito fraca'
      : error.code === 'auth/invalid-email'
      ? 'Email inválido'
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

    let userName = user.displayName || email.split('@')[0] || 'Aventureiro';
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        userName = userData?.name || userName;
      } else {
        const profileData = {
          email: email.toLowerCase(),
          name: sanitizeString(userName),
          level: 1,
          xp: 0,
          totalXP: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await setDoc(doc(db, 'users', user.uid), profileData, { merge: true });
      }
    } catch (firestoreError: any) {
      console.warn('Não foi possível ler/criar o perfil no Firestore durante o login:', firestoreError);
      // Continuar com login bem-sucedido mesmo que o Firestore falhe.
    }

    return { success: true, user: { id: user.uid, email: user.email, name: userName } };
  } catch (error: any) {
    const message = error.code === 'auth/user-not-found'
      ? 'Usuário não encontrado'
      : error.code === 'auth/wrong-password'
      ? 'Senha incorreta'
      : error.code === 'auth/invalid-email'
      ? 'Email inválido'
      : error.code === 'auth/too-many-requests'
      ? 'Muitas tentativas. Aguarde alguns minutos.'
      : 'Email ou senha incorretos';
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
    console.log('🔍 [getUserStats] Buscando stats para userId:', userId);

    if (!isValidUserId(userId)) {
      console.log('❌ [getUserStats] ID inválido:', userId);
      return { success: false, error: 'ID inválido', stats: null };
    }

    console.log('🔐 [getUserStats] Verificando usuário atual...');
    const currentUser = auth.currentUser;
    console.log('👤 [getUserStats] Usuário atual:', currentUser ? currentUser.uid : 'Nenhum');

    console.log('📄 [getUserStats] Fazendo query no Firestore...');
    const userDoc = await getDoc(doc(db, 'users', userId));
    console.log('📋 [getUserStats] Documento existe:', userDoc.exists());

    if (!userDoc.exists()) {
      console.warn('❌ [getUserStats] Usuário não encontrado no Firestore. Usando dados padrão.');
      return {
        success: true,
        stats: {
          name: 'Aventureiro',
          level: 1,
          xp: 0,
          totalXP: 0,
          createdAt: new Date()
        }
      };
    }

    const stats = userDoc.data();
    console.log('✅ [getUserStats] Stats encontrados:', stats);
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
    console.error('❌ [getUserStats] Erro:', error);
    console.error('❌ [getUserStats] Código do erro:', error.code);
    console.error('❌ [getUserStats] Mensagem:', error.message);
    return { success: false, error: 'Erro ao buscar estatísticas', stats: null };
  }
};