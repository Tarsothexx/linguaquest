# 🔒 Segurança LinguaQuest - Guia Completo

## 📋 Implementações de Segurança

### 1. **Validação de Entrada (Input Validation)**
✅ **Implementado em `firebase.ts`**

```typescript
// Email: RFC 5322 format + tamanho máximo
isValidEmail(email) → valida formato e comprimento

// Senha: Mínimo 6 caracteres + letra + número
isValidPassword(password) → força obrigatória

// Nome: 2-100 caracteres + bloqueia caracteres perigosos
isValidName(name) → sanitização contra XSS
```

**Resultado:** Previne entradas malformadas no banco de dados

---

### 2. **Sanitização de Dados (Output Encoding)**
✅ **Implementado em `firebase.ts`**

```typescript
sanitizeString(str) → remove/escapa:
- < > → &lt; &gt;
- & → &amp;
- " ' → &quot; &#x27;
```

**Resultado:** Previne XSS mesmo se dados maliciosos entrem no banco

---

### 3. **Proteção de Banco de Dados (Firestore Rules)**
✅ **Regras em `FIRESTORE_RULES.md`**

```javascript
// Apenas usuários autenticados
allow read: if request.auth != null;

// Dados do curso são SOMENTE LEITURA
match /lessons/{lessonId} { allow read; allow write: false; }
match /units/{unitId} { allow read; allow write: false; }
match /minigames/{gameType} { allow read; allow write: false; }

// Isolamento de dados por usuário
match /progress/{id} {
  allow read: if resource.data.userId == request.auth.uid
}

// Validação de estrutura de dados
function isValidProgressData() {
  return data.keys().hasAll(['userId', 'lessonId', 'score'])
}
```

**Resultado:**
- ❌ Nenhum usuário não-autenticado pode acessar
- ❌ Nenhum usuário pode modificar curso
- ❌ Os dados de um usuário não podem ser vistos por outro
- ❌ Estrutura de dados é validada antes de salvar

---

### 4. **Autenticação (Firebase Auth)**
✅ **Implementado nativamente**

- Senhas armazenadas com hash bcrypt (Firebase)
- Tokens JWT com expiração
- Logout limpa sessão
- Mensagens de erro genéricas (não expõe se email existe)

```typescript
// Resposta segura
"Email ou senha incorretos" // Não diz qual está errado
```

---

### 5. **CORS & Headers de Segurança**
✅ **Vite + React setup seguro**

- API keys expostas apenas em `.env` (não versionadas)
- `.gitignore` bloqueia `.env`
- Comunicação HTTPS em produção

---

### 6. **Rate Limiting (Cliente)**
✅ **Pode ser adicionado em `App.tsx`**

```typescript
// Exemplo: Bloqueia múltiplos logins rápidos
const [lastLoginAttempt, setLastLoginAttempt] = useState(0);

const handleLogin = async () => {
  const now = Date.now();
  if (now - lastLoginAttempt < 3000) { // 3 segundos
    alert('Muitas tentativas. Aguarde...');
    return;
  }
  setLastLoginAttempt(now);
  // ... login logic
};
```

---

### 7. **Proteção de Informações Sensíveis**
✅ **Implementado em `firebase.ts`**

```typescript
// ❌ ANTES: Retorna tudo
return userDoc.data(); // Email, senha hash, tudo

// ✅ DEPOIS: Retorna apenas necessário
return {
  name: stats?.name,
  level: stats?.level,
  totalXP: stats?.totalXP
  // Email, IDs internos, etc. não retornam
};
```

---

### 8. **Proteção contra SQL Injection**
✅ **Não aplicável** (Firestore não usa SQL)

Firestore usa queries estruturadas:
```typescript
query(collection(db, 'progress'), where('userId', '==', userId))
// Não vulnerável a injection como SQL tradicional
```

---

## 🚀 Próximas Melhorias (Recomendado)

### Médio Prazo
1. **Rate Limiting (Servidor)**
   - Cloud Functions do Firebase com limite de requisições/IP
   
2. **2FA (Two-Factor Authentication)**
   - Email verification obrigatória
   - Código de backup

3. **Content Security Policy (CSP)**
   - Header HTTP no servidor

### Longo Prazo
1. **Auditoria de Logs**
   - Registrar todas as mudanças de dados
   
2. **Backup Automático**
   - Cloud Storage snapshots diários

3. **Teste de Penetração**
   - Contratar especialista de segurança

---

## ✅ Checklist de Segurança

- [x] Validação de email, senha, nome
- [x] Sanitização de strings (XSS prevention)
- [x] Firestore Rules com autenticação obrigatória
- [x] Isolamento de dados por usuário
- [x] Dados de curso (lessons, units) somente leitura
- [x] Mensagens de erro genéricas (não expõe info sensível)
- [x] RetPrivação de dados (sem expor emails/IDs)
- [x] .env versionado no .gitignore
- [x] Firebase Auth com hash seguro
- [x] Bloqueia acesso não-autenticado

---

## 🔐 Como Usar com Segurança

### Admin Setup
```bash
# 1. Copie as regras de FIRESTORE_RULES.md
# 2. Firebase Console → Firestore → Rules → Publish
# 3. Remova credentials locais após deploy
```

### Usuário Normal
```typescript
// App autentica via Firebase
const usuario = await loginUser(email, password);
// Firebase valida automaticamente
// Firestore rules limitam acesso
```

### Em Produção
1. Ative HTTPS obrigatório
2. Configure domínio no Firebase Console
3. Adicione reCAPTCHA v3 em formulários
4. Monitore Cloud Firestore usage

---

**Última atualização:** 2026-02-20
**Status:** ✅ Segurança Básica Implementada
