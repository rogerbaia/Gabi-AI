# Guía de Configuración: Túnel Seguro para Ollama Remoto

Esta guía detalla cómo exponer de forma segura y privada tu servidor de **Ollama** local (que corre en el puerto `11434`) a la instancia de Gabi AI desplegada en **Vercel** (`gabiai.aureasynaptica.com`).

Esto te permitirá usar tus modelos locales sin necesidad de exponerlos de forma abierta al público general.

---

## 🛠️ Opción 1: Cloudflare Tunnel (Recomendado)

Cloudflare Tunnel (`cloudflared`) es gratuito, extremadamente seguro y no requiere abrir puertos en tu router doméstico.

### Paso 1: Instalar Cloudflare Tunnel
1. Descarga e instala `cloudflared` para Windows desde el sitio oficial o usando un administrador de paquetes como winget:
   ```powershell
   winget install Cloudflare.cloudflared
   ```

### Paso 2: Autenticar e iniciar el túnel
1. Ejecuta el comando de inicio de sesión (se abrirá una pestaña en tu navegador):
   ```powershell
   cloudflared tunnel login
   ```
2. Crea un nuevo túnel seguro (por ejemplo, llámalo `gabi-ollama`):
   ```powershell
   cloudflared tunnel create gabi-ollama
   ```
   *Esto generará un ID de túnel y un archivo de credenciales JSON.*

### Paso 3: Configurar el archivo `config.yml`
Crea un archivo llamado `config.yml` en la carpeta `.cloudflare` de tu usuario (usualmente `C:\Users\tu-usuario\.cloudflared\config.yml`) con el siguiente contenido:

```yaml
tunnel: TU_TUNNEL_ID_AQUÍ
credentials-file: C:\Users\tu-usuario\.cloudflared\TU_TUNNEL_ID_AQUÍ.json

ingress:
  - hostname: tu-subdominio.tudominio.com
    service: http://localhost:11434
  - service: http_status:404
```

### Paso 4: Asociar tu dominio
Asocia el túnel con tu dominio configurado en Cloudflare:
```powershell
cloudflared tunnel route dns gabi-ollama tu-subdominio.tudominio.com
```

### Paso 5: Iniciar el túnel
Ejecuta el túnel para comenzar a redirigir el tráfico:
```powershell
cloudflared tunnel run gabi-ollama
```

---

## ⚡ Opción 2: Ngrok (Configuración Rápida)

Ngrok es ideal para pruebas rápidas y temporales, aunque las URLs cambian en cada reinicio si usas la cuenta gratuita.

### Paso 1: Instalar Ngrok
1. Descarga Ngrok y regístrate para obtener tu token de autenticación gratuito.
2. Agrega tu token de autenticación ejecutando:
   ```powershell
   ngrok config add-authtoken TU_AUTHTOKEN_AQUÍ
   ```

### Paso 2: Iniciar el túnel apuntando a Ollama
Exponer el puerto local de Ollama:
```powershell
ngrok http 11434
```
Una vez iniciado, copia la URL pública HTTPS que te proporcione Ngrok (por ejemplo: `https://abcd-123-45.ngrok-free.app`).

---

## 🔒 Seguridad: Proteger el Túnel (`OLLAMA_TUNNEL_SECRET`)

Para evitar que terceras personas que encuentren tu URL pública hagan peticiones maliciosas a tu PC (usando tu GPU o CPU), Gabi AI cuenta con un sistema de firma/secreto de túnel.

1. **Elige una clave secreta fuerte** (por ejemplo, `MiSuperClaveSecretaGabi2026`).
2. Configura en tu proxy local (o mediante filtros si utilizas Cloudflare Access/Tunnels con reglas) la validación de la cabecera `X-Tunnel-Secret`.
3. Gabi AI enviará automáticamente esta cabecera en cada petición local/remota que haga hacia `OLLAMA_BASE_URL`.

---

## ⚙️ Configurar Variables de Entorno en Vercel

Ingresa al panel de control de tu proyecto en Vercel y añade las siguientes variables en **Settings > Environment Variables**:

1. **`OLLAMA_BASE_URL`**:
   - Asigna la URL HTTPS provista por tu túnel de Cloudflare o Ngrok.
   - *Ejemplo:* `https://tu-subdominio.tudominio.com` o `https://abcd-123-45.ngrok-free.app`
   - **Nota:** No incluyas `/api` ni barras finales `/` en la URL.

2. **`OLLAMA_TUNNEL_SECRET`** *(Opcional)*:
   - Configura la clave secreta elegida para firmar y asegurar las cabeceras del túnel.

Una vez guardadas las variables, redespliega el proyecto en Vercel. Gabi AI detectará el túnel de inmediato y te mostrará el estado de conexión conectado en verde dentro del **AI Health Center**.
