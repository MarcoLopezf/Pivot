# 🚀 DEPLOYMENT CHECKLIST - PIVOT AI

**Estado**: Primer deploy a producción
**Fecha inicio**: 2026-02-13
**Base de datos**: Supabase (PostgreSQL)
**Hosting**: Vercel

---

## 📋 ÍNDICE

1. [Tareas Críticas (Bloquean Deploy)](#-tareas-críticas-bloquean-deploy)
2. [Configuración de Base de Datos](#-configuración-de-base-de-datos)
3. [Variables de Entorno](#-variables-de-entorno)
4. [Migraciones y Seed](#-migraciones-y-seed)
5. [Deploy Inicial](#-deploy-inicial)
6. [Post-Deploy](#-post-deploy)
7. [Mejoras Recomendadas](#-mejoras-recomendadas-no-bloqueantes)

---

## 🚨 TAREAS CRÍTICAS (Bloquean Deploy)

### ✅ Calidad de Código

- [x] **Arreglar errores de formato**
  - [x] `src/app/quiz/[roadmapId]/[itemId]/page.tsx`
  - [x] `src/app/roadmap/[roadmapId]/item/[itemId]/page.tsx`

- [x] **Limpiar warnings de ESLint**
  - [x] Variables no usadas en login page
  - [x] Importación `Skeleton` no usada en ProjectSubmissionForm
  - [x] React Hooks warning en Step4DirectGoals

- [x] **Verificar que `pnpm verify` pasa completamente**
  - [x] Lint: OK
  - [x] Format: OK
  - [x] Type-check: OK
  - [x] Tests: OK (57 files, 502 tests)
  - [x] Build: OK

---

## 🗄️ CONFIGURACIÓN DE BASE DE DATOS

### 1. Crear Base de Datos en Supabase

- [ ] **Crear proyecto en Supabase**
  - Ir a [supabase.com](https://supabase.com)
  - Crear nuevo proyecto (región recomendada: US East o más cercana a usuarios)
  - Guardar credenciales de DB

- [ ] **Obtener DATABASE_URL de producción**
  ```
  Formato: postgresql://[user]:[password]@[host]:[port]/[database]?pgbouncer=true&connection_limit=1
  ```
  - Se encuentra en: Settings → Database → Connection string → URI
  - **IMPORTANTE**: Usar connection pooling (pgbouncer) para Vercel

- [ ] **Configurar Connection Pooling**
  - Habilitar "Connection Pooling" en Supabase
  - Usar la URL con `?pgbouncer=true`
  - Esto es crítico para serverless (Vercel tiene límite de conexiones)

### 2. Configurar Auth en Supabase

- [ ] **Configurar Auth Providers**
  - Habilitar Email/Password auth
  - Configurar GitHub OAuth (opcional)
  - Configurar Google OAuth (opcional)
  - Añadir redirect URLs de producción:
    - `https://tu-dominio.vercel.app/auth/callback`
    - `https://tu-dominio.com/auth/callback` (si tienes dominio custom)

- [ ] **Obtener Keys de Supabase**
  - `NEXT_PUBLIC_SUPABASE_URL`: Settings → API → Project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Settings → API → anon/public key

---

## 🔐 VARIABLES DE ENTORNO

### En Vercel Dashboard

- [ ] **Configurar todas las variables en Vercel**
  - Ir a: Project Settings → Environment Variables
  - Añadir para todos los ambientes (Production, Preview, Development)

#### Variables de Base de Datos
```bash
DATABASE_URL=postgresql://[credentials]@[host]:5432/postgres?pgbouncer=true&connection_limit=1
```

#### Variables de Supabase (Públicas)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

#### Variables de AI/APIs (Privadas)
```bash
GOOGLE_AI_API_KEY=AIza...
OPENAI_API_KEY=sk-...
YOUTUBE_API_KEY=AIza...
TAVILY_API_KEY=tvly-...
GITHUB_ACCESS_TOKEN=ghp_...
```

- [ ] **Verificar que las keys de producción son DIFERENTES a desarrollo**
  - ⚠️ NUNCA usar las mismas keys de dev en prod
  - Crear keys separadas para cada ambiente

- [ ] **Configurar secrets sensibles**
  - Marcar como "Sensitive" en Vercel las keys privadas
  - No exponer en logs ni errores

---

## 🔄 MIGRACIONES Y SEED

### Estrategia de Migraciones

#### Opción 1: Manual (Recomendada para primer deploy)
```bash
# Desde tu local, apuntando a prod DB
DATABASE_URL="[prod-url]" pnpm prisma migrate deploy
```

**Pros**: Control total, puedes verificar antes
**Contras**: Requiere acceso manual

#### Opción 2: Automática en Build (Para CI/CD futuro)
Añadir a `package.json`:
```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

**Pros**: Automático en cada deploy
**Contras**: Puede fallar el deploy si hay error en migración

### Tareas de Migración

- [ ] **Aplicar migraciones a producción**
  ```bash
  # Generar Prisma Client
  pnpm prisma generate

  # Aplicar migraciones (usa migrate deploy en prod, NO migrate dev)
  DATABASE_URL="[prod-url]" pnpm prisma migrate deploy
  ```

- [ ] **Verificar que las tablas se crearon**
  ```bash
  # Abrir Prisma Studio apuntando a prod (con cuidado)
  DATABASE_URL="[prod-url]" pnpm prisma studio
  ```

### Seed de Datos Iniciales

- [ ] **Ejecutar seed de JobRoles**

  **Estrategia recomendada** (después del primer deploy):

  1. **Verificar que la DB está vacía**
     ```bash
     DATABASE_URL="[prod-url]" pnpm prisma studio
     ```

  2. **Ejecutar seed**
     ```bash
     DATABASE_URL="[prod-url]" pnpm db:seed
     ```

  3. **Verificar que se crearon los JobRoles**
     - Revisar en Prisma Studio o Supabase dashboard
     - Debe haber ~30-50 job roles predefinidos

  **⚠️ IMPORTANTE**: Ejecutar seed SOLO UNA VEZ. Si falla, limpiar la tabla antes de reintentar.

- [ ] **Documentar proceso de seed**
  - Añadir instrucciones al README
  - Crear script `scripts/seed-production.sh` (opcional)

---

## 🚢 DEPLOY INICIAL

### Pre-Deploy

- [ ] **Build local exitoso**
  ```bash
  pnpm build && pnpm start
  ```
  - Probar en http://localhost:3000
  - Verificar que todas las rutas funcionan

- [ ] **Commit y push de cambios**
  ```bash
  git add .
  git commit -m "chore: prepare for production deployment"
  git push origin dev
  ```

### Deploy en Vercel

- [ ] **Conectar repositorio a Vercel**
  - Ir a [vercel.com](https://vercel.com/new)
  - Importar proyecto desde GitHub
  - Seleccionar repositorio `pivot`

- [ ] **Configurar proyecto**
  - Framework Preset: Next.js
  - Root Directory: `./` (raíz)
  - Build Command: `pnpm build` (default)
  - Output Directory: `.next` (default)
  - Install Command: `pnpm install` (default)

- [ ] **Configurar variables de entorno** (ver sección anterior)

- [ ] **Deploy**
  - Hacer deploy desde branch `main` o `dev`
  - Esperar ~2-5 minutos

### Verificación Post-Deploy

- [ ] **Verificar que el deploy fue exitoso**
  - URL: https://[project-name].vercel.app
  - Revisar logs en Vercel dashboard

- [ ] **Aplicar migraciones** (si no se hicieron antes)
  ```bash
  DATABASE_URL="[prod-url]" pnpm prisma migrate deploy
  ```

- [ ] **Ejecutar seed** (JobRoles)
  ```bash
  DATABASE_URL="[prod-url]" pnpm db:seed
  ```

---

## ✅ POST-DEPLOY

### Pruebas Manuales

- [ ] **Landing page** (`/`)
  - Cargar correctamente
  - Redirección funciona (unauth → landing, auth → roadmap)

- [ ] **Autenticación** (`/login`)
  - Sign up con email funciona
  - Login con email funciona
  - OAuth GitHub funciona (si configurado)
  - OAuth Google funciona (si configurado)

- [ ] **Onboarding** (`/onboarding`)
  - Flujo completo funciona
  - Step 1: Profile
  - Step 2: Experience
  - Step 3: Path selection
  - Step 4: Target role
  - Step 5: Import CV (opcional)
  - Step 6: Roadmap generation

- [ ] **Roadmap** (`/roadmap/[id]`)
  - Se genera roadmap correctamente
  - Items se visualizan
  - Navegación entre items funciona

- [ ] **Lesson/Item** (`/roadmap/[id]/item/[itemId]`)
  - Contenido se carga
  - Videos de YouTube cargan
  - Recursos se muestran

- [ ] **Quiz** (`/quiz/[roadmapId]/[itemId]`)
  - Preguntas se generan
  - Envío de respuestas funciona
  - Feedback se muestra

- [ ] **Project Submission**
  - GitHub URL validation funciona
  - Análisis de proyecto funciona
  - Feedback se genera

### Monitoreo Inicial

- [ ] **Revisar logs en Vercel**
  - Ver si hay errores en runtime
  - Verificar que no hay crashes

- [ ] **Probar con usuario real**
  - Crear cuenta de prueba
  - Completar onboarding
  - Generar roadmap
  - Navegar entre items

---

## 📚 MEJORAS RECOMENDADAS (No Bloqueantes)

### 1. Documentación

- [x] **Actualizar README.md** ✅ COMPLETADO

  Contenido incluido:
  ```markdown
  # PIVOT AI - Personalized Learning Roadmaps

  ## 📖 Descripción
  Plataforma de learning paths personalizados con AI

  ## 🚀 Setup Local
  ### Requisitos
  - Node.js 18+
  - PostgreSQL 15+
  - pnpm 8+

  ### Instalación
  1. Clonar repo
  2. Instalar deps: `pnpm install`
  3. Configurar .env (ver .env.example)
  4. Aplicar migraciones: `pnpm db:migrate`
  5. Seed inicial: `pnpm db:seed`
  6. Dev server: `pnpm dev`

  ## 🏗️ Arquitectura
  - Hexagonal/Clean Architecture
  - Domain → Application → Infrastructure → Interfaces

  ## 🧪 Tests
  - Unit: `pnpm test`
  - Integration: `pnpm test:int`
  - Coverage: `pnpm test:coverage`

  ## 📦 Deploy
  Ver DEPLOYMENT-CHECKLIST.md

  ## 📝 Variables de Entorno
  Ver .env.example para lista completa
  ```

- [ ] **Crear CONTRIBUTING.md**
  - Git workflow (feature branches)
  - Conventional commits
  - Pre-push hooks
  - TDD guidelines

- [ ] **Documentar arquitectura**
  - Diagrams de flujo
  - Bounded contexts (DDD)
  - Dependency flow

### 2. CI/CD con GitHub Actions

- [ ] **Crear `.github/workflows/ci.yml`**

  ```yaml
  name: CI

  on:
    pull_request:
      branches: [dev, main]
    push:
      branches: [dev, main]

  jobs:
    verify:
      runs-on: ubuntu-latest

      steps:
        - uses: actions/checkout@v4

        - name: Setup Node.js
          uses: actions/setup-node@v4
          with:
            node-version: '20'

        - name: Setup pnpm
          uses: pnpm/action-setup@v2
          with:
            version: 8

        - name: Install dependencies
          run: pnpm install

        - name: Lint
          run: pnpm lint

        - name: Format check
          run: pnpm format:check

        - name: Type check
          run: pnpm type-check

        - name: Run tests
          run: pnpm test --run

        - name: Build
          run: pnpm build
  ```

- [ ] **Configurar branch protection rules**
  - Require PR reviews (1 approval)
  - Require status checks (CI must pass)
  - Require branches to be up to date

### 3. Health Check Endpoint

**¿Por qué?**
- Monitoreo externo (uptime monitors como UptimeRobot, Better Uptime)
- Vercel Health Checks
- Validar que DB está accesible
- Validar que APIs externas responden

- [ ] **Crear `/api/health/route.ts`**

  ```typescript
  import { NextResponse } from "next/server";
  import { prisma } from "@/infrastructure/database/PrismaClient";

  export const dynamic = "force-dynamic";

  export async function GET() {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;

      return NextResponse.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        services: {
          database: "up",
          api: "up",
        },
      });
    } catch (error) {
      return NextResponse.json(
        {
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 503 }
      );
    }
  }
  ```

- [ ] **Configurar monitoring externo**
  - UptimeRobot: ping cada 5 minutos
  - Better Uptime: alertas por email/Slack
  - Endpoint: `https://tu-dominio.vercel.app/api/health`

### 4. Configuración Avanzada de Vercel

- [ ] **Crear `vercel.json` (si es necesario)**

  ```json
  {
    "functions": {
      "api/**/*.ts": {
        "maxDuration": 60
      }
    },
    "headers": [
      {
        "source": "/(.*)",
        "headers": [
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          }
        ]
      }
    ],
    "rewrites": [
      {
        "source": "/healthz",
        "destination": "/api/health"
      }
    ]
  }
  ```

  **Casos de uso**:
  - ⏱️ Aumentar timeout para AI generation (default: 10s, max: 60s en Pro)
  - 🌍 Configurar regiones específicas
  - 🔒 Headers de seguridad custom
  - 🔄 Rewrites/redirects

- [ ] **Configurar dominio custom** (opcional)
  - Comprar dominio
  - Añadir en Vercel: Settings → Domains
  - Configurar DNS records

### 5. Plan de Migraciones Futuras

- [ ] **Documentar proceso**

  Crear `docs/MIGRATIONS.md`:
  ```markdown
  # Guía de Migraciones

  ## Desarrollo Local
  1. Modificar `prisma/schema.prisma`
  2. Crear migración: `pnpm db:migrate`
  3. Revisar archivo en `prisma/migrations/`
  4. Commit cambios

  ## Producción
  ### Opción 1: Manual (segura)
  DATABASE_URL="[prod]" pnpm prisma migrate deploy

  ### Opción 2: Automática (CI/CD)
  - Se ejecuta en vercel-build
  - Ver package.json → vercel-build script

  ## Rollback
  Si una migración falla:
  1. Revertir cambios en schema.prisma
  2. Crear migración de rollback
  3. Aplicar: `prisma migrate deploy`
  ```

- [ ] **Estrategia de rollback**
  - Backups automáticos de Supabase (revisar retención)
  - Point-in-time recovery habilitado
  - Scripts de rollback documentados

### 6. Monitoreo y Logging

- [ ] **Configurar Sentry**

  1. **Crear proyecto en Sentry**
     - [sentry.io](https://sentry.io)
     - Crear proyecto Next.js

  2. **Instalar SDK**
     ```bash
     pnpm add @sentry/nextjs
     pnpm dlx @sentry/wizard@latest -i nextjs
     ```

  3. **Configurar variables**
     ```bash
     SENTRY_DSN=https://...@sentry.io/...
     NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
     SENTRY_AUTH_TOKEN=sntrys_...
     ```

  4. **Configurar alertas**
     - Email on new issue
     - Slack integration
     - Error rate threshold alerts

- [ ] **Configurar Vercel Analytics** (opcional)
  - Habilitar en Vercel dashboard
  - Ver métricas de performance (Web Vitals)

- [ ] **Structured Logging**
  - Usar `console.log` con JSON en producción
  - Logs de errores con stack traces
  - Request IDs para tracing

---

## 📊 CHECKLIST RESUMIDO

### 🚨 CRÍTICO (Debe completarse antes del deploy)
- [x] `pnpm verify` pasa
- [ ] Base de datos Supabase creada
- [ ] Variables de entorno configuradas en Vercel
- [ ] Build local exitoso

### 🚀 DEPLOY
- [ ] Proyecto conectado en Vercel
- [ ] Deploy inicial exitoso
- [ ] Migraciones aplicadas
- [ ] Seed ejecutado (JobRoles)

### ✅ POST-DEPLOY
- [ ] Pruebas manuales completas
- [ ] Logs sin errores críticos
- [ ] Usuario de prueba funciona end-to-end

### 📚 MEJORAS (Hacer después del deploy)
- [ ] README documentado
- [ ] CI/CD configurado
- [ ] Health check endpoint
- [ ] Sentry configurado
- [ ] Plan de migraciones documentado

---

## 🆘 TROUBLESHOOTING

### Error: "Too many connections" (Database)
- ✅ Usar connection pooling en DATABASE_URL: `?pgbouncer=true&connection_limit=1`
- ✅ Verificar que Supabase tiene pooling habilitado

### Error: "Module not found" en build
- ✅ Verificar que todas las deps están en `dependencies` (no `devDependencies`)
- ✅ Ejecutar `pnpm install` y volver a intentar

### Error: "Environment variable not defined"
- ✅ Verificar que está configurada en Vercel
- ✅ Hacer redeploy para que tome cambios en env vars

### Error en migraciones
- ✅ Nunca usar `migrate dev` en producción (solo `migrate deploy`)
- ✅ Verificar DATABASE_URL apunta a base correcta
- ✅ Revisar permisos de usuario de DB

---

## 📞 CONTACTO Y RECURSOS

- **Documentación Vercel**: https://vercel.com/docs
- **Documentación Prisma**: https://www.prisma.io/docs
- **Documentación Supabase**: https://supabase.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/app/building-your-application/deploying

---

**Última actualización**: 2026-02-13
**Mantenido por**: @MarcoLopezf
