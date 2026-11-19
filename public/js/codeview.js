/*
 * codeview.js — carrega um arquivo .c/.h e mostra com numeração de linhas
 * e realce de sintaxe simples (feito à mão, sem bibliotecas).
 */
(function () {
  "use strict";

  var re = new RegExp([
    "(\\/\\*[\\s\\S]*?\\*\\/)",                                   // 1 comentário de bloco
    "(\\/\\/.*)",                                                   // 2 comentário de linha
    "(\"(?:\\\\.|[^\"\\\\])*\")",                                   // 3 string
    "(^[ \\t]*#[ \\t]*\\w+)",                                       // 4 diretiva do pré-processador
    "(<[a-z_.]+\\.h>)",                                             // 5 <stdio.h>
    "(\\b(?:if|else|for|while|do|return|break|continue|switch|case|default|sizeof)\\b)", // 6 palavras-chave
    "(\\b(?:int|char|void|double|float|long|unsigned|struct|FILE|time_t|size_t|static|const|LARGE_INTEGER)\\b)", // 7 tipos
    "(\\b\\d+(?:\\.\\d+)?\\b)",                                     // 8 números
    "(\\b[A-Za-z_]\\w*(?=\\s*\\())"                                 // 9 chamadas/definições de função
  ].join("|"), "gm");
  var classes = ["", "tk-c", "tk-c", "tk-s", "tk-p", "tk-s", "tk-k", "tk-t", "tk-n", "tk-f"];

  function esc(t) { return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  /* devolve o HTML com cada linha dentro de um <span class="lin"> */
  function realcar(texto) {
    var saida = "", ultimo = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(texto)) !== null) {
      saida += esc(texto.slice(ultimo, m.index));
      var cls = "";
      for (var g = 1; g < classes.length; g++) { if (m[g] !== undefined) { cls = classes[g]; break; } }
      /* tokens que ocupam várias linhas (comentários) viram um span por linha */
      saida += m[0].split("\n").map(function (p) { return "<span class='" + cls + "'>" + esc(p) + "</span>"; }).join("\n");
      ultimo = m.index + m[0].length;
      if (m[0].length === 0) { re.lastIndex++; }
    }
    saida += esc(texto.slice(ultimo));
    return saida.split("\n").map(function (l, i) {
      return "<span class='lin'><span class='n'>" + (i + 1) + "</span>" + l + "</span>";
    }).join("");
  }

  ED.codigo = {
    cache: {},
    carregar: function (url) {
      if (ED.codigo.cache[url]) { return Promise.resolve(ED.codigo.cache[url]); }
      return fetch(url).then(function (r) { return r.text(); }).then(function (t) {
        t = t.replace(/\r\n/g, "\n").replace(/\n$/, "");
        ED.codigo.cache[url] = t;
        return t;
      });
    },
    mostrar: function (pre, url) {
      return ED.codigo.carregar(url).then(function (t) {
        pre.querySelector("code").innerHTML = realcar(t);
        return t;
      }).catch(function () {
        pre.querySelector("code").textContent = "Não foi possível carregar " + url;
      });
    }
  };
})();
