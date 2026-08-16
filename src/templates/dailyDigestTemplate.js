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

  const filasPesadas = pesadasActivas
    .map(
      (p) => `
      <tr>
        <td style="padding:6px 10px;border:1px solid #ddd;">${p.id}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;">${formatearFechaHora(p.fecha)}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;">${p.tipo_movimiento}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;">${p.empresa || "-"}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;">${p.material || "-"}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;">${p.patente || "-"}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;">${[p.personal_nombre, p.personal_apellido].filter(Boolean).join(" ")}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;text-align:right;">${formatearKg(p.peso_neto_kg)} kg</td>
        <td style="padding:6px 10px;border:1px solid #ddd;">${p.estado}</td>
      </tr>`
    )
    .join("");

  return `
  <div style="font-family:Arial, sans-serif; color:#222; max-width:900px; margin:0 auto;">
    <h2 style="margin-bottom:4px;">Digest diario de pesadas</h2>
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

    <h3>Detalle de pesadas</h3>
    <table style="border-collapse:collapse;width:100%;font-size:13px;">
      <thead>
        <tr style="background:#f4f4f4;">
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">ID</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Fecha/hora</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Movimiento</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Empresa</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Material</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Patente</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Personal</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:right;">Peso neto</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Estado</th>
        </tr>
      </thead>
      <tbody>
        ${filasPesadas || '<tr><td colspan="9" style="padding:10px;text-align:center;border:1px solid #ddd;">Sin pesadas registradas</td></tr>'}
      </tbody>
    </table>

    <p style="color:#999;font-size:12px;margin-top:24px;">Correo generado automáticamente por el sistema de pesaje.</p>
  </div>`;
}