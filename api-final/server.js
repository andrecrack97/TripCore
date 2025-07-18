const express = require("express");
const cors = require("cors");
const sql = require("./db"); 
const app = express();
const authRoutes = require("./routes/auth");
const viajesRoutes = require("./routes/viajes");
const usuariosRoutes = require("./routes/usuarios");

app.use(cors());
app.use(express.json());

app.use("/api/viajes", viajesRoutes);
app.use("/api", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api", require("./routes/auth"));


app.get("/", (req, res) => {
  console.log("✅ Alguien visitó /");
  res.send("API TripCore de prueba");
});

const PORT = 3005;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});



