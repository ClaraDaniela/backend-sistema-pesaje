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

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Ordenado por CANTIDAD de pesadas, de mayor a menor.
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

  return Array.from(mapa.values()).sort((a, b) => b.cantidad_pesadas - a.cantidad_pesadas);
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

function nombreMaterialDescarga(m) {
  return [m.tipo_material_descarga, m.material_base_descarga, m.forma_material_descarga]
    .filter(Boolean)
    .join(" - ") || "-";
}

function materialesDescargaTexto(materiales) {
  return (materiales || [])
    .map((m) => `${nombreMaterialDescarga(m)}: ${formatearKg(m.porcentaje)}%`)
    .join(", ");
}

/**
 * Reporte de pesadas que tienen una descarga asociada (siempre INGRESO,
 * ya que las descargas solo se cargan sobre ingresos). Excluye pesadas
 * eliminadas y pesadas sin descarga registrada.
 */
export function construirReporteDescargasHtml(digest) {
  const { fecha, pesadas } = digest;

  const pesadasConDescarga = (pesadas || []).filter(
    (p) =>
      !p.eliminado &&
      p.tipo_movimiento === "INGRESO" &&
      Array.isArray(p.materiales_descarga) &&
      p.materiales_descarga.length > 0
  );

  const cantidadPesadas = pesadasConDescarga.length;
  const totalKg = pesadasConDescarga.reduce((acc, p) => acc + Number(p.peso_neto_kg || 0), 0);

  const totalesPorMaterial = agruparTotalesPorMaterial(pesadasConDescarga);

  const filasPesadas = pesadasConDescarga
    .map(
      (p) => `
      <tr>
        <td style="padding:6px 10px;border:1px solid #ddd;">${p.id}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;">${formatearFechaHora(p.fecha)}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;">${p.empresa || "-"}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;">${p.material || "-"}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;">${p.patente || "-"}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;">${[p.personal_nombre, p.personal_apellido].filter(Boolean).join(" ")}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;text-align:right;">${formatearKg(p.peso_neto_kg)} kg</td>
        <td style="padding:6px 10px;border:1px solid #ddd;">${materialesDescargaTexto(p.materiales_descarga)}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;">${p.comentarios || p.observacion || "-"}</td>
      </tr>`
    )
    .join("");

  return `
  <div style="font-family:Arial, sans-serif; color:#222; max-width:900px; margin:0 auto;">
    <h2 style="margin-bottom:4px;">Reporte de pesadas con descarga</h2>
    <p style="margin-top:0;color:#555;">Fecha: <strong>${fecha}</strong></p>

    <div style="display:flex;gap:20px;margin:16px 0;flex-wrap:wrap;">
      <div style="border:1px solid #ddd;border-radius:6px;padding:12px 20px;">
        <div style="font-size:13px;color:#777;">Total pesadas con descarga</div>
        <div style="font-size:22px;font-weight:bold;">${formatearKg(totalKg)} kg</div>
        <div style="font-size:13px;color:#555;">${cantidadPesadas} pesadas</div>
      </div>
    </div>

    <h3>Totales por material (ingreso)</h3>
    ${tablaTotalesPorMaterial(totalesPorMaterial)}

    <h3>Detalle de pesadas con descarga</h3>
    <table style="border-collapse:collapse;width:100%;font-size:13px;margin-bottom:24px;">
      <thead>
        <tr style="background:#f4f4f4;">
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">ID</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Fecha/hora</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Empresa</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Material</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Patente</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Personal</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:right;">Peso neto</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Materiales de descarga (%)</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Observación</th>
        </tr>
      </thead>
      <tbody>
        ${filasPesadas || '<tr><td colspan="9" style="padding:10px;text-align:center;border:1px solid #ddd;">Sin pesadas con descarga registrada</td></tr>'}
      </tbody>
    </table>

    <p style="color:#999;font-size:12px;margin-top:24px;">Correo generado automáticamente por el sistema de pesaje.</p>
  </div>`;
}

// =====================================================================
// REPORTE SEMANAL
// =====================================================================

