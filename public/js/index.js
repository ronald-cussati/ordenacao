/*
 * index.js — monta a seção de resultados (gráfico + tabela) e a de código
 * da página inicial.
 */
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", function () {
    /* ---------- equipe ---------- */
    var eq = document.getElementById("equipe-lista");
    if (eq) {
      eq.innerHTML = ED.integrantes().map(function (nome) { return "<li>" + ED.escapar(nome) + "</li>"; }).join("");
    }

    /* ---------- resultados ---------- */
    var raiz = document.getElementById("resultados");
    if (raiz) {
      var estado = { tipo: "aleatorio", escala: "log", dados: null };
      var graf = raiz.querySelector("#graf");
      var tabela = raiz.querySelector("#tabela-res");
      var nota = raiz.querySelector("#res-nota");

      var desenhar = function () {
        var d = estado.dados;
        ED.grafico(graf, { series: ED.seriesDoTipo(d, estado.tipo), escala: estado.escala, titulo: "Tamanho x Tempo — vetor " + estado.tipo });
        var html = "<thead><tr><th>Tamanho</th>" + ED.algoritmos.map(function (a) {
          return "<th class='th-alg'><i style='background:" + ED.corHex[a] + "'></i>" + a + "</th>";
        }).join("") + "</tr></thead><tbody>";
        ED.tamanhos.forEach(function (n) {
          var linhas = ED.algoritmos.map(function (a) { return ED.resumo(d, estado.tipo, n, a); });
          var menor = Infinity;
          linhas.forEach(function (r) { if (r && r.media < menor) { menor = r.media; } });
          html += "<tr><td>" + ED.int(n) + "</td>" + linhas.map(function (r) {
            if (!r) { return "<td class='vazio'>—</td>"; }
            return "<td class='" + (r.media === menor ? "melhor" : "") + "'>" + ED.ms(r.media) + "<small>" + ED.humano(r.media) + " · " + r.reps + "×</small></td>";
          }).join("") + "</tr>";
        });
        tabela.innerHTML = html + "</tbody>";
      };

      var ligar = function (seletor, chave) {
        var botoes = raiz.querySelectorAll(seletor);
        botoes.forEach(function (b) {
          b.addEventListener("click", function () {
            botoes.forEach(function (x) { x.classList.remove("ativo"); });
            b.classList.add("ativo");
            estado[chave] = b.getAttribute("data-v");
            desenhar();
          });
        });
      };
      ligar("[data-aba-tipo] button", "tipo");
      ligar("[data-aba-escala] button", "escala");
      document.addEventListener("tema-mudou", function () { if (estado.dados) { desenhar(); } });

      ED.carregarDados().then(function (d) {
        estado.dados = d;
        desenhar();
        ED.tabelaGrandes(d, document.getElementById("grandes-tab"), document.getElementById("grandes-resumo"), 1000000);
        if (d.maquina) {
          nota.textContent = "Máquina: " + d.maquina.cpu + " · " + d.maquina.ram + " de RAM · " + d.maquina.so + " · Compilação: " + d.maquina.compilador + ".";
        }
        var faltam = ED.tamanhos.filter(function (n) { return !ED.resumo(d, "aleatorio", n, "bubble sort"); });
        if (faltam.length) {
          nota.textContent += " Medições ainda em andamento para: " + faltam.map(ED.int).join(", ") + " elementos.";
        }
      });
    }

    /* ---------- código ---------- */
    var cod = document.getElementById("cod-pre");
    if (cod) {
      var arq = "selection_sort.h";
      var autores = {
        "selection_sort.h": "Alvino Mainette Santos",
        "insertion_sort.h": "Ronald Cussati Cesar da Fonseca",
        "bubble_sort.h": "Thalys Cestari Thouzo"
      };
      var autor = document.getElementById("cod-autor");
      var titulo = document.getElementById("cod-nome");
      var copiar = document.getElementById("cod-copiar");
      var baixar = document.getElementById("cod-baixar");
      var carregar = function () {
        titulo.textContent = arq;
        autor.textContent = autores[arq] ? "autor: " + autores[arq] : "";
        baixar.setAttribute("href", "codigo/" + arq);
        baixar.setAttribute("download", arq);
        ED.codigo.mostrar(cod, "codigo/" + arq);
      };
      document.querySelectorAll("[data-aba-cod] button").forEach(function (b) {
        b.addEventListener("click", function () {
          document.querySelectorAll("[data-aba-cod] button").forEach(function (x) { x.classList.remove("ativo"); });
          b.classList.add("ativo");
          arq = b.getAttribute("data-v");
          carregar();
        });
      });
      copiar.addEventListener("click", function () {
        ED.codigo.carregar("codigo/" + arq).then(function (t) {
          return navigator.clipboard.writeText(t);
        }).then(function () {
          copiar.querySelector("span").textContent = "Copiado!";
          setTimeout(function () { copiar.querySelector("span").textContent = "Copiar"; }, 1600);
        }).catch(function () {});
      });
      carregar();
    }
  });
})();
