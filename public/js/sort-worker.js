/*
 * sort-worker.js — roda os testes do simulador FORA da thread da página
 * (Web Worker), para a tela não congelar durante ordenações longas.
 *
 * É a mesma lógica do programa em C (sort.h), traduzida para JavaScript:
 * gera o vetor, guarda um backup, restaura o backup antes de cada
 * algoritmo e mede o tempo SOMENTE da ordenação.
 * Nada é simulado: o tempo mostrado é o tempo real gasto no seu navegador.
 *
 * Para mostrar a barra de porcentagem, cada algoritmo trabalha em
 * "fatias" de passadas do laço externo. Entre uma fatia e outra o worker
 * avisa o progresso. O tempo de espera entre as fatias NÃO entra na conta:
 * só o tempo de dentro das fatias é somado.
 */

/* Cada função faz as passadas k0 ... k1-1 do laço externo
   (a mesma lógica do sort.h, só que dividida em pedaços). */
function selection_sort(v, n, k0, k1) {
  var i, j, menor, aux;
  for (i = k0; i < k1; i++) {
    menor = i;
    for (j = i + 1; j < n; j++) {
      if (v[j] < v[menor]) { menor = j; }
    }
    if (menor !== i) { aux = v[i]; v[i] = v[menor]; v[menor] = aux; }
  }
}

function insertion_sort(v, n, k0, k1) {
  var i, j, chave;
  for (i = k0 + 1; i < k1 + 1; i++) {      /* a passada k é o elemento i = k + 1 */
    chave = v[i];
    j = i - 1;
    while (j >= 0 && v[j] > chave) { v[j + 1] = v[j]; j--; }
    v[j + 1] = chave;
  }
}

function bubble_sort(v, n, k0, k1) {
  var i, j, aux;
  for (i = k0; i < k1; i++) {
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

/* Quanto do trabalho já foi feito (0 a 1) depois de k das "total" passadas.
   Selection e bubble: as primeiras passadas são as mais longas, então o
   trabalho feito cresce mais rápido no começo. Insertion: depende do vetor
   (no crescente quase não há trabalho, nos outros as últimas passadas pesam mais). */
function fracao(alg, tipo, k, total) {
  var x = k / total;
  if (alg === 1) { return tipo === "crescente" ? x : x * x; }
  return 1 - (1 - x) * (1 - x);
}

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

function esperar() { return new Promise(function (ok) { setTimeout(ok, 0); }); }

/* Ordena com um algoritmo, avisando o progresso. Devolve o tempo em ms. */
async function medir(a, v, n, tipo, rep) {
  var total = n - 1;
  var fatia = Math.max(1, Math.ceil(total / 1000));
  var gasto = 0;
  var ultimoAviso = performance.now();
  var dIni = new Date();

  for (var k = 0; k < total; k += fatia) {
    var fim = Math.min(total, k + fatia);
    var t0 = performance.now();                 // <<< começa a contar
    ALGORITMOS[a].f(v, n, k, fim);
    gasto += performance.now() - t0;            // <<< para de contar

    /* avisa o progresso no máximo umas 15 vezes por segundo */
    if (fim < total && performance.now() - ultimoAviso > 70) {
      postMessage({ tipo: "progresso", alg: a, rep: rep, pct: fracao(a, tipo, fim, total) * 100 });
      await esperar();
      ultimoAviso = performance.now();
    }
  }
  return { ms: gasto, inicio: hora(dIni), fim: hora(new Date()) };
}

onmessage = async function (e) {
  var cfg = e.data;
  var n = cfg.n;
  var original = new Int32Array(n);   // vetor gerado (fica de backup)
  var v = new Int32Array(n);          // vetor que será ordenado

  for (var r = 1; r <= cfg.reps; r++) {
    gerar(original, n, cfg.tipo);     // novo vetor a cada repetição
    for (var a = 0; a < ALGORITMOS.length; a++) {
      v.set(original);                // restaura o backup

      postMessage({ tipo: "inicio", alg: a, rep: r });
      var res = await medir(a, v, n, cfg.tipo, r);

      postMessage({
        tipo: "fim", alg: a, rep: r,
        ms: res.ms, inicio: res.inicio, fim: res.fim,
        ok: estaOrdenado(v, n)        // conferência fora da medição
      });
    }
  }
  postMessage({ tipo: "tudo" });
};
