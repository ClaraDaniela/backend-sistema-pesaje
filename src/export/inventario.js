import { sequelize } from "../config/db.js";
import ExcelJS from "exceljs";

export const exportInventarioExcel = async (req, res) => {
  try {

    const data = await sequelize.query(`
      SELECT
          mg.id AS material_id,
          mg.nombre AS material,

          /* ================= STOCK SISTEMA ================= */
          COALESCE(SUM(
              CASE

                  WHEN p.tipo_movimiento = 'INGRESO'
                      THEN (
                          p.peso_bruto_kg -
                          CASE
                              WHEN p.tara_real_kg IS NOT NULL
                                  THEN p.tara_real_kg
                              ELSE v.tara_kg + COALESCE(c.tara_kg, 0)
                          END
                      )

                  WHEN p.tipo_movimiento = 'EGRESO'
                      THEN -(
                          p.peso_bruto_kg -
                          CASE
                              WHEN p.tara_real_kg IS NOT NULL
                                  THEN p.tara_real_kg
                              ELSE v.tara_kg + COALESCE(c.tara_kg, 0)
                          END
                      )

                  ELSE 0

              END
          ), 0) AS stock_sistema,

          /* ================= INVENTARIO FISICO ================= */

          inv.cantidad AS stock_fisico,
          inv.fecha_actualizacion,
          u.nombreusuario AS usuario

      FROM materiales_generales mg

      LEFT JOIN pesadas p
          ON p.material_general_id = mg.id

      LEFT JOIN vehiculos v
          ON v.id = p.vehiculo_id

      LEFT JOIN cajas c
          ON c.id = p.caja_id

      LEFT JOIN inventario_fisico inv
          ON inv.material_general_id = mg.id

      LEFT JOIN usuarios u
          ON u.id = inv.usuario_id

      GROUP BY
          mg.id,
          mg.nombre,
          inv.cantidad,
          inv.fecha_actualizacion,
          u.nombreusuario

      ORDER BY mg.nombre
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    const workbook = new ExcelJS.Workbook();

    const sheet = workbook.addWorksheet("Inventario");

    sheet.columns = [
      {
        header: "Material",
        key: "material",
        width: 35
      },
      {
        header: "Stock sistema",
        key: "stock_sistema",
        width: 20
      },
      {
        header: "Stock físico",
        key: "stock_fisico",
        width: 20
      },
      {
        header: "Diferencia",
        key: "diferencia",
        width: 20
      },
      {
        header: "Última actualización",
        key: "fecha",
        width: 25
      },
      {
        header: "Usuario",
        key: "usuario",
        width: 25
      }
    ];

    sheet.getRow(1).font = {
      bold: true
    };

    data.forEach(row => {

      const sistema = Number(row.stock_sistema || 0);

      const fisico = Number(row.stock_fisico || 0);

      sheet.addRow({
        material: row.material,
        stock_sistema: sistema,
        stock_fisico: fisico,
        diferencia: fisico - sistema,
        fecha: row.fecha_actualizacion
          ? new Date(row.fecha_actualizacion)
              .toLocaleString("es-AR")
          : "-",
        usuario: row.usuario || "-"
      });

    });

    sheet.getColumn("stock_sistema").numFmt = '#,##0.00';
    sheet.getColumn("stock_fisico").numFmt = '#,##0.00';
    sheet.getColumn("diferencia").numFmt = '#,##0.00';

    sheet.autoFilter = {
      from: "A1",
      to: "F1"
    };

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=inventario.xlsx"
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    await workbook.xlsx.write(res);

    res.end();

  } catch (error) {

    console.error(
      "ERROR EXPORT INVENTARIO:",
      error
    );

    res.status(500).json({
      error: error.message
    });

  }
};