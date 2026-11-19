/*
 * demo.js — simulador no navegador.
 * Conversa com o sort-worker.js: o usuário escolhe tipo, tamanho e
 * repetições; os três algoritmos rodam no mesmo vetor (restaurado do
 * backup) e a tela mostra início, fim e tempo de cada um.
 */
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", function () {
    var raiz = document.getElementById("simulador");
    if (!raiz) { return; }

    var estado = { tipo: "aleatorio", n: 1000, reps: 1, worker: null, rodando: false };
    var btnRodar = raiz.querySelector("#sim-rodar");
    var btnParar = raiz.querySelector("#sim-parar");
    var aviso = raiz.querySelector("#sim-aviso");
    var log = raiz.querySelector("#sim-log");
    var cartoes = ED.algoritmos.map(function (_, i) { return raiz.querySelector("[data-alg='" + i + "']"); });
    var inputReps = raiz.querySelector("#sim-reps");
    var relogio = null, tIni = 0;

    /* seleção de tipo e tamanho (botões segmentados) */
    function ligarSeg(seletor, atributo, cb) {
      var botoes = raiz.querySelectorAll(seletor);
      botoes.forEach(function (b) {
        b.addEventListener("click", function () {
          if (estado.rodando) { return; }
          botoes.forEach(function (x) { x.classList.remove("ativo"); x.setAttribute("aria-pressed", "false"); });
          b.classList.add("ativo");
          b.setAttribute("aria-pressed", "true");
          cb(b.getAttribute(atributo));
          atualizarAviso();
        });
      });
    }
    ligarSeg("[data-tipo]", "data-tipo", function (v) { estado.tipo = v; });
    ligarSeg("[data-n]", "data-n", function (v) { estado.n = Number(v); });
    inputReps.addEventListener("input", function () {
      var v = parseInt(inputReps.value, 10);
      estado.reps = isNaN(v) ? 1 : Math.min(20, Math.max(1, v));
    });

    function atualizarAviso() {
      var n = estado.n;
      if (n >= 1000000) {
        aviso.textContent = "Atenção: com 1.000.000 de elementos os algoritmos O(n²) podem levar de vários minutos a dezenas de minutos no navegador. Você pode cancelar quando quiser.";
        aviso.className = "aviso aviso-forte";
      } else if (n >= 100000) {
        aviso.textContent = "Com 100.000 elementos cada algoritmo pode levar de alguns segundos a perto de um minuto.";
        aviso.className = "aviso";
      } else {
        aviso.textContent = "";
        aviso.className = "aviso oculto";
      }
    }
    atualizarAviso();

    function limparCartoes() {
      cartoes.forEach(function (c) {
        c.className = "alg-card cartao";
        c.querySelector(".alg-tempo").textContent = "—";
        c.querySelector(".alg-estado").textContent = "aguardando";
        c.querySelector(".alg-horas").textContent = "início — · fim —";
        c.querySelector(".alg-barra i").style.width = "0%";
      });
    }

    function escrever(linha) {
      log.textContent += linha + "\n";
      log.scrollTop = log.scrollHeight;
    }

    function pararRelogio() { if (relogio) { clearInterval(relogio); relogio = null; } }

    function finalizar(cancelado) {
      pararRelogio();
      estado.rodando = false;
      estado.worker = null;
      btnRodar.disabled = false;
      btnParar.classList.add("oculto");
      raiz.classList.remove("rodando");
      if (cancelado) {
        escrever("-- teste cancelado --");
        cartoes.forEach(function (c) {
          if (c.classList.contains("rodando")) {
            c.classList.remove("rodando");
            c.querySelector(".alg-estado").textContent = "cancelado";
          }
        });
      }
    }

    btnParar.addEventListener("click", function () {
      if (estado.worker) { estado.worker.terminate(); }
      finalizar(true);
    });

    btnRodar.addEventListener("click", function () {
      if (estado.rodando) { return; }
      estado.rodando = true;
      btnRodar.disabled = true;
      btnParar.classList.remove("oculto");
      raiz.classList.add("rodando");
      limparCartoes();
      log.textContent = "";
      escrever("vetor " + estado.tipo + " com " + ED.int(estado.n) + " elementos — " + estado.reps + " repetição(ões)");

      var somas = [0, 0, 0], maiorMs = 0, medias = [[], [], []];
      var w = new Worker("js/sort-worker.js");
      estado.worker = w;

      w.onmessage = function (e) {
        var m = e.data;
        if (m.tipo === "inicio") {
          var c = cartoes[m.alg];
          c.classList.remove("pronto");
          c.classList.add("rodando");
          c.querySelector(".alg-estado").textContent = estado.reps > 1 ? "rodando " + m.rep + "/" + estado.reps : "rodando…";
          tIni = performance.now();
          pararRelogio();
          relogio = setInterval(function () {
            c.querySelector(".alg-tempo").textContent = ED.ms(performance.now() - tIni);
          }, 50);
        } else if (m.tipo === "fim") {
          pararRelogio();
          var card = cartoes[m.alg];
          card.classList.remove("rodando");
          card.classList.add("pronto");
          medias[m.alg].push(m.ms);
          var media = medias[m.alg].reduce(function (s, x) { return s + x; }, 0) / medias[m.alg].length;
          somas[m.alg] = media;
          maiorMs = Math.max.apply(null, somas);
          card.querySelector(".alg-tempo").textContent = ED.ms(media);
          card.querySelector(".alg-estado").textContent = (m.ok ? "ordenado ✓" : "ERRO") + (estado.reps > 1 ? " · média de " + medias[m.alg].length : "");
          card.querySelector(".alg-horas").textContent = "início " + m.inicio + " · fim " + m.fim;
          cartoes.forEach(function (cc, i) {
            cc.querySelector(".alg-barra i").style.width = maiorMs > 0 ? (somas[i] / maiorMs) * 100 + "%" : "0%";
          });
          escrever(ED.algoritmos[m.alg] + " " + m.ms.toFixed(3) + " ms   (início " + m.inicio + " | fim " + m.fim + ")");
        } else if (m.tipo === "tudo") {
          if (estado.reps > 1) {
            escrever("MÉDIA de " + estado.reps + " repetições:");
            ED.algoritmos.forEach(function (nome, i) { escrever(nome + " " + somas[i].toFixed(3) + " ms"); });
          }
          finalizar(false);
        }
      };
      w.onerror = function () { escrever("Erro no worker."); finalizar(true); };
      w.postMessage({ tipo: estado.tipo, n: estado.n, reps: estado.reps });
    });
  });
})();