// Ordenado por CANTIDAD de pesadas que aportaron a cada material,
// de mayor a menor (no por kg). `cantidad_pesadas` cuenta una vez por
// pesada, aunque esa pesada reparta % entre varios materiales.
function agruparPorMaterialFinal(pesadasConDescarga) {
  const mapa = new Map();

  for (const p of pesadasConDescarga) {
    const pesoNeto = Number(p.peso_neto_kg || 0);

    for (const m of p.materiales_descarga || []) {
      const nombre = nombreMaterialDescarga(m);
      const kgAsignado = pesoNeto * (Number(m.porcentaje || 0) / 100);

      if (!mapa.has(nombre)) {
        mapa.set(nombre, { material: nombre, cantidad_pesadas: 0, total_kg: 0 });
      }
      const entry = mapa.get(nombre);
      entry.cantidad_pesadas += 1;
      entry.total_kg += kgAsignado;
    }
  }

  return Array.from(mapa.values()).sort((a, b) => b.cantidad_pesadas - a.cantidad_pesadas);
}

/**
 * Agrupa por tipo de vehículo y, dentro de cada uno, por material final
 * de descarga. `cantidad_camiones` cuenta PATENTES ÚNICAS (camiones
 * distintos). El listado de tipos de vehículo sigue ordenado por KG.
 * El desglose de materiales DENTRO de cada vehículo se ordena por
 * cantidad de pesadas que aportaron a ese material.
 */
function agruparPorCamionYMaterial(pesadasConDescarga) {
  const mapa = new Map();

  for (const p of pesadasConDescarga) {
    const tipoVehiculo = p.tipo_vehiculo?.trim() || "SIN ESPECIFICAR";
    const pesoNeto = Number(p.peso_neto_kg) || 0;
    const patente = p.patente?.trim() || null;

    if (!mapa.has(tipoVehiculo)) {
      mapa.set(tipoVehiculo, {
        tipoVehiculo,
        patentes: new Set(),
        total_kg: 0,
        materiales: new Map(),
      });
    }

    const camion = mapa.get(tipoVehiculo);

    if (patente) camion.patentes.add(patente);
    camion.total_kg += pesoNeto;

    for (const m of p.materiales_descarga || []) {
      const nombre = nombreMaterialDescarga(m);
      const kgAsignado = pesoNeto * (Number(m.porcentaje || 0) / 100);

      if (!camion.materiales.has(nombre)) {
        camion.materiales.set(nombre, { cantidad_pesadas: 0, total_kg: 0 });
      }
      const entry = camion.materiales.get(nombre);
      entry.cantidad_pesadas += 1;
      entry.total_kg += kgAsignado;
    }
  }

  return Array.from(mapa.values())
    .map((camion) => {
      const materiales = Array.from(camion.materiales.entries())
        .map(([material, datos]) => ({
          material,
          cantidad_pesadas: datos.cantidad_pesadas,
          total_kg: datos.total_kg,
        }))
        .sort((a, b) => b.cantidad_pesadas - a.cantidad_pesadas);

      return {
        tipoVehiculo: camion.tipoVehiculo,
        cantidad_camiones: camion.patentes.size,
        total_kg: camion.total_kg,
        materiales,
      };
    })
    .sort((a, b) => b.total_kg - a.total_kg);
}

// Agrupa por día y, dentro de cada día, por tipo de vehículo.
// `cantidad_camiones` cuenta PATENTES ÚNICAS por día y tipo (un mismo
// camión que entra varias veces el mismo día cuenta una sola vez).
function agruparPorDiaYTipoVehiculo(pesadasConDescarga) {
  const mapaDias = new Map();

  for (const p of pesadasConDescarga) {
    const diaKey = formatearFecha(p.fecha);
    const tipoVehiculo = p.tipo_vehiculo?.trim() || "SIN ESPECIFICAR";
    const pesoNeto = Number(p.peso_neto_kg) || 0;
    const patente = p.patente?.trim() || null;

    if (!mapaDias.has(diaKey)) {
      mapaDias.set(diaKey, { fechaOrden: new Date(p.fecha), tipos: new Map() });
    }
    const dia = mapaDias.get(diaKey);

    if (!dia.tipos.has(tipoVehiculo)) {
      dia.tipos.set(tipoVehiculo, { patentes: new Set(), total_kg: 0 });
    }
    const entry = dia.tipos.get(tipoVehiculo);
    if (patente) entry.patentes.add(patente);
    entry.total_kg += pesoNeto;
  }

  return Array.from(mapaDias.entries())
    .map(([diaKey, datos]) => ({
      dia: diaKey,
      fechaOrden: datos.fechaOrden,
      tipos: Array.from(datos.tipos.entries())
        .map(([tipoVehiculo, e]) => ({
          tipoVehiculo,
          cantidad_camiones: e.patentes.size,
          total_kg: e.total_kg,
        }))
        .sort((a, b) => b.cantidad_camiones - a.cantidad_camiones),
    }))
    .sort((a, b) => a.fechaOrden - b.fechaOrden);
}

