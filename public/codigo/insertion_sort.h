/*
 * insertion_sort.h  -  Ordenacao por INSERCAO
 * Autor: Ronald Cussati Cesar da Fonseca
 * ---------------------------------------------------------------
 * Ideia: funciona como ordenar cartas de baralho na mao. Pega o
 * proximo elemento (a "chave") e "empurra" os maiores que ele para
 * a direita ate achar o lugar certo dentro da parte ja ordenada.
 *
 * Melhor caso (vetor ja crescente) : O(n)
 * Medio e pior caso (decrescente)  : O(n^2)
 */

#ifndef INSERTION_SORT_H
#define INSERTION_SORT_H

void insertion_sort(int v[], int n)
{
    int i, j;
    int chave;   /* elemento que sera inserido na parte ordenada */

    for (i = 1; i < n; i++)
    {
        chave = v[i];
        j = i - 1;

        /* anda para tras enquanto os elementos forem maiores que a chave,
           deslocando cada um deles uma posicao para a direita */
        while (j >= 0 && v[j] > chave)
        {
            v[j + 1] = v[j];
            j--;
        }

        /* achou o lugar: coloca a chave nele */
        v[j + 1] = chave;
    }
}

#endif
