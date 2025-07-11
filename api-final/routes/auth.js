const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/login", async (req, res) => {
  const { email, contraseña } = req.body;

  try {
    const result = await db.request()
      .input("email", email)
      .input("contraseña", contraseña)
      .query("SELECT * FROM Usuarios WHERE email = @email AND contraseña = @contraseña");

    if (result.recordset.length === 1) {
      res.status(200).json({ success: true, usuario: result.recordset[0] });
    } else {
      res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
    }
  } catch (error) {
    console.error("❌ Error al hacer login:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

module.exports = router;
