# Algoritmos de Ordenação — Estrutura de Dados II

Trabalho prático do 2º bimestre (Multivix · Sistemas de Informação · 2026/2).
Implementação em **C** do *selection sort*, *insertion sort* e *bubble sort*, com avaliação
empírica de tempo (ms) para vetores de 100 a 1.000.000 de elementos
(aleatórios, crescentes e decrescentes), publicada como site estático.

## Estrutura

```
public/                  ← o site (é a pasta que a Vercel publica)
  index.html             página inicial: visualizador, simulador, resultados, código
  documentacao.html      documentação completa (vira o PDF)
  codigo/sort.h          biblioteca com os 3 algoritmos
  codigo/main.c          programa de teste (menu, backup, cronômetro, CSV)
  data/resultados.json   medições (geradas do CSV)
  downloads/             PDF do grupo e ZIP do código
  js/config.js           ← nomes dos integrantes, turma, link do GitHub
dados/
  resultados.csv         medições originais gravadas pelo programa em C
  maquina.json           descrição da máquina e do compilador usados
scripts/
  csv-para-json.mjs      CSV → JSON do site
  gerar-pdf.ps1          atualiza JSON, ZIP e gera o PDF da documentação
vercel.json              configuração de publicação
```

## Programa em C

```bash
cd public/codigo
gcc -O0 main.c -o ordenacao        # -O0 = sem otimização (tempo do algoritmo puro)
./ordenacao                        # menu interativo
./ordenacao --bateria resultados.csv 100 1000 10000 100000 1000000
```

Os três algoritmos estão em `sort.h`. O tempo é medido da chamada da função de ordenação
até o seu término; o programa mostra o nome do algoritmo, o horário de início, o de fim e o
tempo em ms. Para os testes valerem, **feche outros programas** durante a execução.

## Atualizar resultados e PDF

1. Rode a bateria (comando acima) e copie o CSV para `dados/resultados.csv`.
2. Edite `public/js/config.js` (nomes, turma) e `dados/maquina.json` (hardware/compilador).
3. Rode:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\gerar-pdf.ps1
```

## Testar localmente

```bash
python -m http.server 8000 --directory public
# abra http://localhost:8000
```

## Publicar (GitHub + Vercel)

1. Crie um repositório no GitHub e envie esta pasta (`git init`, `git add .`, `git commit`, `git push`).
2. Em <https://vercel.com/new> importe o repositório. Não precisa de build:
   o `vercel.json` já aponta `outputDirectory` para `public`.
3. A cada `git push` o site é atualizado sozinho.
