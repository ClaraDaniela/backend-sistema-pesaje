import axios from "axios";

class BalanzaDiscovery {
  constructor() {
    this.balanzaIP = null;
    this.lastCheck = null;
    this.checkInterval = 60000; 
  }

  async buscarEnIPsComunes() {
    // IPs prioritarias - las más probables primero
    const ipsPrioritarias = [
      '192.168.0.161', // aca es donde suele estar
      '192.168.1.100', '192.168.1.101', '192.168.1.102', '192.168.1.105',
      '192.168.1.50', '192.168.1.51', '192.168.1.52',
      '192.168.0.100', '192.168.0.101', '192.168.0.102',
    ];

    console.log('🔍 Buscando en IPs prioritarias...');
    for (const ip of ipsPrioritarias) {
      try {
        const response = await axios.get(`http://${ip}:3000/health`, { 
          timeout: 500 
        });
        
        if (response.data?.status === 'ok') {
          console.log(`✅ Balanza encontrada en: ${ip}`);
          this.balanzaIP = ip;
          this.lastCheck = Date.now();
          return ip;
        }
      } catch (error) {
      }
    }

    // Si no encuentra, escanear rango completo
    console.log('⏳ No encontrada en IPs prioritarias. Escaneando red completa...');
    console.log('   (Esto puede tardar 30-60 segundos)');
    return await this.escanearRangoCompleto();
  }

  async escanearRangoCompleto() {
    // Rangos de red más comunes
    const rangosComunes = ['192.168.0', '192.168.1', '10.0.0'];
    
    for (const baseIP of rangosComunes) {
      console.log(`   📡 Escaneando ${baseIP}.1-255...`);
      
      // Escanear todas las IPs en paralelo (mucho más rápido)
      const promesas = [];
      for (let i = 1; i <= 255; i++) {
        const ip = `${baseIP}.${i}`;
        promesas.push(this.probarIP(ip));
      }
      
      const resultados = await Promise.allSettled(promesas);
      const encontrado = resultados.find(
        r => r.status === 'fulfilled' && r.value
      );
      
      if (encontrado) {
        this.balanzaIP = encontrado.value;
        this.lastCheck = Date.now();
        console.log(`✅ ¡Balanza encontrada en: ${this.balanzaIP}!`);
        return this.balanzaIP;
      }
    }
    
    console.log('❌ No se encontró el servidor de balanza en ningún rango');
    return null;
  }

  async probarIP(ip) {
    try {
      const response = await axios.get(`http://${ip}:3000/health`, { 
        timeout: 300 // timeout corto para que sea rápido
      });
      if (response.data?.status === 'ok') {
        return ip;
      }
    } catch (error) {
    }
    return null;
  }

  async obtenerURL() {
    if (this.balanzaIP && this.lastCheck) {
      const tiempoTranscurrido = Date.now() - this.lastCheck;
      if (tiempoTranscurrido < this.checkInterval) {
        return `http://${this.balanzaIP}:3000`;
      }
    }

    // Buscar de nuevo
    console.log('🔍 Buscando servidor de balanza...');
    const ip = await this.buscarEnIPsComunes();
    
    return ip ? `http://${ip}:3000` : null;
  }

  async refrescar() {
    this.balanzaIP = null;
    this.lastCheck = null;
    return await this.obtenerURL();
  }
}

const balanzaDiscovery = new BalanzaDiscovery();

// ========== CONTROLADOR ==========

export const getPeso = async (req, res) => {
  try {
    const balanzaURL = await balanzaDiscovery.obtenerURL();
    
    if (!balanzaURL) {
      return res.json({ 
        disponible: false, 
        peso_kg: null 
      });
    }

    const { data } = await axios.get(`${balanzaURL}/peso`, { 
      timeout: 2000 
    });

    if (!data || data.valor == null) {
      return res.json({ 
        disponible: false, 
        peso_kg: null 
      });
    }

    res.json({
      disponible: true,
      peso_kg: Number(data.valor),
      unidad: data.unidad || 'kg',
      estable: data.estable || false,
      timestamp: data.timestamp
    });

  } catch (error) {
    console.error("Error obteniendo peso:", error.message);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      await balanzaDiscovery.refrescar();
    }
    
    res.json({ 
      disponible: false, 
      peso_kg: null 
    });
  }
};