import ExcelJS from "exceljs";
import { sequelize } from "../config/db.js";

export const exportStockGeneralesExcel = async (req, res) => {
  try {

    const data = await sequelize.query(
      `
      SELECT
          mg.id AS material_id,
          mg.nombre AS material,

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

                  ELSE 0
              END
          ), 0) AS stock_total

      FROM materiales_generales mg

      LEFT JOIN pesadas p
          ON p.material_general_id = mg.id

      LEFT JOIN vehiculos v
          ON v.id = p.vehiculo_id

      LEFT JOIN cajas c
          ON c.id = p.caja_id

      GROUP BY
          mg.id,
          mg.nombre

      ORDER BY
          mg.nombre ASC
      `,
      {
        type: sequelize.QueryTypes.SELECT
      }
    );

    const workbook =
      new ExcelJS.Workbook();

    const sheet =
      workbook.addWorksheet(
        "Stock Generales"
      );

    sheet.columns = [
      {
        header: "Material",
        key: "material",
        width: 40
      },
      {
        header: "Stock Sistema (kg)",
        key: "stock_total",
        width: 25
      }
    ];

    sheet.getRow(1).font = {
      bold: true
    };

    let total = 0;

    data.forEach(row => {

      const stock =
        Number(row.stock_total || 0);

      total += stock;

      sheet.addRow({
        material: row.material,
        stock_total: stock
      });

    });

    // formato números
    sheet.getColumn(
      "stock_total"
    ).numFmt = '#,##0.00';

    // fila total
    sheet.addRow({});

    const totalRow = sheet.addRow({
      material: "TOTAL",
      stock_total: total
    });

    totalRow.font = {
      bold: true
    };

    // filtros
    sheet.autoFilter = {
      from: "A1",
      to: "B1"
    };

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=stock_generales.xlsx"
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    await workbook.xlsx.write(res);

    res.end();

  } catch (error) {

    console.error(
      "ERROR EXPORT STOCK GENERALES:",
      error
    );

    res.status(500).json({
      error: error.message
    });

  }
};

export const exportStockDescargaExcel = async (req, res) => {
  try {

    const data = await sequelize.query(`
      SELECT
        m.id_materiales_descarga AS material_id,
        tm.nombre AS categoria,
        mb.nombre AS material_base,
        fm.nombre AS forma,

        COALESCE(egresos.total, 0) AS stock_total

      FROM materiales m

      JOIN tipos_material tm
        ON tm.id = m.tipo_material_id

      LEFT JOIN materiales_base mb
        ON mb.id = m.material_base_id

      LEFT JOIN formas_material fm
        ON fm.id = m.forma_material_id

      LEFT JOIN (
        SELECT
          ddm.id_materiales AS material_id,

          SUM(
            (
              p.peso_bruto_kg -
              CASE
                WHEN p.tara_real_kg IS NOT NULL
                  THEN p.tara_real_kg
                ELSE v.tara_kg + COALESCE(c.tara_kg, 0)
              END
            ) * (ddm.porcentaje / 100)
          ) AS total

        FROM descarga_detalles_materiales ddm

        JOIN descarga_detalles dd
          ON dd.id_descarga_detalles = ddm.id_descarga_detalles

        JOIN pesadas p
          ON p.id = dd.pesada_id

        LEFT JOIN vehiculos v
          ON v.id = p.vehiculo_id

        LEFT JOIN cajas c
          ON c.id = p.caja_id

        GROUP BY ddm.id_materiales

      ) egresos
        ON egresos.material_id = m.id_materiales_descarga

      ORDER BY tm.nombre, mb.nombre
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    const workbook = new ExcelJS.Workbook();

    const sheet = workbook.addWorksheet(
      "Stock Descarga"
    );

    sheet.columns = [
      {
        header: "Categoría",
        key: "categoria",
        width: 25
      },
      {
        header: "Material",
        key: "material_base",
        width: 30
      },
      {
        header: "Forma",
        key: "forma",
        width: 25
      },
      {
        header: "Stock",
        key: "stock_total",
        width: 20
      }
    ];

    sheet.getRow(1).font = {
      bold: true
    };

    data.forEach(row => {

      sheet.addRow({
        categoria: row.categoria,
        material_base: row.material_base,
        forma: row.forma || "-",
        stock_total: Number(row.stock_total || 0),
      });

    });

    sheet.getColumn("stock_total").numFmt = '#,##0';

    sheet.autoFilter = {
      from: 'A1',
      to: 'D1',
    };

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=stock_descarga.xlsx"
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    await workbook.xlsx.write(res);

    res.end();

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message
    });

  }
};