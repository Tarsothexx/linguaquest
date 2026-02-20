import { db } from './firebase';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';

// ============================================
// DADOS DO EXERCISEBANK (extraído de App.tsx)
// ============================================

const exerciseBank = {
  // Hiragana - Vogais
  h1: [
    { type: 'recognize', question: 'Qual é a pronúncia deste caractere?', char: 'あ', options: ['a', 'i', 'u', 'e'], correct: 0, explanation: 'あ se pronuncia "a" - é a primeira vogal do hiragana' },
    { type: 'recognize', question: 'Selecione o caractere "i"', char: 'い', options: ['あ', 'い', 'う', 'え'], correct: 1, explanation: 'い se pronuncia "i"' },
    { type: 'recognize', question: 'Como se escreve "u"?', char: 'う', options: ['あ', 'い', 'う', 'え'], correct: 2, explanation: 'う se pronuncia "u"' },
    { type: 'recognize', question: 'Identifique o caractere "e"', char: 'え', options: ['あ', 'い', 'う', 'え'], correct: 3, explanation: 'え se pronuncia "e"' },
    { type: 'recognize', question: 'Qual destes é "o"?', char: 'お', options: ['あ', 'お', 'か', 'さ'], correct: 1, explanation: 'お se pronuncia "o" - completa as 5 vogais básicas' },
    { type: 'write', question: 'Complete: a-i-u-e-?', options: ['あ', 'い', 'お', 'か'], correct: 2, explanation: 'A sequência completa é: あ(a) い(i) う(u) え(e) お(o)' },
    { type: 'audio', question: 'Ouça e identifique', word: 'あい', options: ['ai (amor)', 'ie (casa)', 'ao (azul)', 'ei (sim)'], correct: 0, explanation: 'あい significa "amor" em japonês' }
  ],

  // Hiragana - Série K
  h2: [
    { type: 'recognize', question: 'Qual é o caractere "ka"?', char: 'か', options: ['あ', 'か', 'さ', 'た'], correct: 1, explanation: 'か se pronuncia "ka"' },
    { type: 'recognize', question: 'Identifique "ki"', char: 'き', options: ['か', 'き', 'く', 'け'], correct: 1, explanation: 'き se pronuncia "ki"' },
    { type: 'recognize', question: 'Qual é "ku"?', char: 'く', options: ['か', 'き', 'く', 'け'], correct: 2, explanation: 'く se pronuncia "ku"' },
    { type: 'recognize', question: 'Identifique "ke"', char: 'け', options: ['か', 'き', 'く', 'け'], correct: 3, explanation: 'け se pronuncia "ke"' },
    { type: 'recognize', question: 'Qual é "ko"?', char: 'こ', options: ['か', 'き', 'こ', 'け'], correct: 2, explanation: 'こ se pronuncia "ko"' },
    { type: 'write', question: 'Complete a série: か-き-?-け-こ', options: ['く', 'け', 'こ', 'し'], correct: 0, explanation: 'A série K completa é: か(ka) き(ki) く(ku) け(ke) こ(ko)' },
    { type: 'audio', question: 'Qual palavra você ouve?', word: 'かき', options: ['caqui (fruta)', 'escritura', 'madeira de fogo', 'tosse'], correct: 0, explanation: 'かき pode significar "caqui" (fruta) ou "escritura"' }
  ],

  // Hiragana - Série S
  h3: [
    { type: 'recognize', question: 'Qual é o caractere "sa"?', char: 'さ', options: ['さ', 'し', 'す', 'せ'], correct: 0, explanation: 'さ se pronuncia "sa"' },
    { type: 'recognize', question: 'Identifique "shi"', char: 'し', options: ['さ', 'し', 'す', 'せ'], correct: 1, explanation: 'し se pronuncia "shi" (som diferente de "si")' },
    { type: 'recognize', question: 'Qual é "su"?', char: 'す', options: ['さ', 'し', 'す', 'せ'], correct: 2, explanation: 'す se pronuncia "su"' },
    { type: 'recognize', question: 'Identifique "se"', char: 'せ', options: ['さ', 'し', 'す', 'せ'], correct: 3, explanation: 'せ se pronuncia "se"' },
    { type: 'recognize', question: 'Qual é "so"?', char: 'そ', options: ['さ', 'し', 'そ', 'せ'], correct: 2, explanation: 'そ se pronuncia "so"' },
    { type: 'write', question: 'Complete a série: さ-し-?-せ-そ', options: ['す', 'せ', 'そ', 'ぬ'], correct: 0, explanation: 'A série S completa é: さ(sa) し(shi) す(su) せ(se) そ(so)' },
    { type: 'audio', question: 'Qual palavra você ouve?', word: 'さけ', options: ['bebida alcoólica', 'razão', 'som', 'peixe'], correct: 0, explanation: 'さけ significa "saquê" (bebida alcoólica)' }
  ],

  // Partículas
  p1: [
    { type: 'vocab', question: 'Partícula de sujeito - Complete: 私__ 学生です', word: 'は', romaji: 'wa', options: ['が', 'は', 'を', 'に'], correct: 1, explanation: 'は marca o sujeito (tema) da frase' },
    { type: 'vocab', question: 'Partícula de objeto direto - Complete: 水__ 飲みます', word: 'を', romaji: 'wo', options: ['が', 'は', 'を', 'に'], correct: 2, explanation: 'を marca o objeto direto do verbo' },
    { type: 'vocab', question: 'Partícula de destino - Complete: 学校__ 行きます', word: 'に', romaji: 'ni', options: ['が', 'へ', 'を', 'に'], correct: 3, explanation: 'に marca o destino ou direção' },
    { type: 'vocab', question: 'Partícula de sujeito (ênfase) - Complete: 誰__ 来ましたか', word: 'が', romaji: 'ga', options: ['が', 'は', 'を', 'に'], correct: 0, explanation: 'が marca o sujeito com ênfase ou em perguntas' },
    { type: 'vocab', question: 'Partícula de existência - Complete: 猫__ あります', word: 'が', romaji: 'ga', options: ['が', 'は', 'を', 'に'], correct: 0, explanation: 'が é usado com ある/いる para indicar existência' },
    { type: 'vocab', question: 'Partícula de posse - Complete: 私の__ 猫です', word: 'ねこ', romaji: 'neko', options: ['ねこ', 'いぬ', 'とり', 'さかな'], correct: 0, explanation: 'A partícula の indica posse (possessive)"' },
    { type: 'audio', question: 'Ouça a frase e identifique a partícula', word: 'わたしは', options: ['は (sujeito)', 'を (objeto)', 'に (destino)', 'が (ênfase)'], correct: 0, explanation: 'わたしは = "eu (como sujeito)"' }
  ],

  // Vocabulário Essencial - Números
  v1: [
    { type: 'vocab', question: 'Como se diz "um"?', word: 'いち', romaji: 'ichi', options: ['いち', 'に', 'さん', 'し'], correct: 0, explanation: 'いち = 1' },
    { type: 'vocab', question: 'Como se diz "dois"?', word: 'に', romaji: 'ni', options: ['いち', 'に', 'さん', 'し'], correct: 1, explanation: 'に = 2' },
    { type: 'vocab', question: 'Como se diz "três"?', word: 'さん', romaji: 'san', options: ['いち', 'に', 'さん', 'し'], correct: 2, explanation: 'さん = 3' },
    { type: 'vocab', question: 'Como se diz "quatro"?', word: 'し', romaji: 'shi/yon', options: ['し', 'ご', 'ろく', 'しち'], correct: 0, explanation: 'し = 4 (também pronunciado "yon")' },
    { type: 'vocab', question: 'Como se diz "cinco"?', word: 'ご', romaji: 'go', options: ['ろく', 'しち', 'ご', 'きゅう'], correct: 2, explanation: 'ご = 5' },
    { type: 'vocab', question: 'Conte: いち, に, さん, し, ?', word: 'ご', romaji: 'go', options: ['ろく', 'しち', 'ご', 'きゅう'], correct: 2, explanation: 'A sequência é: 1-2-3-4-5' },
    { type: 'audio', question: 'Qual número você ouve?', word: 'さん', options: ['1', '2', '3', '4'], correct: 2, explanation: 'Você ouviu: さん (3)' }
  ],

  // Vocabulário Essencial - Cumprimentos
  v2: [
    { type: 'vocab', question: 'Como dizer "Olá"?', word: 'こんにちは', romaji: 'Konnichiwa', options: ['おはよう', 'こんにちは', 'こんばんは', 'おやすみなさい'], correct: 1, explanation: 'こんにちは é o cumprimento padrão durante o dia' },
    { type: 'vocab', question: 'Forma mais polida de "obrigado"', word: 'ありがとうございます', romaji: 'Arigatou gozaimasu', options: ['ありがとう', 'ありがとうございます', 'どうも', 'すみません'], correct: 1, explanation: 'ございます torna a expressão mais formal' },
    { type: 'vocab', question: 'Como se diz "Boa noite"?', word: 'こんばんは', romaji: 'Konbanwa', options: ['おはよう', 'こんにちは', 'こんばんは', 'おやすみなさい'], correct: 2, explanation: 'こんばんは é o cumprimento para a noite (antes de dormir)' },
    { type: 'vocab', question: 'Como dizer "Desculpe"?', word: 'すみません', romaji: 'Sumimasen', options: ['ごめんなさい', 'すみません', 'しょうがない', 'しってますか'], correct: 1, explanation: 'すみません é a forma mais comum de pedir desculpas' },
    { type: 'vocab', question: 'Forma casual de "obrigado"', word: 'ありがとう', romaji: 'Arigatou', options: ['ありがとうございます', 'ありがとうね', 'ありがとう', 'ありがとうさん'], correct: 2, explanation: 'ありがとう é a forma casual entre amigos' },
    { type: 'vocab', question: 'Como se diz "Boa manhã"?', word: 'おはよう', romaji: 'Ohayou', options: ['おはよう', 'おはようございます', 'こんにちは', 'こんばんは'], correct: 0, explanation: 'おはよう é o cumprimento matinal' },
    { type: 'audio', question: 'qual expressão você ouve?', word: 'ありがとうございます', options: ['Bem-vindo', 'Obrigado (formal)', 'Por favor', 'Desculpe'], correct: 1, explanation: 'Você ouviu ありがとうございます (obrigado formal)' }
  ],

  // Gramática Básica
  p2: [
    { type: 'vocab', question: 'Complete: 私は日本人__. (Sou japonês)', word: 'です', romaji: 'desu', options: ['です', 'ます', 'あります', 'います'], correct: 0, explanation: 'です é o verbo "ser/estar" em forma polida' },
    { type: 'vocab', question: 'Complete: 私は毎日歩き__. (Caminho todo dia)', word: 'ます', romaji: 'masu', options: ['です', 'ます', 'あります', 'います'], correct: 1, explanation: 'ます é a terminação de forma polida de verbos' },
    { type: 'vocab', question: 'Complete: 猫が__. (Existe um gato)', word: 'あります', romaji: 'arimasu', options: ['です', 'ます', 'あります', 'います'], correct: 2, explanation: 'あります é "existir" para objetos inanimados' },
    { type: 'vocab', question: 'Complete: 私は__. (Sou eu)', word: 'です', romaji: 'desu', options: ['です', 'は', 'ます', 'います'], correct: 0, explanation: 'です completa a afirmação "Sou..."' },
    { type: 'vocab', question: 'Como fazer uma pergunta simples?', word: 'ですか', romaji: 'desu ka', options: ['ですね', 'ですか', 'ですよ', 'ですから'], correct: 1, explanation: 'ですか transforma uma frase em pergunta' },
    { type: 'vocab', question: 'Complete: 明日、学校に行き__. (Vou para a escola amanhã)', word: 'ます', romaji: 'masu', options: ['ました', 'ます', 'ましょう', 'ました'], correct: 1, explanation: 'ます indica tempo futuro ou presente' },
    { type: 'audio', question: 'Qual padrão gramatical você ouve?', word: 'です', options: ['Pergunta', 'Negação', 'Afirmação/Ser', 'Passado'], correct: 2, explanation: 'です é uma afirmação ou identificação' }
  ]
};

