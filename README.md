# Bluebird Prospect Board

App interna para el equipo de Bluebird: sube la planilla de prospectos, y el equipo puede verla, editarla,
asignar empresas, cambiar estados y dejar notas — todo compartido en tiempo real, con login real por email/password.

La interfaz de la app está en inglés (como pediste). Esta guía está en español para que sea más fácil de seguir.

---

## Qué vas a necesitar

- Una cuenta gratis en [supabase.com](https://supabase.com) (la base de datos + login)
- Una cuenta gratis en [vercel.com](https://vercel.com) (el hosting)
- Una cuenta en GitHub (para conectar el código a Vercel)
- Node.js instalado si querés probarlo en tu computadora antes de publicarlo (opcional)

---

## Paso 1 — Crear el proyecto en Supabase

1. Andá a [supabase.com](https://supabase.com) → **New project**.
2. Ponele un nombre (ej. `bluebird-board`) y una contraseña de base de datos (guardala, no hace falta después pero por las dudas).
3. Esperá 1-2 minutos a que el proyecto termine de crearse.

## Paso 2 — Crear las tablas

1. En el menú de la izquierda, andá a **SQL Editor** → **New query**.
2. Abrí el archivo `supabase/schema.sql` de esta carpeta, copiá todo su contenido, y pegalo ahí.
3. Apretá **Run**. Esto crea las tablas `companies` y `notes`, y las reglas de seguridad (cada usuario logueado
   puede ver y editar todo, pero solo puede editar o borrar sus propias notas).

## Paso 3 — Configurar el login por email

1. Andá a **Authentication → Providers** y confirmá que **Email** esté habilitado (viene habilitado por defecto).
2. Si querés que la gente pueda entrar apenas se registra, sin confirmar el email primero (más simple para
   arrancar con un equipo chico y de confianza): andá a **Authentication → Settings** y desactivá
   "Confirm email". Si lo dejás activado, cada persona nueva va a tener que click en un link que le llega por mail
   antes de poder entrar.

## Paso 4 — Conseguir las claves de conexión

1. Andá a **Project Settings → API**.
2. Copiá el **Project URL** y la **anon public key**.
3. En esta carpeta, hacé una copia del archivo `.env.local.example` y renombrala a `.env.local`.
4. Pegá ahí esos dos valores.

## Paso 5 — Probarlo en tu computadora (opcional pero recomendado)

```bash
npm install
npm run dev
```

Abrí `http://localhost:3000`, creá una cuenta desde ahí, y probá subir el Excel de prospectos.

## Paso 6 — Subir el código a GitHub

1. Creá un repositorio nuevo en GitHub (puede ser privado).
2. Desde esta carpeta:

```bash
git init
git add .
git commit -m "Bluebird prospect board"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

## Paso 7 — Publicar en Vercel

1. Andá a [vercel.com](https://vercel.com) → **Add New → Project**.
2. Elegí el repositorio que acabás de subir.
3. En **Environment Variables**, agregá las mismas dos variables de tu `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Apretá **Deploy**. En 1-2 minutos te da una URL en vivo (algo como `bluebird-board.vercel.app`).

## Paso 8 — Compartir con el equipo

Mandale la URL a quien quieras. Cada persona:

1. Entra a `/signup` (o al link de registro que le pases) y crea su cuenta con su email y una contraseña.
2. Inicia sesión — ya ve el mismo tablero que todos los demás, en tiempo real.

---

## Cómo cargar los datos

La primera vez que alguien entra sin datos cargados, la app pide subir el Excel. Una vez cargado, queda en la
base de datos compartida — nadie más necesita volver a subirlo. Si generás una lista nueva de prospectos más
adelante, usá el botón **"Import more"** arriba de la tabla para sumar filas nuevas sin perder lo que ya está.

## Qué falta para la próxima etapa (login de Microsoft)

Cuando quieran sumar login con cuenta de Microsoft, hay que:
1. Registrar una app en el [Azure Portal](https://portal.azure.com) para conseguir un Client ID y Client Secret.
2. Cargar esos datos en Supabase → **Authentication → Providers → Azure**.
3. Agregar un botón de "Sign in with Microsoft" en `app/login/page.tsx`.

Avisame cuando quieran dar ese paso y lo armamos.
