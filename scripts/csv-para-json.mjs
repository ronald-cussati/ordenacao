/*
 * csv-para-json.mjs
 * Converte dados/resultados.csv (gerado pelo programa em C) em
 * public/data/resultados.json, que é o arquivo lido pelo site e pelo PDF.
 *
 * Uso:  node scripts/csv-para-json.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const csv = readFileSync(join(raiz, "dados", "resultados.csv"), "utf8").trim().split(/\r?\n/);
const maquinaArq = join(raiz, "dados", "maquina.json");
const maquina = existsSync(maquinaArq) ? JSON.parse(readFileSync(maquinaArq, "utf8")) : null;

const linhas = csv.slice(1).filter(Boolean).map((l) => {
  const [tipo, tamanho, algoritmo, repeticao, inicio, fim, ms] = l.split(",");
  return { tipo, tamanho: Number(tamanho), algoritmo, repeticao: Number(repeticao), inicio, fim, ms: Number(ms) };
});

// resumo: média, mínimo e máximo de cada combinação tipo + tamanho + algoritmo
const grupos = new Map();
for (const l of linhas) {
  const k = `${l.tipo}|${l.tamanho}|${l.algoritmo}`;
  if (!grupos.has(k)) grupos.set(k, []);
  grupos.get(k).push(l.ms);
}
const resumo = [...grupos].map(([k, v]) => {
  const [tipo, tamanho, algoritmo] = k.split("|");
  const soma = v.reduce((a, b) => a + b, 0);
  return {
    tipo, tamanho: Number(tamanho), algoritmo, reps: v.length,
    media: soma / v.length, min: Math.min(...v), max: Math.max(...v),
  };
});

const saida = { gerado_em: new Date().toISOString(), maquina, linhas, resumo };
mkdirSync(join(raiz, "public", "data"), { recursive: true });
writeFileSync(join(raiz, "public", "data", "resultados.json"), JSON.stringify(saida));
console.log(`OK: ${linhas.length} medições, ${resumo.length} combinações -> public/data/resultados.json`);