// ============================================
// UNIDADES E LIÇÕES
// ============================================

const unitsData = [
  {
    id: 'unit1',
    title: 'Unidade 1: Hiragana',
    subtitle: 'Alfabeto Básico Japonês',
    level: 'N5',
    icon: '🔤',
    lessons: [
      { id: 'h1', title: 'Vogais (a, i, u, e, o)', subtitle: 'あ, い, う, え, お', completed: false, xp: 50 },
      { id: 'h2', title: 'Série K', subtitle: 'か, き, く, け, こ', completed: false, xp: 50 },
      { id: 'h3', title: 'Série S', subtitle: 'さ, し, す, せ, そ', completed: false, xp: 50 }
    ]
  },
  {
    id: 'unit2',
    title: 'Unidade 2: Partículas',
    subtitle: 'Palavras Funcionais Importantes',
    level: 'N5',
    icon: '📍',
    lessons: [
      { id: 'p1', title: 'Partículas Básicas', subtitle: 'は, を, に, が', completed: false, xp: 60 }
    ]
  },
  {
    id: 'unit3',
    title: 'Unidade 3: Vocabulário Essencial',
    subtitle: 'Palavras do Dia a Dia',
    level: 'N5',
    icon: '📚',
    lessons: [
      { id: 'v1', title: 'Números (0-10)', subtitle: 'ゼロ, いち, に, さん...', completed: false, xp: 50 },
      { id: 'v2', title: 'Cumprimentos', subtitle: 'こんにちは, ありがとう...', completed: false, xp: 50 }
    ]
  },
  {
    id: 'unit4',
    title: 'Unidade 4: Gramática Básica',
    subtitle: 'Estruturas Fundamentais',
    level: 'N5',
    icon: '🔬',
    lessons: [
      { id: 'p2', title: 'Forma です', subtitle: 'Ser/Estar e Perguntas', completed: false, xp: 60 }
    ]
  }
];

