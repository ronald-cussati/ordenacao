/*
 * grandes.js — tabela das medições de um tamanho grande (1.000.000):
 * mostra, para cada execução, o horário de INÍCIO, o de FIM e quanto
 * tempo levou. Execuções que ainda não terminaram aparecem como pendentes.
 */
(function () {
  "use strict";

  ED.tabelaGrandes = function (dados, tabela, resumo, tamanho) {
    if (!tabela) { return; }
    var html = "<thead><tr><th>Vetor</th><th style='text-align:left'>Algoritmo</th><th>Duração</th><th>Início</th><th>Fim</th><th>Tempo (ms)</th></tr></thead><tbody>";
    var feitas = 0, total = 0, somaMs = 0;

    ED.tipos.forEach(function (tipo) {
      ED.algoritmos.forEach(function (alg) {
        total++;
        var l = null;
        dados.linhas.forEach(function (x) {
          if (x.tipo === tipo && x.tamanho === tamanho && x.algoritmo === alg) { l = x; }
        });
        var nome = "<td>" + ED.nomeTipo[tipo] + "</td><td style='font-family:var(--fonte);text-align:left'><i class='dot' style='display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:7px;background:" + ED.corHex[alg] + "'></i>" + alg + "</td>";
        if (l) {
          feitas++;
          somaMs += l.ms;
          html += "<tr>" + nome + "<td><strong>" + ED.humano(l.ms) + "</strong></td><td>" + l.inicio + "</td><td>" + l.fim + "</td><td>" + ED.nf3.format(l.ms) + "</td></tr>";
        } else {
          html += "<tr>" + nome + "<td class='vazio' colspan='4' style='text-align:left'>em andamento / aguardando execução</td></tr>";
        }
      });
    });

    tabela.innerHTML = html + "</tbody>";
    if (resumo) {
      resumo.textContent = feitas + " de " + total + " execuções concluídas" +
        (feitas ? " · tempo total já medido: " + ED.humano(somaMs) : "") +
        (feitas < total ? ". As execuções são feitas uma de cada vez, em sequência, na mesma máquina; esta tabela é atualizada a cada nova publicação." : ".");
    }
  };
})();
