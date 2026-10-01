function formatearKg(valor) {
  return Number(valor || 0).toLocaleString("es-AR", { maximumFractionDigits: 2 });
}

function formatearFechaHora(fecha) {
  return new Date(fecha).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Agrupa una lista de pesadas (ya filtrada) por material, sumando
// cantidad de pesadas y peso neto total.
function agruparTotalesPorMaterial(pesadas) {
  const mapa = new Map();

  for (const p of pesadas) {
    const material = p.material || "-";
    if (!mapa.has(material)) {
      mapa.set(material, { material, cantidad_pesadas: 0, total_kg: 0 });
    }
    const entry = mapa.get(material);
    entry.cantidad_pesadas += 1;
    entry.total_kg += Number(p.peso_neto_kg || 0);
  }

  return Array.from(mapa.values()).sort((a, b) => b.total_kg - a.total_kg);
}

function tablaTotalesPorMaterial(totales) {
  const filas = totales
    .map(
      (t) => `
      <tr>
        <td style="padding:6px 10px;border:1px solid #ddd;">${t.material || "-"}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;text-align:right;">${t.cantidad_pesadas}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;text-align:right;">${formatearKg(t.total_kg)} kg</td>
      </tr>`
    )
    .join("");

  return `
    <table style="border-collapse:collapse;width:100%;margin-bottom:24px;">
      <thead>
        <tr style="background:#f4f4f4;">
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Material</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:right;">Cant. pesadas</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:right;">Total kg</th>
        </tr>
      </thead>
      <tbody>
        ${filas || '<tr><td colspan="3" style="padding:10px;text-align:center;border:1px solid #ddd;">Sin pesadas registradas</td></tr>'}
      </tbody>
    </table>`;
}

// Arma un nombre legible para un material de descarga combinando
// tipo / base / forma (los que estén presentes).
function nombreMaterialDescarga(m) {
  return [m.tipo_material_descarga, m.material_base_descarga, m.forma_material_descarga]
    .filter(Boolean)
    .join(" - ") || "-";
}

// Texto compacto "Material A: 40%, Material B: 60%" para meter dentro
// de una celda de la tabla principal de pesadas.
function materialesDescargaTexto(materiales) {
  return (materiales || [])
    .map((m) => `${nombreMaterialDescarga(m)}: ${formatearKg(m.porcentaje)}%`)
    .join(", ");
}

// Cuenta cuántas veces aparece cada número de manifiesto en una lista de
// pesadas, ignorando los que no tienen manifiesto cargado. Sirve para
// detectar manifiestos repetidos (probable error de carga).
function contarManifiestos(pesadas) {
  const conteo = new Map();
  for (const p of pesadas) {
    const m = p.nro_manifiesto;
    if (!m) continue;
    conteo.set(m, (conteo.get(m) || 0) + 1);
  }
  return conteo;
}

// Celda de manifiesto: si el número se repite en la tabla, se resalta en rojo.
function celdaManifiesto(p, conteoManifiestos) {
  const m = p.nro_manifiesto;
  const repetido = m && conteoManifiestos.get(m) > 1;
  const estilo = repetido
    ? "color:#c00;font-weight:bold;background:#fdd;"
    : "";
  const titulo = repetido ? ' title="Manifiesto repetido"' : "";
  return `<td style="padding:6px 10px;border:1px solid #ddd;${estilo}"${titulo}>${m || "-"}</td>`;
}

// Fila de la tabla de INGRESOS: incluye materiales/porcentaje y observación
// de la descarga asociada (si todavía no se cargó, se avisa).
function filaPesadaIngreso(p, conteoManifiestos) {
  const tieneDescarga = Array.isArray(p.materiales_descarga) && p.materiales_descarga.length > 0;
  const materialesTexto = tieneDescarga
    ? materialesDescargaTexto(p.materiales_descarga)
    : "Aún no se registra descarga";
  const observacion = tieneDescarga ? (p.comentarios || p.observacion || "-") : "-";

  return `
      <tr>
        <td style="padding:6px 10px;border:1px solid #ddd;">${p.id}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;">${formatearFechaHora(p.fecha)}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;">${p.empresa || "-"}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;">${p.material || "-"}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;">${p.patente || "-"}</td>
        ${celdaManifiesto(p, conteoManifiestos)}
        <td style="padding:6px 10px;border:1px solid #ddd;">${[p.personal_nombre, p.personal_apellido].filter(Boolean).join(" ")}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;text-align:right;">${formatearKg(p.peso_neto_kg)} kg</td>
        <td style="padding:6px 10px;border:1px solid #ddd;${tieneDescarga ? "" : "color:#999;font-style:italic;"}">${materialesTexto}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;">${observacion}</td>
      </tr>`;
}

// Fila de la tabla de EGRESOS: sin columnas de descarga, porque un
// egreso nunca tiene descarga asociada.
function filaPesadaEgreso(p, conteoManifiestos) {
  return `
      <tr>
        <td style="padding:6px 10px;border:1px solid #ddd;">${p.id}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;">${formatearFechaHora(p.fecha)}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;">${p.empresa || "-"}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;">${p.material || "-"}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;">${p.patente || "-"}</td>
        ${celdaManifiesto(p, conteoManifiestos)}
        <td style="padding:6px 10px;border:1px solid #ddd;">${[p.personal_nombre, p.personal_apellido].filter(Boolean).join(" ")}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;text-align:right;">${formatearKg(p.peso_neto_kg)} kg</td>
      </tr>`;
}

export function construirDigestHtml(digest) {
  const { fecha, pesadas } = digest;

  // Solo pesadas que no fueron borradas (pesadas.eliminado = 0/NULL).
  const pesadasActivas = (pesadas || []).filter((p) => !p.eliminado);

  const pesadasIngreso = pesadasActivas.filter((p) => p.tipo_movimiento === "INGRESO");
  const pesadasEgreso = pesadasActivas.filter((p) => p.tipo_movimiento === "EGRESO");

  const cantIngresos = pesadasIngreso.length;
  const cantEgresos = pesadasEgreso.length;
  const totalKgIngresos = pesadasIngreso.reduce((acc, p) => acc + Number(p.peso_neto_kg || 0), 0);
  const totalKgEgresos = pesadasEgreso.reduce((acc, p) => acc + Number(p.peso_neto_kg || 0), 0);

  // Totales por material, separados por tipo de movimiento.
  const totalesIngreso = agruparTotalesPorMaterial(pesadasIngreso);
  const totalesEgreso = agruparTotalesPorMaterial(pesadasEgreso);

  // Conteo de manifiestos por tabla, para detectar repetidos.
  const conteoManifiestosIngreso = contarManifiestos(pesadasIngreso);
  const conteoManifiestosEgreso = contarManifiestos(pesadasEgreso);

  const filasIngreso = pesadasIngreso
    .map((p) => filaPesadaIngreso(p, conteoManifiestosIngreso))
    .join("");
  const filasEgreso = pesadasEgreso
    .map((p) => filaPesadaEgreso(p, conteoManifiestosEgreso))
    .join("");

  return `
  <div style="font-family:Arial, sans-serif; color:#222; max-width:900px; margin:0 auto;">
    <h2 style="margin-bottom:4px;">Resumen diario de pesadas</h2>
    <p style="margin-top:0;color:#555;">Fecha: <strong>${fecha}</strong></p>

    <div style="display:flex;gap:20px;margin:16px 0;flex-wrap:wrap;">
      <div style="border:1px solid #ddd;border-radius:6px;padding:12px 20px;">
        <div style="font-size:13px;color:#777;">Total ingreso</div>
        <div style="font-size:22px;font-weight:bold;">${formatearKg(totalKgIngresos)} kg</div>
        <div style="font-size:13px;color:#555;">${cantIngresos} pesadas</div>
      </div>
      <div style="border:1px solid #ddd;border-radius:6px;padding:12px 20px;">
        <div style="font-size:13px;color:#777;">Total egreso</div>
        <div style="font-size:22px;font-weight:bold;">${formatearKg(totalKgEgresos)} kg</div>
        <div style="font-size:13px;color:#555;">${cantEgresos} pesadas</div>
      </div>
    </div>

    <h3>Totales por material — Ingreso</h3>
    ${tablaTotalesPorMaterial(totalesIngreso)}

    <h3>Totales por material — Egreso</h3>
    ${tablaTotalesPorMaterial(totalesEgreso)}

    <h3>Detalle de pesadas — Ingreso</h3>
    <table style="border-collapse:collapse;width:100%;font-size:13px;margin-bottom:24px;">
      <thead>
        <tr style="background:#f4f4f4;">
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">ID</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Fecha/hora</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Empresa</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Material</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Patente</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Manifiesto</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Personal</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:right;">Peso neto</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Materiales (%)</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Observación</th>
        </tr>
      </thead>
      <tbody>
        ${filasIngreso || '<tr><td colspan="10" style="padding:10px;text-align:center;border:1px solid #ddd;">Sin ingresos registrados</td></tr>'}
      </tbody>
    </table>

    <h3>Detalle de pesadas — Egreso</h3>
    <table style="border-collapse:collapse;width:100%;font-size:13px;margin-bottom:24px;">
      <thead>
        <tr style="background:#f4f4f4;">
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">ID</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Fecha/hora</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Empresa</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Material</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Patente</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Manifiesto</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Personal</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:right;">Peso neto</th>
        </tr>
      </thead>
      <tbody>
        ${filasEgreso || '<tr><td colspan="8" style="padding:10px;text-align:center;border:1px solid #ddd;">Sin egresos registrados</td></tr>'}
      </tbody>
    </table>

    <p style="color:#999;font-size:12px;margin-top:24px;">Correo generado automáticamente por el sistema de pesaje.</p>
  </div>`;
}