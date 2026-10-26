# Convite — Plataforma de Invitaciones Digitales y Control de Acceso QR

Proyecto **Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Prisma + Supabase Auth** completamente configurado, corregido y listo para levantar el servidor y realizar pruebas de principio a fin.

---

## ¿Qué se corrigió y mejoró respecto a la versión anterior?

1. **`package.json` completo y funcional**:
   - Tu archivo original tenía el `package.json` vacío (sin `next`, `react`, `prisma`, `zod`, `@supabase/ssr` ni los scripts `dev`, `build`, `start`). Ahora incluye todas las dependencias y scripts listos.
2. **Archivos de configuración y estilos faltantes agregados**:
   - Se crearon `src/app/globals.css`, `tailwind.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `next.config.mjs`, `components.json` y `src/lib/utils.ts`.
3. **Componentes UI base (`shadcn/ui`) creados**:
   - Se implementaron `src/components/ui/button.tsx`, `src/components/ui/input.tsx` y `src/components/ui/label.tsx`, que eran importados por tus formularios pero no existían en el proyecto.
4. **Corrección de `.env` y Modo Demo Local integrado**:
   - Antes tenías `src/.env` (donde ni Next.js ni Prisma lo leen) con valores de ejemplo que hacían que `zod` en `src/lib/env.ts` lanzara un error fatal al iniciar.
   - Ahora `.env` está en la raíz del proyecto y cuenta con **Modo Demo Local automático (`CONVITE_DEMO_MODE="true"`)**: puedes correr `npm run dev` inmediatamente sin configurar Supabase todavía, o cambiar a Supabase/Postgres real cuando quieras.
5. **Flujo completo de prueba (End-to-End)**:
   - **Login / Registro** con botón de acceso rápido de 1 clic en modo demo (`demo@convite.mx` / `convite123`).
   - **Dashboard del anfitrión** (`/dashboard`) con creación de eventos, alta de invitados/familias, métricas en vivo y envío por WhatsApp.
   - **Portal del invitado** (`/invitacion/[urlToken]`) con confirmación de asistencia (RSVP) y generación real de código QR únicamente cuando el invitado está `CONFIRMED`.
   - **Escáner de recepción con PIN** (`/recepcion/[eventId]`) para probar el control de acceso parcial o total de pases en la puerta (PIN demo: `1234`).

---

## Cómo correr el servidor y hacer pruebas (en 2 minutos)

```bash
# 1. Entra a la carpeta del proyecto
cd convite

# 2. Instala las dependencias (también ejecuta `prisma generate` automáticamente)
npm install

# 3. Inicia el servidor de desarrollo
npm run dev
```

Abre **[http://localhost:3000](http://localhost:3000)** en tu navegador:
- En la pantalla de login verás el **Modo Demo Local Activo**. Haz clic en **"Entrar como Anfitrión Demo (1 clic)"** (o usa `demo@convite.mx` / `convite123`).
- Explora el evento precargado **"Boda de Ana y Luis"**, crea nuevos eventos, agrega familias invitadas, abre el enlace **"Ver invitación"** para confirmar asistencia y ver el código QR real, y entra a **"Abrir Escáner de Puerta (Staff)"** (PIN `1234`) para admitir pases.

---

## Cómo conectar tu proyecto real de Supabase (Producción / Desarrollo con BD en la nube)

Cuando quieras usar tu base de datos PostgreSQL y autenticación de Supabase:

1. Abre el archivo `.env` en la raíz del proyecto y cambia:
   ```env
   CONVITE_DEMO_MODE="false"
   NEXT_PUBLIC_SUPABASE_URL="https://TU-REF.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key-real"
   DATABASE_URL="postgresql://postgres.TU-REF:TU-PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
   DIRECT_URL="postgresql://postgres.TU-REF:TU-PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres"
   ```
2. Ejecuta las migraciones y las políticas RLS / constraints:
   ```bash
   npm run setup:db
   ```
3. En el panel de Supabase → *Authentication → URL Configuration*, agrega `http://localhost:3000/auth/callback` en **Redirect URLs**.
