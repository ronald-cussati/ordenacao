/* teste.h - executa os testes e grava o resultados.csv

   Como cada teste funciona:
   1) gera o vetor original (ele fica guardado como backup)
   2) antes de cada algoritmo copia o backup para o vetor de trabalho,
      assim os tres ordenam exatamente os mesmos numeros
   3) mostra o nome, o horario de inicio, o de fim e o tempo em ms */

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

int tamanhos[QTD_TAMANHOS] = {100, 1000, 10000, 100000, 1000000};

char *nomes_tipos[QTD_TIPOS] = {"aleatorio", "crescente", "decrescente"};
char *nomes_algoritmos[QTD_ALGORITMOS] = {"selection sort", "insertion sort", "bubble sort"};


/* chama o algoritmo (0 = selection, 1 = insertion, 2 = bubble) e devolve
   o tempo em ms. So conta a chamada da funcao de ordenacao. */
double executar_algoritmo(int algoritmo, int v[], int n, char inicio[], char fim[])
{
    double t_inicio, t_fim;

    horario_atual(inicio);
    t_inicio = agora_ms();           /* comeca a contar */

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

    t_fim = agora_ms();              /* para de contar */
    horario_atual(fim);

    return t_fim - t_inicio;
}


/* teste de um tipo de vetor (1, 2 ou 3) e um tamanho.
   Se csv nao for NULL, grava cada medicao no arquivo. */
void testar(int tipo, int n, int repeticoes, FILE *csv)
{
    int *original;                         /* vetor gerado (backup) */
    int *v;                                /* vetor que sera ordenado */
    double soma[QTD_ALGORITMOS] = {0, 0, 0};
    double tempo;
    char inicio[30], fim[30];
    int r, a;

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
        /* vetor novo a cada repeticao */
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

            printf("%s %.3f ms   (inicio %s | fim %s)\n",
                   nomes_algoritmos[a], tempo, inicio, fim);

            if (!esta_ordenado(v, n))
            {
                printf("ERRO: %s nao ordenou o vetor!\n", nomes_algoritmos[a]);
            }

            /* linha do csv: tipo,tamanho,algoritmo,repeticao,inicio,fim,ms */
            if (csv != NULL)
            {
                fprintf(csv, "%s,%d,%s,%d,%s,%s,%.3f\n",
                        nomes_tipos[tipo - 1], n, nomes_algoritmos[a], r,
                        inicio, fim, tempo);
                fflush(csv);   /* salva na hora, o teste pode demorar horas */
            }
        }
    }

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


/* vetores pequenos sao muito rapidos, entao repete mais vezes para
   tirar uma media melhor. Os grandes demoram muito: so uma vez. */
int repeticoes_padrao(int n)
{
    if (n <= 100)    return 20;
    if (n <= 1000)   return 10;
    if (n <= 10000)  return 5;
    if (n <= 100000) return 3;
    return 1;
}


/* roda todos os tipos para os tamanhos da lista e grava no csv */
void bateria_completa(char nome_arquivo[], int lista[], int qtd)
{
    FILE *csv;
    int i, t;

    /* se o arquivo nao existe, cria com o cabecalho; se existe, continua no fim */
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
