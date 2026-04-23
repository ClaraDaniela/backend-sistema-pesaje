import ExcelJS from "exceljs";
import { sequelize } from "../config/db.js";

export const exportStockExcel = async (req, res) => {
  try {

    const data = await sequelize.query(`
      SELECT 
        m.id,
        m.nombre,

        /* ================= STOCK ================= */
        COALESCE(SUM(
          CASE 
            WHEN p.tipo_movimiento = 'INGRESO' THEN 
              (p.peso_bruto_kg - (COALESCE(v.tara_kg,0) + COALESCE(c.tara_kg,0)))

            WHEN p.tipo_movimiento = 'EGRESO' THEN 
              - (p.peso_bruto_kg - (COALESCE(v.tara_kg,0) + COALESCE(c.tara_kg,0)))

            ELSE 0
          END
        ),0) AS stock,

        /* ================= ÚLTIMO USUARIO ================= */
        ult.usuario

      FROM materiales m

      LEFT JOIN pesadas p ON p.material_id = m.id
      LEFT JOIN vehiculos v ON v.id = p.vehiculo_id
      LEFT JOIN cajas c ON c.id = p.caja_id

      /* SUBQUERY OPTIMIZADO */
      LEFT JOIN (
        SELECT i.material_id, u.nombreusuario AS usuario
        FROM inventario_fisico i
        LEFT JOIN usuarios u ON u.id = i.usuario_id
        INNER JOIN (
          SELECT material_id, MAX(fecha_actualizacion) AS max_fecha
          FROM inventario_fisico
          GROUP BY material_id
        ) ultimos 
          ON ultimos.material_id = i.material_id 
         AND ultimos.max_fecha = i.fecha_actualizacion
      ) ult ON ult.material_id = m.id

      GROUP BY m.id, m.nombre, ult.usuario
      ORDER BY m.nombre
    `, { type: sequelize.QueryTypes.SELECT });


    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Stock");

    sheet.columns = [
      { header: "Material", key: "nombre", width: 30 },
      { header: "Stock (kg)", key: "stock", width: 20 },
      { header: "Último usuario", key: "usuario", width: 25 },
    ];

    sheet.getRow(1).font = { bold: true };

    data.forEach(row => {
      sheet.addRow({
        nombre: row.nombre,
        stock: Number(row.stock) || 0,
        usuario: row.usuario || "-",
      });
    });

    sheet.getColumn("stock").numFmt = '#,##0';

    sheet.autoFilter = {
      from: 'A1',
      to: 'C1',
    };

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=stock.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("ERROR EXPORT STOCK:", error);
    res.status(500).json({ error: "Error al generar Excel" });
  }
};