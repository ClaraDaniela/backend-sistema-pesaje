import { sequelize } from "../config/db.js";
import ExcelJS from "exceljs";
export const exportInventarioExcel = async (req, res) => {
    try {
        const data = await sequelize.query(`
      SELECT 
        m.id AS material_id,
        m.nombre,

        /* STOCK SISTEMA */
        COALESCE(SUM(
          CASE 
            WHEN p.tipo_movimiento = 'INGRESO'
              THEN (p.peso_bruto_kg - (v.tara_kg + COALESCE(c.tara_kg,0)))
            WHEN p.tipo_movimiento = 'EGRESO'
              THEN - (p.peso_bruto_kg - (v.tara_kg + COALESCE(c.tara_kg,0)))
          END
        ),0) AS stock_sistema,

        /* STOCK FISICO (último) */
        (
          SELECT i.cantidad
          FROM inventario_fisico i
          WHERE i.material_id = m.id
          ORDER BY i.fecha_actualizacion DESC
          LIMIT 1
        ) AS stock_fisico,

        /* FECHA */
        (
          SELECT i.fecha_actualizacion
          FROM inventario_fisico i
          WHERE i.material_id = m.id
          ORDER BY i.fecha_actualizacion DESC
          LIMIT 1
        ) AS fecha_actualizacion,

        /* USUARIO */
        (
          SELECT u.nombreusuario
          FROM inventario_fisico i
          LEFT JOIN usuarios u ON u.id = i.usuario_id
          WHERE i.material_id = m.id
          ORDER BY i.fecha_actualizacion DESC
          LIMIT 1
        ) AS usuario

      FROM materiales m
      LEFT JOIN pesadas p ON p.material_id = m.id
      LEFT JOIN vehiculos v ON v.id = p.vehiculo_id
      LEFT JOIN cajas c ON c.id = p.caja_id

      GROUP BY m.id, m.nombre
      ORDER BY m.nombre
    `, {
            type: sequelize.QueryTypes.SELECT
        });
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Inventario");
        sheet.addRow([]);
        sheet.addRow(["Resumen"]);
        sheet.addRow(["Fecha exportación", new Date().toLocaleString()]);


        sheet.columns = [
            { header: "Material", key: "nombre", width: 30 },
            { header: "Stock sistema", key: "stock_sistema", width: 20 },
            { header: "Stock físico", key: "stock_fisico", width: 20 },
            { header: "Diferencia", key: "diferencia", width: 20 },
            { header: "Última actualización", key: "fecha", width: 25 },
            { header: "Usuario", key: "usuario", width: 25 },
        ];

        data.forEach(row => {
            const sistema = Number(row.stock_sistema) || 0;
            const fisico = Number(row.stock_fisico) || 0;

            sheet.addRow({
                nombre: row.nombre,
                stock_sistema: sistema,
                stock_fisico: fisico,
                diferencia: fisico - sistema,
                fecha: row.fecha_actualizacion
                    ? new Date(row.fecha_actualizacion).toLocaleString("es-AR")
                    : "-",
                usuario: row.usuario || "-"
            });
        });

        // 🔥 estilos
        sheet.getRow(1).font = { bold: true };

        sheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;

            const diferencia = row.getCell(4).value;

            if (diferencia > 0) {
                row.getCell(4).font = { color: { argb: "FF008000" } }; // verde
            } else if (diferencia < 0) {
                row.getCell(4).font = { color: { argb: "FFFF0000" } }; // rojo
            }
        });

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
        console.error("ERROR EXPORT INVENTARIO:", error);
        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
};