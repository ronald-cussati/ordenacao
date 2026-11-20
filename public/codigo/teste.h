/*
 * teste.h  -  Execucao dos testes
 * ---------------------------------------------------------------
 * executar_algoritmo()  chama um algoritmo e mede o tempo
 * testar()              teste de um tipo de vetor e um tamanho
 * bateria_completa()    roda todos os tipos e grava o resultados.csv
 *
 * Fluxo de cada teste:
 *   1) gera o vetor original (e ele fica guardado como BACKUP)
 *   2) antes de cada algoritmo, copia o backup para o vetor de trabalho
 *      (assim os tres algoritmos ordenam exatamente os mesmos numeros)
 *   3) mostra nome, horario de inicio, horario de fim e tempo em ms
 */

#ifndef TESTE_H
#define TESTE_H

#include <stdio.h>
#include <stdlib.h>

#include "sort.h"
#include "tempo.h"
#include "vetor.h"

#define QTD_TAMANHOS   5
#define QTD_TIPOS      3
#define QTD_ALGORITMOS 3

/* tamanhos pedidos no enunciado */
int tamanhos[QTD_TAMANHOS] = {100, 1000, 10000, 100000, 1000000};

/* nomes que aparecem na tela e no arquivo de resultados */
char *nomes_tipos[QTD_TIPOS] = {"aleatorio", "crescente", "decrescente"};
char *nomes_algoritmos[QTD_ALGORITMOS] = {"selection sort", "insertion sort", "bubble sort"};


/* Chama o algoritmo escolhido (0 = selection, 1 = insertion, 2 = bubble)
   e mede o tempo. Preenche inicio e fim (texto) e devolve o tempo em ms.
   O tempo conta somente a chamada da funcao de ordenacao. */
double executar_algoritmo(int algoritmo, int v[], int n, char inicio[], char fim[])
{
    double t_inicio, t_fim;

    horario_atual(inicio);
    t_inicio = agora_ms();           /* <<< comeca a contar */

    if (algoritmo == 0)
    {
        selection_sort(v, n);
    }
    else if (algoritmo == 1)
    {
        insertion_sort(v, n);
    }
    else
    {
        bubble_sort(v, n);
    }

    t_fim = agora_ms();              /* <<< para de contar */
    horario_atual(fim);

    return t_fim - t_inicio;
}


/* Teste completo de um tipo (1, 2 ou 3) e um tamanho.
   Se csv != NULL, grava cada medicao no arquivo. */
void testar(int tipo, int n, int repeticoes, FILE *csv)
{
    int *original;                         /* vetor gerado (fica de backup) */
    int *v;                                /* vetor que sera ordenado       */
    double soma[QTD_ALGORITMOS] = {0, 0, 0};
    double tempo;
    char inicio[30], fim[30];
    int r, a;

    /* aloca os dois vetores na memoria */
    original = (int *)malloc(n * sizeof(int));
    v = (int *)malloc(n * sizeof(int));
    if (original == NULL || v == NULL)
    {
        printf("Erro: memoria insuficiente para %d elementos.\n", n);
        return;
    }

    printf("\n--- vetor %s com %d elementos ---\n", nomes_tipos[tipo - 1], n);

    for (r = 1; r <= repeticoes; r++)
    {
        /* novo vetor a cada repeticao (no tipo aleatorio, e um novo sorteio) */
        gerar_vetor(original, n, tipo);

        if (repeticoes > 1)
        {
            printf("repeticao %d de %d\n", r, repeticoes);
        }

        for (a = 0; a < QTD_ALGORITMOS; a++)
        {
            /* restaura o vetor a partir do backup */
            copiar_vetor(original, v, n);

            tempo = executar_algoritmo(a, v, n, inicio, fim);
            soma[a] = soma[a] + tempo;

            /* saida no formato do enunciado + horarios de inicio e fim */
            printf("%s %.3f ms   (inicio %s | fim %s)\n",
                   nomes_algoritmos[a], tempo, inicio, fim);

            if (!esta_ordenado(v, n))
            {
                printf("ERRO: %s nao ordenou o vetor!\n", nomes_algoritmos[a]);
            }

            /* grava uma linha no arquivo: tipo,tamanho,algoritmo,repeticao,inicio,fim,ms */
            if (csv != NULL)
            {
                fprintf(csv, "%s,%d,%s,%d,%s,%s,%.3f\n",
                        nomes_tipos[tipo - 1], n, nomes_algoritmos[a], r,
                        inicio, fim, tempo);
                fflush(csv);   /* salva na hora, caso o teste demore horas */
            }
        }
    }

    /* quando houve varias repeticoes, mostra a media de cada algoritmo */
    if (repeticoes > 1)
    {
        printf("MEDIA de %d repeticoes:\n", repeticoes);
        for (a = 0; a < QTD_ALGORITMOS; a++)
        {
            printf("%s %.3f ms\n", nomes_algoritmos[a], soma[a] / repeticoes);
        }
    }

    free(original);
    free(v);
}


/* Quantas vezes repetir cada teste na bateria completa.
   Vetores pequenos sao muito rapidos, entao repetimos mais vezes para
   tirar uma media melhor. Vetores grandes demoram muito: poucas vezes. */
int repeticoes_padrao(int n)
{
    if (n <= 100)    return 20;
    if (n <= 1000)   return 10;
    if (n <= 10000)  return 5;
    if (n <= 100000) return 3;
    return 1;
}


/* Roda todos os tipos para os tamanhos informados e grava no CSV */
void bateria_completa(char nome_arquivo[], int lista[], int qtd)
{
    FILE *csv;
    int i, t;

    /* se o arquivo ainda nao existe, cria e escreve o cabecalho;
       se ja existe, acrescenta no fim */
    csv = fopen(nome_arquivo, "r");
    if (csv == NULL)
    {
        csv = fopen(nome_arquivo, "w");
        if (csv == NULL)
        {
            printf("Nao foi possivel criar %s\n", nome_arquivo);
            return;
        }
        fprintf(csv, "tipo,tamanho,algoritmo,repeticao,inicio,fim,tempo_ms\n");
    }
    else
    {
        fclose(csv);
        csv = fopen(nome_arquivo, "a");
    }

    for (i = 0; i < qtd; i++)
    {
        for (t = 1; t <= QTD_TIPOS; t++)
        {
            testar(t, lista[i], repeticoes_padrao(lista[i]), csv);
        }
    }

    fclose(csv);
    printf("\nResultados gravados em %s\n", nome_arquivo);
}

#endif
