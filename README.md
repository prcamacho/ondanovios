# Novia Virtual Bot (Windows) - modo visible
## Resumen rápido
1. Instalar dependencias: `npm install`
2. Copiar y completar `.env` (`cp .env.example .env` y editar)
3. Ejecutar: doble clic en `run-dev.bat` o `.\run-dev.bat` desde PowerShell
## Comportamiento
- Filtra mensajes triviales (ok/gracias/emojis/stickers) sin gastar tokens.
- Detecta intención de compra y encuentros; notifica al ADMIN_CHAT_ID.
- Servicios (modo discreto): VIP Privado, Encuentro, Audios.
