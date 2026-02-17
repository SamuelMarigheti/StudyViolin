# Guia de Deploy do StudyViolin no Railway

Este documento detalha o processo de deploy da aplicação StudyViolin (Backend FastAPI e Frontend React Native Expo) na plataforma [Railway](https://railway.app/).

## Sumário
1.  [Pré-requisitos](#1-pré-requisitos)
2.  [Configuração do MongoDB](#2-configuração-do-mongodb)
3.  [Deploy do Backend FastAPI](#3-deploy-do-backend-fastapi)
4.  [Deploy do Frontend React Native Expo](#4-deploy-do-frontend-react-native-expo)
5.  [Configuração de Auto-Deploy via GitHub](#5-configuração-de-auto-deploy-via-github)
6.  [Comandos Úteis do Railway CLI](#6-comandos-úteis-do-railway-cli)
7.  [Troubleshooting](#7-troubleshooting)

---

## 1. Pré-requisitos

*   **Conta Railway:** Uma conta ativa no [Railway](https://railway.app/)
*   **Conta GitHub:** Repositório StudyViolin em https://github.com/SamuelMarigheti/StudyViolin.git
*   **Railway CLI (Opcional, mas recomendado):**
    ```bash
    npm i -g @railwaydev/cli
    railway login
    ```
*   **Node.js e npm** (para o Frontend)
*   **Python 3.x e pip** (para o Backend)

---

## 2. Configuração do MongoDB

### Opção A: Plugin MongoDB do Railway (Mais simples)

1.  No seu projeto Railway, clique em `+ New` > `Database` > `MongoDB`
2.  O Railway irá provisionar uma instância e injetar automaticamente a variável `MONGO_URL` no seu serviço backend

### Opção B: MongoDB Atlas (Mais robusto para produção)

1.  Crie um cluster no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2.  Configure acesso à rede: adicione `0.0.0.0/0` para permitir conexões do Railway
3.  Crie um usuário de banco de dados
4.  Copie a Connection String:
    ```
    mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/?retryWrites=true&w=majority
    ```
5.  Adicione como variável `MONGO_URL` no serviço backend do Railway

---

## 3. Deploy do Backend FastAPI

### Opção 1: Usando Nixpacks (Recomendado)

1.  No projeto Railway: `+ New` > `Deploy from GitHub Repo`
2.  Selecione o repositório `StudyViolin`
3.  Em `Root Directory`, defina: `/backend`
4.  Adicione as variáveis de ambiente (veja tabela abaixo)
5.  Defina o `Start Command`:
    ```
    uvicorn server:app --host 0.0.0.0 --port $PORT
    ```

### Opção 2: Usando Dockerfile

Crie o arquivo `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir fastapi uvicorn motor python-dotenv pydantic bcrypt python-jose[cryptography] python-multipart

COPY . .

EXPOSE 8000

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
```

No Railway, em `Service Settings` > `Build`, selecione `Dockerfile` como Build Type.

### Variáveis de Ambiente do Backend

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `MONGO_URL` | String de conexão MongoDB | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `DB_NAME` | Nome do banco de dados | `violin_study` |
| `JWT_SECRET` | Chave secreta para tokens JWT (use uma string forte!) | `minha-chave-super-secreta-prod-2024` |
| `PORT` | Porta do serviço (injetada automaticamente pelo Railway) | Não precisa definir |

### Arquivo `railway.toml` (Backend)

Crie o arquivo `backend/railway.toml`:

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "uvicorn server:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/api/"
healthcheckTimeout = 10
```

---

## 4. Deploy do Frontend React Native Expo

### Opção 1: Exportar como Web Estático (Recomendado)

1.  **Exporte o frontend para web:**
    ```bash
    cd frontend
    npm install
    npx expo export --platform web
    ```
    Isso cria a pasta `dist/` com os arquivos estáticos.

2.  **No Railway:**
    *   `+ New` > `Deploy from GitHub Repo`
    *   Selecione o repositório `StudyViolin`
    *   `Root Directory`: `/frontend`
    *   `Build Command`: `npm install && npx expo export --platform web`
    *   `Publish Directory`: `dist`

3.  **Variável de ambiente:**
    ```
    EXPO_PUBLIC_BACKEND_URL=https://<URL-DO-SEU-BACKEND>.up.railway.app
    ```

### Opção 2: Servidor Node.js (Alternativa)

Crie `frontend/server.js`:

```javascript
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Frontend server listening on port ${port}`);
});
```

No Railway:
*   `Build Command`: `npm install && npx expo export --platform web`
*   `Start Command`: `node server.js`
*   Adicione `express` ao `package.json`: `npm install express`

### Variáveis de Ambiente do Frontend

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `EXPO_PUBLIC_BACKEND_URL` | URL pública do backend no Railway | `https://studyviolin-backend.up.railway.app` |

---

## 5. Configuração de Auto-Deploy via GitHub

1.  Ao conectar o repositório GitHub ao Railway, o auto-deploy é configurado automaticamente
2.  A cada `git push` na branch `main`, o Railway reconstrói e redeployará automaticamente
3.  Verifique e ajuste na aba `Deployments` do serviço no Railway
4.  Você pode configurar branches específicas para deploy em `Service Settings`

---

## 6. Comandos Úteis do Railway CLI

| Comando | Descrição |
|---------|-----------|
| `railway login` | Autenticar CLI com sua conta |
| `railway init` | Inicializar projeto Railway |
| `railway link` | Vincular diretório local a um projeto existente |
| `railway add mongodb` | Adicionar plugin MongoDB ao projeto |
| `railway deploy` | Deploy manual do diretório atual |
| `railway logs` | Visualizar logs do serviço |
| `railway run <cmd>` | Executar comando no ambiente Railway |
| `railway open` | Abrir dashboard no navegador |
| `railway variables` | Listar variáveis de ambiente |

### Exemplos práticos:

```bash
# Vincular ao projeto
railway link

# Deploy do backend
cd backend
railway deploy --service backend

# Ver logs em tempo real
railway logs --follow

# Rodar comando no ambiente Railway
railway run python -c "print('hello')"
```

---

## 7. Troubleshooting

### Problemas de Build
*   **Root Directory incorreto:** Verifique se está `/backend` ou `/frontend`
*   **Dependências faltando:** Verifique `requirements.txt` ou `package.json`
*   **Logs de Build:** Examine os logs na aba `Deployments` do Railway

### Problemas de Deploy/Start
*   **Start Command incorreto:** Confirme `uvicorn server:app --host 0.0.0.0 --port $PORT`
*   **Variáveis de ambiente:** Verifique se `MONGO_URL`, `DB_NAME` e `JWT_SECRET` estão configuradas
*   **Porta:** O app deve escutar na porta `$PORT` fornecida pelo Railway

### Conexão Frontend-Backend
*   **URL incorreta:** Verifique se `EXPO_PUBLIC_BACKEND_URL` tem `https://` e está sem `/` no final
*   **CORS:** O backend já permite todas as origens (`allow_origins=["*"]`). Em produção, restrinja para a URL do frontend:
    ```python
    origins = [
        "https://<SUA_URL_FRONTEND>.up.railway.app",
    ]
    ```

### Conexão Backend-MongoDB
*   **MONGO_URL inválida:** Verifique a string de conexão e credenciais
*   **Acesso à rede (Atlas):** Certifique-se que `0.0.0.0/0` está na whitelist ou use VPC Peering
*   **Plugin Railway:** Verifique se a variável `MONGO_URL` foi injetada corretamente
