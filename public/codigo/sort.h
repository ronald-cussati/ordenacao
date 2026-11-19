/*
 * sort.h  -  Biblioteca de ordenacao
 * ---------------------------------------------------------------
 * Disciplina : Estrutura de Dados I  (Multivix - Sistemas de Informacao)
 * Trabalho   : Avaliacao pratica do 2o bimestre
 *
 * Este arquivo reune os tres algoritmos de ordenacao vistos em sala:
 *     1) selection sort  (ordenacao por selecao)
 *     2) insertion sort  (ordenacao por insercao)
 *     3) bubble sort     (ordenacao por bolha)
 *
 * Todos ordenam um vetor de numeros INTEIROS em ordem CRESCENTE.
 * Os tres recebem os mesmos parametros:
 *     v[] -> o vetor que sera ordenado
 *     n   -> a quantidade de elementos do vetor
 *
 * Os algoritmos foram escritos da forma mais simples possivel
 * (sem nenhuma "esperteza" de otimizacao), exatamente como aparecem
 * nos livros, para que o tempo medido seja o tempo real do algoritmo.
 */

#ifndef SORT_H
#define SORT_H


/* ---------------------------------------------------------------
 * SELECTION SORT
 * Ideia: a cada passada procura o MENOR elemento da parte que ainda
 * nao foi ordenada e coloca ele na primeira posicao dessa parte.
 *
 * Complexidade: sempre O(n^2) comparacoes, nao importa como o vetor
 * esta organizado (melhor, medio e pior caso sao iguais).
 * Trocas: no maximo n-1.
 * --------------------------------------------------------------- */
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


/* ---------------------------------------------------------------
 * INSERTION SORT
 * Ideia: funciona como ordenar cartas de baralho na mao. Pega o
 * proximo elemento (a "chave") e "empurra" os maiores que ele para
 * a direita ate achar o lugar certo dentro da parte ja ordenada.
 *
 * Melhor caso (vetor ja crescente) : O(n)
 * Medio e pior caso (decrescente)  : O(n^2)
 * --------------------------------------------------------------- */
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


/* ---------------------------------------------------------------
 * BUBBLE SORT
 * Ideia: percorre o vetor comparando cada elemento com o vizinho da
 * direita. Se estiverem fora de ordem, troca. A cada passada o maior
 * elemento "sobe como uma bolha" ate o final do vetor.
 *
 * Esta e a versao basica, sem parada antecipada: sempre faz todas as
 * passadas. Por isso o numero de comparacoes e sempre O(n^2).
 * --------------------------------------------------------------- */
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

#endif /* SORT_H */
