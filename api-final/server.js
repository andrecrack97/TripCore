const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // <-- clave para que req.body NO sea undefined

// Rutas
app.use("/api", require("./routes/auth"));            // /api/register - /api/login
app.use("/api/usuarios", require("./routes/usuarios"));// /api/usuarios/registro
app.use("/api/viajes", require("./routes/viajes"));    // ejemplo viajes

// Salud
app.get("/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`🚀 API en http://localhost:${PORT}`));
