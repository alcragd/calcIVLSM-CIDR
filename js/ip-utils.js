(function (global) {
  "use strict";

  /**
   * Lanza un error de validación con un mensaje uniforme.
   * @param {string} message
   */
  function fail(message) {
    throw new Error(message);
  }

  /**
   * Valida una dirección IPv4 y devuelve sus cuatro octetos.
   * @param {string} value
   * @returns {number[]}
   */
  function parseIPv4(value) {
    if (
      typeof value !== "string" ||
      !/^\d+\.\d+\.\d+\.\d+$/.test(value.trim())
    ) {
      fail("IPv4 inválida: " + value);
    }

    var parts = value.trim().split(".").map(Number);
    if (
      parts.some(function (part) {
        return !Number.isInteger(part) || part < 0 || part > 255;
      })
    ) {
      fail("Cada octeto debe estar entre 0 y 255.");
    }

    return parts;
  }

  /**
   * Convierte una IPv4 decimal a un entero sin signo de 32 bits.
   * @param {string} value
   * @returns {number}
   */
  function ipToUint32(value) {
    var parts = parseIPv4(value);
    return (
      (((parts[0] << 24) >>> 0) |
        (parts[1] << 16) |
        (parts[2] << 8) |
        parts[3]) >>>
      0
    );
  }

  /**
   * Convierte un entero de 32 bits a una IPv4 decimal.
   * @param {number} value
   * @returns {string}
   */
  function uint32ToIp(value) {
    value = Number(value);
    if (!Number.isInteger(value) || value < 0 || value > 0xffffffff) {
      fail("Entero IPv4 fuera de rango.");
    }

    return [
      (value >>> 24) & 255,
      (value >>> 16) & 255,
      (value >>> 8) & 255,
      value & 255,
    ].join(".");
  }

  /**
   * Convierte un entero de 32 bits a binario agrupado por octetos.
   * @param {number} value
   * @returns {string}
   */
  function uint32ToBinary(value) {
    return [24, 16, 8, 0]
      .map(function (shift) {
        return ((value >>> shift) & 255).toString(2).padStart(8, "0");
      })
      .join(".");
  }

  /**
   * Convierte un prefijo CIDR a máscara decimal como entero.
   * @param {number|string} prefix
   * @returns {number}
   */
  function prefixToMask(prefix) {
    prefix = parsePrefix(prefix);
    return prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  }

  /**
   * Convierte una máscara decimal válida a su prefijo CIDR.
   * @param {string} mask
   * @returns {number}
   */
  function maskToPrefix(mask) {
    var value = ipToUint32(mask);
    var bits = value.toString(2).padStart(32, "0");

    if (!/^1*0*$/.test(bits)) {
      fail("La máscara debe ser contigua en binario.");
    }

    return bits.indexOf("0") < 0 ? 32 : bits.indexOf("0");
  }

  /**
   * Normaliza y valida un prefijo CIDR.
   * @param {number|string} value
   * @returns {number}
   */
  function parsePrefix(value) {
    var text = String(value == null ? "" : value)
      .trim()
      .replace(/^\//, "");

    if (!/^\d+$/.test(text) || Number(text) < 0 || Number(text) > 32) {
      fail("El prefijo debe estar entre /0 y /32.");
    }

    return Number(text);
  }

  /**
   * Analiza una red en formato IP/prefijo y calcula sus límites.
   * @param {string} value
   * @returns {{ip:number, prefix:number, mask:number, network:number, limit:number}}
   */
  function parseNetwork(value) {
    var parts = String(value || "")
      .trim()
      .split("/");

    if (parts.length !== 2) {
      fail("La red base debe tener formato IP/prefijo.");
    }

    var prefix = parsePrefix(parts[1]);
    var mask = prefixToMask(prefix);
    var ip = ipToUint32(parts[0]);
    var network = (ip & mask) >>> 0;

    return {
      ip: ip,
      prefix: prefix,
      mask: mask,
      network: network,
      limit: network + Math.pow(2, 32 - prefix),
    };
  }

  global.IpUtils = {
    parseIPv4: parseIPv4,
    ipToUint32: ipToUint32,
    uint32ToIp: uint32ToIp,
    uint32ToBinary: uint32ToBinary,
    prefixToMask: prefixToMask,
    maskToPrefix: maskToPrefix,
    parsePrefix: parsePrefix,
    parseNetwork: parseNetwork,
  };
})(window);
