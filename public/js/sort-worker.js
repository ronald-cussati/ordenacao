/*
 * sort-worker.js — roda os testes do simulador FORA da thread da página
 * (Web Worker), para a tela não congelar durante ordenações longas.
 *
 * É a mesma lógica do programa em C (sort.h), traduzida para JavaScript:
 * gera o vetor, guarda um backup, restaura o backup antes de cada
 * algoritmo e mede o tempo SOMENTE da chamada da função de ordenação.
 * Nada é simulado: o tempo mostrado é o tempo real gasto no seu navegador.
 */

function selection_sort(v, n) {
  var i, j, menor, aux;
  for (i = 0; i < n - 1; i++) {
    menor = i;
    for (j = i + 1; j < n; j++) {
      if (v[j] < v[menor]) { menor = j; }
    }
    if (menor !== i) { aux = v[i]; v[i] = v[menor]; v[menor] = aux; }
  }
}

function insertion_sort(v, n) {
  var i, j, chave;
  for (i = 1; i < n; i++) {
    chave = v[i];
    j = i - 1;
    while (j >= 0 && v[j] > chave) { v[j + 1] = v[j]; j--; }
    v[j + 1] = chave;
  }
}

function bubble_sort(v, n) {
  var i, j, aux;
  for (i = 0; i < n - 1; i++) {
    for (j = 0; j < n - 1 - i; j++) {
      if (v[j] > v[j + 1]) { aux = v[j]; v[j] = v[j + 1]; v[j + 1] = aux; }
    }
  }
}

var ALGORITMOS = [
  { nome: "selection sort", f: selection_sort },
  { nome: "insertion sort", f: insertion_sort },
  { nome: "bubble sort", f: bubble_sort }
];

function gerar(v, n, tipo) {
  for (var i = 0; i < n; i++) {
    if (tipo === "aleatorio") { v[i] = Math.floor(Math.random() * 1000000); }
    else if (tipo === "crescente") { v[i] = i + 1; }
    else { v[i] = n - i; }
  }
}

function estaOrdenado(v, n) {
  for (var i = 0; i < n - 1; i++) { if (v[i] > v[i + 1]) { return false; } }
  return true;
}

function hora(d) {
  function p(x) { return (x < 10 ? "0" : "") + x; }
  return p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
}

onmessage = function (e) {
  var cfg = e.data;
  var n = cfg.n;
  var original = new Int32Array(n);   // vetor gerado (fica de backup)
  var v = new Int32Array(n);          // vetor que será ordenado

  for (var r = 1; r <= cfg.reps; r++) {
    gerar(original, n, cfg.tipo);     // novo vetor a cada repetição
    for (var a = 0; a < ALGORITMOS.length; a++) {
      v.set(original);                // restaura o backup

      postMessage({ tipo: "inicio", alg: a, rep: r });
      var dIni = new Date();
      var t0 = performance.now();     // <<< começa a contar
      ALGORITMOS[a].f(v, n);
      var t1 = performance.now();     // <<< para de contar
      var dFim = new Date();

      postMessage({
        tipo: "fim", alg: a, rep: r,
        ms: t1 - t0, inicio: hora(dIni), fim: hora(dFim),
        ok: estaOrdenado(v, n)        // conferência fora da medição
      });
    }
  }
  postMessage({ tipo: "tudo" });
};
