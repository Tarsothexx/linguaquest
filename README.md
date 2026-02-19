# LinguaQuest - App de Aprendizado de Japonês

Um aplicativo interativo para aprender japonês com lições estruturadas, minigames e dicionário integrado.

## 🚀 Funcionalidades

- ✅ **Autenticação completa** com Firebase
- ✅ **Sistema de progresso** persistente
- ✅ **Minigames interativos** (Hiragana, Katakana, Números)
- ✅ **Dicionário inteligente** com IA
- ✅ **Interface responsiva** e moderna
- ✅ **Sincronização entre dispositivos**

## 📋 Pré-requisitos

- Node.js 16+
- Conta Google (para Firebase)

## 🛠️ Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd linguaquest
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o Firebase**
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o .env com suas chaves do Firebase
# Siga o guia em FIREBASE_SETUP.md
```

4. **Execute o projeto**
```bash
npm run dev
```

## 🔧 Configuração do Firebase

Para configurar o banco de dados e autenticação, siga o guia detalhado em [`FIREBASE_SETUP.md`](./FIREBASE_SETUP.md).

### Variáveis de Ambiente (.env)

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id
VITE_ANTHROPIC_API_KEY=your_anthropic_key
```

## 🎮 Como Usar

1. **Crie uma conta** ou faça login
2. **Explore o mapa** de unidades
3. **Complete lições** para ganhar XP
4. **Jogue minigames** para praticar
5. **Use o dicionário** para pesquisar palavras

## 🏗️ Arquitetura

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + Lucide Icons
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **AI**: Anthropic Claude (dicionário)

## 📁 Estrutura do Projeto

```
linguaquest/
├── src/
│   ├── App.tsx          # Componente principal
│   ├── firebase.ts      # Configuração Firebase
│   └── main.tsx         # Ponto de entrada
├── FIREBASE_SETUP.md    # Guia de configuração
├── .env.example         # Exemplo de variáveis
└── package.json
```

## 🚀 Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
```

The project uses Vite + React + TypeScript + Tailwind. If you want, I can run `npm install` and start the dev server here.
