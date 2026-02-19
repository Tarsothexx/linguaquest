# LinguaQuest - Implementação com Firebase

## 🚀 Como Configurar o Firebase

### 1. Criar Projeto no Firebase
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Criar um projeto" ou "Add project"
3. Dê um nome ao projeto (ex: "linguaquest")
4. Ative o Google Analytics (opcional)
5. Escolha sua conta Google

### 2. Configurar Authentication
1. No menu lateral, clique em "Authentication"
2. Vá para a aba "Sign-in method"
3. Ative o provedor "Email/Password"
4. Clique em "Save"

### 3. Configurar Firestore Database
1. No menu lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Iniciar no modo de teste" (para desenvolvimento)
4. Selecione uma localização (ex: us-central1)
5. Clique em "Concluído"

### 4. Obter Configurações do Firebase

**Opção A: Adicionar App Web (Método Recomendado)**
1. No Firebase Console, clique no ícone de engrenagem ⚙️ no topo
2. Selecione "Configurações do projeto"
3. Role para baixo até a seção "Seus apps"
4. Clique no botão **"</> Web"** (ícone de código)
5. Registre o app com um nome (ex: "LinguaQuest Web")
6. Clique em "Registrar app"
7. Você verá a configuração do Firebase SDK:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};
```

8. **Copie TODOS esses valores** - você vai usar no próximo passo

**Opção B: Se não conseguir ver "Seus apps"**
1. No Firebase Console, vá para **Visão geral** (Home)
2. Procure por "Comece adicionando o Firebase ao seu app"
3. Clique no ícone **"</>"** (Web)
4. Siga os passos anteriores

### 5. Configurar o Arquivo .env

1. Na raiz do projeto, abra o arquivo **`.env`** (ou crie um se não existir)
2. Cole as configurações que você copiou do Firebase:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456
```

3. **IMPORTANTE**: O arquivo `.env` já existe no projeto. Basta editar e substituir os valores "demo_" pelos valores reais do Firebase
4. Salve o arquivo
5. O arquivo `src/firebase.ts` vai automaticamente usar essas variáveis

### 6. Instalar Firebase CLI (Opcional, mas Recomendado)

A Firebase CLI permite fazer deploy da sua app na nuvem (grátis) e gerenciar o Firebase pela linha de comando.

```bash
npm install -g firebase-tools
```

Verificar se instalou corretamente:
```bash
firebase --version
```

### 7. Inicializar Firebase no Projeto

```bash
firebase login
```
Isso vai:
1. Abrir o navegador automaticamente
2. Você faz login com sua conta Google
3. Volta ao terminal confirmando o login

Depois, inicialize o projeto:
```bash
firebase init
```

Escolha as opções:
- Selecione **Firestore Database**
- Selecione **Hosting**
- Escolha seu projeto Firebase
- Para "public directory" digite: **dist**
- Configure single-page app: **Yes**

### 8. Fazer Build e Deploy na Nuvem

```bash
# Build do projeto
npm run build

# Deploy na nuvem (grátis no plano Spark)
firebase deploy
```

Seu app vai estar disponível em:
```
https://seu-projeto.web.app
https://seu-projeto.firebaseapp.com
```

### ⚙️ Comandos Firebase Úteis

```bash
# Fazer login
firebase login

# Listar projetos disponíveis
firebase list

# Usar um projeto específico
firebase use seu-projeto-id

# Fazer deploy (após npm run build)
firebase deploy

# Deploy apenas hosting
firebase deploy --only hosting

# Testar localmente com emuladores
firebase emulators:start

# Ver logs em tempo real
firebase functions:log

# Fazer logout
firebase logout
```

### 🚀 Executar Projeto Localmente

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 📊 Estrutura do Banco de Dados

### Collections no Firestore:

#### `users`
```json
{
  "email": "user@example.com",
  "name": "Nome do Usuário",
  "level": 1,
  "xp": 0,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### `progress`
```json
{
  "userId": "firebase_user_id",
  "unitId": "unit1",
  "lessonId": "h1",
  "completed": true,
  "score": 85,
  "completedAt": "2024-01-01T00:00:00.000Z"
}
```

#### `minigameScores`
```json
{
  "userId": "firebase_user_id",
  "gameType": "hiragana",
  "score": 95,
  "accuracy": 0.95,
  "playedAt": "2024-01-01T00:00:00.000Z"
}
```

## 🔧 Funcionalidades Implementadas

### ✅ Autenticação
- Registro de usuários
- Login/logout
- Persistência de sessão
- Recuperação automática de estado

### ✅ Progresso do Usuário
- Salvamento automático de progresso
- Sincronização entre dispositivos
- Rastreamento de lições completadas

### ✅ Minigames
- Salvamento de pontuações
- Estatísticas de acertos/erros
- Histórico de jogos

### ✅ Segurança
- Autenticação via Firebase Auth
- Regras de segurança no Firestore
- Dados criptografados

## 🚀 Próximos Passos

1. **Configurar Regras de Segurança**: No Firebase Console, configure as regras do Firestore para proteger os dados
2. **Adicionar Analytics**: Implemente tracking de uso do app
3. **Backup**: Configure backups automáticos dos dados
4. **Monitoramento**: Adicione logging e monitoramento de erros

## 🐛 Troubleshooting

### Erro: "Firebase: Error (auth/invalid-api-key)"
- Verifique se copiou corretamente a `apiKey` do Firebase Console
- Certifique-se que as variáveis no `.env` estão corretas

### Erro: "Missing or insufficient permissions"
- Configure as regras de segurança no Firestore:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### App não carrega dados
- Verifique se o Firestore Database foi criado
- Confirme que as regras de segurança estão corretas
- Verifique o console do navegador (F12) para erros

### Erro ao fazer `firebase login`
- Certifique-se que suas credenciais Google estão corretas
- Tente fazer logout: `firebase logout`
- Depois faça login novamente: `firebase login`

### Erro: "Cannot find module 'firebase'"
```bash
npm install
```

### Erro ao fazer deploy: "Permission denied"
- Certifique-se que você está logado: `firebase login`
- Verifique se selecionou o projeto correto: `firebase use seu-projeto-id`

### Port já está em uso
Se a porta 5173, 5174, etc estiver em uso:
```bash
# Usar uma porta específica
npm run dev -- --port 3000
```

## 📞 Suporte

- [Documentação do Firebase](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)
- [Comunidade Firebase](https://firebase.google.com/community)

## ✅ Checklist de Configuração

- [ ] Criei projeto no Firebase Console
- [ ] Ativei Email/Password authentication
- [ ] Criei Firestore Database
- [ ] Copiei as credenciais para `.env`
- [ ] Rodei `npm install`
- [ ] Testei localmente com `npm run dev`
- [ ] Rodei `firebase login`
- [ ] Rodei `firebase init`
- [ ] Rodei `npm run build && firebase deploy`

Se todas as caixas estão checadas, seu app está no ar! 🎉</content>
<parameter name="filePath">c:\Users\tarcisio.evangelista\Downloads\linguaquest\FIREBASE_SETUP.md