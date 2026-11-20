# Ordenação: selection sort, insertion sort e bubble sort

Estrutura de Dados II · Multivix · Sistemas de Informação
Avaliação prática do 2º bimestre

## Arquivos

| Arquivo | O que tem | Responsável |
|---|---|---|
| `selection_sort.h` | ordenação por seleção | Alvino Mainette Santos |
| `insertion_sort.h` | ordenação por inserção | Ronald Cussati Cesar da Fonseca |
| `bubble_sort.h` | ordenação por bolha | Thalys Cestari Thouzo |
| `sort.h` | junta os três algoritmos (`#include`) | grupo |
| `vetor.h` | gerar o vetor, fazer backup, conferir se ordenou | grupo |
| `tempo.h` | cronômetro (ms) e horário de início/fim | grupo |
| `teste.h` | executa os testes e grava o CSV | grupo |
| `main.c` | menu do programa | grupo |

## Como compilar

Sem otimização, para o tempo ser o do algoritmo puro:

```
gcc -O0 main.c -o ordenacao
```

No Windows o resultado é `ordenacao.exe`. Em Dev-C++ ou Code::Blocks, crie um
projeto com todos os arquivos na mesma pasta e desligue a otimização do compilador.

## Como usar

1. Execute o programa e escolha `1 - Executar um teste`.
2. Escolha o tipo do vetor (aleatório, crescente ou decrescente).
3. Escolha o tamanho (100, 1.000, 10.000, 100.000 ou 1.000.000).
4. Informe quantas repetições quer (a tela mostra a média no final).

Bateria completa (grava um CSV com todas as medições):

```
ordenacao --bateria resultados.csv 100 1000 10000 100000 1000000
```

## Como o teste funciona

1. O vetor é gerado e uma cópia fica guardada como **backup**.
2. Antes de cada algoritmo o backup é copiado para o vetor de trabalho,
   então os três ordenam exatamente os mesmos números.
3. O tempo é medido só na chamada da função de ordenação.
4. A tela mostra o nome, o horário de início, o horário de fim e o tempo em ms.

Feche os outros programas durante o teste. Com 1.000.000 de elementos cada
algoritmo leva de vários minutos a dezenas de minutos.
