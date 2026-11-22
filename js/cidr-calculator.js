(function (global) {
  "use strict";

  /**
   * Calcula la información de una red CIDR.
   *
   * Se puede proporcionar un prefijo, una máscara o ambos. Cuando se
   * proporcionan ambos valores, deben representar la misma red.
   *
   * @param {string} ipText Dirección IPv4.
   * @param {string} prefixText Prefijo, con o sin barra inicial.
   * @param {string} maskText Máscara decimal opcional.
   * @returns {object} Datos de red, hosts, broadcast y formas binarias.
   */
  global.calculateCidr = function (ipText, prefixText, maskText) {
    var ip = IpUtils.ipToUint32(ipText);
    var prefix = prefixText ? IpUtils.parsePrefix(prefixText) : null;

    if (maskText) {
      var maskPrefix = IpUtils.maskToPrefix(maskText);
      if (prefix !== null && prefix !== maskPrefix) {
        throw new Error("El prefijo y la máscara no son consistentes.");
      }
      prefix = maskPrefix;
    }

    if (prefix === null) {
      throw new Error("Indica un prefijo o una máscara.");
    }

    var mask = IpUtils.prefixToMask(prefix);
    var network = (ip & mask) >>> 0;
    var size = Math.pow(2, 32 - prefix);
    var broadcast = network + size - 1;
    var usable =
      prefix === 32 ? 1 : prefix === 31 ? 2 : Math.max(0, size - 2);

    return {
      ip: IpUtils.uint32ToIp(ip),
      prefix: prefix,
      mask: IpUtils.uint32ToIp(mask),
      network: IpUtils.uint32ToIp(network),
      firstHost:
        prefix === 32
          ? IpUtils.uint32ToIp(network)
          : IpUtils.uint32ToIp(network + 1),
      lastHost:
        prefix === 32
          ? IpUtils.uint32ToIp(network)
          : prefix === 31
            ? IpUtils.uint32ToIp(broadcast)
            : IpUtils.uint32ToIp(broadcast - 1),
      broadcast: IpUtils.uint32ToIp(broadcast),
      usableHosts: usable,
      binary: {
        ip: IpUtils.uint32ToBinary(ip),
        mask: IpUtils.uint32ToBinary(mask),
        network: IpUtils.uint32ToBinary(network),
        broadcast: IpUtils.uint32ToBinary(broadcast),
      },
    };
  };
})(window);
