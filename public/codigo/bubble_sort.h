/* bubble_sort.h - ordenacao por bolha
   Responsavel: Thalys Cestari Thouzo */

#ifndef BUBBLE_SORT_H
#define BUBBLE_SORT_H

/* Compara cada elemento com o vizinho da direita e troca se estiverem
   fora de ordem. A cada passada o maior elemento vai para o final.
   Versao basica, sem parar antes: sempre O(n^2). */
void bubble_sort(int v[], int n)
{
    int i, j;
    int aux;

    for (i = 0; i < n - 1; i++)
    {
        /* os ultimos i ja estao no lugar */
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
