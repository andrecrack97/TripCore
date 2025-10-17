const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas CORE (están en ./routes)
app.use("/api", require("./routes/auth"));              // /api/register - /api/login
app.use("/api/usuarios", require("./routes/usuarios"));
app.use("/api/viajes", require("./routes/viajes"));
app.use("/api/me", require("./routes/me"));
app.use("/api/seguros", require("./routes/seguros"));

// Rutas GEO (módulo GeoDB)
app.use("/api/destinos", require("./apiGeoDB/routes/destinosGEO"));

// Salud
app.get("/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 API en http://localhost:${PORT}`));
