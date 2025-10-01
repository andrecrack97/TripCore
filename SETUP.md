# TripCore - Configuración y Ejecución

## Problemas Solucionados

✅ **Error de conexión ERR_CONNECTION_REFUSED**: 
- El frontend estaba intentando conectarse al puerto 5432 (puerto de PostgreSQL)
- Corregido para usar el puerto 3005 donde corre el servidor API

✅ **Configuración de base de datos**:
- Unificado para usar PostgreSQL en lugar de SQL Server
- Creado archivo .env con configuración por defecto

✅ **URLs de API**:
- Corregidas todas las URLs en el frontend para apuntar al puerto correcto

## Configuración Inicial

### 1. Base de Datos PostgreSQL

Asegúrate de tener PostgreSQL instalado y crear la base de datos:

```sql
CREATE DATABASE tripcore;
CREATE USER postgres WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE tripcore TO postgres;
```

### 2. Configuración de Variables de Entorno

El archivo `.env` ya está creado en `api-final/` con la configuración por defecto:

```env
PORT=3005
PGHOST=localhost
PGPORT=5432
PGDATABASE=tripcore
PGUSER=postgres
PGPASSWORD=password
```

Si necesitas cambiar la configuración, edita el archivo `api-final/.env`.

## Ejecución del Proyecto

### Opción 1: Usar los scripts .bat (Recomendado)

1. **Iniciar el Backend (API)**:
   ```bash
   cd api-final
   start.bat
   ```

2. **Iniciar el Frontend**:
   ```bash
   cd TC
   start.bat
   ```

### Opción 2: Manual

1. **Backend**:
   ```bash
   cd api-final
   npm install
   node server.js
   ```

2. **Frontend**:
   ```bash
   cd TC
   npm install
   npm run dev
   ```

## Verificación

1. El backend debería iniciar en `http://localhost:3005`
2. El frontend debería iniciar en `http://localhost:5173` (o el puerto que Vite asigne)
3. Puedes probar la conexión a la base de datos ejecutando:
   ```bash
   cd api-final
   node test-db.js
   ```

## Estructura de la API

- **Registro**: `POST http://localhost:3005/api/usuarios/registro`
- **Login**: `POST http://localhost:3005/api/login`
- **Health Check**: `GET http://localhost:3005/health`

## Notas Importantes

- Asegúrate de que PostgreSQL esté corriendo antes de iniciar el backend
- El frontend y backend deben ejecutarse simultáneamente
- Si cambias el puerto del backend, actualiza también el archivo `.env` del frontend
