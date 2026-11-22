(function (global) {
  "use strict";

  /**
   * Asigna subredes VLSM dentro de una red base.
   *
   * Las solicitudes se ordenan de mayor a menor antes de asignarlas para
   * reducir la fragmentación y mantener los bloques alineados.
   *
   * @param {string} baseText Red base en formato IP/prefijo.
   * @param {Array<{name:string, hosts:number}>} requests Solicitudes.
   * @returns {object} Subredes asignadas y resumen de capacidad.
   */
  global.calculateVlsm = function (baseText, requests) {
    var base = IpUtils.parseNetwork(baseText);
    var capacity = Math.pow(2, 32 - base.prefix);

    if (!Array.isArray(requests) || !requests.length) {
      throw new Error("Añade al menos una subred.");
    }

    var sorted = requests
      .map(function (item) {
        var hosts = Number(item.hosts);
        if (
          !item.name.trim() ||
          !Number.isInteger(hosts) ||
          hosts < 1
        ) {
          throw new Error(
            "Cada subred necesita nombre y hosts enteros positivos."
          );
        }

        return {
          name: item.name.trim(),
          requiredHosts: hosts,
          needed: hosts + 2,
        };
      })
      .sort(function (a, b) {
        return b.needed - a.needed;
      });

    var current = base.network;
    var rows = [];

    sorted.forEach(function (item) {
      var hostBits = Math.max(2, Math.ceil(Math.log2(item.needed)));
      var block = Math.pow(2, hostBits);
      var prefix = 32 - hostBits;

      if (current + block > base.limit || prefix < base.prefix) {
        throw new Error("Espacio insuficiente para asignar todas las subredes.");
      }

      var broadcast = current + block - 1;
      var usable = block - 2;

      rows.push({
        name: item.name,
        requiredHosts: item.requiredHosts,
        prefix: prefix,
        mask: IpUtils.uint32ToIp(IpUtils.prefixToMask(prefix)),
        network: IpUtils.uint32ToIp(current),
        firstHost: IpUtils.uint32ToIp(current + 1),
        lastHost: IpUtils.uint32ToIp(broadcast - 1),
        broadcast: IpUtils.uint32ToIp(broadcast),
        usableHosts: usable,
        blockSize: block,
        wasted: block - item.needed,
      });

      current += block;
    });

    return {
      base: baseText,
      rows: rows,
      used: current - base.network,
      remaining: base.limit - current,
      capacity: capacity,
    };
  };
})(window);
