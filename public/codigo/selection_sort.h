/*
 * selection_sort.h  -  Ordenacao por SELECAO
 * Autor: Alvino Mainette Santos
 * ---------------------------------------------------------------
 * Ideia: a cada passada procura o MENOR elemento da parte que ainda
 * nao foi ordenada e coloca ele na primeira posicao dessa parte.
 *
 * Complexidade: sempre O(n^2) comparacoes, nao importa como o vetor
 * esta organizado (melhor, medio e pior caso sao iguais).
 * Trocas: no maximo n-1.
 */

#ifndef SELECTION_SORT_H
#define SELECTION_SORT_H

void selection_sort(int v[], int n)
{
    int i, j;
    int menor;   /* posicao do menor elemento encontrado ate agora */
    int aux;     /* variavel auxiliar para fazer a troca           */

    /* i marca onde termina a parte ja ordenada */
    for (i = 0; i < n - 1; i++)
    {
        menor = i;

        /* procura o menor valor entre as posicoes i+1 ... n-1 */
        for (j = i + 1; j < n; j++)
        {
            if (v[j] < v[menor])
            {
                menor = j;
            }
        }

        /* se achou um valor menor que v[i], troca os dois de lugar */
        if (menor != i)
        {
            aux = v[i];
            v[i] = v[menor];
            v[menor] = aux;
        }
    }
}

#endif
