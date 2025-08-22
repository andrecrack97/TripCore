const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// rutas
app.use("/api", require("./routes/auth"));         // /api/register  /api/login
app.use("/api/viajes", require("./routes/viajes"));
app.use("/api/usuarios", require("./routes/usuarios"));

app.get("/", (_req, res) => res.send("API TripCore de prueba"));

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
