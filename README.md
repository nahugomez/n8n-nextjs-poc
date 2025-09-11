# Flujo de Agente Virtual (Texto/Voz)

1. Usuario abre el widget del chat, y se crea un ID de sesión (UUID).
2. El usuario escribe un mensaje o envía un audio al webhook
(POST: https://n8ntest.sanjuan.gob.ar/webhook-test/6814e41c-43d9-4cef-8e53-0bb266efaeb8)
- En caso de ser texto:
```json
{
  "session_id": "b7e71a45-45ec-4732-9ac0-1607a9ef3fc8",
  "type": "message",
  "data": "Hola, ¿como estás?"
}
```
- En caso de ser audio:
```json
{
  "session_id": "b7e71a45-45ec-4732-9ac0-1607a9ef3fc8",
  "type": "audio",
  "data": "[Base64Audio]"
}
```
3. El workflow se va a encargar de inyectarle el mensaje o el texto del audio al agente
4. El agente va a realizar su procesamiento interno (Consultar base de datos, RAG, etc.), y devuelve una respuesta
5. Dependiendo de si el input que se recibió fue "message" o "audio", se va a realizar lo siguiente
- En caso de ser "message": 
  - Se retorna directamente un JSON usando Respond to Webhook
```json
{
  "response": {
    "type": "message",
    "data": "Hola, ¿como estás?"
  }
}
```
- En caso de ser "audio":
  - Agarra la respuesta devuelta por el agente
  - Envía la respuesta a ElevenLabs para que genere un audio en base al texto (Al usar modelo 2.5 Flash aprox. 75ms)
  - Retorna un JSON con el audio en Base64
```json
{
  "response": {
    "type": "audio",
    "data": "[Base64Audio]",
    "transcription": "Hola, ¿como estás?"
  }
}
```
6. La aplicación Next.js, se encarga de mostrar el texto o reproducir el audio generado.