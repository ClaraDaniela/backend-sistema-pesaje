import initModels from "../models/index.js";
import { sequelize } from "../config/db.js";

const models = initModels(sequelize);
const { usuarios, roles } = models;

export const loginUsuario = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await usuarios.findOne({
      where: {
        nombreusuario: username,
        password: password
      },
      include: [{
        model: roles,
        as: "rol",
        attributes: ["nombre"]
      }]
    });

    if (!user) {
      return res.status(401).json({
        message: "Usuario o contraseña incorrectos"
      });
    }

    res.json({
      id: user.id,
      nombreusuario: user.nombreusuario,
      email: user.email,
      rol: user.rol?.nombre,
      activo: user.activo
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};