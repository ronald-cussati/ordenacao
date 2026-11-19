/*
 * common.js — utilitários compartilhados pelas duas páginas:
 * tema claro/escuro, barra de progresso, revelar ao rolar, brilho que
 * segue o mouse, contadores, formatação de números e leitura dos dados.
 */
(function () {
  "use strict";

  /* ---------- tema ---------- */
  var saved = null;
  try { saved = localStorage.getItem("tema"); } catch (e) {}
  if (saved === "light" || saved === "dark") {
    document.documentElement.setAttribute("data-theme", saved);
  }

  function alternarTema() {
    var atual = document.documentElement.getAttribute("data-theme");
    if (!atual) {
      atual = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    var novo = atual === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", novo);
    try { localStorage.setItem("tema", novo); } catch (e) {}
    document.dispatchEvent(new CustomEvent("tema-mudou"));
  }

  /* ---------- formatação ---------- */
  var nf3 = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  var nfInt = new Intl.NumberFormat("pt-BR");

  var ED = (window.ED = {
    nf3: nf3,
    int: function (n) { return nfInt.format(n); },
    ms: function (n) {
      /* o programa em C imprime 3 casas decimais: abaixo disso o cronômetro só diz "menos que 0,001 ms" */
      if (n < 0.0005) { return "< 0,001 ms"; }
      return nf3.format(n) + " ms";
    },
    /* texto "humano" para tempos grandes: 1 h 12 min, 7 min 30 s, 2,4 s ... */
    humano: function (ms) {
      if (ms < 0.0005) { return "< 0,001 ms"; }
      if (ms < 1) { return nf3.format(ms) + " ms"; }
      if (ms < 1000) { return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(ms) + " ms"; }
      var s = ms / 1000;
      if (s < 60) { return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(s) + " s"; }
      var m = Math.floor(s / 60);
      var rs = Math.round(s - m * 60);
      if (m < 60) { return m + " min " + rs + " s"; }
      var h = Math.floor(m / 60);
      return h + " h " + (m - h * 60) + " min";
    },
    nomeTipo: { aleatorio: "Aleatório", crescente: "Crescente", decrescente: "Decrescente" },
    cores: { "selection sort": "var(--sel)", "insertion sort": "var(--ins)", "bubble sort": "var(--bub)" },
    /* cores dos algoritmos: lidas do CSS na hora, para acompanhar o tema claro/escuro */
    corHex: (function () {
      var vars = { "selection sort": "--sel", "insertion sort": "--ins", "bubble sort": "--bub" };
      var padrao = { "selection sort": "#5046b4", "insertion sort": "#0e8577", "bubble sort": "#cc5f22" };
      var o = {};
      Object.keys(vars).forEach(function (k) {
        Object.defineProperty(o, k, { enumerable: true, get: function () {
          return getComputedStyle(document.documentElement).getPropertyValue(vars[k]).trim() || padrao[k];
        } });
      });
      return o;
    })(),
    algoritmos: ["selection sort", "insertion sort", "bubble sort"],
    tipos: ["aleatorio", "crescente", "decrescente"],
    tamanhos: [100, 1000, 10000, 100000, 1000000],
    reduzMovimento: window.matchMedia("(prefers-reduced-motion: reduce)").matches,

    /* carrega o JSON de resultados gerado a partir do CSV do programa em C */
    carregarDados: function () {
      return fetch("data/resultados.json", { cache: "no-cache" })
        .then(function (r) { if (!r.ok) { throw new Error("sem dados"); } return r.json(); })
        .catch(function () { return { linhas: [], resumo: [], maquina: null }; });
    },
    /* acha uma linha do resumo */
    resumo: function (dados, tipo, tamanho, alg) {
      for (var i = 0; i < dados.resumo.length; i++) {
        var r = dados.resumo[i];
        if (r.tipo === tipo && r.tamanho === tamanho && r.algoritmo === alg) { return r; }
      }
      return null;
    },
    /* lista de integrantes preenchidos */
    integrantes: function () {
      return (window.GRUPO.integrantes || []).filter(function (n) { return n && n.trim(); });
    },
    escapar: function (t) {
      return String(t).replace(/[&<>"]/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
      });
    }
  });

  /* ---------- preencher campos data-g="campo" com dados do grupo ---------- */
  function preencherGrupo() {
    var g = window.GRUPO;
    document.querySelectorAll("[data-g]").forEach(function (el) {
      var k = el.getAttribute("data-g");
      if (k === "integrantes") {
        el.innerHTML = ED.integrantes().map(function (n) { return "<li>" + ED.escapar(n) + "</li>"; }).join("");
      } else if (k === "turma") {
        if (g.turma) { el.textContent = g.turma; } else if (el.parentElement) { el.parentElement.classList.add("oculto"); }
      } else if (g[k] !== undefined) {
        el.textContent = g[k];
      }
    });
    document.querySelectorAll("[data-pdf]").forEach(function (a) { a.setAttribute("href", g.pdf); });
    document.querySelectorAll("[data-zip]").forEach(function (a) { a.setAttribute("href", g.zip); });
    document.querySelectorAll("[data-repo]").forEach(function (a) {
      if (g.repositorio) { a.setAttribute("href", g.repositorio); } else { a.classList.add("oculto"); }
    });
  }

  /* ---------- efeitos ---------- */
  function iniciarEfeitos() {
    /* barra de progresso de leitura */
    var barra = document.querySelector(".progresso");
    if (barra) {
      var atualizar = function () {
        var h = document.documentElement;
        var max = h.scrollHeight - h.clientHeight;
        barra.style.transform = "scaleX(" + (max > 0 ? h.scrollTop / max : 0) + ")";
      };
      window.addEventListener("scroll", atualizar, { passive: true });
      atualizar();
    }

    /* nav ganha fundo ao rolar */
    var nav = document.querySelector(".nav");
    if (nav) {
      var rolar = function () { nav.classList.toggle("rolou", window.scrollY > 12); };
      window.addEventListener("scroll", rolar, { passive: true });
      rolar();
    }

    /* revelar ao rolar */
    var itens = document.querySelectorAll(".revelar");
    if ("IntersectionObserver" in window && !ED.reduzMovimento) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("visivel"); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      itens.forEach(function (el) { io.observe(el); });
    } else {
      itens.forEach(function (el) { el.classList.add("visivel"); });
    }

    /* brilho que segue o mouse nos cartões */
    if (!ED.reduzMovimento) {
      document.addEventListener("pointermove", function (e) {
        var alvo = e.target.closest && e.target.closest(".cartao");
        if (!alvo) { return; }
        var r = alvo.getBoundingClientRect();
        alvo.style.setProperty("--mx", e.clientX - r.left + "px");
        alvo.style.setProperty("--my", e.clientY - r.top + "px");
      }, { passive: true });
    }

    /* contadores animados */
    var contadores = document.querySelectorAll("[data-conta]");
    var ioc = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) { return; }
        ioc.unobserve(e.target);
        var el = e.target;
        var alvo = Number(el.getAttribute("data-conta"));
        if (ED.reduzMovimento) { el.textContent = ED.int(alvo); return; }
        var ini = performance.now();
        (function passo(t) {
          var p = Math.min(1, (t - ini) / 1400);
          var ease = 1 - Math.pow(1 - p, 3);
          el.textContent = ED.int(Math.round(alvo * ease));
          if (p < 1) { requestAnimationFrame(passo); }
        })(ini);
      });
    }, { threshold: 0.6 }) : null;
    contadores.forEach(function (el) {
      if (ioc) { ioc.observe(el); } else { el.textContent = ED.int(Number(el.getAttribute("data-conta"))); }
    });

    /* botão de tema */
    document.querySelectorAll("[data-tema]").forEach(function (b) { b.addEventListener("click", alternarTema); });

    /* menu mobile */
    var burger = document.querySelector(".burger");
    if (burger && nav) {
      burger.addEventListener("click", function () {
        var aberto = nav.classList.toggle("aberto");
        burger.setAttribute("aria-expanded", aberto ? "true" : "false");
      });
      nav.querySelectorAll(".links a").forEach(function (a) {
        a.addEventListener("click", function () { nav.classList.remove("aberto"); burger.setAttribute("aria-expanded", "false"); });
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    preencherGrupo();
    iniciarEfeitos();
  });
})();
