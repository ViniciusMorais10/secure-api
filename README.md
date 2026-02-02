# 🔐 Secure API

API RESTful robusta focada em segurança, autenticação e autorização (RBAC) construída com NestJS e TypeScript. Este projeto demonstra implementação de boas práticas de segurança desde o código até a infraestrutura.

## 📋 Sobre o Projeto

Este projeto foi desenvolvido como parte do meu portfólio para demonstrar conhecimentos em:

- Autenticação e autorização seguras
- Implementação de RBAC (Role-Based Access Control)
- Boas práticas de segurança em APIs
- Arquitetura modular e escalável
- Uso de tecnologias modernas do ecossistema Node.js

## 🚀 Tecnologias Utilizadas

- **[NestJS](https://nestjs.com/)** - Framework Node.js progressivo
- **[TypeScript](https://www.typescriptlang.org/)** - Superset JavaScript com tipagem estática
- **[Prisma](https://www.prisma.io/)** - ORM moderno para Node.js e TypeScript
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional
- **[JWT](https://jwt.io/)** - JSON Web Tokens para autenticação
- **[Argon2](https://github.com/ranisalt/node-argon2)** - Algoritmo de hashing de senhas (vencedor do Password Hashing Competition)
- **[Docker](https://www.docker.com/)** - Containerização
- **[Swagger](https://swagger.io/)** - Documentação interativa da API

## 🔐 Features de Segurança

- ✅ **Autenticação JWT** com access e refresh tokens separados
- ✅ **Refresh Token Rotation** - tokens são rotacionados a cada uso
- ✅ **RBAC** - Controle de acesso baseado em roles (Admin/User)
- ✅ **Rate Limiting** - Proteção contra brute force em endpoints sensíveis
- ✅ **Argon2 Hashing** - Algoritmo de hashing resistente a ataques GPU
- ✅ **Validação de Dados** - Validação automática com class-validator
- ✅ **Normalização de Email** - Emails são normalizados (lowercase, trim)
- ✅ **Token Revocation** - Sistema de revogação de refresh tokens
- ✅ **Guards Personalizados** - Proteção de rotas com JWT e Roles

## 📁 Estrutura do Projeto

```
src/
├── auth/                    # Módulo de autenticação
│   ├── decorators/         # Decorators customizados (Roles)
│   ├── dto/                # Data Transfer Objects
│   ├── guards/             # Guards (JWT, Roles)
│   ├── strategies/         # Estratégias Passport (JWT)
│   └── auth.service.ts     # Lógica de autenticação
├── user/                    # Módulo de usuários
│   ├── dto/                # DTOs de usuário
│   └── user.service.ts     # Lógica de usuários
├── refresh-token/          # Módulo de refresh tokens
│   └── refresh-token.service.ts
├── prisma/                 # Módulo Prisma
│   └── prisma.service.ts
├── admin/                  # Módulo admin (exemplo RBAC)
└── main.ts                 # Entry point da aplicação
```

## 🛠️ Instalação e Configuração

### Pré-requisitos

- Node.js (v18 ou superior)
- pnpm (ou npm/yarn)
- Docker e Docker Compose

### Passo a Passo

1. **Clone o repositório**

```bash
git clone <seu-repositorio>
cd secure-api
```

2. **Instale as dependências**

```bash
pnpm install
```

3. **Configure as variáveis de ambiente**

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
DATABASE_URL="postgresql://postgres:secure123@localhost:5432/secureapi?schema=public"

JWT_ACCESS_SECRET=seu_secret_access_aqui
JWT_ACCESS_EXPIRES_IN=15m

JWT_REFRESH_SECRET=seu_secret_refresh_aqui
JWT_REFRESH_EXPIRES_IN=7d

PORT=3000
```

4. **Inicie o banco de dados com Docker**

```bash
docker-compose up -d
```

5. **Execute as migrations**

```bash
pnpm prisma migrate dev
```

6. **Inicie a aplicação**

```bash
# Modo desenvolvimento
pnpm run start:dev

# Modo produção
pnpm run build
pnpm run start:prod
```

A API estará disponível em `http://localhost:3000`

## 📚 Documentação da API

Acesse a documentação interativa Swagger em: `http://localhost:3000/docs`

### Endpoints Principais

#### Autenticação

- **POST** `/auth/register` - Registrar novo usuário
- **POST** `/auth/login` - Fazer login (rate limited: 5 req/min)
- **POST** `/auth/refresh` - Renovar tokens (rate limited: 20 req/min)

#### Usuários (Protegido)

- **GET** `/user/profile` - Obter perfil do usuário autenticado

#### Admin (Protegido - Apenas ADMIN)

- **GET** `/admin/users` - Listar todos os usuários

### Exemplo de Uso

**1. Registrar usuário**

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "StrongPass#123"
  }'
```

**2. Fazer login**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "StrongPass#123"
  }'
```

Resposta:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**3. Acessar rota protegida**

```bash
curl -X GET http://localhost:3000/user/profile \
  -H "Authorization: Bearer {accessToken}"
```

**4. Renovar tokens**

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

## 🏗️ Decisões Arquiteturais

### Por que Argon2?

Argon2 é o vencedor do Password Hashing Competition e é mais resistente a ataques de GPU/ASIC comparado ao bcrypt. É a escolha recomendada pela OWASP para hashing de senhas.

### Refresh Token Rotation

Implementei rotação de refresh tokens para aumentar a segurança. A cada renovação:

1. O token antigo é revogado
2. Um novo par de tokens é gerado
3. Isso previne reutilização de tokens roubados

### Separação de Secrets JWT

Access e refresh tokens usam secrets diferentes, adicionando uma camada extra de segurança. Se um secret for comprometido, o outro permanece seguro.

### Rate Limiting

- Login: 5 requisições por minuto
- Refresh: 20 requisições por minuto

Isso protege contra ataques de brute force mantendo boa experiência do usuário.

## 🧪 Testes

```bash
# Testes unitários
pnpm run test

# Testes e2e
pnpm run test:e2e

# Cobertura de testes
pnpm run test:cov
```

## 🗄️ Banco de Dados

### Schema Prisma

O projeto utiliza três modelos principais:

- **User** - Usuários do sistema
- **RefreshToken** - Tokens de refresh com hash
- **LoginAttempt** - Tentativas de login (em desenvolvimento)

### Migrations

```bash
# Criar nova migration
pnpm prisma migrate dev --name nome_da_migration

# Aplicar migrations em produção
pnpm prisma migrate deploy

# Abrir Prisma Studio
pnpm prisma studio
```

## 🔄 Próximos Passos

- [ ] Implementar sistema de LoginAttempt para proteção contra brute force
- [ ] Adicionar logs de auditoria
- [ ] Implementar endpoint de logout
- [ ] Adicionar validação robusta de complexidade de senha
- [ ] Criar job para limpeza de tokens expirados
- [ ] Implementar testes unitários e e2e
- [ ] Adicionar CI/CD com GitHub Actions
- [ ] Implementar 2FA (Two-Factor Authentication)
- [ ] Adicionar recuperação de senha via email

## 📝 Scripts Disponíveis

```bash
pnpm run start          # Inicia a aplicação
pnpm run start:dev      # Inicia em modo desenvolvimento (watch)
pnpm run start:prod     # Inicia em modo produção
pnpm run build          # Build da aplicação
pnpm run lint           # Executa o linter
pnpm run format         # Formata o código com Prettier
pnpm run test           # Executa testes unitários
pnpm run test:e2e       # Executa testes e2e
```

## 🤝 Contribuindo

Este é um projeto de portfólio pessoal, mas sugestões e feedbacks são bem-vindos!

## 📄 Licença

Este projeto está sob a licença UNLICENSED - veja o arquivo package.json para detalhes.

## 👤 Autor

Desenvolvido como projeto de portfólio para demonstrar habilidades em desenvolvimento backend seguro.

---

⭐ Se este projeto foi útil para você, considere dar uma estrela no repositório!
