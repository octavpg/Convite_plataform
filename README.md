<div align="center">
  <h1>🎟️ Convite</h1>
  <p><strong>Plataforma SaaS para la creación, personalización y gestión de invitaciones digitales interactivas.</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-14+-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe" />
  </p>
</div>

---

## 📌 Contexto & Problema de Negocio

Este proyecto nació como la evolución técnica de un micronegocio validado en el mercado real: tras diseñar y desplegar manualmente más de **10 invitaciones web interactivas para clientes en 3 meses** utilizando *HTML/CSS/JS*, identifiqué la oportunidad de automatizar y escalar el proceso.

**Convite** transforma ese flujo manual en una plataforma de autoservicio (SaaS) donde los organizadores de eventos pueden configurar, previsualizar, pagar y gestionar sus invitaciones y confirmaciones de asistencia en tiempo real.

---

## ✨ Características Principales

* **Editor Dinámico:** Configuración interactiva de eventos (itinerarios, cuenta regresiva, mapas con ubicación, código de vestimenta y enlaces de mesa de regalos).
* **Confirmación de Asistencia (RSVP):** Sistema de gestión de invitados con métricas en tiempo real de asistencia confirmada.
* **Diseño Mobile-First:** Experiencia ultra-optimizada para dispositivos móviles y carga rápida en redes móviles limitadas.
* **Procesamiento de Pagos:** Integración segura con checkout de Stripe para la adquisición de plantillas premium y planes por evento.
* **Arquitectura Escalable:** Gestión de datos relacionales y autenticación moderna respaldada por Supabase (PostgreSQL).

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Frontend** | Next.js (App Router), React, Tailwind CSS | Renderizado del lado del servidor (SSR), rendimiento y diseño responsivo. |
| **Backend & API** | Next.js Server Actions / API Routes | Manejo de lógica de negocio y endpoints internos. |
| **Base de Datos & ORM** | PostgreSQL & Prisma ORM | Modelado relacional estructurado, migraciones y consultas tipo-seguras (*type-safe*). |
| **Autenticación & Storage** | Supabase | Gestión de usuarios, sesiones seguras y almacenamiento de recursos multimedia. |
| **Pasarela de Pagos** | Stripe API & Webhooks | Procesamiento seguro de transacciones y conciliación de eventos de pago. |

---

## 📂 Arquitectura de Base de Datos (Prisma Schema Overview)

El sistema opera sobre un esquema relacional diseñado para soportar múltiples usuarios y eventos:

* `User`: Información del cliente, rol y suscripciones/compras asociadas.
* `Event`: Detalles del evento (fecha, locación, configuraciones de diseño, slug público).
* `Guest / RSVP`: Lista de invitados vinculados al evento con control de estado (Confirmado / Rechazado / Pendiente) y pases asignados.
* `Order`: Historial de transacciones validadas mediante webhooks de Stripe.

---

## 🚀 Puesta en Marcha Local

### Prerrequisitos
* Node.js v18+ instalado
* Cuenta de Supabase (PostgreSQL) y claves de desarrollo de Stripe

### Instalación

1. Clona el repositorio:
   ```bash
   git clone [https://github.com/octavpg/convite.git](https://github.com/octavpg/convite.git)
   cd convite
