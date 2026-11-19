/*
 * charts.js — gráfico de linhas em SVG puro (sem bibliotecas).
 * Mostra a relação TAMANHO x TEMPO pedida no enunciado.
 *
 *   ED.grafico(elemento, {
 *     series: [{ nome, cor, pontos: [{x: tamanho, y: tempo_ms}] }],
 *     escala: "log" | "linear"
 *   })
 */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";

  function el(nome, attrs, pai) {
    var e = document.createElementNS(NS, nome);
    for (var k in attrs) { e.setAttribute(k, attrs[k]); }
    if (pai) { pai.appendChild(e); }
    return e;
  }

  var sup = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  function potencia10(k) {
    if (k === 0) { return "1"; }
    if (k === 1) { return "10"; }
    return "10" + String(k).split("").map(function (c) { return sup[c]; }).join("");
  }

  function rotuloTamanho(v) {
    if (v >= 1000000) { return v / 1000000 + " mi"; }
    if (v >= 1000) { return v / 1000 + " mil"; }
    return String(v);
  }
  var nfCurto = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

  ED.grafico = function (container, cfg) {
    container.innerHTML = "";
    var series = cfg.series.filter(function (s) { return s.pontos.length > 0; });
    var log = cfg.escala !== "linear";

    var W = 760, H = 400, m = { t: 18, r: 26, b: 58, l: 84 };
    var iw = W - m.l - m.r, ih = H - m.t - m.b;

    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": cfg.titulo || "Gráfico Tamanho x Tempo", class: "grafico-svg" });
    container.appendChild(svg);

    if (!series.length) {
      var t = el("text", { x: W / 2, y: H / 2, "text-anchor": "middle", class: "eixo-rotulo" }, svg);
      t.textContent = "Sem dados medidos ainda";
      return;
    }

    /* limites dos dados */
    var xs = [], ys = [];
    series.forEach(function (s) { s.pontos.forEach(function (p) { xs.push(p.x); ys.push(p.y); }); });
    var xmin = 100, xmax = Math.max.apply(null, xs);
    var ymaxD = Math.max.apply(null, ys), yminD = Math.min.apply(null, ys);
    var kx0 = 2, kx1 = Math.max(3, Math.ceil(Math.log10(xmax)));
    var ky0 = Math.floor(Math.log10(Math.max(yminD, 1e-4)) - 0.001), ky1 = Math.ceil(Math.log10(ymaxD) + 0.001);
    if (ky1 - ky0 < 2) { ky1 = ky0 + 2; }

    var X, Y;
    if (log) {
      X = function (v) { return m.l + ((Math.log10(v) - kx0) / (kx1 - kx0)) * iw; };
      Y = function (v) { return m.t + ih - ((Math.log10(Math.max(v, 1e-4)) - ky0) / (ky1 - ky0)) * ih; };
    } else {
      var xtop = Math.pow(10, kx1), ytop = niceMax(ymaxD);
      X = function (v) { return m.l + (v / xtop) * iw; };
      Y = function (v) { return m.t + ih - (v / ytop) * ih; };
    }

    function niceMax(v) {
      var p = Math.pow(10, Math.floor(Math.log10(v)));
      var f = v / p;
      var n = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
      return n * p;
    }

    /* grade e eixos */
    var g = el("g", { class: "grade" }, svg);
    var i;
    if (log) {
      for (i = ky0; i <= ky1; i++) {
        var yy = Y(Math.pow(10, i));
        el("line", { x1: m.l, x2: W - m.r, y1: yy, y2: yy, class: "grade-linha" }, g);
        var tt = el("text", { x: m.l - 10, y: yy + 4, "text-anchor": "end", class: "eixo-rotulo" }, g);
        tt.textContent = potencia10(i);
      }
      for (i = kx0; i <= kx1; i++) {
        var xx = X(Math.pow(10, i));
        el("line", { x1: xx, x2: xx, y1: m.t, y2: m.t + ih, class: "grade-linha" }, g);
        var tx = el("text", { x: xx, y: m.t + ih + 20, "text-anchor": "middle", class: "eixo-rotulo" }, g);
        tx.textContent = rotuloTamanho(Math.pow(10, i));
      }
    } else {
      var ytop2 = niceMax(ymaxD);
      for (i = 0; i <= 4; i++) {
        var v = (ytop2 / 4) * i, y2 = Y(v);
        el("line", { x1: m.l, x2: W - m.r, y1: y2, y2: y2, class: "grade-linha" }, g);
        var t2 = el("text", { x: m.l - 10, y: y2 + 4, "text-anchor": "end", class: "eixo-rotulo" }, g);
        t2.textContent = nfCurto.format(v);
      }
      var xtop2 = Math.pow(10, kx1);
      for (i = 0; i <= 4; i++) {
        var vx = (xtop2 / 4) * i, x2 = X(vx);
        el("line", { x1: x2, x2: x2, y1: m.t, y2: m.t + ih, class: "grade-linha" }, g);
        var t3 = el("text", { x: x2, y: m.t + ih + 20, "text-anchor": "middle", class: "eixo-rotulo" }, g);
        t3.textContent = i === 0 ? "0" : rotuloTamanho(vx);
      }
    }
    var tl = el("text", { x: m.l + iw / 2, y: H - 10, "text-anchor": "middle", class: "eixo-titulo" }, svg);
    tl.textContent = "Tamanho do vetor (elementos)";
    var ty = el("text", { x: 18, y: m.t + ih / 2, "text-anchor": "middle", class: "eixo-titulo", transform: "rotate(-90 18 " + (m.t + ih / 2) + ")" }, svg);
    ty.textContent = "Tempo (ms)" + (log ? " — escala log" : "");

    /* linhas */
    var tip = document.createElement("div");
    tip.className = "grafico-tip";
    container.appendChild(tip);
    container.style.position = "relative";

    series.forEach(function (s, idx) {
      var pts = s.pontos.slice().sort(function (a, b) { return a.x - b.x; });
      var d = pts.map(function (p, k) { return (k ? "L" : "M") + X(p.x).toFixed(1) + " " + Y(p.y).toFixed(1); }).join(" ");
      var grupo = el("g", { class: "serie" }, svg);
      var path = el("path", { d: d, fill: "none", stroke: s.cor, "stroke-width": 2.6, "stroke-linecap": "round", "stroke-linejoin": "round", class: "serie-linha" }, grupo);
      path.style.setProperty("--atraso", idx * 140 + "ms");
      pts.forEach(function (p) {
        var c = el("circle", { cx: X(p.x), cy: Y(p.y), r: 4.6, fill: s.cor, class: "serie-ponto" }, grupo);
        c.addEventListener("pointerenter", function () {
          tip.innerHTML = "<b style='color:" + s.cor + "'>" + s.nome + "</b><br>" + ED.int(p.x) + " elementos<br>" + ED.ms(p.y) + "<br><i>" + ED.humano(p.y) + "</i>";
          tip.style.opacity = 1;
          var rc = container.getBoundingClientRect();
          var rs = svg.getBoundingClientRect();
          var esc = rs.width / W;
          tip.style.left = Math.min(rc.width - 170, Math.max(4, X(p.x) * esc - 70)) + "px";
          tip.style.top = Math.max(4, Y(p.y) * esc - 96) + "px";
        });
        c.addEventListener("pointerleave", function () { tip.style.opacity = 0; });
      });
    });

    /* legenda */
    var leg = document.createElement("div");
    leg.className = "legenda";
    series.forEach(function (s) {
      leg.insertAdjacentHTML("beforeend", "<span><i style='background:" + s.cor + "'></i>" + s.nome + "</span>");
    });
    container.appendChild(leg);
  };

  /* monta as séries a partir do JSON de resultados */
  ED.seriesDoTipo = function (dados, tipo) {
    return ED.algoritmos.map(function (alg) {
      var pontos = [];
      ED.tamanhos.forEach(function (n) {
        var r = ED.resumo(dados, tipo, n, alg);
        if (r) { pontos.push({ x: n, y: r.media }); }
      });
      return { nome: alg, cor: ED.corHex[alg], pontos: pontos };
    });
  };
})();