function tablaPorMaterialFinal(totales) {
  const filas = totales
    .map(
      (t) => `
      <tr>
        <td style="padding:6px 10px;border:1px solid #ddd;">${t.material}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;text-align:right;">${t.cantidad_pesadas}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;text-align:right;">${formatearKg(t.total_kg)} kg</td>
      </tr>`
    )
    .join("");

  return `
    <table style="border-collapse:collapse;width:100%;margin-bottom:24px;">
      <thead>
        <tr style="background:#f4f4f4;">
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Material clasificado</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:right;">Cant. pesadas</th>
          <th style="padding:6px 10px;border:1px solid #ddd;text-align:right;">Total kg</th>
        </tr>
      </thead>
      <tbody>
        ${filas || '<tr><td colspan="3" style="padding:10px;text-align:center;border:1px solid #ddd;">Sin descargas registradas en la semana</td></tr>'}
      </tbody>
    </table>`;
}

function tablaResumenPorDiaYTipoVehiculo(porDia) {
  if (!porDia.length) {
    return `<p>Sin datos de vehículos en la semana.</p>`;
  }

  return porDia
    .map((dia) => {
      const filas = dia.tipos
        .map(
          (t) => `
            <tr>
              <td style="padding:6px 10px;border:1px solid #ddd;">${t.tipoVehiculo}</td>
              <td style="padding:6px 10px;border:1px solid #ddd;text-align:right;">${t.cantidad_camiones}</td>
              <td style="padding:6px 10px;border:1px solid #ddd;text-align:right;">${formatearKg(t.total_kg)} kg</td>
            </tr>`
        )
        .join("");

      return `
        <h4 style="margin-bottom:4px;">${dia.dia}</h4>
        <table style="border-collapse:collapse;width:100%;margin-bottom:16px;">
          <thead>
            <tr style="background:#f4f4f4;">
              <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Tipo de vehículo</th>
              <th style="padding:6px 10px;border:1px solid #ddd;text-align:right;">Cant. camiones</th>
              <th style="padding:6px 10px;border:1px solid #ddd;text-align:right;">Total kg</th>
            </tr>
          </thead>
          <tbody>
            ${filas}
          </tbody>
        </table>`;
    })
    .join("");
}

function tablaPorCamionYMaterial(porCamion) {
  if (!porCamion.length) {
    return `<p>Sin datos por tipo de vehículo en la semana.</p>`;
  }

  return porCamion
    .map((c) => {
      const filas = c.materiales
        .map(
          (m) => `
            <tr>
              <td style="padding:6px 10px;border:1px solid #ddd;">${m.material}</td>
              <td style="padding:6px 10px;border:1px solid #ddd;text-align:right;">${m.cantidad_pesadas}</td>
              <td style="padding:6px 10px;border:1px solid #ddd;text-align:right;">${formatearKg(m.total_kg)} kg</td>
            </tr>`
        )
        .join("");

      return `
        <h4 style="margin-bottom:4px;">${c.tipoVehiculo}</h4>
        <p style="margin-top:0;color:#555;">
          <strong>${c.cantidad_camiones}</strong> camiones distintos —
          <strong>${formatearKg(c.total_kg)} kg</strong>
        </p>
        <table style="border-collapse:collapse;width:100%;margin-bottom:16px;">
          <thead>
            <tr style="background:#f4f4f4;">
              <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Material</th>
              <th style="padding:6px 10px;border:1px solid #ddd;text-align:right;">Cant. pesadas</th>
              <th style="padding:6px 10px;border:1px solid #ddd;text-align:right;">Total kg</th>
            </tr>
          </thead>
          <tbody>
            ${filas}
          </tbody>
        </table>`;
    })
    .join("");
}

