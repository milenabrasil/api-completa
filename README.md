# API Completa

API REST completa com autenticação JWT e gerenciamento de tarefas por usuário.

## Tecnologias
- Node.js
- Express
- MySQL
- JWT (JSON Web Token)
- Bcrypt

## Funcionalidades
- Cadastro e login de usuários
- Senha criptografada com Bcrypt
- Autenticação com JWT
- CRUD completo de tarefas
- Cada usuário vê e gerencia apenas suas próprias tarefas
- Rotas protegidas por autenticação

## Como rodar

### Instalação
```bash
npm install
```

### Configurar o banco
```sql
CREATE DATABASE api_completa;
USE api_completa;
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);
CREATE TABLE tarefas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    concluida BOOLEAN DEFAULT FALSE,
    usuario_id INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

### Rodar o servidor
```bash
node server.js
```

## Rotas

### Autenticação
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | /cadastro | Cadastrar usuário | ❌ |
| POST | /login | Fazer login | ❌ |

### Tarefas
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | /tarefas | Listar tarefas do usuário | ✅ |
| GET | /tarefas/:id | Buscar tarefa por id | ✅ |
| POST | /tarefas | Criar tarefa | ✅ |
| PUT | /tarefas/:id | Atualizar tarefa | ✅ |
| DELETE | /tarefas/:id | Deletar tarefa | ✅ |

## Como autenticar
```
Authorization: Bearer SEU_TOKEN_AQUI
```