/*
 * visualizer.js — animação didática dos três algoritmos (barras).
 * É só uma ilustração de COMO cada algoritmo trabalha, com 28 barras.
 * Os tempos oficiais NÃO vêm daqui: vêm do programa em C.
 */
(function () {
  "use strict";

  /* cada algoritmo é um "gerador": a cada yield ele mostra um passo */
  function* selection(a, st) {
    var n = a.length, i, j, menor, aux;
    for (i = 0; i < n - 1; i++) {
      menor = i;
      for (j = i + 1; j < n; j++) {
        st.cmp++; st.destaque = [j, menor]; yield;
        if (a[j] < a[menor]) { menor = j; }
      }
      if (menor !== i) { aux = a[i]; a[i] = a[menor]; a[menor] = aux; st.trocas++; st.destaque = [i, menor]; yield; }
      st.ordenadoAte = i;
    }
    st.ordenadoAte = n;
  }
  function* insertion(a, st) {
    var n = a.length, i, j, chave;
    for (i = 1; i < n; i++) {
      chave = a[i]; j = i - 1;
      while (j >= 0) {
        st.cmp++; st.destaque = [j, j + 1]; yield;
        if (a[j] > chave) { a[j + 1] = a[j]; st.trocas++; j--; } else { break; }
      }
      a[j + 1] = chave;
      st.ordenadoAte = i;
    }
    st.ordenadoAte = n;
  }
  function* bubble(a, st) {
    var n = a.length, i, j, aux;
    for (i = 0; i < n - 1; i++) {
      for (j = 0; j < n - 1 - i; j++) {
        st.cmp++; st.destaque = [j, j + 1]; yield;
        if (a[j] > a[j + 1]) { aux = a[j]; a[j] = a[j + 1]; a[j + 1] = aux; st.trocas++; }
      }
      st.ordenadoDesde = n - 1 - i;
    }
    st.ordenadoDesde = 0;
  }

  var N = 28;
  var painel = [
    { id: "viz-sel", gen: selection, nome: "selection sort", tipoSel: "ate" },
    { id: "viz-ins", gen: insertion, nome: "insertion sort", tipoSel: "ate" },
    { id: "viz-bub", gen: bubble, nome: "bubble sort", tipoSel: "desde" }
  ];

  function embaralhado() {
    var a = [], i, j, t;
    for (i = 0; i < N; i++) { a.push(i + 1); }
    for (i = N - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var itens = [];
    painel.forEach(function (p) {
      var cv = document.getElementById(p.id);
      if (!cv) { return; }
      var info = document.getElementById(p.id + "-info");
      var item = { p: p, cv: cv, ctx: cv.getContext("2d"), info: info, pausa: 0 };
      reiniciar(item);
      itens.push(item);
    });
    if (!itens.length) { return; }

    function reiniciar(item) {
      item.a = embaralhado();
      item.st = { cmp: 0, trocas: 0, destaque: [], ordenadoAte: -1, ordenadoDesde: N };
      item.g = item.p.gen(item.a, item.st);
      item.pausa = 0;
    }

    function ajustar(item) {
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      var r = item.cv.getBoundingClientRect();
      item.cv.width = Math.round(r.width * dpr);
      item.cv.height = Math.round(r.height * dpr);
      item.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      item.w = r.width; item.h = r.height;
    }

    function desenhar(item) {
      var c = item.ctx, w = item.w, h = item.h, a = item.a, st = item.st;
      c.clearRect(0, 0, w, h);
      var destaque = getComputedStyle(document.documentElement).getPropertyValue("--texto").trim() || "#000";
      var gap = 3, bw = (w - gap * (N - 1)) / N;
      for (var i = 0; i < N; i++) {
        var bh = (a[i] / N) * (h - 8) + 4;
        var x = i * (bw + gap), y = h - bh;
        var pronto = item.p.tipoSel === "ate" ? i <= st.ordenadoAte : i >= st.ordenadoDesde;
        var ativo = st.destaque.indexOf(i) !== -1;
        c.globalAlpha = pronto ? 0.9 : ativo ? 1 : 0.35;
        c.fillStyle = ativo && !pronto ? destaque : ED.corHex[item.p.nome];
        var r = Math.min(4, bw / 2);
        c.beginPath();
        c.moveTo(x, y + r); c.arcTo(x, y, x + r, y, r);
        c.lineTo(x + bw - r, y); c.arcTo(x + bw, y, x + bw, y + r, r);
        c.lineTo(x + bw, h); c.lineTo(x, h); c.closePath();
        c.fill();
      }
      c.globalAlpha = 1;
      if (item.info) { item.info.textContent = st.cmp + " comparações · " + st.trocas + " trocas"; }
    }

    itens.forEach(ajustar);
    /* ao redimensionar, o canvas é limpo: redesenha na hora (sem esperar o próximo quadro) */
    window.addEventListener("resize", function () { itens.forEach(function (item) { ajustar(item); desenhar(item); }); });

    var visivel = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visivel = es[0].isIntersecting; }).observe(itens[0].cv.parentElement.parentElement);
    }
    var ultimo = 0;
    function quadro(t) {
      requestAnimationFrame(quadro);
      if (!visivel || t - ultimo < 38) { return; }
      ultimo = t;
      itens.forEach(function (item) {
        if (item.pausa > 0) {
          item.pausa--;
          if (item.pausa === 0) { reiniciar(item); }
        } else {
          /* alguns passos por quadro: o bubble é mais lento visualmente, então avança mais */
          var passos = item.p.id === "viz-bub" ? 3 : 2, r;
          for (var k = 0; k < passos; k++) {
            r = item.g.next();
            if (r.done) { item.st.destaque = []; item.pausa = 40; break; }
          }
        }
        desenhar(item);
      });
    }
    if (ED.reduzMovimento) {
      /* sem animação: mostra o estado final ordenado */
      itens.forEach(function (item) { while (!item.g.next().done) {} item.st.destaque = []; desenhar(item); });
    } else {
      requestAnimationFrame(quadro);
    }
  });
})();