// ============================================
// FUNÇÕES DE MIGRAÇÃO
// ============================================

export const migrateExercises = async () => {
  try {
    console.log('Iniciando migração de exercícios...');

    // Salvar cada lição com seus exercícios
    for (const [lessonId, exercises] of Object.entries(exerciseBank)) {
      const docRef = doc(db, 'lessons', lessonId);
      await setDoc(docRef, {
        exercises: exercises,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`✅ Lição ${lessonId} migrada`);
    }

    console.log('✅ Todas as lições foram migradas com sucesso!');
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao migrar exercícios:', error);
    return { success: false, error };
  }
};

export const migrateUnits = async () => {
  try {
    console.log('Iniciando migração de unidades...');

    for (const unit of unitsData) {
      const unitRef = doc(db, 'units', unit.id);
      await setDoc(unitRef, {
        title: unit.title,
        subtitle: unit.subtitle,
        level: unit.level,
        icon: unit.icon,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Salvar lições dentro da unidade
      for (const lesson of unit.lessons) {
        const lessonRef = doc(db, `units/${unit.id}/lessons`, lesson.id);
        await setDoc(lessonRef, {
          title: lesson.title,
          subtitle: lesson.subtitle,
          xp: lesson.xp,
          completed: false,
          createdAt: new Date()
        });
      }

      console.log(`✅ Unidade ${unit.id} migrada com ${unit.lessons.length} lições`);
    }

    console.log('✅ Todas as unidades foram migradas com sucesso!');
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao migrar unidades:', error);
    return { success: false, error };
  }
};

export const migrateMinigameData = async () => {
  try {
    console.log('Iniciando migração de dados de minigames...');

    const minigameData = {
      hiragana: [
        { char: 'あ', romaji: 'a' },
        { char: 'い', romaji: 'i' },
        { char: 'う', romaji: 'u' },
        { char: 'え', romaji: 'e' },
        { char: 'お', romaji: 'o' },
        { char: 'か', romaji: 'ka' },
        { char: 'き', romaji: 'ki' },
        { char: 'く', romaji: 'ku' },
        { char: 'け', romaji: 'ke' },
        { char: 'こ', romaji: 'ko' }
      ],
      katakana: [
        { char: 'ア', romaji: 'a' },
        { char: 'イ', romaji: 'i' },
        { char: 'ウ', romaji: 'u' },
        { char: 'エ', romaji: 'e' },
        { char: 'オ', romaji: 'o' },
        { char: 'カ', romaji: 'ka' },
        { char: 'キ', romaji: 'ki' },
        { char: 'ク', romaji: 'ku' },
        { char: 'ケ', romaji: 'ke' },
        { char: 'コ', romaji: 'ko' }
      ],
      numbers: [
        { char: '0', romaji: 'zero/rei' },
        { char: '1', romaji: 'ichi' },
        { char: '2', romaji: 'ni' },
        { char: '3', romaji: 'san' },
        { char: '4', romaji: 'shi/yon' },
        { char: '5', romaji: 'go' },
        { char: '6', romaji: 'roku' },
        { char: '7', romaji: 'shichi/nana' },
        { char: '8', romaji: 'hachi' },
        { char: '9', romaji: 'kyuu' }
      ]
    };

    for (const [gameType, data] of Object.entries(minigameData)) {
      const docRef = doc(db, 'minigames', gameType);
      await setDoc(docRef, {
        type: gameType,
        data: data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`✅ Minigame ${gameType} migrado com ${data.length} itens`);
    }

    console.log('✅ Todos os minigames foram migrados com sucesso!');
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao migrar minigames:', error);
    return { success: false, error };
  }
};

// Função para executar todas as migrações
export const runAllMigrations = async () => {
  try {
    console.log('🚀 Iniciando migração completa...\n');

    const results = [];

    // Executar migrações
    results.push(await migrateUnits());
    results.push(await migrateExercises());
    results.push(await migrateMinigameData());

    if (results.every(r => r.success)) {
      console.log('\n✅ MIGRAÇÃO COMPLETA COM SUCESSO! 🎉');
      return { success: true, message: 'Todos os dados foram migrados para o Firestore' };
    } else {
      console.log('\n⚠️ Algumas migrações falharam');
      return { success: false, message: 'Erro em uma ou mais migrações' };
    }
  } catch (error) {
    console.error('❌ Erro geral na migração:', error);
    return { success: false, error };
  }
};

// Função para carregar exercícios do Firestore
export const loadExercisesFromFirestore = async () => {
  try {
    const lessonsSnapshot = await getDocs(collection(db, 'lessons'));
    const exercises: any = {};

    lessonsSnapshot.forEach((doc) => {
      exercises[doc.id] = doc.data().exercises;
    });

    return { success: true, exercises };
  } catch (error) {
    console.error('Erro ao carregar exercícios:', error);
    return { success: false, error };
  }
};

// Função para carregar unidades do Firestore
export const loadUnitsFromFirestore = async () => {
  try {
    const unitsSnapshot = await getDocs(collection(db, 'units'));
    const units: any[] = [];

    for (const unitDoc of unitsSnapshot.docs) {
      const lessonsSnapshot = await getDocs(collection(db, `units/${unitDoc.id}/lessons`));
      const lessons = lessonsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      units.push({
        id: unitDoc.id,
        ...unitDoc.data(),
        lessons
      });
    }

    return { success: true, units };
  } catch (error) {
    console.error('Erro ao carregar unidades:', error);
    return { success: false, error };
  }
};

// Função para carregar minigames do Firestore
export const loadMinigamesFromFirestore = async () => {
  try {
    const minigamesSnapshot = await getDocs(collection(db, 'minigames'));
    const minigames: any = {};

    minigamesSnapshot.forEach((doc) => {
      minigames[doc.id] = doc.data().data;
    });

    return { success: true, minigames };
  } catch (error) {
    console.error('Erro ao carregar minigames:', error);
    return { success: false, error };
  }
};