/**
 * Reporte semanal de pesadas de INGRESO. Bloques:
 *  1) Total de la semana por material ya clasificado, ordenado por
 *     cantidad de pesadas.
 *  2) Vehículos utilizados por día: cuántos camiones distintos de cada
 *     tipo entraron cada día.
 *  3) Por tipo de vehículo, cuánto vino de cada material (acumulado
 *     de la semana), ordenado por cantidad de pesadas dentro de cada
 *     vehículo.
 *  4) Pesadas de ingreso sin descarga asociada, ordenado por cantidad.
 *
 * `digest` debe traer { fechaInicio, fechaFin, pesadas }, con `pesadas`
 * filtrado al rango de la semana, incluyendo `tipo_vehiculo` y `patente`
 * por pesada.
 */
export function construirReporteSemanalHtml(digest) {
  const { fechaInicio, fechaFin, pesadas } = digest;

  const pesadasIngreso = (pesadas || []).filter(
    (p) => !p.eliminado && p.tipo_movimiento === "INGRESO"
  );

  const pesadasConDescarga = pesadasIngreso.filter(
    (p) => Array.isArray(p.materiales_descarga) && p.materiales_descarga.length > 0
  );

  const pesadasSinDescarga = pesadasIngreso.filter(
    (p) => !Array.isArray(p.materiales_descarga) || p.materiales_descarga.length === 0
  );

  const totalIngresadoKg = pesadasIngreso.reduce((acc, p) => acc + Number(p.peso_neto_kg || 0), 0);
  const totalConDescargaKg = pesadasConDescarga.reduce((acc, p) => acc + Number(p.peso_neto_kg || 0), 0);
  const totalSinDescargaKg = pesadasSinDescarga.reduce((acc, p) => acc + Number(p.peso_neto_kg || 0), 0);

  const totalesPorMaterialFinal = agruparPorMaterialFinal(pesadasConDescarga);
  const porCamionYMaterial = agruparPorCamionYMaterial(pesadasConDescarga);
  const porDiaYTipoVehiculo = agruparPorDiaYTipoVehiculo(pesadasConDescarga);
  const totalesPendientesPorMaterial = agruparTotalesPorMaterial(pesadasSinDescarga);

  return `
  <div style="font-family:Arial, sans-serif; color:#222; max-width:900px; margin:0 auto;">
    <h2 style="margin-bottom:4px;">Reporte semanal de pesadas</h2>
    <p style="margin-top:0;color:#555;">Semana: <strong>${fechaInicio} a ${fechaFin}</strong></p>

    <div style="display:flex;gap:20px;margin:16px 0;flex-wrap:wrap;">
      <div style="border:1px solid #ddd;border-radius:6px;padding:12px 20px;">
        <div style="font-size:13px;color:#777;">Total ingresado (semana)</div>
        <div style="font-size:22px;font-weight:bold;">${formatearKg(totalIngresadoKg)} kg</div>
        <div style="font-size:13px;color:#555;">${pesadasIngreso.length} pesadas</div>
      </div>
      <div style="border:1px solid #ddd;border-radius:6px;padding:12px 20px;">
        <div style="font-size:13px;color:#777;">Ya clasificado (con descarga)</div>
        <div style="font-size:22px;font-weight:bold;">${formatearKg(totalConDescargaKg)} kg</div>
        <div style="font-size:13px;color:#555;">${pesadasConDescarga.length} pesadas</div>
      </div>
      <div style="border:1px solid #ddd;border-radius:6px;padding:12px 20px;">
        <div style="font-size:13px;color:#777;">Sin descarga asociada</div>
        <div style="font-size:22px;font-weight:bold;">${formatearKg(totalSinDescargaKg)} kg</div>
        <div style="font-size:13px;color:#555;">${pesadasSinDescarga.length} pesadas</div>
      </div>
    </div>

    <h3>Total de la semana por material clasificado</h3>
    ${tablaPorMaterialFinal(totalesPorMaterialFinal)}

    <h3>Vehículos utilizados por día</h3>
    ${tablaResumenPorDiaYTipoVehiculo(porDiaYTipoVehiculo)}

    <h3>Por tipo de vehículo, cuánto vino de cada material</h3>
    ${tablaPorCamionYMaterial(porCamionYMaterial)}

    <h3>Pesadas de ingreso sin descarga asociada</h3>
    ${tablaTotalesPorMaterial(totalesPendientesPorMaterial)}

    <p style="color:#999;font-size:12px;margin-top:24px;">Correo generado automáticamente por el sistema de pesaje.</p>
  </div>`;
}