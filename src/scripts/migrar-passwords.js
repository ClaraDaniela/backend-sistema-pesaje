//para ejecutar: node src/scripts/migrar-passwords.js
import bcrypt from "bcrypt";
import { sequelize } from "../config/db.js";

const SALT_ROUNDS = 12;

async function migrar() {
  try {
    await sequelize.authenticate();
    console.log("DB conectada");

    const [usuarios] = await sequelize.query(
      "SELECT id, nombreusuario, password FROM usuarios"
    );

    for (const usuario of usuarios) {
      if (usuario.password.startsWith("$2b$")) {
        console.log(`Usuario ${usuario.nombreusuario} ya hasheado, skip`);
        continue;
      }

      const hash = await bcrypt.hash(usuario.password, SALT_ROUNDS);

      await sequelize.query(
        "UPDATE usuarios SET password = :hash WHERE id = :id",
        { replacements: { hash, id: usuario.id } }
      );

      console.log(`✔ Usuario ${usuario.nombreusuario} migrado`);
    }

    console.log("Migración completa");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await sequelize.close();
  }
}

migrar();