import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { sequelize } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generarPdfPesada = async (req, res) => {
  try {
    const { id } = req.params;

    const [p] = await sequelize.query(
      `
      SELECT *
      FROM vw_pesadas_con_neto
      WHERE id = :id
    `,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!p) {
      return res.status(404).json({ error: "Pesada no encontrada" });
    }

    const doc = new PDFDocument({
      size: [226, 650],
      margin: 10,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=pesada_${id}.pdf`
    );

    doc.pipe(res);

    // =========================
    // LOGO
    // =========================
    try {
      const logoPath = path.join(
        __dirname,
        "../public/logoServiecoBlanco.png"
      );

      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, {
          fit: [120, 60],
          align: "center",
        });
      }
    } catch (err) {
      console.log("Error cargando logo:", err);
    }

    doc.moveDown();

    // =========================
    // HEADER
    // =========================
    doc
      .fontSize(9)
      .text("SERVIECO", { align: "center" })
      .text("www.servieco.com.ar", { align: "center" })
      .text("info@servieco.com.ar", { align: "center" });

    doc.moveDown();

    const linea = () => {
      doc.moveTo(10, doc.y).lineTo(216, doc.y).stroke();
      doc.moveDown(0.5);
    };

    const fila = (label, value) => {
      if (value === null || value === undefined || value === "") return;

      doc
        .fontSize(9)
        .text(label, 10, doc.y, { continued: true })
        .text(String(value), { align: "right" });
    };

    const formatKg = (n) =>
      Number(n || 0).toLocaleString("es-AR");

    const fecha = new Date(p.fecha);

    doc.moveDown();
    linea();

    fila("FECHA", fecha.toLocaleDateString("es-AR"));
    fila("HORA", fecha.toLocaleTimeString("es-AR"));
    fila("CLIENTE", p.empresa);
    fila("PATENTE", p.patente);
    fila("MATERIAL", p.material);

    doc.moveDown();
    linea();

    // =========================
    // LOGICA PRINCIPAL
    // =========================
    const ingreso = p.peso_bruto_kg;

    const egreso = p.tara_real_kg
      ? p.tara_real_kg
      : (p.tara_camion + p.tara_caja);

    const neto = ingreso - egreso;

    // =========================
    // DATOS CLAVE
    // =========================
    fila("INGRESO", `${formatKg(ingreso)} kg`);
    fila("EGRESO", `${formatKg(egreso)} kg`);

    doc.moveDown();

    doc
      .fontSize(12)
      .text("NETO", 10, doc.y, { continued: true })
      .text(`${formatKg(neto)} kg`, { align: "right" });


    doc.moveDown();
    linea();

    doc
      .fontSize(8)
      .text("Gracias por su visita", { align: "center" });

    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al generar PDF" });
  }
};