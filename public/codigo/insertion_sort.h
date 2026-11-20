/* insertion_sort.h - ordenacao por insercao
   Responsavel: Ronald Cussati Cesar da Fonseca */

#ifndef INSERTION_SORT_H
#define INSERTION_SORT_H

/* Pega um elemento de cada vez (a chave) e coloca ele no lugar certo
   dentro da parte que ja esta ordenada, empurrando os maiores para a direita.
   Melhor caso (vetor crescente): O(n). Pior caso (decrescente): O(n^2). */
void insertion_sort(int v[], int n)
{
    int i, j;
    int chave;

    for (i = 1; i < n; i++)
    {
        chave = v[i];
        j = i - 1;

        while (j >= 0 && v[j] > chave)
        {
            v[j + 1] = v[j];
            j--;
        }

        v[j + 1] = chave;
    }
}

#endif
