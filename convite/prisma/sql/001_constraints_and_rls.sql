-- Ejecutar una vez después de `prisma migrate dev`:
--   npx prisma db execute --file prisma/sql/001_constraints_and_rls.sql --schema prisma/schema.prisma

-- 1) Integridad que Prisma no expresa de forma nativa
ALTER TABLE "guests"
  ADD CONSTRAINT "guests_total_passes_positive" CHECK ("totalPasses" >= 1),
  ADD CONSTRAINT "guests_admitted_within_total"
    CHECK ("admittedPasses" >= 0 AND "admittedPasses" <= "totalPasses");

-- 2) Las tablas de `public` quedan expuestas por la API REST de Supabase (clave anon).
--    Con RLS activo y sin políticas, anon/authenticated no pueden leer ni escribir nada.
--    Prisma conecta con el rol `postgres` (dueño de las tablas), que no pasa por RLS.
--    Las políticas de lectura para Realtime se añaden en la fase del dashboard.
ALTER TABLE "users"                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "events"                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE "guests"                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stripe_webhook_events"  ENABLE ROW LEVEL SECURITY;
