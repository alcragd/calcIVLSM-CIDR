(function ($) {
  "use strict";

  /**
   * Muestra un error de validación escapando el texto antes de insertarlo.
   * @param {string} selector Selector del contenedor.
   * @param {Error|string} error Error que se mostrará.
   */
  function showError(selector, error) {
    var message = error.message || error;
    var safeMessage = $("<div>").text(message).html();

    $(selector).html(
      '<div class="alert alert-danger">' + safeMessage + "</div>"
    );
  }

  /**
   * Marca una dirección para aplicar la tipografía monoespaciada de la UI.
   * @param {string} value Dirección IPv4.
   * @returns {string} Fragmento HTML.
   */
  function address(value) {
    return '<span class="address">' + value + "</span>";
  }

  /**
   * Renderiza el resultado de la calculadora CIDR.
   * @param {object} result Resultado generado por calculateCidr.
   */
  function renderCidr(result) {
    var items = [
      ["Red", result.network],
      ["Primer host", result.firstHost],
      ["Último host", result.lastHost],
      ["Broadcast", result.broadcast],
      ["Máscara", result.mask],
      ["Prefijo", "/" + result.prefix],
      ["Hosts utilizables", result.usableHosts],
    ];

    var html =
      '<div class="card result-card">' +
      '<div class="card-body"><div class="row g-2">';

    items.forEach(function (item) {
      html +=
        '<div class="col-md-4"><strong>' +
        item[0] +
        ":</strong> " +
        (typeof item[1] === "number" ? item[1] : address(item[1])) +
        "</div>";
    });

    html +=
      '</div><hr><h3 class="h6">Representación binaria</h3>' +
      '<div class="binary">' +
      Object.keys(result.binary)
        .map(function (key) {
          return key + ": " + result.binary[key];
        })
        .join("<br>") +
      "</div></div></div>";

    $("#cidr-result").html(html);
  }

  /**
   * Renderiza la tabla de subredes VLSM y el resumen de capacidad.
   * @param {object} result Resultado generado por calculateVlsm.
   */
  function renderVlsm(result) {
    var html =
      '<div class="alert alert-info">' +
      "Capacidad: " +
      result.capacity +
      " direcciones · Usadas: " +
      result.used +
      " · Restantes: " +
      result.remaining +
      '</div><div class="table-responsive"><table class="table ' +
      'table-striped table-bordered align-middle"><thead><tr>' +
      "<th>Nombre</th><th>Red</th><th>Prefijo</th><th>Máscara</th><th>Primer host</th>" +
      "<th>Último host</th><th>Broadcast</th><th>Usables</th>" +
      '<th>Desperdicio</th></tr></thead><tbody>';

    result.rows.forEach(function (row) {
      html +=
        "<tr><td>" +
        $("<div>").text(row.name).html() +
        "</td><td>" +
        address(row.network) +
        "</td><td>/" +
        row.prefix +
        "</td><td>" +
        address(row.mask) +
        "</td><td>" +
        address(row.firstHost) +
        "</td><td>" +
        address(row.lastHost) +
        "</td><td>" +
        address(row.broadcast) +
        "</td><td>" +
        row.usableHosts +
        "</td><td>" +
        row.wasted +
        "</td></tr>";
    });

    $("#vlsm-result").html(html + "</tbody></table></div>");
  }

  /**
   * Agrega una fila editable de solicitud VLSM.
   * @param {string} [name] Nombre inicial.
   * @param {number} [hosts] Hosts iniciales.
   */
  function addRow(name, hosts) {
    $("#subnet-rows").append(
      '<div class="row g-2 mb-2 subnet-row">' +
        '<div class="col-md-7"><input class="form-control subnet-name" ' +
        'placeholder="Nombre" value="' +
        (name || "") +
        '" required></div>' +
        '<div class="col-md-4"><input class="form-control subnet-hosts" ' +
        'type="number" min="1" placeholder="Hosts requeridos" value="' +
        (hosts || "") +
        '" required></div>' +
        '<div class="col-md-1"><button class="btn btn-outline-danger ' +
        'remove-row" type="button" aria-label="Eliminar">×</button></div>' +
        "</div>"
    );
  }

  /**
   * Carga una lista completa de solicitudes VLSM en el formulario.
   * @param {string} base Red base.
   * @param {Array<[string, number]>} data Filas nombre/hosts.
   */
  function loadVlsm(base, data) {
    $("#vlsm-base").val(base);
    $("#subnet-rows").empty();

    data.forEach(function (row) {
      addRow(row[0], row[1]);
    });
  }

  /**
   * Registra los eventos de la interfaz cuando el DOM está disponible.
   */
  $(function () {
    

    $("#cidr-form").on("submit", function (event) {
      event.preventDefault();

      try {
        renderCidr(
          calculateCidr(
            $("#cidr-ip").val(),
            $("#cidr-prefix").val(),
            $("#cidr-mask").val()
          )
        );
      } catch (error) {
        showError("#cidr-result", error);
      }
    });

    $("#cidr-example").on("click", function () {
      $("#cidr-ip").val("192.168.10.0");
      $("#cidr-prefix").val("/24");
      $("#cidr-mask").val("");
      $("#cidr-form").trigger("submit");
    });

    $("#cidr-clear").on("click", function () {
      $("#cidr-form")[0].reset();
      $("#cidr-result").empty();
    });

    $("#add-subnet").on("click", function () {
      addRow();
    });

    $("#subnet-rows").on("click", ".remove-row", function () {
      $(this).closest(".subnet-row").remove();
    });

    $("#vlsm-form").on("submit", function (event) {
      event.preventDefault();

      try {
        var requests = $(".subnet-row")
          .map(function () {
            return {
              name: $(this).find(".subnet-name").val(),
              hosts: $(this).find(".subnet-hosts").val(),
            };
          })
          .get();

        renderVlsm(calculateVlsm($("#vlsm-base").val(), requests));
      } catch (error) {
        showError("#vlsm-result", error);
      }
    });

    $("#vlsm-example").on("click", function () {
      loadVlsm("192.168.0.0/24", [
        ["A", 100],
        ["B", 50],
        ["C", 25],
        ["D", 10],
      ]);
      $("#vlsm-form").trigger("submit");
    });

    $("#vlsm-clear").on("click", function () {
      $("#vlsm-form")[0].reset();
      $("#subnet-rows").empty();
      $("#vlsm-result").empty();
    });
  });
})(jQuery);
