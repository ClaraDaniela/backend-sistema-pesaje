import { Sequelize } from "sequelize";
import "dotenv/config";

const requiredEnv = ["DB_NAME", "DB_USER", "DB_PASSWORD", "DB_HOST"];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Falta la variable de entorno ${key} para la conexión a la base de datos.`);
  }
}

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: "mysql",
    dialectOptions:
      process.env.DB_SSL === "true"
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : undefined,
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      freezeTableName: true,
      timestamps: false,
    },
  }
);

export async function connectDB() {
  await sequelize.authenticate();
  console.log("✅ DB conectada (Sequelize)");
}
