import bcrypt from "bcrypt";
import initModels from "../models/index.js";
import { sequelize } from "../config/db.js";

const models = initModels(sequelize);
const { usuarios, roles } = models;

export const loginUsuario = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await usuarios.findOne({
      where: { nombreusuario: username },
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

    // comparo la contraseña con el hash
    const passwordOk = await bcrypt.compare(password, user.password);

    if (!passwordOk) {
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

export const crearUsuario = async (req, res) => {
  try {
    const { nombreusuario, password, email, rol_id } = req.body;

    const existe = await usuarios.findOne({
      where: { nombreusuario }
    });

    if (existe) {
      return res.status(409).json({
        error: "El nombre de usuario ya existe"
      });
    }

    const hash = await bcrypt.hash(password, 12);

    const nuevo = await usuarios.create({
      nombreusuario,
      password: hash,
      email: email || null,
      rol_id,
      activo: 1
    });

    res.status(201).json({
      id: nuevo.id,
      nombreusuario: nuevo.nombreusuario,
      email: nuevo.email,
      rol_id: nuevo.rol_id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const cambiarPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password_actual, password_nueva } = req.body;

    const user = await usuarios.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const passwordOk = await bcrypt.compare(password_actual, user.password);

    if (!passwordOk) {
      return res.status(401).json({ error: "Contraseña actual incorrecta" });
    }

    const hash = await bcrypt.hash(password_nueva, 12);

    await user.update({ password: hash });

    res.json({ message: "Contraseña actualizada correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const listarUsuarios = async (req, res) => {
  try {
    const lista = await usuarios.findAll({
      include: [{ model: roles, as: "rol", attributes: ["nombre"] }],
      attributes: { exclude: ["password"] },
      order: [["id", "ASC"]],
    });
    res.json(lista);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};