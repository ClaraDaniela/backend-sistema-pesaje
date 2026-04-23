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

    const [p] = await sequelize.query(`
      SELECT *
      FROM vw_pesadas_con_neto
      WHERE id = :id
    `, {
      replacements: { id },
      type: sequelize.QueryTypes.SELECT
    });

    if (!p) {
      return res.status(404).json({ error: "Pesada no encontrada" });
    }

    const doc = new PDFDocument({
      size: [226, 600],
      margin: 10,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=pesada_${id}.pdf`
    );

    doc.pipe(res);

    try {
      const logoPath = path.join(__dirname, "../public/logoServiecoBlanco.png");

      console.log("Buscando logo en:", logoPath);

      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, {
          fit: [120, 60],
          align: "center",
        });
      } else {
        console.log("❌ Logo NO encontrado");
      }

    } catch (err) {
      console.log("Error cargando logo:", err);
    }

    doc.moveDown();

    doc
      .fontSize(10)

    doc.moveDown(0.5);

    doc
      .fontSize(8)
      .text("www.servieco.com.ar", { align: "center" })
      .text("info@servieco.com.ar", { align: "center" });

    doc.moveDown();

    const linea = () => {
      doc.moveTo(10, doc.y)
        .lineTo(216, doc.y)
        .stroke();
      doc.moveDown(0.5);
    };

    linea();

    const fila = (label, value) => {
      doc
        .fontSize(9)
        .text(label, 10, doc.y, { continued: true })
        .text(String(value), { align: "right" });
    };

    const fecha = new Date(p.fecha);

    fila("CODIGO", `${p.id}-${fecha.getDate()}-${fecha.getMonth() + 1}`);
    fila("FECHA", fecha.toLocaleDateString("es-AR"));
    fila("HORA", fecha.toLocaleTimeString("es-AR"));
    fila("CLIENTE", p.empresa);
    fila("PATENTE", p.patente);

    doc.moveDown();
    linea();

    const formatKg = (n) => Number(n).toLocaleString("es-AR");

    fila("PESO INGRESO", formatKg(p.peso_bruto_kg));
    fila("TARA", formatKg(p.tara_total));

    doc.moveDown();

    doc
      .fontSize(12)
      .text("NETO", 10, doc.y, { continued: true })
      .text(`${formatKg(p.peso_neto)} kg`, {
        align: "right",
      });

    doc.moveDown();
    linea();

    doc
      .fontSize(8)
      .text("Ramon Pacheco 2950", { align: "center" })
      .text("Presidente Derqui", { align: "center" })
      .text("Buenos Aires", { align: "center" });

    doc.moveDown();

    doc
      .fontSize(8)
      .text("Gracias por su visita", { align: "center" });

    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al generar PDF" });
  }
};