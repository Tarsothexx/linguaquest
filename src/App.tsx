import React, { useState, useEffect } from 'react';
import { Flame, Zap, Trophy, Star, Heart, Volume2, Check, X, ChevronRight, Award, Target, Sparkles, Crown, Shield, User, Mail, Lock, LogOut, TrendingUp, BookOpen, Lightbulb, RefreshCw, Gamepad2, Info, Search, Grid3x3 } from 'lucide-react';
import { registerUser, loginUser, logoutUser, saveProgress, getUserProgress, saveMinigameScore, getUserStats, auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authScreen, setAuthScreen] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  
  const [selectedLanguage, setSelectedLanguage] = useState('japanese');
  const [currentScreen, setCurrentScreen] = useState('map'); // map, unit, lesson, complete, minigame, resources, dictionary
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [selectedResourceTab, setSelectedResourceTab] = useState('hiragana'); // hiragana, katakana, particles
  const [dictionaryQuery, setDictionaryQuery] = useState('');
  const [dictionaryResult, setDictionaryResult] = useState<any>(null);
  const [dictionaryLoading, setDictionaryLoading] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: 'Aventureiro',
    email: '',
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    rank: 'Ferro',
    hearts: 5,
    maxHearts: 5,
    streak: 0,
    totalXP: 0,
    gemsCollected: 0,
    lastLoginDate: null as string | null,
    completedLessons: [] as string[]
  });
  
  // Minigame states
  const [minigameMode, setMinigameMode] = useState<string | null>(null); // 'hiragana', 'katakana', 'numbers'
  const [minigameQuestion, setMinigameQuestion] = useState(0);
  const [minigameScore, setMinigameScore] = useState({ correct: 0, wrong: 0 });
  const [minigameCurrentChar, setMinigameCurrentChar] = useState<any>(null);
  const [minigameOptions, setMinigameOptions] = useState<any[]>([]);
  const [minigameSelected, setMinigameSelected] = useState<string | null>(null);
  const [minigameShowResult, setMinigameShowResult] = useState(false);
  const [minigameAnimating, setMinigameAnimating] = useState(false);
  const [minigameShuffledData, setMinigameShuffledData] = useState<any[]>([]);
  
  const [units, setUnits] = useState([
    {
      id: 'unit1',
      title: 'Unidade 1: Hiragana',
      subtitle: 'Alfabeto Básico Japonês',
      level: 'N5',
      color: 'from-pink-400 to-rose-500',
      icon: 'あ',
      locked: false,
      lessons: [
        { id: 'h1', title: 'Vogais あいうえお', subtitle: '5 sons básicos', completed: false, stars: 0, xp: 30 },
        { id: 'h2', title: 'Série K かきくけこ', subtitle: 'Consoante K', completed: false, stars: 0, xp: 30 },
        { id: 'h3', title: 'Série S さしすせそ', subtitle: 'Consoante S', completed: false, stars: 0, xp: 30 },
        { id: 'h4', title: 'Série T たちつてと', subtitle: 'Consoante T', completed: false, stars: 0, xp: 30 },
        { id: 'h5', title: 'Série N なにぬねの', subtitle: 'Consoante N', completed: false, stars: 0, xp: 30 },
        { id: 'h6', title: 'Série H はひふへほ', subtitle: 'Consoante H', completed: false, stars: 0, xp: 30 },
        { id: 'h7', title: 'Série M まみむめも', subtitle: 'Consoante M', completed: false, stars: 0, xp: 30 },
        { id: 'h8', title: 'Série Y・R・W やゆよ らりるれろ わをん', subtitle: 'Completando o alfabeto', completed: false, stars: 0, xp: 40 }
      ]
    },
    {
      id: 'unit2',
      title: 'Unidade 2: Saudações e Básico',
      subtitle: 'Primeiras Palavras',
      level: 'N5',
      color: 'from-blue-400 to-indigo-500',
      icon: '👋',
      locked: false,
      lessons: [
        { id: 's1', title: 'Cumprimentos', subtitle: 'こんにちは、おはよう', completed: false, stars: 0, xp: 40 },
        { id: 's2', title: 'Agradecimentos', subtitle: 'ありがとう、すみません', completed: false, stars: 0, xp: 40 },
        { id: 's3', title: 'Apresentações', subtitle: 'Dizer seu nome', completed: false, stars: 0, xp: 40 },
        { id: 's4', title: 'Sim e Não', subtitle: 'はい、いいえ', completed: false, stars: 0, xp: 40 }
      ]
    },
    {
      id: 'unit3',
      title: 'Unidade 3: Números',
      subtitle: 'Contando em Japonês',
      level: 'N5',
      color: 'from-green-400 to-emerald-500',
      icon: '🔢',
      locked: false,
      lessons: [
        { id: 'n1', title: 'Números 1-10', subtitle: 'いち、に、さん...', completed: false, stars: 0, xp: 40 },
        { id: 'n2', title: 'Números 11-100', subtitle: 'じゅう、にじゅう...', completed: false, stars: 0, xp: 50 },
        { id: 'n3', title: 'Contadores Básicos', subtitle: '~つ、~人、~個', completed: false, stars: 0, xp: 50 }
      ]
    },
    {
      id: 'unit4',
      title: 'Unidade 4: Katakana',
      subtitle: 'Alfabeto para Palavras Estrangeiras',
      level: 'N5',
      color: 'from-purple-400 to-pink-500',
      icon: 'ア',
      locked: true,
      lessons: [
        { id: 'k1', title: 'Vogais アイウエオ', subtitle: 'Katakana básico', completed: false, stars: 0, xp: 30 },
        { id: 'k2', title: 'Séries K-N', subtitle: 'カキクケコ até ナニヌネノ', completed: false, stars: 0, xp: 40 },
        { id: 'k3', title: 'Séries H-W', subtitle: 'Completando katakana', completed: false, stars: 0, xp: 40 },
        { id: 'k4', title: 'Palavras Estrangeiras', subtitle: 'コーヒー、カメラ', completed: false, stars: 0, xp: 50 }
      ]
    },
    {
      id: 'unit5',
      title: 'Unidade 5: Vocabulário Essencial',
      subtitle: 'Palavras do Dia a Dia',
      level: 'N5',
      color: 'from-yellow-400 to-orange-500',
      icon: '📚',
      locked: true,
      lessons: [
        { id: 'v1', title: 'Família', subtitle: 'かぞく、ちち、はは', completed: false, stars: 0, xp: 50 },
        { id: 'v2', title: 'Comidas', subtitle: 'たべもの、のみもの', completed: false, stars: 0, xp: 50 },
        { id: 'v3', title: 'Lugares', subtitle: 'がっこう、うち、えき', completed: false, stars: 0, xp: 50 },
        { id: 'v4', title: 'Tempo', subtitle: 'きょう、あした、いま', completed: false, stars: 0, xp: 50 }
      ]
    },
    {
      id: 'unit6',
      title: 'Unidade 6: Partículas',
      subtitle: 'Conectando Palavras',
      level: 'N5',
      color: 'from-red-400 to-pink-500',
      icon: '⚡',
      locked: true,
      lessons: [
        { id: 'p1', title: 'Partícula は (wa)', subtitle: 'Marcador de tópico', completed: false, stars: 0, xp: 60 },
        { id: 'p2', title: 'Partícula を (wo/o)', subtitle: 'Objeto direto', completed: false, stars: 0, xp: 60 },
        { id: 'p3', title: 'Partículas に・で', subtitle: 'Lugar e tempo', completed: false, stars: 0, xp: 60 },
        { id: 'p4', title: 'Partículas が・も・と', subtitle: 'Sujeito e outros', completed: false, stars: 0, xp: 60 }
      ]
    },
    {
      id: 'unit7',
      title: 'Unidade 7: Verbos Básicos',
      subtitle: 'Ações do Cotidiano',
      level: 'N5',
      color: 'from-indigo-400 to-purple-500',
      icon: '🏃',
      locked: true,
      lessons: [
        { id: 'vb1', title: 'Verbos です・います', subtitle: 'Ser e estar', completed: false, stars: 0, xp: 70 },
        { id: 'vb2', title: 'Verbos ~ます (Forma Polida)', subtitle: 'たべます、のみます', completed: false, stars: 0, xp: 70 },
        { id: 'vb3', title: 'Verbos Negativos', subtitle: '~ません', completed: false, stars: 0, xp: 70 },
        { id: 'vb4', title: 'Verbos no Passado', subtitle: '~ました、~ませんでした', completed: false, stars: 0, xp: 70 }
      ]
    },
    {
      id: 'unit8',
      title: 'Unidade 8: Adjetivos',
      subtitle: 'Descrevendo Coisas',
      level: 'N4',
      color: 'from-cyan-400 to-blue-500',
      icon: '🎨',
      locked: true,
      lessons: [
        { id: 'a1', title: 'Adjetivos-i', subtitle: 'おおきい、あかい', completed: false, stars: 0, xp: 80 },
        { id: 'a2', title: 'Adjetivos-na', subtitle: 'きれい、しずか', completed: false, stars: 0, xp: 80 },
        { id: 'a3', title: 'Negativo e Passado', subtitle: 'Conjugações', completed: false, stars: 0, xp: 80 }
      ]
    },
    {
      id: 'unit9',
      title: 'Unidade 9: Kanji Básico N5',
      subtitle: 'Primeiros Ideogramas',
      level: 'N4',
      color: 'from-orange-400 to-red-500',
      icon: '漢',
      locked: true,
      lessons: [
        { id: 'kj1', title: 'Números em Kanji', subtitle: '一二三四五', completed: false, stars: 0, xp: 100 },
        { id: 'kj2', title: 'Tempo em Kanji', subtitle: '日月年時', completed: false, stars: 0, xp: 100 },
        { id: 'kj3', title: 'Pessoas em Kanji', subtitle: '人男女子', completed: false, stars: 0, xp: 100 },
        { id: 'kj4', title: 'Kanji Essenciais', subtitle: '大小中上下', completed: false, stars: 0, xp: 100 }
      ]
    }
  ]);

  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [exerciseResults, setExerciseResults] = useState<boolean[]>([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const [dailyQuests, setDailyQuests] = useState([
    { id: 1, title: 'Complete 2 lições', progress: 0, target: 2, xp: 30, completed: false },
    { id: 2, title: 'Acerte 20 exercícios', progress: 0, target: 20, xp: 40, completed: false },
    { id: 3, title: 'Pratique por 3 dias seguidos', progress: 0, target: 3, xp: 100, completed: false },
    { id: 4, title: 'Ganhe 150 XP hoje', progress: 0, target: 150, xp: 50, completed: false }
  ]);

  // Partículas japonesas com traduções
  const particleTranslations = {
    'は': { romaji: 'wa', translation: 'Marcador de tópico (indica o assunto da frase)' },
    'を': { romaji: 'wo/o', translation: 'Marcador de objeto direto' },
    'に': { romaji: 'ni', translation: 'Direção, tempo específico, localização de existência' },
    'で': { romaji: 'de', translation: 'Local de ação, meio/instrumento' },
    'が': { romaji: 'ga', translation: 'Marcador de sujeito (ênfase)' },
    'も': { romaji: 'mo', translation: 'Também, até mesmo' },
    'と': { romaji: 'to', translation: 'E (conecta substantivos), com (companhia)' },
    'の': { romaji: 'no', translation: 'Posse, modificador' },
    'へ': { romaji: 'e', translation: 'Direção (para onde)' },
    'や': { romaji: 'ya', translation: 'E (lista não exaustiva)' },
    'か': { romaji: 'ka', translation: 'Marca de pergunta' },
    'ね': { romaji: 'ne', translation: 'Busca confirmação, "né?"' },
    'よ': { romaji: 'yo', translation: 'Ênfase, "sabia?"' }
  };

  // Dados para o minigame
  const minigameData = {
    hiragana: [
      // Vogais básicas
      { char: 'あ', romaji: 'a' }, { char: 'い', romaji: 'i' }, { char: 'う', romaji: 'u' }, { char: 'え', romaji: 'e' }, { char: 'お', romaji: 'o' },
      // Série K
      { char: 'か', romaji: 'ka' }, { char: 'き', romaji: 'ki' }, { char: 'く', romaji: 'ku' }, { char: 'け', romaji: 'ke' }, { char: 'こ', romaji: 'ko' },
      // Série S
      { char: 'さ', romaji: 'sa' }, { char: 'し', romaji: 'shi' }, { char: 'す', romaji: 'su' }, { char: 'せ', romaji: 'se' }, { char: 'そ', romaji: 'so' },
      // Série T
      { char: 'た', romaji: 'ta' }, { char: 'ち', romaji: 'chi' }, { char: 'つ', romaji: 'tsu' }, { char: 'て', romaji: 'te' }, { char: 'と', romaji: 'to' },
      // Série N
      { char: 'な', romaji: 'na' }, { char: 'に', romaji: 'ni' }, { char: 'ぬ', romaji: 'nu' }, { char: 'ね', romaji: 'ne' }, { char: 'の', romaji: 'no' },
      // Série H
      { char: 'は', romaji: 'ha' }, { char: 'ひ', romaji: 'hi' }, { char: 'ふ', romaji: 'fu' }, { char: 'へ', romaji: 'he' }, { char: 'ほ', romaji: 'ho' },
      // Série M
      { char: 'ま', romaji: 'ma' }, { char: 'み', romaji: 'mi' }, { char: 'む', romaji: 'mu' }, { char: 'め', romaji: 'me' }, { char: 'も', romaji: 'mo' },
      // Série Y
      { char: 'や', romaji: 'ya' }, { char: 'ゆ', romaji: 'yu' }, { char: 'よ', romaji: 'yo' },
      // Série R
      { char: 'ら', romaji: 'ra' }, { char: 'り', romaji: 'ri' }, { char: 'る', romaji: 'ru' }, { char: 'れ', romaji: 're' }, { char: 'ろ', romaji: 'ro' },
      // W e N
      { char: 'わ', romaji: 'wa' }, { char: 'を', romaji: 'wo' }, { char: 'ん', romaji: 'n' },
      
      // DAKUTEN (゙) - Sons sonoros
      { char: 'が', romaji: 'ga' }, { char: 'ぎ', romaji: 'gi' }, { char: 'ぐ', romaji: 'gu' }, { char: 'げ', romaji: 'ge' }, { char: 'ご', romaji: 'go' },
      { char: 'ざ', romaji: 'za' }, { char: 'じ', romaji: 'ji' }, { char: 'ず', romaji: 'zu' }, { char: 'ぜ', romaji: 'ze' }, { char: 'ぞ', romaji: 'zo' },
      { char: 'だ', romaji: 'da' }, { char: 'ぢ', romaji: 'ji' }, { char: 'づ', romaji: 'zu' }, { char: 'で', romaji: 'de' }, { char: 'ど', romaji: 'do' },
      { char: 'ば', romaji: 'ba' }, { char: 'び', romaji: 'bi' }, { char: 'ぶ', romaji: 'bu' }, { char: 'べ', romaji: 'be' }, { char: 'ぼ', romaji: 'bo' },
      
      // HANDAKUTEN (゚) - Sons P
      { char: 'ぱ', romaji: 'pa' }, { char: 'ぴ', romaji: 'pi' }, { char: 'ぷ', romaji: 'pu' }, { char: 'ぺ', romaji: 'pe' }, { char: 'ぽ', romaji: 'po' },
      
      // YŌON (拗音) - Combinações
      { char: 'きゃ', romaji: 'kya' }, { char: 'きゅ', romaji: 'kyu' }, { char: 'きょ', romaji: 'kyo' },
      { char: 'しゃ', romaji: 'sha' }, { char: 'しゅ', romaji: 'shu' }, { char: 'しょ', romaji: 'sho' },
      { char: 'ちゃ', romaji: 'cha' }, { char: 'ちゅ', romaji: 'chu' }, { char: 'ちょ', romaji: 'cho' },
      { char: 'にゃ', romaji: 'nya' }, { char: 'にゅ', romaji: 'nyu' }, { char: 'にょ', romaji: 'nyo' },
      { char: 'ひゃ', romaji: 'hya' }, { char: 'ひゅ', romaji: 'hyu' }, { char: 'ひょ', romaji: 'hyo' },
      { char: 'みゃ', romaji: 'mya' }, { char: 'みゅ', romaji: 'myu' }, { char: 'みょ', romaji: 'myo' },
      { char: 'りゃ', romaji: 'rya' }, { char: 'りゅ', romaji: 'ryu' }, { char: 'りょ', romaji: 'ryo' },
      { char: 'ぎゃ', romaji: 'gya' }, { char: 'ぎゅ', romaji: 'gyu' }, { char: 'ぎょ', romaji: 'gyo' },
      { char: 'じゃ', romaji: 'ja' }, { char: 'じゅ', romaji: 'ju' }, { char: 'じょ', romaji: 'jo' },
      { char: 'びゃ', romaji: 'bya' }, { char: 'びゅ', romaji: 'byu' }, { char: 'びょ', romaji: 'byo' },
      { char: 'ぴゃ', romaji: 'pya' }, { char: 'ぴゅ', romaji: 'pyu' }, { char: 'ぴょ', romaji: 'pyo' }
    ],
    katakana: [
      // Vogais básicas
      { char: 'ア', romaji: 'a' }, { char: 'イ', romaji: 'i' }, { char: 'ウ', romaji: 'u' }, { char: 'エ', romaji: 'e' }, { char: 'オ', romaji: 'o' },
      // Série K
      { char: 'カ', romaji: 'ka' }, { char: 'キ', romaji: 'ki' }, { char: 'ク', romaji: 'ku' }, { char: 'ケ', romaji: 'ke' }, { char: 'コ', romaji: 'ko' },
      // Série S
      { char: 'サ', romaji: 'sa' }, { char: 'シ', romaji: 'shi' }, { char: 'ス', romaji: 'su' }, { char: 'セ', romaji: 'se' }, { char: 'ソ', romaji: 'so' },
      // Série T
      { char: 'タ', romaji: 'ta' }, { char: 'チ', romaji: 'chi' }, { char: 'ツ', romaji: 'tsu' }, { char: 'テ', romaji: 'te' }, { char: 'ト', romaji: 'to' },
      // Série N
      { char: 'ナ', romaji: 'na' }, { char: 'ニ', romaji: 'ni' }, { char: 'ヌ', romaji: 'nu' }, { char: 'ネ', romaji: 'ne' }, { char: 'ノ', romaji: 'no' },
      // Série H
      { char: 'ハ', romaji: 'ha' }, { char: 'ヒ', romaji: 'hi' }, { char: 'フ', romaji: 'fu' }, { char: 'ヘ', romaji: 'he' }, { char: 'ホ', romaji: 'ho' },
      // Série M
      { char: 'マ', romaji: 'ma' }, { char: 'ミ', romaji: 'mi' }, { char: 'ム', romaji: 'mu' }, { char: 'メ', romaji: 'me' }, { char: 'モ', romaji: 'mo' },
      // Série Y
      { char: 'ヤ', romaji: 'ya' }, { char: 'ユ', romaji: 'yu' }, { char: 'ヨ', romaji: 'yo' },
      // Série R
      { char: 'ラ', romaji: 'ra' }, { char: 'リ', romaji: 'ri' }, { char: 'ル', romaji: 'ru' }, { char: 'レ', romaji: 're' }, { char: 'ロ', romaji: 'ro' },
      // W e N
      { char: 'ワ', romaji: 'wa' }, { char: 'ヲ', romaji: 'wo' }, { char: 'ン', romaji: 'n' },
      
      // DAKUTEN (゙) - Sons sonoros
      { char: 'ガ', romaji: 'ga' }, { char: 'ギ', romaji: 'gi' }, { char: 'グ', romaji: 'gu' }, { char: 'ゲ', romaji: 'ge' }, { char: 'ゴ', romaji: 'go' },
      { char: 'ザ', romaji: 'za' }, { char: 'ジ', romaji: 'ji' }, { char: 'ズ', romaji: 'zu' }, { char: 'ゼ', romaji: 'ze' }, { char: 'ゾ', romaji: 'zo' },
      { char: 'ダ', romaji: 'da' }, { char: 'ヂ', romaji: 'ji' }, { char: 'ヅ', romaji: 'zu' }, { char: 'デ', romaji: 'de' }, { char: 'ド', romaji: 'do' },
      { char: 'バ', romaji: 'ba' }, { char: 'ビ', romaji: 'bi' }, { char: 'ブ', romaji: 'bu' }, { char: 'ベ', romaji: 'be' }, { char: 'ボ', romaji: 'bo' },
      
      // HANDAKUTEN (゚) - Sons P
      { char: 'パ', romaji: 'pa' }, { char: 'ピ', romaji: 'pi' }, { char: 'プ', romaji: 'pu' }, { char: 'ペ', romaji: 'pe' }, { char: 'ポ', romaji: 'po' },
      
      // YŌON (拗音) - Combinações
      { char: 'キャ', romaji: 'kya' }, { char: 'キュ', romaji: 'kyu' }, { char: 'キョ', romaji: 'kyo' },
      { char: 'シャ', romaji: 'sha' }, { char: 'シュ', romaji: 'shu' }, { char: 'ショ', romaji: 'sho' },
      { char: 'チャ', romaji: 'cha' }, { char: 'チュ', romaji: 'chu' }, { char: 'チョ', romaji: 'cho' },
      { char: 'ニャ', romaji: 'nya' }, { char: 'ニュ', romaji: 'nyu' }, { char: 'ニョ', romaji: 'nyo' },
      { char: 'ヒャ', romaji: 'hya' }, { char: 'ヒュ', romaji: 'hyu' }, { char: 'ヒョ', romaji: 'hyo' },
      { char: 'ミャ', romaji: 'mya' }, { char: 'ミュ', romaji: 'myu' }, { char: 'ミョ', romaji: 'myo' },
      { char: 'リャ', romaji: 'rya' }, { char: 'リュ', romaji: 'ryu' }, { char: 'リョ', romaji: 'ryo' },
      { char: 'ギャ', romaji: 'gya' }, { char: 'ギュ', romaji: 'gyu' }, { char: 'ギョ', romaji: 'gyo' },
      { char: 'ジャ', romaji: 'ja' }, { char: 'ジュ', romaji: 'ju' }, { char: 'ジョ', romaji: 'jo' },
      { char: 'ビャ', romaji: 'bya' }, { char: 'ビュ', romaji: 'byu' }, { char: 'ビョ', romaji: 'byo' },
      { char: 'ピャ', romaji: 'pya' }, { char: 'ピュ', romaji: 'pyu' }, { char: 'ピョ', romaji: 'pyo' },
      
      // COMBINAÇÕES EXTRAS DE KATAKANA (para palavras estrangeiras)
      { char: 'ファ', romaji: 'fa' }, { char: 'フィ', romaji: 'fi' }, { char: 'フェ', romaji: 'fe' }, { char: 'フォ', romaji: 'fo' },
      { char: 'ウィ', romaji: 'wi' }, { char: 'ウェ', romaji: 'we' }, { char: 'ウォ', romaji: 'wo' },
      { char: 'ヴァ', romaji: 'va' }, { char: 'ヴィ', romaji: 'vi' }, { char: 'ヴ', romaji: 'vu' }, { char: 'ヴェ', romaji: 've' }, { char: 'ヴォ', romaji: 'vo' },
      { char: 'ティ', romaji: 'ti' }, { char: 'ディ', romaji: 'di' }, { char: 'デュ', romaji: 'dyu' },
      { char: 'トゥ', romaji: 'tu' }, { char: 'ドゥ', romaji: 'du' }
    ],
    numbers: [
      { char: '一', romaji: 'ichi' }, { char: '二', romaji: 'ni' }, { char: '三', romaji: 'san' }, { char: '四', romaji: 'shi/yon' }, 
      { char: '五', romaji: 'go' }, { char: '六', romaji: 'roku' }, { char: '七', romaji: 'shichi/nana' }, { char: '八', romaji: 'hachi' }, 
      { char: '九', romaji: 'kyuu' }, { char: '十', romaji: 'juu' },
      { char: 'いち', romaji: 'ichi' }, { char: 'に', romaji: 'ni' }, { char: 'さん', romaji: 'san' }, { char: 'よん', romaji: 'yon' },
      { char: 'ご', romaji: 'go' }, { char: 'ろく', romaji: 'roku' }, { char: 'なな', romaji: 'nana' }, { char: 'はち', romaji: 'hachi' },
      { char: 'きゅう', romaji: 'kyuu' }, { char: 'じゅう', romaji: 'juu' },
      // Números grandes
      { char: '百', romaji: 'hyaku' }, { char: '千', romaji: 'sen' }, { char: '万', romaji: 'man' },
      { char: 'ひゃく', romaji: 'hyaku' }, { char: 'せん', romaji: 'sen' }, { char: 'まん', romaji: 'man' }
    ]
  };

  // Banco de exercícios completo
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
      { type: 'recognize', question: 'Qual é "ka"?', char: 'か', options: ['か', 'き', 'く', 'け'], correct: 0, explanation: 'か se pronuncia "ka"' },
      { type: 'recognize', question: 'Identifique "ki"', char: 'き', options: ['か', 'き', 'く', 'け'], correct: 1, explanation: 'き se pronuncia "ki"' },
      { type: 'recognize', question: 'Este caractere é?', char: 'く', options: ['ku', 'ke', 'ko', 'ka'], correct: 0, explanation: 'く se pronuncia "ku"' },
      { type: 'recognize', question: 'Encontre "ke"', char: 'け', options: ['か', 'き', 'く', 'け'], correct: 3, explanation: 'け se pronuncia "ke"' },
      { type: 'recognize', question: 'Selecione "ko"', char: 'こ', options: ['こ', 'か', 'き', 'く'], correct: 0, explanation: 'こ se pronuncia "ko"' },
      { type: 'vocab', question: 'O que significa かき?', word: 'かき', romaji: 'kaki', options: ['Ostra', 'Caqui', 'Casa', 'Escrever'], correct: 1, explanation: 'かき (kaki) significa "caqui" (a fruta)' },
      { type: 'vocab', question: 'Traduza: ここ', word: 'ここ', romaji: 'koko', options: ['Ali', 'Lá', 'Aqui', 'Onde'], correct: 2, explanation: 'ここ (koko) significa "aqui"' }
    ],
    
    // Hiragana - Série S
    h3: [
      { type: 'recognize', question: 'Qual é a pronúncia deste caractere?', char: 'さ', options: ['sa', 'shi', 'su', 'se'], correct: 0, explanation: 'さ se pronuncia "sa"' },
      { type: 'recognize', question: 'Identifique "shi"', char: 'し', options: ['sa', 'shi', 'su', 'se'], correct: 1, explanation: 'し se pronuncia "shi"' },
      { type: 'recognize', question: 'Este caractere é?', char: 'す', options: ['su', 'se', 'so', 'sa'], correct: 0, explanation: 'す se pronuncia "su"' },
      { type: 'recognize', question: 'Encontre "se"', char: 'せ', options: ['sa', 'shi', 'su', 'se'], correct: 3, explanation: 'せ se pronuncia "se"' },
      { type: 'recognize', question: 'Selecione "so"', char: 'そ', options: ['so', 'sa', 'shi', 'su'], correct: 0, explanation: 'そ se pronuncia "so"' },
      { type: 'vocab', question: 'O que significa すし?', word: 'すし', romaji: 'sushi', options: ['Sushi', 'Sopa', 'Salada', 'Sorvete'], correct: 0, explanation: 'すし (sushi) é o famoso prato japonês' },
      { type: 'vocab', question: 'Traduza: せんせい', word: 'せんせい', romaji: 'sensei', options: ['Professor', 'Estudante', 'Diretor', 'Pai'], correct: 0, explanation: 'せんせい (sensei) significa "professor" ou "mestre"' }
    ],
    
    // Hiragana - Série T
    h4: [
      { type: 'recognize', question: 'Qual é a pronúncia deste caractere?', char: 'た', options: ['ta', 'chi', 'tsu', 'te'], correct: 0, explanation: 'た se pronuncia "ta"' },
      { type: 'recognize', question: 'Identifique "chi"', char: 'ち', options: ['ta', 'chi', 'tsu', 'te'], correct: 1, explanation: 'ち se pronuncia "chi"' },
      { type: 'recognize', question: 'Este caractere é?', char: 'つ', options: ['tsu', 'te', 'to', 'ta'], correct: 0, explanation: 'つ se pronuncia "tsu"' },
      { type: 'recognize', question: 'Encontre "te"', char: 'て', options: ['ta', 'chi', 'tsu', 'te'], correct: 3, explanation: 'て se pronuncia "te"' },
      { type: 'recognize', question: 'Selecione "to"', char: 'と', options: ['to', 'ta', 'chi', 'tsu'], correct: 0, explanation: 'と se pronuncia "to"' },
      { type: 'vocab', question: 'O que significa ちず?', word: 'ちず', romaji: 'chizu', options: ['Mapa', 'Livro', 'Carro', 'Casa'], correct: 0, explanation: 'ちず (chizu) significa "mapa"' },
      { type: 'vocab', question: 'Traduza: ともだち', word: 'ともだち', romaji: 'tomodachi', options: ['Amigo', 'Professor', 'Família', 'Animal'], correct: 0, explanation: 'ともだち (tomodachi) significa "amigo"' }
    ],
    
    // Hiragana - Série N
    h5: [
      { type: 'recognize', question: 'Qual é a pronúncia deste caractere?', char: 'な', options: ['na', 'ni', 'nu', 'ne'], correct: 0, explanation: 'な se pronuncia "na"' },
      { type: 'recognize', question: 'Identifique "ni"', char: 'に', options: ['na', 'ni', 'nu', 'ne'], correct: 1, explanation: 'に se pronuncia "ni"' },
      { type: 'recognize', question: 'Este caractere é?', char: 'ぬ', options: ['nu', 'ne', 'no', 'na'], correct: 0, explanation: 'ぬ se pronuncia "nu"' },
      { type: 'recognize', question: 'Encontre "ne"', char: 'ね', options: ['na', 'ni', 'nu', 'ne'], correct: 3, explanation: 'ね se pronuncia "ne"' },
      { type: 'recognize', question: 'Selecione "no"', char: 'の', options: ['no', 'na', 'ni', 'nu'], correct: 0, explanation: 'の se pronuncia "no"' },
      { type: 'vocab', question: 'O que significa なまえ?', word: 'なまえ', romaji: 'namae', options: ['Nome', 'Número', 'Nó', 'Nuvem'], correct: 0, explanation: 'なまえ (namae) significa "nome"' },
      { type: 'vocab', question: 'Traduza: ねこ', word: 'ねこ', romaji: 'neko', options: ['Gato', 'Cachorro', 'Pássaro', 'Peixe'], correct: 0, explanation: 'ねこ (neko) significa "gato"' }
    ],
    
    // Hiragana - Série H
    h6: [
      { type: 'recognize', question: 'Qual é a pronúncia deste caractere?', char: 'は', options: ['ha', 'hi', 'fu', 'he'], correct: 0, explanation: 'は se pronuncia "ha"' },
      { type: 'recognize', question: 'Identifique "hi"', char: 'ひ', options: ['ha', 'hi', 'fu', 'he'], correct: 1, explanation: 'ひ se pronuncia "hi"' },
      { type: 'recognize', question: 'Este caractere é?', char: 'ふ', options: ['fu', 'he', 'ho', 'ha'], correct: 0, explanation: 'ふ se pronuncia "fu"' },
      { type: 'recognize', question: 'Encontre "he"', char: 'へ', options: ['ha', 'hi', 'fu', 'he'], correct: 3, explanation: 'へ se pronuncia "he"' },
      { type: 'recognize', question: 'Selecione "ho"', char: 'ほ', options: ['ho', 'ha', 'hi', 'fu'], correct: 0, explanation: 'ほ se pronuncia "ho"' },
      { type: 'vocab', question: 'O que significa はな?', word: 'はな', romaji: 'hana', options: ['Flor', 'Nariz', 'Folha', 'Sol'], correct: 0, explanation: 'はな (hana) significa "flor"' },
      { type: 'vocab', question: 'Traduza: ひと', word: 'ひと', romaji: 'hito', options: ['Pessoa', 'Dia', 'Ano', 'Mês'], correct: 0, explanation: 'ひと (hito) significa "pessoa"' }
    ],
    
    // Hiragana - Série M
    h7: [
      { type: 'recognize', question: 'Qual é a pronúncia deste caractere?', char: 'ま', options: ['ma', 'mi', 'mu', 'me'], correct: 0, explanation: 'ま se pronuncia "ma"' },
      { type: 'recognize', question: 'Identifique "mi"', char: 'み', options: ['ma', 'mi', 'mu', 'me'], correct: 1, explanation: 'み se pronuncia "mi"' },
      { type: 'recognize', question: 'Este caractere é?', char: 'む', options: ['mu', 'me', 'mo', 'ma'], correct: 0, explanation: 'む se pronuncia "mu"' },
      { type: 'recognize', question: 'Encontre "me"', char: 'め', options: ['ma', 'mi', 'mu', 'me'], correct: 3, explanation: 'め se pronuncia "me"' },
      { type: 'recognize', question: 'Selecione "mo"', char: 'も', options: ['mo', 'ma', 'mi', 'mu'], correct: 0, explanation: 'も se pronuncia "mo"' },
      { type: 'vocab', question: 'O que significa みず?', word: 'みず', romaji: 'mizu', options: ['Água', 'Fogo', 'Terra', 'Ar'], correct: 0, explanation: 'みず (mizu) significa "água"' },
      { type: 'vocab', question: 'Traduza: めがね', word: 'めがね', romaji: 'megane', options: ['Óculos', 'Livro', 'Caneta', 'Papel'], correct: 0, explanation: 'めがね (megane) significa "óculos"' }
    ],

    // Saudações
    s1: [
      { type: 'vocab', question: 'Como se diz "Olá/Boa tarde"?', word: 'こんにちは', romaji: 'Konnichiwa', options: ['おはよう', 'こんにちは', 'こんばんは', 'さようなら'], correct: 1, explanation: 'こんにちは (konnichiwa) é usado durante o dia para dizer "olá"' },
      { type: 'vocab', question: 'Qual é "Bom dia"?', word: 'おはよう', romaji: 'Ohayou', options: ['おはよう', 'こんにちは', 'こんばんは', 'おやすみ'], correct: 0, explanation: 'おはよう (ohayou) significa "bom dia"' },
      { type: 'vocab', question: 'Boa noite (cumprimento)', word: 'こんばんは', romaji: 'Konbanwa', options: ['おはよう', 'こんにちは', 'こんばんは', 'おやすみ'], correct: 2, explanation: 'こんばんは (konbanwa) é usado à noite para cumprimentar' },
      { type: 'vocab', question: 'Boa noite (ao dormir)', word: 'おやすみ', romaji: 'Oyasumi', options: ['おはよう', 'こんにちは', 'こんばんは', 'おやすみ'], correct: 3, explanation: 'おやすみ (oyasumi) é dito antes de dormir' },
      { type: 'context', question: 'São 9h da manhã. O que você diz?', word: 'おはよう', options: ['おはよう', 'こんにちは', 'こんばんは', 'おやすみ'], correct: 0, explanation: 'Pela manhã usamos おはよう (ohayou)' },
      { type: 'context', question: 'São 8h da noite. Ao dormir você diz:', word: 'おやすみ', options: ['こんばんは', 'おやすみ', 'さようなら', 'ありがとう'], correct: 1, explanation: 'おやすみ é usado especificamente antes de dormir' }
    ],

    // Agradecimentos
    s2: [
      { type: 'vocab', question: 'Como se diz "Obrigado"?', word: 'ありがとう', romaji: 'Arigatou', options: ['すみません', 'ごめんなさい', 'ありがとう', 'どういたしまして'], correct: 2, explanation: 'ありがとう (arigatou) significa "obrigado"' },
      { type: 'vocab', question: 'Forma mais polida de "obrigado"', word: 'ありがとうございます', romaji: 'Arigatou gozaimasu', options: ['ありがとう', 'ありがとうございます', 'どうも', 'すみません'], correct: 1, explanation: 'ございます torna a expressão mais formal' },
      { type: 'vocab', question: '"Com licença" / "Desculpe"', word: 'すみません', romaji: 'Sumimasen', options: ['ありがとう', 'すみません', 'ごめんなさい', 'おねがいします'], correct: 1, explanation: 'すみません (sumimasen) é usado para chamar atenção ou pedir desculpas formalmente' },
      { type: 'vocab', question: '"De nada"', word: 'どういたしまして', romaji: 'Douitashimashite', options: ['ありがとう', 'どういたしまして', 'すみません', 'いいえ'], correct: 1, explanation: 'どういたしまして (douitashimashite) é a resposta para "obrigado"' },
      { type: 'context', question: 'Alguém te ajudou. Você diz:', word: 'ありがとう', options: ['すみません', 'ありがとう', 'ごめんなさい', 'おねがいします'], correct: 1, explanation: 'Agradeça com ありがとう quando alguém te ajudar' }
    ],

    // Apresentações
    s3: [
      { type: 'vocab', question: 'Como se diz "Meu nome é"?', word: 'わたしのなまえは', romaji: 'Watashi no namae wa', options: ['わたしのなまえは', 'あなたは', 'かれは', 'かのじょは'], correct: 0, explanation: 'わたしのなまえは (watashi no namae wa) significa "meu nome é"' },
      { type: 'vocab', question: 'Qual é "sou brasileiro"?', word: 'ブラジルじんです', romaji: 'Burajiru jin desu', options: ['ブラジルじんです', 'アメリカじんです', 'にほんじんです', 'イギリスじんです'], correct: 0, explanation: 'ブラジルじんです significa "sou brasileiro"' },
      { type: 'vocab', question: '"Prazer em conhecê-lo"', word: 'はじめまして', romaji: 'Hajimemashite', options: ['はじめまして', 'よろしくおねがいします', 'どうぞよろしく', 'おめでとう'], correct: 0, explanation: 'はじめまして é usado quando se conhece alguém pela primeira vez' },
      { type: 'vocab', question: '"Muito prazer"', word: 'よろしくおねがいします', romaji: 'Yoroshiku onegaishimasu', options: ['はじめまして', 'よろしくおねがいします', 'どうぞよろしく', 'おめでとう'], correct: 1, explanation: 'よろしくおねがいします é uma expressão de cortesia ao se apresentar' },
      { type: 'context', question: 'Ao conhecer alguém, primeiro você diz:', word: 'はじめまして', options: ['はじめまして', 'こんにちは', 'さようなら', 'ありがとう'], correct: 0, explanation: 'Comece sempre com はじめまして quando conhecer alguém' },
      { type: 'context', question: 'Depois de dizer seu nome, você diz:', word: 'よろしくおねがいします', options: ['こんにちは', 'よろしくおねがいします', 'さようなら', 'ありがとう'], correct: 1, explanation: 'Complete a apresentação com よろしくおねがいします' }
    ],

    // Números 1-10
    n1: [
      { type: 'number', question: 'Como se diz "1"?', char: '一', romaji: 'ichi', options: ['いち', 'に', 'さん', 'し'], correct: 0, explanation: '1 = いち (ichi)' },
      { type: 'number', question: 'Como se diz "2"?', char: '二', romaji: 'ni', options: ['いち', 'に', 'さん', 'よん'], correct: 1, explanation: '2 = に (ni)' },
      { type: 'number', question: 'O número "3" é:', char: '三', romaji: 'san', options: ['に', 'さん', 'よん', 'ご'], correct: 1, explanation: '3 = さん (san)' },
      { type: 'number', question: '"4" pode ser:', char: '四', romaji: 'shi/yon', options: ['さん', 'し・よん', 'ご', 'ろく'], correct: 1, explanation: '4 tem duas leituras: し (shi) e よん (yon). よん é mais comum' },
      { type: 'number', question: 'Número "5":', char: '五', romaji: 'go', options: ['よん', 'ご', 'ろく', 'なな'], correct: 1, explanation: '5 = ご (go)' },
      { type: 'number', question: '"10" em japonês:', char: '十', romaji: 'juu', options: ['きゅう', 'じゅう', 'とお', 'ひゃく'], correct: 1, explanation: '10 = じゅう (juu)' },
      { type: 'math', question: '3 + 2 = ?', options: ['よん', 'ご', 'ろく', 'なな'], correct: 1, explanation: '3 (さん) + 2 (に) = 5 (ご)' }
    ],

    // Números 11-100
    n2: [
      { type: 'number', question: 'Como se diz "11"?', char: '十一', romaji: 'juuichi', options: ['じゅういち', 'じゅうに', 'じゅうさん', 'じゅうよん'], correct: 0, explanation: '11 = じゅういち (juuichi)' },
      { type: 'number', question: 'Como se diz "20"?', char: '二十', romaji: 'nijuu', options: ['じゅう', 'にじゅう', 'さんじゅう', 'よんじゅう'], correct: 1, explanation: '20 = にじゅう (nijuu)' },
      { type: 'number', question: '"30" é:', char: '三十', romaji: 'sanjuu', options: ['にじゅう', 'さんじゅう', 'よんじゅう', 'ごじゅう'], correct: 1, explanation: '30 = さんじゅう (sanjuu)' },
      { type: 'number', question: 'Número "50":', char: '五十', romaji: 'gojuu', options: ['よんじゅう', 'ごじゅう', 'ろくじゅう', 'ななじゅう'], correct: 1, explanation: '50 = ごじゅう (gojuu)' },
      { type: 'number', question: '"100" em japonês:', char: '百', romaji: 'hyaku', options: ['きゅうじゅう', 'ひゃく', 'せん', 'まん'], correct: 1, explanation: '100 = ひゃく (hyaku)' },
      { type: 'math', question: '20 + 30 = ?', options: ['ごじゅう', 'ろくじゅう', 'ななじゅう', 'はちじゅう'], correct: 0, explanation: '20 (にじゅう) + 30 (さんじゅう) = 50 (ごじゅう)' },
      { type: 'math', question: '100 - 20 = ?', options: ['はちじゅう', 'きゅうじゅう', 'ひゃく', 'にじゅう'], correct: 0, explanation: '100 (ひゃく) - 20 (にじゅう) = 80 (はちじゅう)' }
    ],

    // Contadores Básicos
    n3: [
      { type: 'vocab', question: 'Contador geral de objetos:', word: '~つ', romaji: '~tsu', options: ['~つ', '~人', '~個', '~匹'], correct: 0, explanation: '~つ é usado para contar objetos pequenos e gerais' },
      { type: 'vocab', question: 'Contador de pessoas:', word: '~人', romaji: '~nin', options: ['~つ', '~人', '~個', '~匹'], correct: 1, explanation: '~人 é usado para contar pessoas' },
      { type: 'vocab', question: 'Contador de objetos redondos:', word: '~個', romaji: '~ko', options: ['~つ', '~人', '~個', '~匹'], correct: 2, explanation: '~個 é usado para objetos redondos ou frutas' },
      { type: 'vocab', question: 'Contador de animais pequenos:', word: '~匹', romaji: '~hiki', options: ['~つ', '~人', '~個', '~匹'], correct: 3, explanation: '~匹 é usado para animais pequenos' },
      { type: 'context', question: '2 maçãs =', word: 'りんごがにこ', options: ['りんごがふたつ', 'りんごがにこ', 'りんごがににん', 'りんごがにひき'], correct: 1, explanation: 'Maçãs usam ~個: りんごがにこ (ringo ga niko)' },
      { type: 'context', question: '3 pessoas =', word: 'さんにん', options: ['さんつ', 'さんにん', 'さんこ', 'さんひき'], correct: 1, explanation: 'Pessoas usam ~人: さんにん (sannin)' },
      { type: 'context', question: '1 cachorro =', word: 'いっぴき', options: ['ひとつ', 'ひとり', 'いっこ', 'いっぴき'], correct: 3, explanation: 'Cachorros usam ~匹: いっぴき (ippiki)' }
    ],

    // Katakana - Vogais
    k1: [
      { type: 'recognize', question: 'Qual é a pronúncia deste caractere?', char: 'ア', options: ['a', 'i', 'u', 'e'], correct: 0, explanation: 'ア se pronuncia "a" - primeira vogal do katakana' },
      { type: 'recognize', question: 'Selecione o caractere "i"', char: 'イ', options: ['ア', 'イ', 'ウ', 'エ'], correct: 1, explanation: 'イ se pronuncia "i"' },
      { type: 'recognize', question: 'Como se escreve "u"?', char: 'ウ', options: ['ア', 'イ', 'ウ', 'エ'], correct: 2, explanation: 'ウ se pronuncia "u"' },
      { type: 'recognize', question: 'Identifique o caractere "e"', char: 'エ', options: ['ア', 'イ', 'ウ', 'エ'], correct: 3, explanation: 'エ se pronuncia "e"' },
      { type: 'recognize', question: 'Qual destes é "o"?', char: 'オ', options: ['ア', 'オ', 'カ', 'サ'], correct: 1, explanation: 'オ se pronuncia "o" - completa as vogais katakana' },
      { type: 'write', question: 'Complete: a-i-u-e-?', options: ['ア', 'イ', 'オ', 'カ'], correct: 2, explanation: 'A sequência completa é: ア(a) イ(i) ウ(u) エ(e) オ(o)' },
      { type: 'vocab', question: 'O que significa アメリカ?', word: 'アメリカ', romaji: 'amerika', options: ['América', 'África', 'Ásia', 'Europa'], correct: 0, explanation: 'アメリカ (amerika) significa "América"' }
    ],

    // Katakana - Série K
    k2: [
      { type: 'recognize', question: 'Qual é "ka"?', char: 'カ', options: ['カ', 'キ', 'ク', 'ケ'], correct: 0, explanation: 'カ se pronuncia "ka"' },
      { type: 'recognize', question: 'Identifique "ki"', char: 'キ', options: ['カ', 'キ', 'ク', 'ケ'], correct: 1, explanation: 'キ se pronuncia "ki"' },
      { type: 'recognize', question: 'Este caractere é?', char: 'ク', options: ['ku', 'ke', 'ko', 'ka'], correct: 0, explanation: 'ク se pronuncia "ku"' },
      { type: 'recognize', question: 'Encontre "ke"', char: 'ケ', options: ['カ', 'キ', 'ク', 'ケ'], correct: 3, explanation: 'ケ se pronuncia "ke"' },
      { type: 'recognize', question: 'Selecione "ko"', char: 'コ', options: ['コ', 'カ', 'キ', 'ク'], correct: 0, explanation: 'コ se pronuncia "ko"' },
      { type: 'vocab', question: 'O que significa コーヒー?', word: 'コーヒー', romaji: 'koohii', options: ['Café', 'Chá', 'Leite', 'Água'], correct: 0, explanation: 'コーヒー (koohii) significa "café"' },
      { type: 'vocab', question: 'Traduza: ケーキ', word: 'ケーキ', romaji: 'keeki', options: ['Bolo', 'Pão', 'Biscoito', 'Sorvete'], correct: 0, explanation: 'ケーキ (keeki) significa "bolo"' }
    ],

    // Katakana - Série S
    k3: [
      { type: 'recognize', question: 'Qual é "sa"?', char: 'サ', options: ['サ', 'シ', 'ス', 'セ'], correct: 0, explanation: 'サ se pronuncia "sa"' },
      { type: 'recognize', question: 'Identifique "shi"', char: 'シ', options: ['サ', 'シ', 'ス', 'セ'], correct: 1, explanation: 'シ se pronuncia "shi"' },
      { type: 'recognize', question: 'Este caractere é?', char: 'ス', options: ['su', 'se', 'so', 'sa'], correct: 0, explanation: 'ス se pronuncia "su"' },
      { type: 'recognize', question: 'Encontre "se"', char: 'セ', options: ['サ', 'シ', 'ス', 'セ'], correct: 3, explanation: 'セ se pronuncia "se"' },
      { type: 'recognize', question: 'Selecione "so"', char: 'ソ', options: ['ソ', 'サ', 'シ', 'ス'], correct: 0, explanation: 'ソ se pronuncia "so"' },
      { type: 'vocab', question: 'O que significa サッカー?', word: 'サッカー', romaji: 'sakkaa', options: ['Futebol', 'Basquete', 'Vôlei', 'Tênis'], correct: 0, explanation: 'サッカー (sakkaa) significa "futebol"' },
      { type: 'vocab', question: 'Traduza: スーパー', word: 'スーパー', romaji: 'suupaa', options: ['Supermercado', 'Restaurante', 'Loja', 'Mercado'], correct: 0, explanation: 'スーパー (suupaa) significa "supermercado"' }
    ],

    // Katakana - Série T
    k4: [
      { type: 'recognize', question: 'Qual é "ta"?', char: 'タ', options: ['タ', 'チ', 'ツ', 'テ'], correct: 0, explanation: 'タ se pronuncia "ta"' },
      { type: 'recognize', question: 'Identifique "chi"', char: 'チ', options: ['タ', 'チ', 'ツ', 'テ'], correct: 1, explanation: 'チ se pronuncia "chi"' },
      { type: 'recognize', question: 'Este caractere é?', char: 'ツ', options: ['tsu', 'te', 'to', 'ta'], correct: 0, explanation: 'ツ se pronuncia "tsu"' },
      { type: 'recognize', question: 'Encontre "te"', char: 'テ', options: ['タ', 'チ', 'ツ', 'テ'], correct: 3, explanation: 'テ se pronuncia "te"' },
      { type: 'recognize', question: 'Selecione "to"', char: 'ト', options: ['ト', 'タ', 'チ', 'ツ'], correct: 0, explanation: 'ト se pronuncia "to"' },
      { type: 'vocab', question: 'O que significa テレビ?', word: 'テレビ', romaji: 'terebi', options: ['Televisão', 'Rádio', 'Computador', 'Celular'], correct: 0, explanation: 'テレビ (terebi) significa "televisão"' },
      { type: 'vocab', question: 'Traduza: トマト', word: 'トマト', romaji: 'tomato', options: ['Tomate', 'Batata', 'Cenoura', 'Cebola'], correct: 0, explanation: 'トマト (tomato) significa "tomate"' }
    ],

    // Vocabulário - Família
    v1: [
      { type: 'vocab', question: 'Como se diz "pai"?', word: 'ちち', romaji: 'chichi', options: ['ちち', 'はは', 'あに', 'あね'], correct: 0, explanation: 'ちち (chichi) significa "pai"' },
      { type: 'vocab', question: 'Qual é "mãe"?', word: 'はは', romaji: 'haha', options: ['ちち', 'はは', 'あに', 'あね'], correct: 1, explanation: 'はは (haha) significa "mãe"' },
      { type: 'vocab', question: '"Irmão mais velho" é:', word: 'あに', romaji: 'ani', options: ['ちち', 'はは', 'あに', 'あね'], correct: 2, explanation: 'あに (ani) significa "irmão mais velho"' },
      { type: 'vocab', question: 'Como se diz "irmã mais velha"?', word: 'あね', romaji: 'ane', options: ['ちち', 'はは', 'あに', 'あね'], correct: 3, explanation: 'あね (ane) significa "irmã mais velha"' },
      { type: 'vocab', question: '"Irmão mais novo" em japonês:', word: 'おとうと', romaji: 'otouto', options: ['おとうと', 'いもうと', 'おじいさん', 'おばあさん'], correct: 0, explanation: 'おとうと (otouto) significa "irmão mais novo"' },
      { type: 'vocab', question: 'Qual é "irmã mais nova"?', word: 'いもうと', romaji: 'imouto', options: ['おとうと', 'いもうと', 'おじいさん', 'おばあさん'], correct: 1, explanation: 'いもうと (imouto) significa "irmã mais nova"' },
      { type: 'context', question: 'Complete: わたしの___ は エンジニアです (Meu pai é engenheiro)', word: 'ちち', options: ['ちち', 'はは', 'あに', 'あね'], correct: 0, explanation: 'Use ちち para se referir ao pai' }
    ],

    // Vocabulário - Comida
    v2: [
      { type: 'vocab', question: 'Como se diz "arroz"?', word: 'ごはん', romaji: 'gohan', options: ['ごはん', 'パン', '肉', '魚'], correct: 0, explanation: 'ごはん (gohan) significa "arroz" ou "comida"' },
      { type: 'vocab', question: 'Qual é "pão"?', word: 'パン', romaji: 'pan', options: ['ごはん', 'パン', '肉', '魚'], correct: 1, explanation: 'パン (pan) significa "pão"' },
      { type: 'vocab', question: '"Carne" é:', word: '肉', romaji: 'niku', options: ['ごはん', 'パン', '肉', '魚'], correct: 2, explanation: '肉 (niku) significa "carne"' },
      { type: 'vocab', question: 'Como se diz "peixe"?', word: '魚', romaji: 'sakana', options: ['ごはん', 'パン', '肉', '魚'], correct: 3, explanation: '魚 (sakana) significa "peixe"' },
      { type: 'vocab', question: '"Água" em japonês:', word: '水', romaji: 'mizu', options: ['水', 'お茶', 'コーヒー', 'ジュース'], correct: 0, explanation: '水 (mizu) significa "água"' },
      { type: 'vocab', question: 'Qual é "chá"?', word: 'お茶', romaji: 'ocha', options: ['水', 'お茶', 'コーヒー', 'ジュース'], correct: 1, explanation: 'お茶 (ocha) significa "chá"' },
      { type: 'context', question: 'Complete: ___ を たべます (Como arroz)', word: 'ごはん', options: ['ごはん', 'パン', '肉', '魚'], correct: 0, explanation: 'Use ごはん para se referir ao arroz' }
    ],

    // Vocabulário - Lugares
    v3: [
      { type: 'vocab', question: 'Como se diz "casa"?', word: 'いえ', romaji: 'ie', options: ['いえ', 'がっこう', 'びょういん', 'みせ'], correct: 0, explanation: 'いえ (ie) significa "casa"' },
      { type: 'vocab', question: 'Qual é "escola"?', word: 'がっこう', romaji: 'gakkou', options: ['いえ', 'がっこう', 'びょういん', 'みせ'], correct: 1, explanation: 'がっこう (gakkou) significa "escola"' },
      { type: 'vocab', question: '"Hospital" é:', word: 'びょういん', romaji: 'byouin', options: ['いえ', 'がっこう', 'びょういん', 'みせ'], correct: 2, explanation: 'びょういん (byouin) significa "hospital"' },
      { type: 'vocab', question: 'Como se diz "loja"?', word: 'みせ', romaji: 'mise', options: ['いえ', 'がっこう', 'びょういん', 'みせ'], correct: 3, explanation: 'みせ (mise) significa "loja"' },
      { type: 'vocab', question: '"Restaurante" em japonês:', word: 'レストラン', romaji: 'resutoran', options: ['レストラン', 'ホテル', 'こうえん', 'えき'], correct: 0, explanation: 'レストラン (resutoran) significa "restaurante"' },
      { type: 'vocab', question: 'Qual é "estação de trem"?', word: 'えき', romaji: 'eki', options: ['レストラン', 'ホテル', 'こうえん', 'えき'], correct: 3, explanation: 'えき (eki) significa "estação de trem"' },
      { type: 'context', question: 'Complete: ___ に いきます (Vou para a escola)', word: 'がっこう', options: ['いえ', 'がっこう', 'びょういん', 'みせ'], correct: 1, explanation: 'Use がっこう para se referir à escola' }
    ],

    // Vocabulário - Tempo
    v4: [
      { type: 'vocab', question: 'Como se diz "hoje"?', word: 'きょう', romaji: 'kyou', options: ['きょう', 'あした', 'きのう', 'いま'], correct: 0, explanation: 'きょう (kyou) significa "hoje"' },
      { type: 'vocab', question: 'Qual é "amanhã"?', word: 'あした', romaji: 'ashita', options: ['きょう', 'あした', 'きのう', 'いま'], correct: 1, explanation: 'あした (ashita) significa "amanhã"' },
      { type: 'vocab', question: '"Ontem" é:', word: 'きのう', romaji: 'kinou', options: ['きょう', 'あした', 'きのう', 'いま'], correct: 2, explanation: 'きのう (kinou) significa "ontem"' },
      { type: 'vocab', question: 'Como se diz "agora"?', word: 'いま', romaji: 'ima', options: ['きょう', 'あした', 'きのう', 'いま'], correct: 3, explanation: 'いま (ima) significa "agora"' },
      { type: 'vocab', question: '"Manhã" em japonês:', word: 'あさ', romaji: 'asa', options: ['あさ', 'ひる', 'ばん', 'よる'], correct: 0, explanation: 'あさ (asa) significa "manhã"' },
      { type: 'vocab', question: 'Qual é "noite"?', word: 'よる', romaji: 'yoru', options: ['あさ', 'ひる', 'ばん', 'よる'], correct: 3, explanation: 'よる (yoru) significa "noite"' },
      { type: 'vocab', question: '"Tempo" (clima) é:', word: 'てんき', romaji: 'tenki', options: ['じかん', 'てんき', 'とき', 'はれ'], correct: 1, explanation: 'てんき (tenki) significa "tempo" ou "clima"' }
    ],

    p2: [
      { type: 'particle', question: 'Complete: りんご___ たべます (Como maçã)', word: 'を', options: ['は', 'を', 'が', 'に'], correct: 1, explanation: 'を marca o objeto direto' },
      { type: 'particle', question: 'Complete: ほん___ よみます (Leio livro)', word: 'を', options: ['を', 'は', 'に', 'で'], correct: 0, explanation: 'を indica o que está sendo lido' },
      { type: 'particle', question: 'Qual partícula marca objeto direto?', word: 'を', options: ['は', 'が', 'を', 'に'], correct: 2, explanation: 'を (wo/o) marca o objeto da ação' }
    ],

    // Partículas Avançadas - で・に・へ
    p3: [
      { type: 'particle', question: 'Complete: がっこう___ べんきょうします (Estudo na escola)', word: 'で', options: ['で', 'に', 'へ', 'から'], correct: 0, explanation: 'で marca o local onde a ação acontece' },
      { type: 'particle', question: 'Complete: とうきょう___ いきます (Vou para Tóquio)', word: 'へ', options: ['で', 'に', 'へ', 'から'], correct: 2, explanation: 'へ indica direção ou destino' },
      { type: 'particle', question: 'Complete: 9じ___ おきます (Acordo às 9)', word: 'に', options: ['で', 'に', 'へ', 'から'], correct: 1, explanation: 'に marca tempo específico' },
      { type: 'particle', question: 'Complete: えき___ でます (Saio da estação)', word: 'から', options: ['で', 'に', 'へ', 'から'], correct: 3, explanation: 'から indica ponto de partida' },
      { type: 'particle', question: 'Qual partícula usar para "no trem"?', word: 'で', options: ['で', 'に', 'へ', 'から'], correct: 0, explanation: 'で marca o meio de transporte' },
      { type: 'particle', question: 'Complete: ともだち___ あいます (Encontro com amigo)', word: 'に', options: ['で', 'に', 'へ', 'から'], correct: 1, explanation: 'に marca a pessoa com quem você encontra' },
      { type: 'context', question: 'Complete: レストラン___ たべます (Como no restaurante)', word: 'で', options: ['で', 'に', 'へ', 'から'], correct: 0, explanation: 'Use で para o local da ação' }
    ],

    // Partículas Avançadas - と・から・まで
    p4: [
      { type: 'particle', question: 'Complete: ともだち___ いきます (Vou com amigo)', word: 'と', options: ['と', 'から', 'まで', 'で'], correct: 0, explanation: 'と marca companhia ("com")' },
      { type: 'particle', question: 'Complete: 9じ___ 5じ___ べんきょうします (Estudo das 9 às 5)', word: 'から...まで', options: ['と...で', 'から...まで', 'に...へ', 'で...と'], correct: 1, explanation: 'から...まで indica período de tempo' },
      { type: 'particle', question: 'Complete: せんせい___ ききました (Perguntei ao professor)', word: 'に', options: ['と', 'から', 'まで', 'に'], correct: 3, explanation: 'に marca a pessoa a quem você pergunta' },
      { type: 'particle', question: 'Complete: ブラジル___ きました (Vim do Brasil)', word: 'から', options: ['と', 'から', 'まで', 'に'], correct: 1, explanation: 'から indica origem' },
      { type: 'particle', question: 'Qual partícula usar para "até a estação"?', word: 'まで', options: ['と', 'から', 'まで', 'に'], correct: 2, explanation: 'まで marca o ponto final' },
      { type: 'particle', question: 'Complete: りんご___ バナナ___ たべます (Como maçã e banana)', word: 'と', options: ['と', 'から', 'まで', 'に'], correct: 0, explanation: 'と conecta itens em uma lista' },
      { type: 'context', question: 'Complete: 9じ___ 10じ___ ねます (Durmo das 9 às 10)', word: 'から...まで', options: ['と...で', 'から...まで', 'に...へ', 'で...と'], correct: 1, explanation: 'Use から...まで para intervalos de tempo' }
    ],

    // Verbos Básicos - です・います
    vb1: [
      { type: 'vocab', question: 'Como se diz "ser/estar" (formal)?', word: 'です', romaji: 'desu', options: ['です', 'います', 'あります', 'ます'], correct: 0, explanation: 'です (desu) é a forma formal de "ser" ou "estar"' },
      { type: 'vocab', question: 'Qual é "existir" (para pessoas/animais)?', word: 'います', romaji: 'imasu', options: ['です', 'います', 'あります', 'ます'], correct: 1, explanation: 'います (imasu) indica existência de pessoas ou animais' },
      { type: 'vocab', question: '"Existir" (para objetos) é:', word: 'あります', romaji: 'arimasu', options: ['です', 'います', 'あります', 'ます'], correct: 2, explanation: 'あります (arimasu) indica existência de objetos ou coisas' },
      { type: 'context', question: 'Complete: わたし___ ブラジルじんです (Eu sou brasileiro)', word: 'は', options: ['は', 'が', 'を', 'です'], correct: 0, explanation: 'Frases com です usam は para marcar o tópico' },
      { type: 'context', question: 'Complete: ねこ___ います (Tem um gato)', word: 'が', options: ['は', 'が', 'を', 'です'], correct: 1, explanation: 'Frases de existência usam が para o sujeito' },
      { type: 'context', question: 'Complete: ほん___ あります (Tem um livro)', word: 'が', options: ['は', 'が', 'を', 'です'], correct: 1, explanation: 'Objetos usam あります com が' },
      { type: 'context', question: 'Qual verbo usar para "Uma pessoa está aqui"?', word: 'います', options: ['です', 'います', 'あります', 'ます'], correct: 1, explanation: 'Pessoas usam います (imasu)' }
    ],
  };

  const ranks = [
    { name: 'Ferro', minXP: 0, color: 'text-gray-600', icon: Shield, bgColor: 'bg-gray-100', borderColor: 'border-gray-300' },
    { name: 'Bronze', minXP: 300, color: 'text-amber-700', icon: Shield, bgColor: 'bg-amber-100', borderColor: 'border-amber-300' },
    { name: 'Prata', minXP: 800, color: 'text-gray-400', icon: Award, bgColor: 'bg-gray-100', borderColor: 'border-gray-400' },
    { name: 'Ouro', minXP: 1500, color: 'text-yellow-500', icon: Award, bgColor: 'bg-yellow-100', borderColor: 'border-yellow-400' },
    { name: 'Platina', minXP: 2500, color: 'text-cyan-500', icon: Trophy, bgColor: 'bg-cyan-100', borderColor: 'border-cyan-400' },
    { name: 'Diamante', minXP: 4000, color: 'text-blue-500', icon: Trophy, bgColor: 'bg-blue-100', borderColor: 'border-blue-400' },
    { name: 'Mestre', minXP: 6000, color: 'text-purple-500', icon: Crown, bgColor: 'bg-purple-100', borderColor: 'border-purple-400' },
    { name: 'Grão-Mestre', minXP: 10000, color: 'text-pink-500', icon: Crown, bgColor: 'bg-pink-100', borderColor: 'border-pink-400' }
  ];

  // Improved Sound Effects
  const playSound = (type: string) => {
    const audioContext = new AudioContext();
    
    if (type === 'correct') {
      // Melodia alegre de sucesso
      const notes = [
        { freq: 523.25, start: 0, duration: 0.15 },      // C5
        { freq: 659.25, start: 0.15, duration: 0.15 },   // E5
        { freq: 783.99, start: 0.3, duration: 0.25 }     // G5
      ];
      
      notes.forEach(note => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, audioContext.currentTime + note.start);
        gain.gain.setValueAtTime(0.3, audioContext.currentTime + note.start);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.start + note.duration);
        
        osc.start(audioContext.currentTime + note.start);
        osc.stop(audioContext.currentTime + note.start + note.duration);
      });
      
    } else if (type === 'wrong') {
      // Som de erro mais suave
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.3);
      
    } else if (type === 'levelup') {
      // Fanfarra épica
      const melody = [
        { freq: 523.25, start: 0, duration: 0.15 },
        { freq: 587.33, start: 0.15, duration: 0.15 },
        { freq: 659.25, start: 0.3, duration: 0.15 },
        { freq: 783.99, start: 0.45, duration: 0.15 },
        { freq: 1046.50, start: 0.6, duration: 0.4 }
      ];
      
      melody.forEach(note => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.freq, audioContext.currentTime + note.start);
        gain.gain.setValueAtTime(0.25, audioContext.currentTime + note.start);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.start + note.duration);
        
        osc.start(audioContext.currentTime + note.start);
        osc.stop(audioContext.currentTime + note.start + note.duration);
      });
      
    } else if (type === 'click') {
      // Som de clique sutil
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioContext.currentTime);
      gain.gain.setValueAtTime(0.1, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
      
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.05);
    }
  };

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        let savedAuth = null;
        let savedUser = null;
        let savedUnits = null;
        
        if (window.localStorage) {
          try {
            const localAuth = localStorage.getItem('isAuthenticated');
            if (localAuth === 'true') {
              savedAuth = { value: 'true' };
              const localUser = localStorage.getItem('userProfile');
              const localUnits = localStorage.getItem('units');
              if (localUser) savedUser = { value: localUser };
              if (localUnits) savedUnits = { value: localUnits };
            }
          } catch (e) {
            console.log('Erro ao carregar dados');
          }
        }

        if (savedAuth?.value === 'true' && savedUser) {
          setIsAuthenticated(true);
          const userData = JSON.parse(savedUser.value);
          
          const today = new Date().toDateString();
          const lastLogin = userData.lastLoginDate;
          
          if (lastLogin !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastLogin === yesterday.toDateString()) {
              userData.streak += 1;
            } else if (lastLogin !== today) {
              userData.streak = 1;
            }
            userData.lastLoginDate = today;
          }
          
          setUserProfile(userData);
        }

        if (savedUnits) {
          setUnits(JSON.parse(savedUnits.value));
        }
      } catch (error) {
        console.log('Iniciando nova sessão');
      }
    };
    
    loadUserData();
  }, []);

  // Save user data
  const saveUserData = async () => {
    try {
      const userString = JSON.stringify(userProfile);
      const unitsString = JSON.stringify(units);
      
      if (window.localStorage) {
        localStorage.setItem('userProfile', userString);
        localStorage.setItem('units', unitsString);
      }
    } catch (error) {
      console.log('Não foi possível salvar o progresso');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      saveUserData();
    }
  }, [userProfile, units]);

  // Firebase auth state listener - apenas para restaurar sessões
  useEffect(() => {
    console.log('🔄 [App] Configurando listener de autenticação...');

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('👤 [App] onAuthStateChanged chamado, user:', user ? user.uid : 'null');
      console.log('🔐 [App] isAuthenticated atual:', isAuthenticated);

      if (user && !isAuthenticated) {
        console.log('✅ [App] Usuário logado, mas app não sabe - restaurando sessão...');

        // Simplesmente marcar como autenticado sem buscar dados por enquanto
        console.log('👤 [App] Definindo autenticação básica...');
        setIsAuthenticated(true);

        // Tentar buscar dados depois
        try {
          console.log('📊 [App] Tentando buscar dados do usuário...');
          const statsResult = await getUserStats(user.uid);
          console.log('📊 [App] Resultado getUserStats:', statsResult);

          if (statsResult.success) {
            const userData = statsResult.stats;
            const updatedProfile = {
              ...userProfile,
              name: (userData as any)?.name || user.displayName || 'Aventureiro',
              level: (userData as any)?.level || 1,
              xp: (userData as any)?.xp || 0,
              totalXP: (userData as any)?.totalXP || 0,
            };
            setUserProfile(updatedProfile);
            console.log('✅ [App] Perfil atualizado com dados do Firestore');
          }
        } catch (error) {
          console.error('❌ [App] Erro ao buscar dados, mantendo perfil básico:', error);
        }

        console.log('✅ [App] Sessão restaurada!');
      } else if (!user && isAuthenticated) {
        console.log('🚪 [App] Usuário deslogado, limpando estado...');
        setIsAuthenticated(false);
      } else if (user && isAuthenticated) {
        console.log('ℹ️ [App] Usuário já está logado e app já sabe');
      } else {
        console.log('ℹ️ [App] Nenhum usuário logado');
      }
    });

    return unsubscribe;
  }, [isAuthenticated]);

  const handleLogin = async () => {
    setAuthError('');
    setLoginLoading(true);

    const email = loginData.email.trim().toLowerCase();
    const password = loginData.password.trim();

    if (!email || !password) {
      setAuthError('Por favor, preencha email e senha');
      playSound('wrong');
      setLoginLoading(false);
      return;
    }

    try {
      const result = await loginUser(email, password);

      if (result.success && result.user) {
        let userData: any = {};
        try {
          const statsResult = await getUserStats(result.user.id);
          userData = statsResult.success ? statsResult.stats : {};
        } catch (statsError) {
          console.warn('Não foi possível carregar estatísticas do usuário:', statsError);
        }

        const userProfile = {
          name: result.user.name || 'Aventureiro',
          email: result.user.email,
          level: (userData as any)?.level || 1,
          xp: (userData as any)?.xp || 0,
          xpToNextLevel: 100,
          rank: 'Ferro',
          hearts: 5,
          maxHearts: 5,
          streak: 1,
          totalXP: (userData as any)?.totalXP || (userData as any)?.xp || 0,
          gemsCollected: 0,
          lastLoginDate: new Date().toDateString(),
          completedLessons: []
        };

        setUserProfile(userProfile);
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        setLoginData({ email: '', password: '' });
        playSound('correct');
      } else {
        setAuthError(result.error || 'Email ou senha incorretos');
        playSound('wrong');
      }
    } catch (error) {
      console.error('Erro inesperado no login:', error);
      setAuthError('Erro de conexão. Verifique sua internet e tente novamente.');
      playSound('wrong');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async () => {
    setAuthError('');
    setRegisterLoading(true);

    const name = registerData.name.trim();
    const email = registerData.email.trim().toLowerCase();
    const password = registerData.password.trim();
    const confirmPassword = registerData.confirmPassword.trim();

    if (!name || !email || !password || !confirmPassword) {
      setAuthError('Por favor, preencha todos os campos');
      playSound('wrong');
      setRegisterLoading(false);
      return;
    }

    if (password.length < 6) {
      setAuthError('A senha deve ter pelo menos 6 caracteres');
      playSound('wrong');
      setRegisterLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setPasswordMatchError(true);
      setAuthError('As senhas não conferem');
      playSound('wrong');
      setRegisterLoading(false);
      return;
    }

    try {
      const result = await registerUser(email, password, name);

      if (result.success) {
        const newUser = {
          name,
          email,
          level: 1,
          xp: 0,
          xpToNextLevel: 100,
          rank: 'Ferro',
          hearts: 5,
          maxHearts: 5,
          streak: 1,
          totalXP: 0,
          gemsCollected: 0,
          lastLoginDate: new Date().toDateString(),
          completedLessons: []
        };

        setUserProfile(newUser);
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userProfile', JSON.stringify(newUser));
        setPasswordMatchError(false);
        setRegisterData({ name: '', email: '', password: '', confirmPassword: '' });
        playSound('levelup');
      } else {
        setAuthError(result.error || 'Erro no registro. Tente novamente.');
        playSound('wrong');
      }
    } catch (error) {
      console.error('Erro inesperado no registro:', error);
      setAuthError('Erro de conexão. Verifique sua internet e tente novamente.');
      playSound('wrong');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const result = await logoutUser();
      if (window.localStorage) {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userProfile');
      }

      if (result.success) {
        setIsAuthenticated(false);
        setCurrentScreen('map');
        setLoginData({ email: '', password: '' });
        playSound('click');
      } else {
        console.log('Erro ao fazer logout:', result.error);
        // Mesmo com erro, faz logout local
        setIsAuthenticated(false);
        setCurrentScreen('map');
        setLoginData({ email: '', password: '' });
      }
    } catch (error) {
      console.log('Erro ao fazer logout:', error);
      // Mesmo com erro, faz logout local
      setIsAuthenticated(false);
      setCurrentScreen('map');
      setLoginData({ email: '', password: '' });
    }
  };

  const getCurrentRank = (totalXP: number) => {
    for (let i = ranks.length - 1; i >= 0; i--) {
      if (totalXP >= ranks[i].minXP) return ranks[i];
    }
    return ranks[0];
  };

  const selectUnit = (unit: any) => {
    if (unit.locked) {
      playSound('wrong');
      alert('Complete as unidades anteriores para desbloquear!');
      return;
    }
    playSound('click');
    setSelectedUnit(unit);
    setCurrentScreen('unit');
  };

  const startLesson = (lesson: any) => {
    playSound('click');
    setCurrentLesson(lesson);
    setCurrentExercise(0);
    setExerciseResults([]);
    setShowResult(false);
    setSelectedAnswer(null);
    setCurrentScreen('lesson');
  };

  const checkAnswer = () => {
    if (selectedAnswer === null || !currentLesson) return;
    
    const exercises = exerciseBank[currentLesson.id as keyof typeof exerciseBank];
    const exercise = exercises[currentExercise];
    const isCorrect = selectedAnswer === exercise.correct;
    
    setShowResult(true);
    setExerciseResults([...exerciseResults, isCorrect]);

    if (isCorrect) {
      playSound('correct');
      setDailyQuests(prev => prev.map(q => {
        if (q.id === 2 && !q.completed) {
          const newProg = q.progress + 1;
          return { ...q, progress: newProg, completed: newProg >= q.target };
        }
        return q;
      }));
    } else {
      playSound('wrong');
      setUserProfile(prev => ({
        ...prev,
        hearts: Math.max(0, prev.hearts - 1)
      }));
    }
  };

  const nextExercise = () => {
    if (!currentLesson) return;
    
    const exercises = exerciseBank[currentLesson.id as keyof typeof exerciseBank];
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      completeLesson();
    }
  };

  const completeLesson = () => {
    if (!currentLesson) return;
    
    const correctAnswers = exerciseResults.filter(r => r).length;
    const totalQuestions = exerciseResults.length;
    const accuracy = correctAnswers / totalQuestions;
    const xpEarned = Math.floor(currentLesson.xp * accuracy);
    const stars = accuracy === 1 ? 3 : accuracy >= 0.7 ? 2 : 1;

    setUserProfile(prev => {
      const newXP = prev.xp + xpEarned;
      const newTotalXP = prev.totalXP + xpEarned;
      const levelUp = newXP >= prev.xpToNextLevel;
      
      if (levelUp) {
        playSound('levelup');
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
      }
      
      const completed = [...prev.completedLessons];
      if (!completed.includes(currentLesson.id)) {
        completed.push(currentLesson.id);
      }
      
      return {
        ...prev,
        xp: levelUp ? newXP - prev.xpToNextLevel : newXP,
        level: levelUp ? prev.level + 1 : prev.level,
        xpToNextLevel: levelUp ? Math.floor(prev.xpToNextLevel * 1.2) : prev.xpToNextLevel,
        totalXP: newTotalXP,
        rank: getCurrentRank(newTotalXP).name,
        gemsCollected: prev.gemsCollected + stars,
        hearts: Math.min(prev.hearts + 1, prev.maxHearts),
        completedLessons: completed
      };
    });

    // Atualiza as unidades e o selectedUnit
    setUnits(prev => {
      const updatedUnits = prev.map(unit => {
        if (unit.id === selectedUnit.id) {
          const updatedLessons = unit.lessons.map(l => 
            l.id === currentLesson.id 
              ? { ...l, completed: true, stars: Math.max(l.stars, stars) }
              : l
          );
          
          const updatedUnit = { ...unit, lessons: updatedLessons };
          
          // Atualiza o selectedUnit com os novos dados
          setSelectedUnit(updatedUnit);
          
          return updatedUnit;
        }
        
        // Desbloqueia próxima unidade se todas lições foram completadas
        const prevUnit = prev.find(u => u.id === selectedUnit.id);
        if (prevUnit) {
          const allPrevCompleted = prevUnit.lessons.every(l => 
            l.id === currentLesson.id ? true : l.completed
          );
          const currentIndex = prev.findIndex(u => u.id === unit.id);
          const selectedIndex = prev.findIndex(u => u.id === selectedUnit.id);
          
          if (allPrevCompleted && currentIndex === selectedIndex + 1) {
            return { ...unit, locked: false };
          }
        }
        
        return unit;
      });
      
      return updatedUnits;
    });

    setDailyQuests(prev => prev.map(quest => {
      if (quest.id === 1 && !quest.completed) {
        const newProg = quest.progress + 1;
        return { ...quest, progress: newProg, completed: newProg >= quest.target };
      }
      if (quest.id === 4 && !quest.completed) {
        const newProg = quest.progress + xpEarned;
        return { ...quest, progress: newProg, completed: newProg >= quest.target };
      }
      return quest;
    }));

    setCurrentScreen('complete');
  };

  const playAudio = (text: string, lang = 'ja-JP') => {
    // Cancela qualquer fala anterior
    speechSynthesis.cancel();
    
    setIsPlayingAudio(true);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.75;
    utterance.volume = 1.0;
    
    utterance.onend = () => {
      setIsPlayingAudio(false);
    };
    
    utterance.onerror = () => {
      setIsPlayingAudio(false);
    };
    
    speechSynthesis.speak(utterance);
  };

  // Função do Dicionário
  const searchDictionary = async () => {
    if (!dictionaryQuery.trim()) return;
    
    setDictionaryLoading(true);
    playSound('click');
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: [{
            role: 'user',
            content: `Você é um tradutor especializado Português → Japonês para estudantes brasileiros.

PALAVRA/FRASE EM PORTUGUÊS: "${dictionaryQuery}"

Forneça a tradução completa em JSON com esta estrutura EXATA:

{
  "original": "${dictionaryQuery}",
  "kanji": "escrita em kanji (se houver, senão null)",
  "hiragana": "escrita completa em hiragana",
  "katakana": "escrita em katakana (apenas se aplicável para palavras estrangeiras, senão null)",
  "romaji": "romanização completa",
  "type": "tipo gramatical (substantivo, verbo, adjetivo, expressão, etc)",
  "formality": "nível de formalidade (casual, polido, muito formal)",
  "mainTranslation": "tradução principal mais comum",
  "alternativeTranslations": ["tradução alternativa 1", "tradução alternativa 2"],
  "particlesUsed": ["partículas usadas na frase, se houver"],
  "breakdown": "explicação detalhada de cada componente da palavra/frase",
  "examples": [
    {
      "japanese": "exemplo em japonês (com kanji)",
      "hiragana": "mesmo exemplo em hiragana",
      "romaji": "romanização do exemplo",
      "portuguese": "tradução do exemplo em português"
    }
  ],
  "usage": "contextos e situações onde usar esta palavra/expressão",
  "culturalNotes": "notas culturais importantes sobre o uso",
  "conjugations": "conjugações ou variações importantes (se aplicável)",
  "relatedWords": [
    {"japanese": "palavra relacionada", "meaning": "significado"}
  ]
}

IMPORTANTE:
- Se a palavra tiver kanji, sempre forneça tanto kanji quanto hiragana
- Para verbos, inclua a forma dicionário
- Para expressões com partículas, explique cada partícula
- Dê exemplos práticos do dia a dia
- Seja detalhado e educativo`
          }]
        })
      });

      const data = await response.json();
      const textContent = data.content.find((c: any) => c.type === 'text')?.text || '';
      
      // Remove markdown code blocks se existirem
      const cleanJson = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const result = JSON.parse(cleanJson);
      
      setDictionaryResult(result);
      playSound('correct');
    } catch (error) {
      console.error('Erro no dicionário:', error);
      setDictionaryResult({
        original: dictionaryQuery,
        mainTranslation: 'Erro ao buscar tradução. Por favor, tente novamente.',
        error: true
      });
      playSound('wrong');
    } finally {
      setDictionaryLoading(false);
    }
  };

  // Componente de Tooltip para Partículas
  const ParticleTooltip = ({ particle, children }: { particle: string; children: React.ReactNode }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const info = particleTranslations[particle as keyof typeof particleTranslations];

    if (!info) return children;

    return (
      <span 
        className="relative inline-block group"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className="border-b-2 border-dotted border-blue-400 cursor-help">
          {children}
        </span>
        {showTooltip && (
          <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-sm rounded-lg p-3 shadow-xl">
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-blue-300">{particle} ({info.romaji})</p>
                <p className="text-xs mt-1">{info.translation}</p>
              </div>
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-8 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        )}
      </span>
    );
  };

  // Funções do Minigame
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startMinigame = (mode: 'hiragana' | 'katakana' | 'numbers') => {
    const data = minigameData[mode];
    
    // Embaralha os dados e cria array de 100 questões
    const shuffled = [];
    while (shuffled.length < 100) {
      const remainingNeeded = 100 - shuffled.length;
      const dataToAdd = shuffleArray(data).slice(0, Math.min(remainingNeeded, data.length));
      shuffled.push(...dataToAdd);
    }
    
    setMinigameShuffledData(shuffled);
    setMinigameMode(mode);
    setMinigameQuestion(0);
    setMinigameScore({ correct: 0, wrong: 0 });
    setMinigameSelected(null);
    setMinigameShowResult(false);
    setMinigameAnimating(false);
    generateMinigameQuestion(mode, 0, shuffled);
    setCurrentScreen('minigame');
    playSound('click');
  };

  const exitMinigame = () => {
    setMinigameMode(null);
    setMinigameQuestion(0);
    setMinigameScore({ correct: 0, wrong: 0 });
    setMinigameSelected(null);
    setMinigameShowResult(false);
    setMinigameAnimating(false);
    setMinigameCurrentChar(null);
    setMinigameOptions([]);
    setMinigameShuffledData([]);
    setCurrentScreen('map');
    playSound('click');
  };

  const generateMinigameQuestion = (mode: 'hiragana' | 'katakana' | 'numbers', questionNum: number, shuffledData = minigameShuffledData) => {
    const data = minigameData[mode];
    
    // Usa o caractere do array embaralhado
    const correctItem = shuffledData[questionNum] || shuffledData[0];
    
    // Gera 3 opções incorretas diferentes
    const wrongOptions: string[] = [];
    const allPossibleOptions = data.filter((item: { char: string; romaji: string }) => item.romaji !== correctItem.romaji);
    
    while (wrongOptions.length < 3 && allPossibleOptions.length > 0) {
      const randomIndex = Math.floor(Math.random() * allPossibleOptions.length);
      const randomItem = allPossibleOptions[randomIndex];
      
      if (!wrongOptions.includes(randomItem.romaji)) {
        wrongOptions.push(randomItem.romaji);
      }
      
      // Remove para evitar loop infinito caso não tenha opções suficientes
      allPossibleOptions.splice(randomIndex, 1);
    }
    
    // Se não tiver 3 opções diferentes disponíveis, preenche com duplicatas modificadas
    while (wrongOptions.length < 3) {
      const randomItem = data[Math.floor(Math.random() * data.length)];
      if (randomItem.romaji !== correctItem.romaji && !wrongOptions.includes(randomItem.romaji)) {
        wrongOptions.push(randomItem.romaji);
      }
    }
    
    // Mistura as opções
    const allOptions = shuffleArray([correctItem.romaji, ...wrongOptions]);
    
    setMinigameCurrentChar(correctItem);
    setMinigameOptions(allOptions);
  };

  const checkMinigameAnswer = (selected: string) => {
    setMinigameSelected(selected);
    setMinigameShowResult(true);
    
    const isCorrect = selected === minigameCurrentChar.romaji;
    
    if (isCorrect) {
      playSound('correct');
      setMinigameScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      playSound('wrong');
      setMinigameScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
    }
  };

  const nextMinigameQuestion = () => {
    if (minigameQuestion >= 99) {
      // Fim do jogo
      const totalScore = minigameScore.correct + (minigameSelected === minigameCurrentChar.romaji ? 1 : 0);
      const xpEarned = totalScore * 2;
      
      setUserProfile(prev => {
        const newXP = prev.xp + xpEarned;
        const newTotalXP = prev.totalXP + xpEarned;
        const levelUp = newXP >= prev.xpToNextLevel;
        
        if (levelUp) {
          playSound('levelup');
          setShowLevelUp(true);
          setTimeout(() => setShowLevelUp(false), 3000);
        }
        
        return {
          ...prev,
          xp: levelUp ? newXP - prev.xpToNextLevel : newXP,
          level: levelUp ? prev.level + 1 : prev.level,
          xpToNextLevel: levelUp ? Math.floor(prev.xpToNextLevel * 1.2) : prev.xpToNextLevel,
          totalXP: newTotalXP,
          rank: getCurrentRank(newTotalXP).name,
          gemsCollected: prev.gemsCollected + Math.floor(totalScore / 33)
        };
      });
      
      return;
    }
    
    setMinigameAnimating(true);
    
    setTimeout(() => {
      const nextQuestion = minigameQuestion + 1;
      setMinigameQuestion(nextQuestion);
      setMinigameSelected(null);
      setMinigameShowResult(false);
      if (minigameMode) {
        generateMinigameQuestion(minigameMode as 'hiragana' | 'katakana' | 'numbers', nextQuestion);
      }
      setMinigameAnimating(false);
    }, 300);
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-300/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full grid md:grid-cols-2 relative z-10">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white flex flex-col justify-center">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🐸</div>
              <h1 className="text-4xl font-bold mb-2">LinguaQuest</h1>
              <p className="text-lg opacity-90">Do N5 ao N4 - Trilha Completa</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <BookOpen className="h-8 w-8 text-yellow-300" />
                <div>
                  <p className="font-semibold">9 Unidades Completas</p>
                  <p className="text-sm opacity-80">Hiragana, Katakana, Gramática e Kanji</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <Trophy className="h-8 w-8 text-yellow-300" />
                <div>
                  <p className="font-semibold">Sistema de Rankings</p>
                  <p className="text-sm opacity-80">Do Ferro ao Grão-Mestre</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <Sparkles className="h-8 w-8 text-pink-300" />
                <div>
                  <p className="font-semibold">Aprenda Brincando</p>
                  <p className="text-sm opacity-80">Exercícios interativos e divertidos</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 flex flex-col justify-center">
            {authScreen === 'login' ? (
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Entrar</h2>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogin}
                  disabled={loginLoading}
                  className={`w-full font-bold py-3 rounded-xl transition-all transform mb-4 ${loginLoading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white hover:scale-105'}`}
                >
                  {loginLoading ? 'Entrando...' : 'Entrar'}
                </button>

                {authError && (
                  <p className="text-sm text-red-600 mb-4">{authError}</p>
                )}

                <p className="text-center text-gray-600">
                  Não tem uma conta?{' '}
                  <button
                    onClick={() => {
                      setAuthScreen('register');
                      setAuthError('');
                      setPasswordMatchError(false);
                      playSound('click');
                    }}
                    className="text-purple-600 font-semibold hover:underline"
                  >
                    Criar conta
                  </button>
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Criar Conta</h2>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                        placeholder="Seu nome"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        value={registerData.password}
                        onChange={(e) => {
                          setRegisterData({...registerData, password: e.target.value});
                          if (registerData.confirmPassword && e.target.value !== registerData.confirmPassword) {
                            setPasswordMatchError(true);
                          } else {
                            setPasswordMatchError(false);
                          }
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        value={registerData.confirmPassword}
                        onChange={(e) => {
                          setRegisterData({...registerData, confirmPassword: e.target.value});
                          if (e.target.value && registerData.password !== e.target.value) {
                            setPasswordMatchError(true);
                          } else {
                            setPasswordMatchError(false);
                          }
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                          passwordMatchError
                            ? 'border-red-500 focus:border-red-600 bg-red-50'
                            : 'border-gray-300 focus:border-purple-500'
                        }`}
                        placeholder="Repita a senha"
                      />
                      {registerData.confirmPassword && (
                        <div className="absolute right-3 top-3.5">
                          {passwordMatchError ? (
                            <X className="h-5 w-5 text-red-500" />
                          ) : (
                            <Check className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {passwordMatchError && registerData.confirmPassword && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <span>❌ As senhas não conferem</span>
                      </p>
                    )}
                    {!passwordMatchError && registerData.password && registerData.confirmPassword && (
                      <p className="text-green-500 text-sm mt-2 flex items-center gap-1">
                        <span>✅ Senhas conferem</span>
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleRegister}
                  disabled={passwordMatchError || !registerData.password || !registerData.confirmPassword || !registerData.name || !registerData.email}
                  className={`w-full font-bold py-3 rounded-xl transition-all transform mb-4 ${
                    passwordMatchError || !registerData.password || !registerData.confirmPassword || !registerData.name || !registerData.email
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover:scale-105'
                  }`}
                >
                  {passwordMatchError ? '❌ Senhas não conferem' : 'Criar Conta'}
                </button>

                <p className="text-center text-gray-600">
                  Já tem uma conta?{' '}
                  <button
                    onClick={() => {
                      setAuthScreen('login');
                      setAuthError('');
                      setPasswordMatchError(false);
                      playSound('click');
                    }}
                    className="text-purple-600 font-semibold hover:underline"
                  >
                    Entrar
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Level Up Modal
  const LevelUpModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
          LEVEL UP!
        </h2>
        <p className="text-2xl font-bold text-gray-800 mb-4">Nível {userProfile.level}</p>
        <p className="text-gray-600">Você está evoluindo!</p>
      </div>
    </div>
  );

  // Minigame Screen
  if (currentScreen === 'minigame') {
    if (!minigameMode) {
      // Seleção de modo
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            <button
              onClick={() => {
                setCurrentScreen('map');
                playSound('click');
              }}
              className="mb-6 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
              <span>Voltar</span>
            </button>

            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🎮</div>
                <h2 className="text-4xl font-bold text-gray-800 mb-2">Minigame de Memorização</h2>
                <p className="text-gray-600 mb-2">Aprenda TODOS os caracteres japoneses em 100 questões!</p>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 mt-4">
                  <p className="text-sm text-blue-800 font-semibold flex items-center justify-center mb-2">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Sistema Completo de Aprendizado
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-white rounded-lg p-2">
                      <p className="font-bold text-pink-600">きゃ kya</p>
                      <p className="text-gray-600">Combinações</p>
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <p className="font-bold text-blue-600">が ga</p>
                      <p className="text-gray-600">Dakuten</p>
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <p className="font-bold text-purple-600">ぱ pa</p>
                      <p className="text-gray-600">Handakuten</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    ✨ Ordem aleatória a cada partida • Cobertura total do alfabeto
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <button
                  onClick={() => startMinigame('hiragana')}
                  className="group bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl p-8 text-white hover:scale-105 transform transition-all shadow-lg"
                >
                  <div className="text-6xl mb-4">きゃ</div>
                  <h3 className="text-2xl font-bold mb-2">Hiragana Completo</h3>
                  <p className="text-sm opacity-90 mb-2">104 caracteres incluindo combinações</p>
                  <div className="flex flex-wrap gap-1 justify-center mb-3">
                    <span className="text-xs bg-white/20 px-2 py-1 rounded">Básico</span>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded">Dakuten</span>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded">Yōon</span>
                  </div>
                  <div className="mt-4 bg-white/20 rounded-lg p-2">
                    <p className="text-xs">100 questões aleatórias • +200 XP máx</p>
                  </div>
                </button>

                <button
                  onClick={() => startMinigame('katakana')}
                  className="group bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl p-8 text-white hover:scale-105 transform transition-all shadow-lg"
                >
                  <div className="text-6xl mb-4">シャ</div>
                  <h3 className="text-2xl font-bold mb-2">Katakana Completo</h3>
                  <p className="text-sm opacity-90 mb-2">117 caracteres + estrangeiros</p>
                  <div className="flex flex-wrap gap-1 justify-center mb-3">
                    <span className="text-xs bg-white/20 px-2 py-1 rounded">Básico</span>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded">Dakuten</span>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded">Especiais</span>
                  </div>
                  <div className="mt-4 bg-white/20 rounded-lg p-2">
                    <p className="text-xs">100 questões aleatórias • +200 XP máx</p>
                  </div>
                </button>

                <button
                  onClick={() => startMinigame('numbers')}
                  className="group bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-8 text-white hover:scale-105 transform transition-all shadow-lg"
                >
                  <div className="text-6xl mb-4">百</div>
                  <h3 className="text-2xl font-bold mb-2">Números</h3>
                  <p className="text-sm opacity-90 mb-2">26 variações de números</p>
                  <div className="flex flex-wrap gap-1 justify-center mb-3">
                    <span className="text-xs bg-white/20 px-2 py-1 rounded">Kanji</span>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded">Hiragana</span>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded">Grandes</span>
                  </div>
                  <div className="mt-4 bg-white/20 rounded-lg p-2">
                    <p className="text-xs">100 questões aleatórias • +200 XP máx</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Jogo ativo
    if (minigameQuestion >= 100) {
      // Tela de resultado final
      const finalCorrect = minigameScore.correct;
      const finalWrong = minigameScore.wrong;
      const accuracy = Math.round((finalCorrect / 100) * 100);
      const xpEarned = finalCorrect * 2;
      
      // Calcula caracteres únicos vistos
      const uniqueChars = new Set(minigameShuffledData.slice(0, 100).map(item => item.char));
      const uniqueCount = uniqueChars.size;
      
      // Calcula tipos de caracteres
      const basicChars = minigameShuffledData.slice(0, 100).filter(item => item.char.length === 1 && 
        !['が', 'ぎ', 'ぐ', 'げ', 'ご', 'ざ', 'じ', 'ず', 'ぜ', 'ぞ', 'だ', 'ぢ', 'づ', 'で', 'ど', 'ば', 'び', 'ぶ', 'べ', 'ぼ',
         'ガ', 'ギ', 'グ', 'ゲ', 'ゴ', 'ザ', 'ジ', 'ズ', 'ゼ', 'ゾ', 'ダ', 'ヂ', 'ヅ', 'デ', 'ド', 'バ', 'ビ', 'ブ', 'ベ', 'ボ',
         'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ', 'パ', 'ピ', 'プ', 'ペ', 'ポ'].includes(item.char)
      ).length;
      const dakutenChars = minigameShuffledData.slice(0, 100).filter(item => 
        ['が', 'ぎ', 'ぐ', 'げ', 'ご', 'ざ', 'じ', 'ず', 'ぜ', 'ぞ', 'だ', 'ぢ', 'づ', 'で', 'ど', 'ば', 'び', 'ぶ', 'べ', 'ぼ',
         'ガ', 'ギ', 'グ', 'ゲ', 'ゴ', 'ザ', 'ジ', 'ズ', 'ゼ', 'ゾ', 'ダ', 'ヂ', 'ヅ', 'デ', 'ド', 'バ', 'ビ', 'ブ', 'ベ', 'ボ'].includes(item.char)
      ).length;
      const handakutenChars = minigameShuffledData.slice(0, 100).filter(item => 
        ['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ', 'パ', 'ピ', 'プ', 'ペ', 'ポ'].includes(item.char)
      ).length;
      const combinationChars = minigameShuffledData.slice(0, 100).filter(item => item.char.length > 1).length;

      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4 animate-bounce">
                {accuracy >= 90 ? '🏆' : accuracy >= 70 ? '🎉' : accuracy >= 50 ? '👍' : '💪'}
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {accuracy >= 90 ? 'Incrível!' : accuracy >= 70 ? 'Muito Bem!' : accuracy >= 50 ? 'Bom Trabalho!' : 'Continue Praticando!'}
              </h2>
              <p className="text-gray-600">
                Você completou 100 questões de{' '}
                {minigameMode === 'hiragana' ? 'Hiragana' : minigameMode === 'katakana' ? 'Katakana' : 'Números'}!
              </p>
            </div>

            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 mb-6">
              <div className="text-white text-xl font-bold mb-2">+{xpEarned} XP</div>
              <div className="text-white text-sm mb-2">Você ganhou {Math.floor(finalCorrect / 33)} gemas! 💎</div>
              <div className="text-white text-xs opacity-90 bg-white/20 rounded-lg p-2 mt-2">
                ✨ Você praticou {uniqueCount} caracteres diferentes nesta sessão!
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center bg-gray-100 rounded-lg p-3">
                <span className="text-gray-700 font-medium">Precisão</span>
                <span className={`font-bold ${accuracy >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
                  {accuracy}%
                </span>
              </div>
              <div className="flex justify-between items-center bg-green-100 rounded-lg p-3">
                <span className="text-gray-700 font-medium">Acertos</span>
                <span className="font-bold text-green-600">{finalCorrect}</span>
              </div>
              <div className="flex justify-between items-center bg-red-100 rounded-lg p-3">
                <span className="text-gray-700 font-medium">Erros</span>
                <span className="font-bold text-red-600">{finalWrong}</span>
              </div>
              <div className="flex justify-between items-center bg-purple-100 rounded-lg p-3">
                <span className="text-gray-700 font-medium">Caracteres Únicos</span>
                <span className="font-bold text-purple-600">{uniqueCount}</span>
              </div>
            </div>

            {/* Estatísticas de Tipos */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 mb-6 border-2 border-indigo-200">
              <h3 className="text-sm font-bold text-indigo-800 mb-3 flex items-center">
                <Sparkles className="h-4 w-4 mr-1" />
                Distribuição de Caracteres
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-600 mb-1">Básicos</p>
                  <p className="text-lg font-bold text-gray-700">{basicChars}</p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-600 mb-1">Dakuten ゙</p>
                  <p className="text-lg font-bold text-blue-600">{dakutenChars}</p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-600 mb-1">Handakuten ゚</p>
                  <p className="text-lg font-bold text-green-600">{handakutenChars}</p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-600 mb-1">Combinações</p>
                  <p className="text-lg font-bold text-purple-600">{combinationChars}</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 text-center mt-2">
                Você praticou uma variedade completa! 🎯
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  startMinigame(minigameMode as 'hiragana' | 'katakana' | 'numbers');
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all"
              >
                Jogar Novamente
              </button>
              <button
                onClick={() => {
                  setMinigameMode(null);
                  setMinigameQuestion(0);
                  setMinigameScore({ correct: 0, wrong: 0 });
                  setMinigameSelected(null);
                  setMinigameShowResult(false);
                  setMinigameAnimating(false);
                  setMinigameShuffledData([]);
                  playSound('click');
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 rounded-xl transition-all"
              >
                Escolher Outro Modo
              </button>
              <button
                onClick={exitMinigame}
                className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold py-4 rounded-xl transition-all"
              >
                Voltar ao Mapa
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Questão ativa
    const progress = ((minigameQuestion + 1) / 100) * 100;
    const isCorrect = minigameShowResult && minigameSelected === minigameCurrentChar?.romaji;

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
        {showLevelUp && <LevelUpModal />}
        
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => {
                  if (window.confirm('Deseja sair? Seu progresso será perdido.')) {
                    exitMinigame();
                  }
                }}
                className="bg-white/30 hover:bg-white/40 p-2 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
              <div className="flex items-center space-x-6 text-white">
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-300" />
                  <span className="font-bold">{minigameScore.correct}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <X className="h-5 w-5 text-red-300" />
                  <span className="font-bold">{minigameScore.wrong}</span>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-lg">
                  <span className="font-semibold">{minigameQuestion + 1}/100</span>
                </div>
              </div>
            </div>
            <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className={`bg-white rounded-3xl shadow-2xl p-8 mb-6 transition-all duration-300 ${
            minigameAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}>
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-2">
                <p className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  🔀 Ordem aleatória para melhor memorização
                </p>
              </div>
              <p className="text-sm text-gray-500 mb-2">Qual é a pronúncia?</p>
              <div className="text-9xl mb-2 font-bold">{minigameCurrentChar?.char}</div>
              
              {/* Badge indicador de tipo de caractere */}
              {minigameCurrentChar && (
                <div className="flex justify-center">
                  {minigameCurrentChar.char.length > 1 ? (
                    <span className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-full font-semibold border border-purple-200">
                      ✨ Combinação (Yōon)
                    </span>
                  ) : (
                    ['が', 'ぎ', 'ぐ', 'げ', 'ご', 'ざ', 'じ', 'ず', 'ぜ', 'ぞ', 'だ', 'ぢ', 'づ', 'で', 'ど', 'ば', 'び', 'ぶ', 'べ', 'ぼ',
                     'ガ', 'ギ', 'グ', 'ゲ', 'ゴ', 'ザ', 'ジ', 'ズ', 'ゼ', 'ゾ', 'ダ', 'ヂ', 'ヅ', 'デ', 'ド', 'バ', 'ビ', 'ブ', 'ベ', 'ボ'].includes(minigameCurrentChar.char) ? (
                      <span className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-3 py-1 rounded-full font-semibold border border-blue-200">
                        ゙ Dakuten (Som Sonoro)
                      </span>
                    ) : ['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ', 'パ', 'ピ', 'プ', 'ペ', 'ポ'].includes(minigameCurrentChar.char) ? (
                      <span className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-1 rounded-full font-semibold border border-green-200">
                        ゚ Handakuten (Som P)
                      </span>
                    ) : (
                      <span className="text-xs bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 px-3 py-1 rounded-full font-semibold border border-gray-200">
                        Básico
                      </span>
                    )
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {minigameOptions.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (!minigameShowResult) {
                      checkMinigameAnswer(option);
                    }
                  }}
                  disabled={minigameShowResult}
                  className={`p-6 rounded-2xl font-semibold text-xl transition-all transform hover:scale-105 ${
                    minigameShowResult
                      ? option === minigameCurrentChar.romaji
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-xl scale-105 ring-4 ring-green-300'
                        : option === minigameSelected
                        ? 'bg-gradient-to-r from-red-400 to-rose-500 text-white ring-4 ring-red-300'
                        : 'bg-gray-100 text-gray-400'
                      : minigameSelected === option
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800 hover:shadow-md'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {minigameShowResult && (
            <div className={`rounded-2xl p-6 ${
              isCorrect ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-rose-500'
            }`}>
              <div className="flex items-center justify-between text-white mb-4">
                <div className="flex items-center space-x-3">
                  {isCorrect ? (
                    <>
                      <Check className="h-8 w-8" />
                      <h4 className="text-2xl font-bold">Correto! 🎉</h4>
                    </>
                  ) : (
                    <>
                      <X className="h-8 w-8" />
                      <div>
                        <h4 className="text-2xl font-bold">Errado!</h4>
                        <p className="text-sm opacity-90">Resposta: {minigameCurrentChar?.romaji}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={nextMinigameQuestion}
                className="w-full bg-white text-gray-800 font-bold py-4 rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
              >
                {minigameQuestion < 99 ? 'Próxima →' : 'Ver Resultado Final'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Resources Screen (Tabelas e Dicionário)
  if (currentScreen === 'resources') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 p-4">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => {
              setCurrentScreen('map');
              playSound('click');
            }}
            className="mb-6 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors"
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
            <span>Voltar</span>
          </button>

          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  <BookOpen className="h-8 w-8 mr-3 text-green-600" />
                  Recursos de Aprendizado
                </h3>
                <p className="text-gray-600 mt-1">Consulte tabelas e use o dicionário</p>
              </div>
              <div className="text-6xl">🐸</div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 mb-6 overflow-x-auto">
              <button
                onClick={() => {
                  setSelectedResourceTab('hiragana');
                  playSound('click');
                }}
                className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  selectedResourceTab === 'hiragana'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                あ Hiragana
              </button>
              <button
                onClick={() => {
                  setSelectedResourceTab('katakana');
                  playSound('click');
                }}
                className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  selectedResourceTab === 'katakana'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ア Katakana
              </button>
              <button
                onClick={() => {
                  setSelectedResourceTab('particles');
                  playSound('click');
                }}
                className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  selectedResourceTab === 'particles'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                は Partículas
              </button>
              <button
                onClick={() => {
                  setSelectedResourceTab('dictionary');
                  playSound('click');
                }}
                className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  selectedResourceTab === 'dictionary'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Search className="inline h-5 w-5 mr-1" /> Dicionário
              </button>
            </div>

            {/* Content */}
            <div className="mt-6">
              {selectedResourceTab === 'hiragana' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Tabela Completa de Hiragana</h3>
                  <div className="grid grid-cols-5 gap-3 mb-6">
                    {minigameData.hiragana.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => playAudio(item.romaji)}
                        className="bg-gradient-to-br from-pink-100 to-rose-100 hover:from-pink-200 hover:to-rose-200 p-4 rounded-xl text-center transition-all transform hover:scale-105 group"
                      >
                        <div className="text-4xl mb-2">{item.char}</div>
                        <div className="text-sm font-semibold text-gray-700">{item.romaji}</div>
                        <Volume2 className="h-4 w-4 mx-auto mt-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedResourceTab === 'katakana' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Tabela Completa de Katakana</h3>
                  <div className="grid grid-cols-5 gap-3 mb-6">
                    {minigameData.katakana.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => playAudio(item.romaji)}
                        className="bg-gradient-to-br from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 p-4 rounded-xl text-center transition-all transform hover:scale-105 group"
                      >
                        <div className="text-4xl mb-2">{item.char}</div>
                        <div className="text-sm font-semibold text-gray-700">{item.romaji}</div>
                        <Volume2 className="h-4 w-4 mx-auto mt-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedResourceTab === 'particles' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Guia Completo de Partículas</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(particleTranslations).map(([particle, info]) => (
                      <div key={particle} className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="text-5xl mb-2">{particle}</div>
                            <div className="text-lg font-semibold text-purple-700">{info.romaji}</div>
                          </div>
                          <button
                            onClick={() => playAudio(particle)}
                            className="bg-purple-200 hover:bg-purple-300 p-3 rounded-lg transition-colors"
                          >
                            <Volume2 className="h-5 w-5 text-purple-700" />
                          </button>
                        </div>
                        <p className="text-gray-700">{info.translation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedResourceTab === 'dictionary' && (
                <div>
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-xl p-4 mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                      <span className="text-3xl mr-2">🇧🇷</span>
                      Português → Japonês
                      <span className="text-3xl ml-2">🇯🇵</span>
                    </h3>
                    <p className="text-gray-700">
                      Digite uma palavra ou frase em <strong>português</strong> e receba a tradução completa com explicações detalhadas!
                    </p>
                  </div>
                  
                  <div className="flex space-x-2 mb-6">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={dictionaryQuery}
                        onChange={(e) => setDictionaryQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && searchDictionary()}
                        placeholder="Ex: obrigado, bom dia, eu gosto de você..."
                        className="w-full px-4 py-4 pr-12 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none text-lg"
                        disabled={dictionaryLoading}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-2xl">
                        🇧🇷
                      </div>
                    </div>
                    <button
                      onClick={searchDictionary}
                      disabled={dictionaryLoading || !dictionaryQuery.trim()}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold px-8 py-4 rounded-xl transition-all transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg"
                    >
                      {dictionaryLoading ? (
                        <>
                          <RefreshCw className="h-5 w-5 animate-spin" />
                          <span>Traduzindo...</span>
                        </>
                      ) : (
                        <>
                          <Search className="h-5 w-5" />
                          <span>Traduzir</span>
                        </>
                      )}
                    </button>
                  </div>

                  {dictionaryResult && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-8 shadow-xl">
                      {dictionaryResult.error ? (
                        <div className="text-center text-red-600">
                          <X className="h-12 w-12 mx-auto mb-2" />
                          <p className="font-semibold text-lg">{dictionaryResult.mainTranslation}</p>
                        </div>
                      ) : (
                        <>
                          {/* Header com palavra original */}
                          <div className="bg-white rounded-xl p-4 mb-6 border-2 border-gray-200">
                            <p className="text-sm text-gray-500 mb-1">Você pesquisou:</p>
                            <p className="text-2xl font-bold text-gray-800">🇧🇷 {dictionaryResult.original}</p>
                          </div>

                          {/* Traduções principais em destaque */}
                          <div className="grid md:grid-cols-2 gap-4 mb-6">
                            {/* Kanji */}
                            {dictionaryResult.kanji && (
                              <div className="bg-gradient-to-br from-red-100 to-pink-100 border-2 border-red-300 rounded-xl p-6">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-red-700 mb-2">📝 Kanji</p>
                                    <p className="text-5xl font-bold text-gray-800 mb-2">{dictionaryResult.kanji}</p>
                                    <p className="text-xs text-gray-600">Escrita formal com ideogramas</p>
                                  </div>
                                  <button
                                    onClick={() => playAudio(dictionaryResult.kanji || dictionaryResult.hiragana)}
                                    className="bg-red-200 hover:bg-red-300 p-3 rounded-lg transition-colors"
                                  >
                                    <Volume2 className="h-5 w-5 text-red-700" />
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Hiragana */}
                            <div className="bg-gradient-to-br from-pink-100 to-rose-100 border-2 border-pink-300 rounded-xl p-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-pink-700 mb-2">あ Hiragana</p>
                                  <p className="text-5xl font-bold text-gray-800 mb-2">{dictionaryResult.hiragana}</p>
                                    <p className="text-xs text-gray-600">Leitura fonética completa</p>
                                  </div>
                                  <button
                                    onClick={() => playAudio(dictionaryResult.hiragana)}
                                    className="bg-pink-200 hover:bg-pink-300 p-3 rounded-lg transition-colors"
                                  >
                                    <Volume2 className="h-5 w-5 text-pink-700" />
                                  </button>
                                </div>
                              </div>

                              {/* Katakana (se houver) */}
                              {dictionaryResult.katakana && (
                                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-300 rounded-xl p-6">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="text-sm font-semibold text-blue-700 mb-2">ア Katakana</p>
                                      <p className="text-5xl font-bold text-gray-800 mb-2">{dictionaryResult.katakana}</p>
                                      <p className="text-xs text-gray-600">Para palavras estrangeiras</p>
                                    </div>
                                    <button
                                      onClick={() => playAudio(dictionaryResult.katakana)}
                                      className="bg-blue-200 hover:bg-blue-300 p-3 rounded-lg transition-colors"
                                    >
                                      <Volume2 className="h-5 w-5 text-blue-700" />
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Romaji */}
                              <div className="bg-gradient-to-br from-purple-100 to-violet-100 border-2 border-purple-300 rounded-xl p-6">
                                <p className="text-sm font-semibold text-purple-700 mb-2">🔤 Romaji (Pronúncia)</p>
                                <p className="text-3xl font-bold text-gray-800 mb-2">{dictionaryResult.romaji}</p>
                                <p className="text-xs text-gray-600">Como se lê em português</p>
                              </div>
                            </div>

                            {/* Informações gramaticais */}
                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                              <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
                                <p className="text-sm text-gray-600 font-semibold mb-2">📚 Tipo</p>
                                <p className="text-lg text-gray-800 font-medium">{dictionaryResult.type}</p>
                              </div>

                              {dictionaryResult.formality && (
                                <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
                                  <p className="text-sm text-gray-600 font-semibold mb-2">🎩 Formalidade</p>
                                  <p className="text-lg text-gray-800 font-medium">{dictionaryResult.formality}</p>
                                </div>
                              )}
                            </div>

                            {/* Traduções alternativas */}
                            {dictionaryResult.alternativeTranslations && dictionaryResult.alternativeTranslations.length > 0 && (
                              <div className="bg-white rounded-xl p-6 mb-6 border-2 border-gray-200">
                                <p className="text-sm text-gray-600 font-semibold mb-3">🔄 Traduções Alternativas</p>
                                <div className="flex flex-wrap gap-2">
                                  {dictionaryResult.alternativeTranslations.map((alt: string, idx: number) => (
                                    <span key={idx} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">
                                      {alt}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Partículas */}
                            {dictionaryResult.particlesUsed && dictionaryResult.particlesUsed.length > 0 && (
                              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
                                <p className="text-sm text-purple-700 font-semibold mb-3 flex items-center">
                                  <Sparkles className="h-4 w-4 mr-2" />
                                  Partículas Usadas
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {dictionaryResult.particlesUsed.map((p: string, idx: number) => (
                                    <div key={idx} className="bg-white border-2 border-purple-300 px-4 py-2 rounded-lg">
                                      <span className="text-2xl font-bold text-purple-700 mr-2">{p}</span>
                                      {particleTranslations[p as keyof typeof particleTranslations] && (
                                        <span className="text-xs text-gray-600">
                                          ({particleTranslations[p as keyof typeof particleTranslations].romaji})
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Análise detalhada */}
                            {dictionaryResult.breakdown && (
                              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                                <p className="text-sm text-blue-700 font-semibold mb-3 flex items-center">
                                  <Lightbulb className="h-4 w-4 mr-2" />
                                  Análise Detalhada
                                </p>
                                <p className="text-gray-800 leading-relaxed">{dictionaryResult.breakdown}</p>
                              </div>
                            )}

                            {/* Exemplos */}
                            {dictionaryResult.examples && dictionaryResult.examples.length > 0 && (
                              <div className="bg-white rounded-xl p-6 mb-6 border-2 border-gray-200">
                                <p className="text-sm text-gray-600 font-semibold mb-4 flex items-center">
                                  <BookOpen className="h-4 w-4 mr-2" />
                                  Exemplos de Uso
                                </p>
                                <div className="space-y-4">
                                  {dictionaryResult.examples.map((ex: any, idx: number) => (
                                    <div key={idx} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-l-4 border-green-500">
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                          <p className="text-xl font-bold text-gray-800 mb-1">{ex.japanese}</p>
                                          <p className="text-sm text-pink-600 mb-1">{ex.hiragana}</p>
                                          <p className="text-sm text-purple-600 mb-2">{ex.romaji}</p>
                                          <p className="text-gray-700">
                                            <span className="font-semibold">🇧🇷</span> {ex.portuguese}
                                          </p>
                                        </div>
                                        <button
                                          onClick={() => playAudio(ex.japanese)}
                                          className="bg-green-200 hover:bg-green-300 p-2 rounded-lg transition-colors ml-3"
                                        >
                                          <Volume2 className="h-4 w-4 text-green-700" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Contexto de uso */}
                            {dictionaryResult.usage && (
                              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl p-6 mb-6">
                                <p className="text-sm text-yellow-800 font-semibold mb-3 flex items-center">
                                  <Target className="h-4 w-4 mr-2" />
                                  Quando Usar
                                </p>
                                <p className="text-gray-800 leading-relaxed">{dictionaryResult.usage}</p>
                              </div>
                            )}

                            {/* Notas culturais */}
                            {dictionaryResult.culturalNotes && (
                              <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6 mb-6">
                                <p className="text-sm text-orange-800 font-semibold mb-3 flex items-center">
                                  <Info className="h-4 w-4 mr-2" />
                                  Notas Culturais
                                </p>
                                <p className="text-gray-800 leading-relaxed">{dictionaryResult.culturalNotes}</p>
                              </div>
                            )}

                            {/* Conjugações */}
                            {dictionaryResult.conjugations && (
                              <div className="bg-white rounded-xl p-6 mb-6 border-2 border-gray-200">
                                <p className="text-sm text-gray-600 font-semibold mb-3">🔄 Conjugações e Variações</p>
                                <p className="text-gray-800 leading-relaxed">{dictionaryResult.conjugations}</p>
                              </div>
                            )}

                            {/* Palavras relacionadas */}
                            {dictionaryResult.relatedWords && dictionaryResult.relatedWords.length > 0 && (
                              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6">
                                <p className="text-sm text-indigo-700 font-semibold mb-4 flex items-center">
                                  <Grid3x3 className="h-4 w-4 mr-2" />
                                  Palavras Relacionadas
                                </p>
                                <div className="grid md:grid-cols-2 gap-3">
                                  {dictionaryResult.relatedWords.map((word: any, idx: number) => (
                                    <div key={idx} className="bg-white rounded-lg p-3 border border-indigo-200">
                                      <p className="text-lg font-bold text-gray-800">{word.japanese}</p>
                                      <p className="text-sm text-gray-600">{word.meaning}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
          </div>
        </div>
      </div>
    );
  }

  // Complete Screen
  if (currentScreen === 'complete') {
    const correctAnswers = exerciseResults.filter(r => r).length;
    const totalQuestions = exerciseResults.length;
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
    const xpEarned = Math.floor(currentLesson.xp * (correctAnswers / totalQuestions));
    const stars = accuracy === 100 ? 3 : accuracy >= 70 ? 2 : 1;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4 animate-bounce">
              {accuracy === 100 ? '🏆' : accuracy >= 70 ? '🎊' : '💪'}
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {accuracy === 100 ? 'Perfeito!' : accuracy >= 70 ? 'Muito Bem!' : 'Bom Trabalho!'}
            </h2>
            <p className="text-gray-600">
              {accuracy === 100 ? 'Performance impecável!' : accuracy >= 70 ? 'Continue assim!' : 'Pratique mais para melhorar!'}
            </p>
          </div>

          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 mb-6">
            <div className="text-white text-xl font-bold mb-2">+{xpEarned} XP</div>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3].map(i => (
                <Star
                  key={i}
                  className={`h-8 w-8 ${
                    i <= stars
                      ? 'text-yellow-300 fill-yellow-300 animate-pulse'
                      : 'text-yellow-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center bg-gray-100 rounded-lg p-3">
              <span className="text-gray-700 font-medium">Precisão</span>
              <span className={`font-bold ${accuracy === 100 ? 'text-green-600' : accuracy >= 70 ? 'text-blue-600' : 'text-orange-600'}`}>
                {accuracy}%
              </span>
            </div>
            <div className="flex justify-between items-center bg-gray-100 rounded-lg p-3">
              <span className="text-gray-700 font-medium">Acertos</span>
              <span className="font-bold text-green-600">{correctAnswers}/{totalQuestions}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-100 rounded-lg p-3">
              <span className="text-gray-700 font-medium">Nível</span>
              <span className="font-bold text-purple-600">{userProfile.level}</span>
            </div>
          </div>

          <button
            onClick={() => {
              // Busca a unidade atualizada antes de voltar
              const updatedUnit = units.find(u => u.id === selectedUnit.id);
              if (updatedUnit) {
                setSelectedUnit(updatedUnit);
              }
              setCurrentScreen('unit');
              playSound('click');
            }}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all"
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  // Lesson Screen
  if (currentScreen === 'lesson' && currentLesson) {
    const exercises = exerciseBank[currentLesson.id as keyof typeof exerciseBank];
    const exercise = exercises[currentExercise];
    const isCorrect = showResult && selectedAnswer === exercise.correct;
    const progress = ((currentExercise + 1) / exercises.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
        {showLevelUp && <LevelUpModal />}
        
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (window.confirm('Deseja sair da lição? Seu progresso será perdido.')) {
                      setCurrentScreen('unit');
                      playSound('click');
                    }
                  }}
                  className="bg-white/30 hover:bg-white/40 p-2 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
                <span className="text-white font-semibold">
                  Questão {currentExercise + 1} de {exercises.length}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {[...Array(userProfile.maxHearts)].map((_, i) => (
                    <Heart
                      key={i}
                      className={`h-6 w-6 transition-all ${
                        i < userProfile.hearts
                          ? 'text-red-500 fill-red-500 scale-100'
                          : 'text-white/30 scale-75'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
            {(exercise.type === 'recognize' || exercise.type === 'vocab' || exercise.type === 'audio') && (
              <div className="mb-6">
                <button
                  onClick={() => {
                    playAudio((exercise as any).word || (exercise as any).char || (exercise as any).romaji);
                    playSound('click');
                  }}
                  className={`mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-4 rounded-2xl flex items-center justify-center space-x-3 transition-all transform hover:scale-105 shadow-lg ${
                    isPlayingAudio ? 'ring-4 ring-blue-300 animate-pulse' : ''
                  }`}
                >
                  <Volume2 className={`h-7 w-7 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
                  <span className="text-lg font-semibold">
                    {isPlayingAudio ? 'Tocando...' : 'Ouvir Pronúncia'}
                  </span>
                </button>
                <p className="text-center text-sm text-gray-500 mt-2 flex items-center justify-center space-x-1">
                  <Volume2 className="h-4 w-4" />
                  <span>Dica: Clique nas opções para ouvir cada pronúncia</span>
                </p>
              </div>
            )}

            <div className="text-center mb-8">
              {(exercise as any).char && <div className="text-8xl mb-4 font-bold">{(exercise as any).char}</div>}
              {(exercise as any).word && <div className="text-7xl mb-4 font-bold">{(exercise as any).word}</div>}
              {(exercise as any).romaji && <p className="text-2xl text-blue-600 mb-2 font-medium">{(exercise as any).romaji}</p>}
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{exercise.question}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {exercise.options.map((option: string, idx: number) => {
                // Verifica se a opção contém partículas japonesas
                const hasParticle = Object.keys(particleTranslations).some(p => option.includes(p));
                
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (!showResult) {
                        setSelectedAnswer(idx);
                        playSound('click');
                        // Reproduz o áudio da opção clicada
                        playAudio(option);
                      }
                    }}
                    disabled={showResult}
                    className={`p-6 rounded-2xl font-semibold text-lg transition-all transform hover:scale-105 relative group ${
                      showResult
                        ? idx === exercise.correct
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-xl scale-105 ring-4 ring-green-300'
                          : idx === selectedAnswer
                          ? 'bg-gradient-to-r from-red-400 to-rose-500 text-white ring-4 ring-red-300'
                          : 'bg-gray-100 text-gray-400'
                        : selectedAnswer === idx
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800 hover:shadow-md'
                    }`}
                  >
                    {!showResult && (
                      <div className="absolute top-2 right-2 flex items-center space-x-1">
                        <Volume2 className={`h-4 w-4 transition-all ${
                          selectedAnswer === idx 
                            ? 'text-white opacity-70' 
                            : 'text-blue-500 opacity-0 group-hover:opacity-60'
                        }`} />
                      </div>
                    )}
                    <div className="flex items-center justify-center">
                      {hasParticle && !showResult ? (
                        <span>
                          {option.split('').map((char: string, charIdx: number) => {
                            if (particleTranslations[char as keyof typeof particleTranslations]) {
                              return (
                                <ParticleTooltip key={charIdx} particle={char}>
                                  {char}
                                </ParticleTooltip>
                              );
                            }
                            return <span key={charIdx}>{char}</span>;
                          })}
                        </span>
                      ) : (
                        option
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {!showResult ? (
            <button
              onClick={checkAnswer}
              disabled={selectedAnswer === null}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-5 rounded-2xl text-xl shadow-lg transition-all transform hover:scale-105 disabled:cursor-not-allowed disabled:transform-none disabled:opacity-50"
            >
              Verificar Resposta
            </button>
          ) : (
            <div className={`rounded-2xl p-6 ${
              isCorrect ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-rose-500'
            }`}>
              <div className="flex items-start justify-between text-white mb-4">
                <div className="flex items-start space-x-3">
                  {isCorrect ? (
                    <>
                      <Check className="h-8 w-8 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-2xl font-bold mb-1">Excelente! 🎉</h4>
                        <p className="text-sm opacity-90">+10 XP</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <X className="h-8 w-8 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-2xl font-bold mb-2">Ops! Tente novamente</h4>
                        <div className="bg-white/20 rounded-lg p-3 mb-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold mb-1">Resposta correta:</p>
                              <p className="text-lg">{exercise.options[exercise.correct]}</p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playAudio(exercise.options[exercise.correct]);
                              }}
                              className="bg-white/30 hover:bg-white/40 p-2 rounded-lg transition-colors"
                              title="Ouvir pronúncia correta"
                            >
                              <Volume2 className="h-5 w-5 text-white" />
                            </button>
                          </div>
                        </div>
                        <div className="bg-white/20 rounded-lg p-3">
                          <p className="text-sm flex items-start">
                            <Lightbulb className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                            <span>{exercise.explanation}</span>
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  nextExercise();
                  playSound('click');
                }}
                className="w-full bg-white text-gray-800 font-bold py-4 rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
              >
                {currentExercise < exercises.length - 1 ? 'Próxima Questão →' : 'Ver Resultado'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Unit Screen
  if (currentScreen === 'unit' && selectedUnit) {
    // Garante que estamos usando a versão mais atualizada da unidade
    const currentUnit = units.find(u => u.id === selectedUnit.id) || selectedUnit;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => {
              setCurrentScreen('map');
              setSelectedUnit(null);
              playSound('click');
            }}
            className="mb-6 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors"
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
            <span>Voltar</span>
          </button>

          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="text-5xl">{currentUnit.icon}</div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">{currentUnit.title}</h4>
                    <p className="text-gray-600">{currentUnit.subtitle}</p>
                  </div>
                </div>
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {currentUnit.level}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Progresso</p>
                <p className="text-2xl font-bold text-purple-600">
                  {currentUnit.lessons.filter((l: any) => l.completed).length}/{currentUnit.lessons.length}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {currentUnit.lessons.map((lesson: any, idx: number) => {
                const isAvailable = idx === 0 || currentUnit.lessons[idx - 1].completed;
                
                return (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      if (isAvailable) {
                        startLesson(lesson);
                      } else {
                        playSound('wrong');
                        alert('Complete a lição anterior primeiro!');
                      }
                    }}
                    disabled={!isAvailable}
                    className={`w-full text-left rounded-2xl p-6 transition-all transform ${
                      !isAvailable
                        ? 'bg-gray-200 opacity-50 cursor-not-allowed'
                        : lesson.completed
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500 hover:scale-105'
                        : 'bg-gradient-to-r from-blue-400 to-indigo-500 hover:scale-105 shadow-lg'
                    }`}
                    style={{
                      background: currentUnit.locked ? undefined : `linear-gradient(to right, ${currentUnit.color.replace('from-', '').replace('to-', ',')})`
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-3xl">{lesson.icon || '📖'}</span>
                          <div>
                            <h3 className={`text-xl font-bold ${!isAvailable ? 'text-gray-600' : 'text-white'}`}>
                              {lesson.title}
                            </h3>
                            <p className={`text-sm ${!isAvailable ? 'text-gray-500' : 'text-white/80'}`}>
                              {lesson.subtitle}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`text-sm font-semibold ${!isAvailable ? 'text-gray-600' : 'text-white/90'}`}>
                            {lesson.xp} XP
                          </span>
                          {lesson.completed && (
                            <div className="flex space-x-1">
                              {[1, 2, 3].map(i => (
                                <Star
                                  key={i}
                                  className={`h-5 w-5 ${
                                    i <= lesson.stars
                                      ? 'text-yellow-300 fill-yellow-300'
                                      : 'text-white/30'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {!isAvailable ? (
                        <div className="bg-gray-400 p-3 rounded-full">
                          <X className="h-6 w-6 text-white" />
                        </div>
                      ) : lesson.completed ? (
                        <div className="bg-white/30 p-3 rounded-full">
                          <Check className="h-6 w-6 text-white" />
                        </div>
                      ) : (
                        <div className="bg-white/30 p-3 rounded-full">
                          <ChevronRight className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Map Screen
  const currentRank = getCurrentRank(userProfile.totalXP);
  const RankIcon = currentRank.icon;
  const nextRank = ranks.find(r => r.minXP > userProfile.totalXP);
  const xpProgress = nextRank 
    ? ((userProfile.totalXP - currentRank.minXP) / (nextRank.minXP - currentRank.minXP)) * 100
    : 100;

  const totalLessons = units.reduce((acc, unit) => acc + unit.lessons.length, 0);
  const completedLessons = userProfile.completedLessons.length;
  const overallProgress = Math.round((completedLessons / totalLessons) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4">
      {showLevelUp && <LevelUpModal />}
      
      <div className="max-w-6xl mx-auto">
        {/* Top Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle cx="40" cy="40" r="32" stroke="#e5e7eb" strokeWidth="6" fill="none" />
                  <circle
                    cx="40" cy="40" r="32"
                    stroke="url(#gradient)"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${(userProfile.xp / userProfile.xpToNextLevel) * 201} 201`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">{userProfile.level}</div>
                    <div className="text-xs text-gray-500">LVL</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-gray-800">{userProfile.name}</h2>
                <div className="flex items-center space-x-2">
                  <div className={`${currentRank.bgColor} px-2 py-1 rounded-lg flex items-center space-x-1`}>
                    <RankIcon className={`h-4 w-4 ${currentRank.color}`} />
                    <span className={`text-sm font-semibold ${currentRank.color}`}>{currentRank.name}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${xpProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {nextRank ? `${nextRank.minXP - userProfile.totalXP} XP` : 'MAX'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Flame className="h-6 w-6 text-orange-500" />
                <div>
                  <div className="text-xl font-bold text-gray-800">{userProfile.streak}</div>
                  <div className="text-xs text-gray-500">dias</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-yellow-500" />
                <div>
                  <div className="text-xl font-bold text-gray-800">{userProfile.gemsCollected}</div>
                  <div className="text-xs text-gray-500">gemas</div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(userProfile.maxHearts)].map((_, i) => (
                  <Heart
                    key={i}
                    className={`h-6 w-6 ${
                      i < userProfile.hearts ? 'text-red-500 fill-red-500' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-purple-800">Progresso Total do Curso</span>
              <span className="text-sm font-bold text-purple-800">{overallProgress}%</span>
            </div>
            <div className="w-full bg-white/50 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <p className="text-xs text-purple-700 mt-2">
              {completedLessons} de {totalLessons} lições completas
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Trilha de Aprendizado</h3>
                  <p className="text-gray-600">Do N5 ao N4 - Curso Completo de Japonês</p>
                </div>
                <div className="text-6xl">🐸</div>
              </div>

              <div className="space-y-4">
                {units.map((unit, idx) => {
                  const completedInUnit = unit.lessons.filter(l => l.completed).length;
                  const progressInUnit = Math.round((completedInUnit / unit.lessons.length) * 100);
                  
                  return (
                    <button
                      key={unit.id}
                      onClick={() => selectUnit(unit)}
                      disabled={unit.locked}
                      className={`w-full text-left rounded-2xl p-6 transition-all transform ${
                        unit.locked
                          ? 'bg-gray-200 opacity-50 cursor-not-allowed'
                          : 'hover:scale-105 shadow-lg'
                      }`}
                      style={{
                        background: unit.locked ? undefined : `linear-gradient(to right, ${unit.color.replace('from-', '').replace('to-', ',')})`
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="text-5xl bg-white/20 p-4 rounded-xl">{unit.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className={`text-xl font-bold ${unit.locked ? 'text-gray-600' : 'text-white'}`}>
                                {unit.title}
                              </h4>
                              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                unit.locked ? 'bg-gray-300 text-gray-600' : 'bg-white/30 text-white'
                              }`}>
                                {unit.level}
                              </span>
                            </div>
                            <p className={`text-sm mb-2 ${unit.locked ? 'text-gray-500' : 'text-white/80'}`}>
                              {unit.subtitle}
                            </p>
                            <div className="flex items-center space-x-3">
                              <div className="flex-1">
                                <div className={`w-full h-2 rounded-full ${unit.locked ? 'bg-gray-300' : 'bg-white/30'}`}>
                                  <div
                                    className={`h-2 rounded-full ${unit.locked ? 'bg-gray-400' : 'bg-white'}`}
                                    style={{ width: `${progressInUnit}%` }}
                                  />
                                </div>
                              </div>
                              <span className={`text-sm font-semibold ${unit.locked ? 'text-gray-600' : 'text-white'}`}>
                                {completedInUnit}/{unit.lessons.length}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className={`p-3 rounded-full ${unit.locked ? 'bg-gray-400' : 'bg-white/30'}`}>
                          {unit.locked ? (
                            <X className="h-6 w-6 text-white" />
                          ) : (
                            <ChevronRight className="h-6 w-6 text-white" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resources Card */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center">
                  <BookOpen className="h-6 w-6 mr-2" />
                  Recursos
                </h3>
                <div className="text-3xl">🐸</div>
              </div>
              <p className="text-sm opacity-90 mb-3">
                Tabelas de Hiragana, Katakana e Dicionário interativo!
              </p>
              <div className="bg-white/20 rounded-lg p-3 mb-4 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div className="text-center">
                    <p className="font-bold">あ・ア</p>
                    <p className="opacity-80">Tabelas</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold">は・を</p>
                    <p className="opacity-80">Partículas</p>
                  </div>
                </div>
                <p className="text-xs opacity-75 text-center">
                  + Dicionário com análise completa
                </p>
              </div>
              <button
                onClick={() => {
                  setCurrentScreen('resources');
                  setSelectedResourceTab('hiragana');
                  playSound('click');
                }}
                className="w-full bg-white text-green-700 font-bold py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all"
              >
                Abrir Recursos
              </button>
            </div>

            {/* Minigame Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center">
                  <Gamepad2 className="h-6 w-6 mr-2" />
                  Minigame
                </h3>
                <div className="text-3xl">🎮</div>
              </div>
              <p className="text-sm opacity-90 mb-3">
                Pratique caracteres completos em um desafio de 100 questões!
              </p>
              <div className="bg-white/20 rounded-lg p-3 mb-4 backdrop-blur-sm">
                <div className="grid grid-cols-3 gap-1 text-xs mb-2">
                  <div className="text-center">
                    <p className="font-bold">104+</p>
                    <p className="opacity-80">Hiragana</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold">117+</p>
                    <p className="opacity-80">Katakana</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold">26</p>
                    <p className="opacity-80">Números</p>
                  </div>
                </div>
                <p className="text-xs opacity-75 text-center">
                  Inclui combinações きゃ, dakuten が, handakuten ぱ
                </p>
              </div>
              <button
                onClick={() => {
                  setMinigameMode(null);
                  setMinigameQuestion(0);
                  setMinigameScore({ correct: 0, wrong: 0 });
                  setMinigameSelected(null);
                  setMinigameShowResult(false);
                  setMinigameAnimating(false);
                  setMinigameShuffledData([]);
                  setCurrentScreen('minigame');
                  playSound('click');
                }}
                className="w-full bg-white text-purple-700 font-bold py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all"
              >
                Jogar Agora
              </button>
            </div>

            {/* Daily Quests */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <Target className="h-6 w-6 mr-2 text-orange-500" />
                  Missões Diárias
                </h3>
                <button
                  onClick={() => {
                    setDailyQuests(prev => prev.map(q => ({ ...q, progress: 0, completed: false })));
                    playSound('click');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Resetar missões"
                >
                  <RefreshCw className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <div className="space-y-3">
                {dailyQuests.map(quest => (
                  <div key={quest.id} className={`p-4 rounded-xl transition-all ${
                    quest.completed ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <p className={`text-sm font-semibold ${
                        quest.completed ? 'text-green-700 line-through' : 'text-gray-700'
                      }`}>
                        {quest.title}
                      </p>
                      <span className="text-xs font-bold text-orange-600 whitespace-nowrap ml-2">
                        +{quest.xp} XP
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          quest.completed ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min((quest.progress / quest.target) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.min(quest.progress, quest.target)}/{quest.target}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rank Progress */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Trophy className="h-6 w-6 mr-2" />
                Progresso de Rank
              </h3>
              {userProfile.totalXP < 10000 ? (
                <>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>{currentRank.name}</span>
                      <span>{nextRank?.name || 'Máximo'}</span>
                    </div>
                    <div className="w-full bg-white/30 rounded-full h-3">
                      <div
                        className="bg-white h-3 rounded-full transition-all duration-500"
                        style={{ width: `${xpProgress}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-sm opacity-90">
                    Faltam {nextRank ? nextRank.minXP - userProfile.totalXP : 0} XP para {nextRank?.name}
                  </p>
                </>
              ) : (
                <div className="text-center py-4">
                  <Crown className="h-16 w-16 mx-auto mb-2 text-yellow-300" />
                  <p className="font-bold text-lg">Grão-Mestre!</p>
                  <p className="text-sm opacity-90">Rank máximo alcançado!</p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <TrendingUp className="h-6 w-6 mr-2 text-blue-500" />
                Estatísticas
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">XP Total</span>
                  <span className="font-bold text-purple-600">{userProfile.totalXP}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Nível</span>
                  <span className="font-bold text-blue-600">{userProfile.level}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Lições Completas</span>
                  <span className="font-bold text-green-600">{completedLessons}/{totalLessons}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Taxa de Sucesso</span>
                  <span className="font-bold text-orange-600">{overallProgress}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;