/*
 * bubble_sort.h  -  Ordenacao por BOLHA
 * Autor: Thalys Cestari Thouzo
 * ---------------------------------------------------------------
 * Ideia: percorre o vetor comparando cada elemento com o vizinho da
 * direita. Se estiverem fora de ordem, troca. A cada passada o maior
 * elemento "sobe como uma bolha" ate o final do vetor.
 *
 * Esta e a versao basica, sem parada antecipada: sempre faz todas as
 * passadas. Por isso o numero de comparacoes e sempre O(n^2).
 */

#ifndef BUBBLE_SORT_H
#define BUBBLE_SORT_H

void bubble_sort(int v[], int n)
{
    int i, j;
    int aux;     /* variavel auxiliar para fazer a troca */

    /* cada passada i coloca o i-esimo maior elemento no seu lugar */
    for (i = 0; i < n - 1; i++)
    {
        /* os ultimos i elementos ja estao no lugar, entao nao precisa
           compara-los de novo */
        for (j = 0; j < n - 1 - i; j++)
        {
            if (v[j] > v[j + 1])
            {
                aux = v[j];
                v[j] = v[j + 1];
                v[j + 1] = aux;
            }
        }
    }
}

#endif
