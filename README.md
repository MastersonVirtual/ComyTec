# ComyTec
Área Comercial y Coordinación Técnica

## Firebase Functions v2 + OpenAI (endpoint `/chat`)

Esta integración mantiene la API key en backend y expone un endpoint HTTP seguro para tu frontend.

### 1) Estructura

- `functions/index.js`: Cloud Function v2 (`chat`)
- `functions/package.json`: dependencias y scripts

### 2) Inicialización e instalación

```bash
# En la raíz del repo
firebase init functions

# Entrar a la carpeta de functions
cd functions

# Si necesitas inicializar package.json manualmente
npm init -y

# Instalar dependencias
npm install firebase-functions firebase-admin openai
```

> Si ya tienes `functions/` creada, solo instala dependencias y reemplaza `index.js`.

### 3) Configurar variables de entorno (sin exponer API key)

Para Functions v2, usa secretos recomendados:

```bash
firebase functions:secrets:set OPENAI_API_KEY
firebase functions:secrets:set ALLOWED_ORIGIN
```

Luego, en despliegue v2, vincula secretos desde consola o `firebase.json` según tu flujo.

### 4) Deploy

```bash
# Desde la raíz del proyecto
firebase deploy --only functions:chat
```

URL esperada:

```text
https://us-central1-TU_PROYECTO.cloudfunctions.net/chat
```

### 5) Contrato del endpoint

- Método: `POST`
- Body JSON: `{ "message": "..." }`
- Límite: 500 caracteres
- Respuesta OK: `{ "reply": "..." }`

### 6) Ejemplo de frontend (HTML + JS)

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Chat GPT seguro con Firebase</title>
  </head>
  <body>
    <textarea id="message" placeholder="Escribe tu mensaje"></textarea>
    <button id="send">Enviar</button>
    <pre id="output"></pre>

    <script>
      const CHAT_ENDPOINT = "https://us-central1-TU_PROYECTO.cloudfunctions.net/chat";

      document.getElementById("send").addEventListener("click", async () => {
        const message = document.getElementById("message").value;
        const output = document.getElementById("output");

        try {
          const res = await fetch(CHAT_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message }),
          });

          const data = await res.json();
          if (!res.ok) {
            output.textContent = `Error: ${data.error || "unknown"}`;
            return;
          }

          output.textContent = data.reply;
        } catch (err) {
          output.textContent = `Error de red: ${err.message}`;
        }
      });
    </script>
  </body>
</html>
```

## Buenas prácticas aplicadas

- API key solo en backend (`OPENAI_API_KEY`)
- Validación de payload (`message` obligatorio)
- Límite de tamaño (`500` chars)
- Manejo de errores con `try/catch`
- CORS básico configurable con `ALLOWED_ORIGIN`
