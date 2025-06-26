const express = require("express");
const cors = require("cors");
const app = express();
const viajesRoutes = require("./routes/viajes");

app.use(cors());
app.use(express.json());

app.use("/api/viajes", viajesRoutes);

app.get("/", (req, res) => {
  console.log("✅ Alguien visitó /");
  res.send("API TripCore de prueba");
});

const PORT = 3005;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
