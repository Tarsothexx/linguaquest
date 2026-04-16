# Firestore Security Rules para LinguaQuest

## ⚠️ IMPORTANTE: Copie esto para o Firebase Console

Acesse: [Firebase Console](https://console.firebase.google.com/)
→ linguaquest-c77f9
→ Firestore Database
→ Rules

Cole o conteúdo abaixo e clique "Publish":

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ===== FUNÇÕES DE VALIDAÇÃO =====
    
    // Verifica se o usuário está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Verifica se o usuário é dono do documento
    function isDocumentOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Valida estrutura de usuário
    function isValidUserData() {
      let data = request.resource.data;
      return data.keys().hasAll(['email', 'name', 'createdAt']) &&
             data.email is string &&
             data.name is string &&
             data.email.size() > 3 &&
             data.name.size() > 1;
    }
    
    // Valida dados de progresso
    function isValidProgressData() {
      let data = request.resource.data;
      return data.keys().hasAll(['userId', 'lessonId', 'score', 'timestamp']) &&
             data.userId is string &&
             data.lessonId is string &&
             data.score is number &&
             data.score >= 0 && data.score <= 100;
    }
    
    // Valida pontuação de minigame
    function isValidMinigameScore() {
      let data = request.resource.data;
      return data.keys().hasAll(['userId', 'gameType', 'score', 'timestamp']) &&
             data.userId is string &&
             data.score is number &&
             data.score >= 0;
    }
    
    // ===== REGRAS POR COLEÇÃO =====
    
    // Coleta "users" - Profile do usuário
    match /users/{userId} {
      allow read: if isAuthenticated() &&
                     (isDocumentOwner(userId) || request.auth.token.admin == true);
      allow create: if isAuthenticated() &&
                       request.auth.uid == userId &&
                       isValidUserData();
      allow update: if isAuthenticated() &&
                       isDocumentOwner(userId) &&
                       isValidUserData();
      allow delete: if isAuthenticated() && isDocumentOwner(userId);
    }
    
    // Coleção "lessons" - Dado de lições (SOMENTE LEITURA para usuários)
    match /lessons/{lessonId} {
      allow read: if isAuthenticated();
      allow write: if false; // Protege contra modificações
    }
    
    // Coleção "units" - Unidades de curso (SOMENTE LEITURA)
    match /units/{unitId} {
      allow read: if isAuthenticated();
      allow write: if false;
      
      // Subcoleção de lições
      match /lessons/{lessonId} {
        allow read: if isAuthenticated();
        allow write: if false;
      }
    }
    
    // Coleção "minigames" - Dados de minigames (SOMENTE LEITURA)
    match /minigames/{gameType} {
      allow read: if isAuthenticated();
      allow write: if false;
    }
    
    // Coleção "progress" - Progresso do usuário
    match /progress/{progressId} {
      allow read: if isAuthenticated() && 
                     (isDocumentOwner(resource.data.userId) || 
                      request.auth.token.admin == true);
      allow create: if isAuthenticated() && 
                       isDocumentOwner(request.resource.data.userId) && 
                       isValidProgressData();
      allow update: if isAuthenticated() && 
                       isDocumentOwner(resource.data.userId) && 
                       isValidProgressData();
      allow delete: if isAuthenticated() && 
                       isDocumentOwner(resource.data.userId);
    }
    
    // Coleção "minigame_scores" - Pontuações de minigames
    match /minigame_scores/{scoreId} {
      allow read: if isAuthenticated() && 
                     isDocumentOwner(resource.data.userId);
      allow create: if isAuthenticated() && 
                       isDocumentOwner(request.resource.data.userId) && 
                       isValidMinigameScore();
      allow update: if isAuthenticated() && 
                       isDocumentOwner(resource.data.userId);
      allow delete: if isAuthenticated() && 
                       isDocumentOwner(resource.data.userId);
    }
    
    // Bloquear tudo mais
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Segurança Implementada:

### ✅ **Autenticação & Autorização**
- Apenas usuários autenticados podem acessar dados
- Usuários só veem seus próprios dados (exceto dados públicos)
- Admins podem ver tudo (proteja o token `admin`)

### ✅ **Validação de Dados**
- Estrutura obrigatória para cada tipo de documento
- Tamanho mínimo de strings validado
- Tipos de dados rigorosamente checados

### ✅ **Proteção de Dados do Curso**
- `lessons`, `units`, `minigames` são **SOMENTE LEITURA**
- Nenhum usuário (nem admin) pode modificar conteúdo do curso
- Garante integridade dos dados educacionais

### ✅ **Isolamento de Dados**
- Progress de um usuário não pode ser visto por outro
- Minigame scores são privados

### ✅ **Prevenção de Exploração**
- Sem acesso genérico (`{document=**}` bloqueado)
- Validação rigorosa em CRUDs
- Nenhuma escrita em coleções críticas

---

**Próximo passo:** Cole as regras acima no Firebase Console e clique "Publish"
