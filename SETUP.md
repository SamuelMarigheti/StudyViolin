# Documentação do Projeto StudyViolin

Este documento fornece um guia completo para configurar, executar e entender o projeto StudyViolin, que consiste em um backend FastAPI, um frontend React Native Expo e um banco de dados MongoDB.

## Sumário
1.  [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2.  [Requisitos do Sistema](#2-requisitos-do-sistema)
3.  [Configuração do Ambiente](#3-configuração-do-ambiente)
4.  [Executando a Aplicação](#4-executando-a-aplicação)
5.  [Configuração dos Arquivos `.env`](#5-configuração-dos-arquivos-env)
6.  [Credenciais Padrão](#6-credenciais-padrão)
7.  [Comandos Úteis](#7-comandos-úteis)
8.  [Troubleshooting Básico](#8-troubleshooting-básico)

---

## 1. Visão Geral do Projeto

O StudyViolin é uma aplicação composta por:
*   **Backend**: Desenvolvido com Python FastAPI, servindo a API para o frontend.
*   **Frontend**: Uma aplicação mobile construída com React Native Expo.
*   **Banco de Dados**: MongoDB, persistindo os dados da aplicação.

## 2. Requisitos do Sistema

*   **Sistema Operacional**: Fedora 43 Linux
*   **Container Runtime**: Podman 5.7.1
*   **Python**: Versão 3.x (com `venv` para ambientes virtuais)
*   **Node.js e npm**: Necessário para o desenvolvimento do frontend Expo
*   **Expo CLI**: Ferramenta de linha de comando para projetos Expo

## 3. Configuração do Ambiente

### MongoDB

O MongoDB é executado como um contêiner Podman.

### Backend (Python FastAPI)

1.  **Navegue até a pasta `backend`**:
    ```bash
    cd backend
    ```
2.  **Crie e ative um ambiente virtual Python**:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```
3.  **Instale as dependências Python**:
    ```bash
    pip install fastapi uvicorn motor python-dotenv pydantic bcrypt python-jose[cryptography] python-multipart
    ```

### Frontend (React Native Expo)

1.  **Navegue até a pasta `frontend`**:
    ```bash
    cd frontend
    ```
2.  **Instale as dependências Node.js/npm**:
    ```bash
    npm install
    ```

## 4. Executando a Aplicação

Certifique-se de que cada componente esteja em sua própria janela de terminal ou em segundo plano. O IP local da sua máquina é `192.168.3.8`.

### Iniciar MongoDB

```bash
podman run -d --name mongo -p 27017:27017 docker.io/library/mongo:7
```

*   `-d`: Executa o contêiner em modo detached (segundo plano).
*   `--name mongo`: Atribui o nome `mongo` ao contêiner.
*   `-p 27017:27017`: Mapeia a porta 27017 do host para a porta 27017 do contêiner.

### Iniciar Backend

```bash
cd backend
source venv/bin/activate
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

*   `server:app`: Refere-se à instância `app` dentro do arquivo `server.py`.
*   `--reload`: Reinicia o servidor automaticamente em caso de mudanças no código.
*   `--host 0.0.0.0`: Permite acesso de qualquer interface de rede.
*   `--port 8000`: Define a porta do backend.

### Iniciar Frontend

```bash
cd frontend
npx expo start
```

*   Isso exibirá um QR code. Use o aplicativo **Expo Go** no celular para escanear.
*   **Importante**: O celular deve estar na mesma rede Wi-Fi que a máquina (`192.168.3.8`).

## 5. Configuração dos Arquivos `.env`

### Backend (`backend/.env`)

```dotenv
MONGO_URL=mongodb://localhost:27017
DB_NAME=violin_study
JWT_SECRET=violin-study-plan-secret-key-2024
```

*   `MONGO_URL`: URL de conexão com o MongoDB.
*   `DB_NAME`: Nome do banco de dados.
*   `JWT_SECRET`: Chave secreta para tokens JWT. **Altere em produção!**

### Frontend (`frontend/.env`)

```dotenv
EXPO_PUBLIC_BACKEND_URL=http://192.168.3.8:8000
```

*   Substitua `192.168.3.8` pelo IP local da sua máquina se necessário.

## 6. Credenciais Padrão

| Campo | Valor |
|-------|-------|
| **Usuário** | `admin` |
| **Senha** | `violino2024` |

**Importante**: Na primeira vez que fizer login, o sistema irá forçar a troca da senha por segurança.

## 7. Comandos Úteis

### Podman (MongoDB)

| Ação | Comando |
|------|---------|
| Iniciar contêiner | `podman start mongo` |
| Parar contêiner | `podman stop mongo` |
| Reiniciar contêiner | `podman restart mongo` |
| Remover contêiner | `podman rm mongo` |
| Recriar do zero | `podman rm -f mongo && podman run -d --name mongo -p 27017:27017 docker.io/library/mongo:7` |
| Listar contêineres | `podman ps` |
| Ver logs | `podman logs mongo` |
| Ver logs em tempo real | `podman logs -f mongo` |

### Backend

| Ação | Comando |
|------|---------|
| Iniciar (foreground) | `cd backend && source venv/bin/activate && uvicorn server:app --reload --host 0.0.0.0 --port 8000` |
| Iniciar (background) | `cd backend && source venv/bin/activate && nohup uvicorn server:app --reload --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &` |
| Parar (foreground) | `Ctrl+C` no terminal |
| Parar (background) | `kill $(lsof -t -i:8000)` |
| Reiniciar (background) | `kill $(lsof -t -i:8000); cd backend && source venv/bin/activate && nohup uvicorn server:app --reload --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &` |
| Ver logs (background) | `tail -f /tmp/backend.log` |
| Verificar se está rodando | `curl -s http://localhost:8000/api/` |

### Frontend

| Ação | Comando |
|------|---------|
| Iniciar | `cd frontend && npx expo start` |
| Iniciar (web direto) | `cd frontend && npx expo start --web` |
| Parar | `Ctrl+C` no terminal |
| Parar (por PID) | `kill $(lsof -t -i:8081)` |
| Reiniciar | `kill $(lsof -t -i:8081); cd frontend && npx expo start` |
| Limpar cache e iniciar | `cd frontend && npx expo start --clear` |

### Iniciar/Parar/Reiniciar Tudo

```bash
# === INICIAR TUDO ===
podman start mongo
cd backend && source venv/bin/activate && nohup uvicorn server:app --reload --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
cd frontend && npx expo start

# === PARAR TUDO ===
kill $(lsof -t -i:8081) 2>/dev/null   # Frontend
kill $(lsof -t -i:8000) 2>/dev/null   # Backend
podman stop mongo                       # MongoDB

# === REINICIAR TUDO ===
kill $(lsof -t -i:8081) 2>/dev/null; kill $(lsof -t -i:8000) 2>/dev/null; podman restart mongo
cd backend && source venv/bin/activate && nohup uvicorn server:app --reload --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
cd frontend && npx expo start

# === VERIFICAR STATUS ===
podman ps --filter name=mongo            # MongoDB
curl -s http://localhost:8000/api/       # Backend
lsof -i:8081                             # Frontend
```

### Testando a API com cURL

```bash
# Verificar se a API está rodando
curl http://localhost:8000/api/

# Login
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "violino2024"}' \
     http://localhost:8000/api/auth/login
```

## 8. Troubleshooting Básico

### Frontend não consegue se conectar ao Backend
*   Verifique se o backend está rodando na porta `8000`.
*   Confirme se `EXPO_PUBLIC_BACKEND_URL` no `frontend/.env` tem o IP correto.
*   Certifique-se de que o firewall não bloqueia a porta `8000`:
    ```bash
    sudo firewall-cmd --zone=public --add-port=8000/tcp --permanent
    sudo firewall-cmd --reload
    ```
*   Verifique se o celular está na mesma rede Wi-Fi.

### Backend não consegue se conectar ao MongoDB
*   Verifique se o contêiner está rodando: `podman ps`
*   Confirme a porta `27017` mapeada.
*   Verifique `MONGO_URL` no `backend/.env`.

### `uvicorn` não inicia
*   Verifique se o venv está ativado: `source venv/bin/activate`
*   Confirme que as dependências foram instaladas.
*   Verifique erros de sintaxe no `server.py`.

### Expo Go apresenta "Network request failed"
*   O frontend não alcança o backend — revise IP e porta.
*   Reinicie o Expo e escaneie o QR code novamente.

### Problemas de permissão no Fedora (SELinux/Firewall)
*   Abrir porta no firewall:
    ```bash
    sudo firewall-cmd --zone=public --add-port=8000/tcp --permanent
    sudo firewall-cmd --reload
    ```
