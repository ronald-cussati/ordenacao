/* selection_sort.h - ordenacao por selecao
   Responsavel: Alvino Mainette Santos */

#ifndef SELECTION_SORT_H
#define SELECTION_SORT_H

/* A cada passada procura o menor elemento da parte que falta ordenar
   e coloca ele na primeira posicao dessa parte.
   Sempre faz O(n^2) comparacoes, mesmo se o vetor ja estiver ordenado. */
void selection_sort(int v[], int n)
{
    int i, j;
    int menor;   /* posicao do menor valor encontrado */
    int aux;

    for (i = 0; i < n - 1; i++)
    {
        menor = i;

        for (j = i + 1; j < n; j++)
        {
            if (v[j] < v[menor])
            {
                menor = j;
            }
        }

        /* troca o menor com v[i] */
        if (menor != i)
        {
            aux = v[i];
            v[i] = v[menor];
            v[menor] = aux;
        }
    }
}

#endif
