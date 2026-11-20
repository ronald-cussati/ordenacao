/* vetor.h - funcoes para gerar, copiar e conferir o vetor */

#ifndef VETOR_H
#define VETOR_H

#include <stdlib.h>

/* rand() no Windows so vai ate 32767, entao junta duas chamadas
   para sortear numeros de 0 ate 999999 */
int numero_aleatorio(void)
{
    long long x = (long long)rand() * 32768 + rand();
    return (int)(x % 1000000);
}

/* tipo 1 = aleatorio, 2 = crescente, 3 = decrescente */
void gerar_vetor(int v[], int n, int tipo)
{
    int i;

    for (i = 0; i < n; i++)
    {
        if (tipo == 1)
        {
            v[i] = numero_aleatorio();
        }
        else if (tipo == 2)
        {
            v[i] = i + 1;
        }
        else
        {
            v[i] = n - i;
        }
    }
}

/* usada para fazer o backup e para restaurar o vetor */
void copiar_vetor(int origem[], int destino[], int n)
{
    int i;
    for (i = 0; i < n; i++)
    {
        destino[i] = origem[i];
    }
}

/* devolve 1 se o vetor esta em ordem crescente, 0 se nao esta */
int esta_ordenado(int v[], int n)
{
    int i;
    for (i = 0; i < n - 1; i++)
    {
        if (v[i] > v[i + 1])
        {
            return 0;
        }
    }
    return 1;
}

#endif
