# 🔐 Secure API

Security-first RESTful API built with **NestJS** and **TypeScript**, focused on robust authentication, authorization (RBAC) and real-world protections against common attack vectors such as brute force, token reuse and session abuse.

This project was designed as a **backend security case study**, inspired by practices commonly adopted in **fintechs and sensitive systems**.

---

## 📋 About the Project

**Secure API** goes beyond a simple “JWT login” implementation and addresses real security concerns, including:

- Brute force attack protection
- Temporary login lockout
- Refresh token rotation and revocation
- Audit trail for critical authentication events
- Clear separation of concerns and domain boundaries

The focus is **secure authentication engineering**, not CRUD.

---

## 🚀 Tech Stack

- **NestJS** – Modular and scalable Node.js framework
- **TypeScript** – Static typing and compile-time safety
- **Prisma** – Type-safe ORM
- **PostgreSQL** – Relational database
- **JWT** – Stateless authentication
- **Argon2** – Password hashing (PHC winner)
- **Docker** – Containerization
- **Swagger** – Interactive API documentation
- **@nestjs/throttler** – Rate limiting

---

## 🔐 Security Features

### Authentication & Session Management

- ✅ JWT with **separate access and refresh tokens**
- ✅ **Refresh token rotation** with persistent revocation
- ✅ Session invalidation on token reuse
- ✅ Independent secrets for access and refresh tokens

### Attack Protection

- ✅ **Rate limiting** on sensitive endpoints
- ✅ **Brute force protection** with:
  - Sliding time window
  - Temporary lockout per email + IP
- ✅ Secure password hashing with **Argon2**

### Auditing & Monitoring

- ✅ **Audit log for critical security events**, including:
  - `auth.login_blocked`
  - `auth.login_failed`
  - `auth.login_success`
- ✅ Capture of IP address, user-agent

### Authorization

- ✅ **RBAC (Role-Based Access Control)**
- ✅ Custom guards (`JwtGuard`, `RolesGuard`)
- ✅ Clear separation between public and protected routes

---

## 📁 Project Structure

src/
├── auth/
│ ├── decorators/
│ ├── dto/
│ ├── guards/
│ ├── strategies/
│ └── auth.service.ts
├── login-attempt/
│ ├── login-attempt.service.ts
│ └── login-attempt.module.ts
├── audit/
│ ├── audit-log.service.ts
│ └── audit.module.ts
├── refresh-token/
│ └── refresh-token.service.ts
├── user/
│ └── user.service.ts
├── prisma/
│ └── prisma.service.ts
├── admin/
│ └── admin.controller.ts
└── main.ts

---

## 🔑 Authentication Flow (High Level)

1. Login request is received
2. System checks if **email + IP** are currently locked
3. Credentials are validated
4. On failure:
   - Attempt is recorded
   - Lockout may be applied
   - Security event is audited
5. On success:
   - Login attempts are reset
   - Access and refresh tokens are issued
   - Session is persisted
   - Success event is audited

---

## 📚 API Documentation

Swagger UI available at:

http://localhost:3000/docs

---

## 🧠 Key Architectural Decisions

### Why LoginAttempt + Lockout?

Rate limiting alone does not protect against distributed or persistent brute force attacks.  
The **LoginAttempt** mechanism adds a defense-in-depth layer commonly used in financial systems.

### Why Explicit Audit Logs?

Technical logs are not sufficient for incident investigation.  
The **Audit Log** records **domain-level security events**, enabling traceability and analysis.

### Why Refresh Token Rotation?

Prevents token reuse and session fixation attacks, a common requirement in regulated environments.

---

## 🗄️ Core Database Models

- **User** – System users
- **RefreshToken** – Persistent sessions with revocation
- **LoginAttempt** – Login attempt tracking and lockout
- **AuditLog** – Security audit trail

---

## 🔄 Roadmap

- [ ] Admin audit log visualization
- [ ] Security-focused e2e tests
- [ ] CI/CD with GitHub Actions
- [ ] Observability integration
- [ ] Two-Factor Authentication (2FA)

---

## 👤 Author

Developed as a **secure backend case study**, focused on authentication, authorization and security practices used by fintechs and sensitive systems.

---

⭐ If this project was useful or interesting, consider starring the repository.
