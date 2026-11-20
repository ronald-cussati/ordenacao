/*
 * vetor.h  -  Funcoes para mexer nos vetores
 * ---------------------------------------------------------------
 * gerar_vetor()   preenche o vetor (aleatorio, crescente ou decrescente)
 * copiar_vetor()  copia um vetor para outro (backup e restauracao)
 * esta_ordenado() confere se o vetor ficou em ordem crescente
 */

#ifndef VETOR_H
#define VETOR_H

#include <stdlib.h>

/* Gera um numero aleatorio grande.
   rand() no Windows so vai ate 32767, entao juntamos duas chamadas
   para conseguir numeros de 0 ate 999999. */
int numero_aleatorio(void)
{
    long long x = (long long)rand() * 32768 + rand();
    return (int)(x % 1000000);
}

/* Preenche o vetor de acordo com o tipo escolhido:
   tipo 1 = aleatorio, tipo 2 = crescente, tipo 3 = decrescente */
void gerar_vetor(int v[], int n, int tipo)
{
    int i;

    for (i = 0; i < n; i++)
    {
        if (tipo == 1)
        {
            v[i] = numero_aleatorio();   /* sorteado */
        }
        else if (tipo == 2)
        {
            v[i] = i + 1;                /* 1, 2, 3, ... n   */
        }
        else
        {
            v[i] = n - i;                /* n, n-1, ... , 1  */
        }
    }
}

/* Copia o vetor "origem" para o vetor "destino".
   E usada para fazer o backup e para restaurar o vetor. */
void copiar_vetor(int origem[], int destino[], int n)
{
    int i;
    for (i = 0; i < n; i++)
    {
        destino[i] = origem[i];
    }
}

/* Confere se o vetor esta em ordem crescente.
   Devolve 1 se estiver ordenado e 0 se nao estiver.
   Esta conferencia acontece FORA da medicao de tempo. */
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
