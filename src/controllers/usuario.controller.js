import { Usuario, Rol } from "../models/index.js";

export const loginUsuario = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await Usuario.findOne({
      where: { nombreusuario: username, password: password },
      include: [{
        model: Rol,
        as: undefined,
        attributes: ["nombre"],
        required: false 
      }]
    });

    if (!user) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }
    res.json({
      id: user.id,
      nombreusuario: user.nombreusuario,
      email: user.email,
      rol: user.role?.nombre,  
      activo: user.activo
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};