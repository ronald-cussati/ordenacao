/*
 * doc.js — monta as partes dinâmicas da documentação a partir do
 * resultados.json (gerado do CSV do programa em C): ambiente, tabelas,
 * gráficos, observações, listagem completa e anexos de código.
 * Com ?print=1 na URL a página abre tudo e usa o tema claro (para o PDF).
 */
(function () {
  "use strict";

  var modoImpressao = /[?&]print=1/.test(location.search);
  if (modoImpressao) { document.documentElement.setAttribute("data-theme", "light"); }

  function th(alg) { return "<th class='th-alg'><i style='background:" + ED.corHex[alg] + "'></i>" + alg + "</th>"; }

  function celula(r, menor) {
    if (!r) { return "<td class='vazio'>—</td>"; }
    return "<td class='" + (r.media === menor ? "melhor" : "") + "'>" + ED.ms(r.media) +
      "<small>" + (r.reps > 1 ? "média de " + r.reps + " · mín " + ED.nf3.format(r.min) + " · máx " + ED.nf3.format(r.max) : "1 execução") + "</small></td>";
  }

  /* ---------- Figura 2: os três tipos de vetor ---------- */
  function figuraTipos() {
    var alvo = document.getElementById("fig-tipos");
    if (!alvo) { return; }
    var tipos = [
      { nome: "aleatório", v: [6, 2, 9, 4, 10, 1, 7, 3, 8, 5], cor: "var(--sel)" },
      { nome: "crescente", v: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], cor: "var(--ins)" },
      { nome: "decrescente", v: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1], cor: "var(--bub)" }
    ];
    var s = "<svg viewBox='0 0 760 190' role='img' aria-label='Exemplos dos três tipos de vetor'>";
    tipos.forEach(function (t, k) {
      var x0 = 14 + k * 250;
      t.v.forEach(function (n, i) {
        var h = n * 12;
        s += "<rect x='" + (x0 + i * 22) + "' y='" + (140 - h) + "' width='17' height='" + h + "' rx='3' fill='" + t.cor + "' opacity='.9'/>";
      });
      s += "<text x='" + (x0 + 108) + "' y='172' text-anchor='middle' class='d-rot'>" + t.nome + "</text>";
    });
    alvo.innerHTML = s + "</svg>";
  }

  /* ---------- ambiente ---------- */
  function ambiente(d) {
    var tb = document.querySelector("#tab-maquina tbody");
    var m = d.maquina || {};
    var inicio = null, fim = null;
    d.linhas.forEach(function (l) {
      if (!inicio || l.inicio < inicio) { inicio = l.inicio; }
      if (!fim || l.fim > fim) { fim = l.fim; }
    });
    var linhas = [
      ["Processador", m.cpu || "—"],
      ["Memória RAM", m.ram || "—"],
      ["Sistema operacional", m.so || "—"],
      ["Linguagem e compilador", m.compilador || "—"],
      ["Comando de compilação", "<code>gcc -O0 main.c -o ordenacao</code> (sem otimização; é o equivalente do que foi usado)"],
      ["Período das medições", inicio ? inicio + " até " + fim : "—"],
      ["Medições registradas", ED.int(d.linhas.length) + " ordenações"]
    ];
    tb.innerHTML = linhas.map(function (l) { return "<tr><td><strong>" + l[0] + "</strong></td><td>" + l[1] + "</td></tr>"; }).join("");
  }

  /* ---------- 3.2 número de comparações ---------- */
  function comparacoes() {
    var t = document.getElementById("tab-comp");
    var html = "<thead><tr><th>Tamanho (n)</th><th>n(n-1)/2 — selection, bubble e insertion no pior caso</th><th>n-1 — insertion no melhor caso</th></tr></thead><tbody>";
    ED.tamanhos.forEach(function (n) {
      html += "<tr><td>" + ED.int(n) + "</td><td>" + ED.int(n * (n - 1) / 2) + "</td><td>" + ED.int(n - 1) + "</td></tr>";
    });
    t.innerHTML = html + "</tbody>";
  }

  /* ---------- 3.4 fator de crescimento ---------- */
  function fatores(d) {
    var t = document.getElementById("tab-fator");
    var html = "<thead><tr><th>Vetor · algoritmo</th>";
    for (var k = 1; k < ED.tamanhos.length; k++) { html += "<th>" + ED.int(ED.tamanhos[k - 1]) + " → " + ED.int(ED.tamanhos[k]) + "</th>"; }
    html += "</tr></thead><tbody>";
    ED.tipos.forEach(function (tipo) {
      ED.algoritmos.forEach(function (alg) {
        html += "<tr><td>" + ED.nomeTipo[tipo] + " · " + alg + "</td>";
        for (var k = 1; k < ED.tamanhos.length; k++) {
          var a = ED.resumo(d, tipo, ED.tamanhos[k - 1], alg), b = ED.resumo(d, tipo, ED.tamanhos[k], alg);
          if (a && b && a.media >= 0.0005) { html += "<td>" + new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(b.media / a.media) + "×</td>"; }
          else { html += "<td class='vazio'>—</td>"; }
        }
        html += "</tr>";
      });
    });
    t.innerHTML = html + "</tbody>";
  }

  /* ---------- 4. testes: tabelas + gráficos por tipo ---------- */
  function testes(d) {
    var alvo = document.getElementById("testes-blocos");
    var html = "";
    ED.tipos.forEach(function (tipo) {
      html += "<div class='graf-doc'><h3>Vetor " + ED.nomeTipo[tipo].toLowerCase() + "</h3>" +
        "<div class='graf-par'><div class='cartao' style='padding:14px'><div id='g-" + tipo + "'></div></div></div>" +
        "<div class='tabela-wrap cartao' style='padding:6px 10px;margin-top:14px'><table class='tabela'><thead><tr><th>Tamanho</th>" +
        ED.algoritmos.map(th).join("") + "</tr></thead><tbody>";
      ED.tamanhos.forEach(function (n) {
        var rs = ED.algoritmos.map(function (a) { return ED.resumo(d, tipo, n, a); });
        var menor = Infinity;
        rs.forEach(function (r) { if (r && r.media < menor) { menor = r.media; } });
        html += "<tr><td>" + ED.int(n) + "</td>" + rs.map(function (r) { return celula(r, menor); }).join("") + "</tr>";
      });
      html += "</tbody></table></div></div>";
    });
    alvo.innerHTML = html;
    ED.tipos.forEach(function (tipo) {
      ED.grafico(document.getElementById("g-" + tipo), { series: ED.seriesDoTipo(d, tipo), escala: "log", titulo: "Tamanho x Tempo — vetor " + tipo });
    });
    document.getElementById("testes-resumo").innerHTML =
      "Os números em verde indicam o algoritmo mais rápido de cada tamanho. Os gráficos usam escala logarítmica nos dois eixos; a leitura é: quanto mais alta a linha, mais lento o algoritmo.";
  }

  /* ---------- observações calculadas dos dados ---------- */
  function observacoes(d) {
    var ul = document.getElementById("observacoes");
    var uc = document.getElementById("conclusao-dados");
    var htmlO = "", htmlC = "";
    ED.tipos.forEach(function (tipo) {
      var n = null;
      for (var i = ED.tamanhos.length - 1; i >= 0; i--) {
        if (ED.algoritmos.every(function (a) { return ED.resumo(d, tipo, ED.tamanhos[i], a); })) { n = ED.tamanhos[i]; break; }
      }
      if (!n) { return; }
      var rs = ED.algoritmos.map(function (a) { return { a: a, t: ED.resumo(d, tipo, n, a).media }; });
      var ord = rs.slice().sort(function (x, y) { return x.t - y.t; });
      var rapido = ord[0], lento = ord[2];
      var razao = lento.t / Math.max(rapido.t, 0.001);
      var frase = "<li><strong>Vetor " + ED.nomeTipo[tipo].toLowerCase() + " com " + ED.int(n) + " elementos:</strong> " +
        rs.map(function (r) { return r.a + " " + ED.humano(r.t); }).join("; ") + ". O mais rápido foi o <strong>" + rapido.a +
        "</strong> e o mais lento o <strong>" + lento.a + "</strong> (" + (razao >= 10 ? "cerca de " + Math.round(razao).toLocaleString("pt-BR") : new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(razao)) + " vezes mais lento).</li>";
      htmlO += frase;
      htmlC += frase;
    });
    ul.innerHTML = htmlO || "<li>Sem dados.</li>";
    uc.innerHTML = htmlC;
  }

  /* ---------- Anexo B: listagem completa ---------- */
  function listagem(d) {
    var t = document.getElementById("tab-listagem");
    var html = "<thead><tr><th>#</th><th>Tipo</th><th>Tamanho</th><th>Algoritmo</th><th>Rep.</th><th>Início</th><th>Fim</th><th>Tempo (ms)</th></tr></thead><tbody>";
    d.linhas.forEach(function (l, i) {
      html += "<tr><td>" + (i + 1) + "</td><td>" + l.tipo + "</td><td>" + ED.int(l.tamanho) + "</td><td>" + l.algoritmo + "</td><td>" + l.repeticao +
        "</td><td>" + l.inicio + "</td><td>" + l.fim + "</td><td>" + ED.nf3.format(l.ms) + "</td></tr>";
    });
    t.innerHTML = html + "</tbody>";
    document.getElementById("listagem-titulo").textContent = "Ver as " + ED.int(d.linhas.length) + " medições";
  }

  /* ---------- índice lateral que acompanha a leitura ---------- */
  function indiceAtivo() {
    var links = [].slice.call(document.querySelectorAll("#toc-lista a"));
    if (!links.length || !("IntersectionObserver" in window)) { return; }
    var mapa = {};
    links.forEach(function (a) { mapa[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (a) { a.classList.remove("atual"); });
          mapa[e.target.id].classList.add("atual");
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    Object.keys(mapa).forEach(function (id) { var s = document.getElementById(id); if (s) { io.observe(s); } });
  }

  document.addEventListener("DOMContentLoaded", function () {
    figuraTipos();
    comparacoes();
    indiceAtivo();

    var anexos = document.querySelectorAll("[data-anexo]");
    var pendentes = 1 + anexos.length;
    function pronto() { if (--pendentes === 0) { window.__docPronto = true; document.documentElement.setAttribute("data-pronto", "1"); } }

    ED.carregarDados().then(function (d) {
      ambiente(d); fatores(d); testes(d); observacoes(d); listagem(d);
      ED.tabelaGrandes(d, document.getElementById("grandes-tab"), document.getElementById("grandes-resumo"), 1000000);
      document.addEventListener("tema-mudou", function () { testes(d); });
      pronto();
    });
    anexos.forEach(function (pre) {
      ED.codigo.mostrar(pre, "codigo/" + pre.getAttribute("data-anexo")).then(pronto);
    });

    if (modoImpressao) {
      document.querySelectorAll("details").forEach(function (x) { x.open = true; });
      document.querySelectorAll(".revelar").forEach(function (x) { x.classList.add("visivel"); });
    }
    window.addEventListener("beforeprint", function () { document.querySelectorAll("details").forEach(function (x) { x.open = true; }); });
  });
})();
