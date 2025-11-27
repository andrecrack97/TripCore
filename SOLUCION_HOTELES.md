# 🛠️ SOLUCIÓN: Error de Hoteles - Guía Paso a Paso

## 🔍 Problema Identificado

El error `ERR_CONNECTION_REFUSED` significa que **el servidor backend NO está corriendo** en el puerto 3000.

## ✅ Solución Paso a Paso

### 1. **Verificar que el backend esté corriendo**

Abre una terminal (cmd o PowerShell) y ejecuta:

```bash
cd TripCore\api-final
node server.js
```

Deberías ver un mensaje como:
```
🚀 API en http://localhost:3000
✅ Cliente Amadeus inicializado correctamente
```

**⚠️ IMPORTANTE:** Deja esta terminal abierta mientras uses la aplicación. Si cierras la terminal, el servidor se detiene.

### 2. **Verificar que el puerto 3000 esté disponible**

Si ves un error como "EADDRINUSE: address already in use", significa que otro programa está usando el puerto 3000.

**Opción A:** Cierra el otro programa que está usando el puerto
**Opción B:** Cambia el puerto en el archivo `.env`:
```env
PORT=3001
```

Y luego actualiza el frontend para que use el puerto 3001.

### 3. **Verificar las credenciales de Amadeus**

El archivo `.env` en `TripCore/api-final/` debe tener:

```env
AMADEUS_CLIENT_ID=tu_client_id
AMADEUS_CLIENT_SECRET=tu_client_secret
AMADEUS_HOSTNAME=test
PORT=3000
```

**Nota:** Si las credenciales son de ejemplo (`tu_client_id`, `tu_client_secret`), la aplicación funcionará pero mostrará hoteles de ejemplo en lugar de datos reales de Amadeus.

### 4. **Obtener credenciales reales de Amadeus (Opcional)**

Si quieres datos reales de Amadeus:

1. Ve a https://developers.amadeus.com/
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto (modo sandbox)
4. Copia el `Client ID` y `Client Secret`
5. Reemplázalos en el archivo `.env`

### 5. **Reiniciar el servidor después de cambios**

Después de modificar el archivo `.env`:
1. Detén el servidor (Ctrl+C en la terminal)
2. Inícialo de nuevo: `node server.js`

## 🧪 Probar que Funciona

1. Con el servidor corriendo, abre tu navegador
2. Ve a: `http://localhost:3000/health`
3. Deberías ver: `{"ok":true}`

Si ves esto, el servidor está funcionando correctamente.

## 🔧 Si Sigue Sin Funcionar

### Verificar instalación de dependencias:

```bash
cd TripCore\api-final
npm install
```

### Verificar que amadeus esté instalado:

```bash
cd TripCore\api-final
npm list amadeus
```

Si no está instalado:
```bash
npm install amadeus
```

## 📝 Resumen de Archivos Modificados

✅ `TripCore/api-final/utils/amadeusClient.js` - Cliente de Amadeus
✅ `TripCore/api-final/routes/hoteles.js` - Ruta de hoteles con fallback a datos de ejemplo
✅ `TripCore/api-final/package.json` - Agregado paquete amadeus
✅ `TripCore/api-final/server.js` - Corregido doble registro de rutas

## 💡 Notas Importantes

- El servidor backend **debe estar corriendo** para que la aplicación funcione
- Si no hay credenciales válidas de Amadeus, la app mostrará hoteles de ejemplo
- El puerto por defecto es 3000, pero puede cambiarse en `.env`

