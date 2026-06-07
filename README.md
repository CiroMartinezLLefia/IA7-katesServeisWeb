# Champions SaaS

SaaS **multiusuari mínim** per a navegar per **equips** i **partits**, publicar **comentaris de partits** i gestionar contingut mitjançant panells de control de **backoffice basats en rols** (`EDITOR`, `ADMIN`). Creat com a lliurable de **M0613 IA7** (bloc *Creació d'un SaaS*, sessions S16-S20).

**Demo en viu:** https://champions-saas-ciro.vercel.app
**Repositori:** https://github.com/ciro-daw2/champions-saas

## Per què aquest projecte

Els aficionats i els editors necessiten un lloc únic per **publicar** enfrontaments de l'estil Champions i multimèdia, mentre que els **usuari registrats** poden debatre sobre els partits. L'aplicació separa el **catàleg públic**, les **funcions socials** i les **eines internes** amb una autorització clara, un patró habitual en productes SaaS B2B/B2C reals.

## Funcionalitats

### Públic

- Navegar per **equips** i **partits** amb dades reals de PostgreSQL (mitjançant Prisma).
- Pàgina de **detall de partit** amb navegació entre entitats relacionades, mostrant marcadors i detalls.

### Usuaris autenticats

- **Registre** i **inici de sessió** (Auth.js amb proveïdor de credencials i contrasenyes encriptades).
- Publicar **comentaris** sobre els partits (capa social / debats en directe).

### Backoffice

- **`EDITOR`**: manteniment d'equips, partits i fitxers multimèdia relacionats (escuts, imatges de partit) mitjançant pujades a Supabase Storage.
- **`ADMIN`**: gestió d'usuaris i **rols** (`USER`, `EDITOR`, `ADMIN`), amb mesures de seguretat contra l'auto-modificació.

### Producte / Enginyeria

- **Històries d'usuari** implementades incrementalment en **sprints de Scrum** (US-01 … US-22 — vegeu el backlog del curs).
- **Llavor idempotent** per a la inicialització de la base de dades local i en producció.
- Integració de **Supabase Storage** per a avatars d'usuari, escuts d'equips i imatges de partits (amb mecanismes alternatius en cas d'absència de credencials locals).

## Stack tecnològic

| Capa | Tecnologia |
| ---- | ---------- |
| Framework | **Next.js 16** (App Router), **React 19**, **TypeScript** |
| ORM / BD | **Prisma 6** → **PostgreSQL** (allotjat a **Supabase**, utilitzant l'esquema personalitzat `champions` per a aïllament) |
| Auth | **Auth.js** (NextAuth.js v4) |
| Validació | **Zod 4** |
| Interfície (UI) | **Tailwind CSS v4** (tema Champions blau nit i or) |
| Multimèdia | **Supabase** (Storage + clau de rol de servei al servidor) |
| Desplegament | **Vercel** (aplicació) + **Supabase** (BD, autenticació, emmagatzematge) |

## Arquitectura (alt nivell)

```text
Navegador → Next.js (RSC / Server Actions / Route Handlers)
               → Prisma → Supabase Postgres (esquema aïllat: 'champions')
               → Auth.js (sessions)
               → Supabase Storage (pujades des del servidor amb rol de servei)
```

- Els punts d'accés de **lectura pública** exposen equips/partits als visitants.
- Les **mutacions** (comentaris, CRUD de backoffice, pujades de fitxers) s'executen **al servidor** amb validació i comprovacions de rols.

## Requisits previs

- **Node.js** LTS (es recomana v20+)
- Un projecte de **Supabase** (Postgres + Auth + buckets de Storage configurats) o una instància de PostgreSQL
- **Git**

## Primers passos

### 1. Clonar i instal·lar

```bash
git clone https://github.com/ciro-daw2/champions-saas.git
cd champions-saas
npm install
```

### 2. Variables d'entorn

Copieu el fitxer d'exemple i introduïu els vostres valors:

```bash
cp .env.example .env
```

No publiqueu mai el fitxer `.env`. Vegeu la secció d'**Entorn** a continuació per conèixer el significat de cada variable.

### 3. Base de dades

Executeu les migracions contra la base de dades i inseriu els comptes per defecte:

```bash
npx prisma migrate dev
npm run db:seed
```

### 4. Execució en local

```bash
npm run dev
```

Obriu [http://localhost:3000](http://localhost:30500) (o el port per defecte).

## Entorn

| Variable | Descripció |
| -------- | ----------- |
| `DATABASE_URL` | URL de connexió de pool de Supabase (Prisma client) |
| `DIRECT_URL` | URL directa de Supabase (migracions) |
| `NEXTAUTH_URL` | URL de l'aplicació (ex: `http://localhost:3000` en dev) |
| `NEXTAUTH_SECRET` | Secret fort generat per a Auth.js |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del projecte de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clau de servidor per a Storage i APIs d'administració |
| `SUPABASE_BUCKET_AVATARS` | Nom del bucket per a avatars d'usuari |
| `SUPABASE_BUCKET_TEAMS` | Nom del bucket per a escuts d'equips |
| `SUPABASE_BUCKET_MATCHES` | Nom del bucket per a imatges de partits |

La plantilla completa està disponible a **`.env.example`** (sense secrets).

## Scripts

| Ordre | Objectiu |
| ----- | -------- |
| `npm run dev` | Iniciar Next.js en mode desenvolupament |
| `npm run build` | Compilar el codi i generar la versió de producció |
| `npm run start` | Iniciar el servidor de producció compilat |
| `npm run lint` | Comprovació de lint amb ESLint |
| `npm run db:seed` | Omplir la base de dades amb la llavor de Prisma |
| `npx prisma studio` | Explorar la base de dades en local |

## Llista de verificació (IA7)

- [x] El visitant pot utilitzar les rutes públiques d'**equips** i **partits** amb dades persistides a la BD.
- [x] L'usuari es pot **registrar** i **iniciar sessió** sense errors.
- [x] L'usuari registrat pot **comentar** un partit.
- [x] L'`EDITOR` pot gestionar equips/partits/mitjans; l'`ADMIN` pot gestionar usuaris/rols.
- [x] L'aplicació es compila i es construeix correctament amb Turbopack (`npm run build`).

## Desplegament

1. Pugeu els canvis a GitHub; connecteu el repositori a **Vercel**.
2. Definiu totes les variables d'entorn de producció a Vercel (les mateixes que en local).
3. Executeu les migracions contra la BD de producció (`prisma migrate deploy` a CI o manualment des d'un entorn de confiança).

## Full de ruta / limitacions conegudes

- Facturació / subscripcions no incloses (abast del curs).
- El control de ràtio de peticions i l'observabilitat avançada queden pendents per a futures iteracions.

## Context acadèmic

Desenvolupat com a **IA7 — Kates Serveis web** dins de **M0613** (DAW2). Descobriment de producte i backlog: **Scrum** (sessió S19); implementació: sprints guiats (sessió S20), com a part de **M0613** (DAW2).

## Llicència

Ús educatiu — Llicència MIT.

## Autor

**Ciro** — [Portfolio](https://YOUR-PORTFOLIO.com)
