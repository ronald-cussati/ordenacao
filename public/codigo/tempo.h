/*
 * tempo.h  -  Cronometro e horario
 * ---------------------------------------------------------------
 * agora_ms()      devolve o tempo atual em milissegundos
 * horario_atual() escreve a data e a hora do relogio em um texto
 */

#ifndef TEMPO_H
#define TEMPO_H

#include <stdio.h>
#include <time.h>

/* Para o cronometro de alta precisao no Windows */
#ifdef _WIN32
#include <windows.h>
#endif

/* Devolve o tempo atual em milissegundos (com casas decimais).
   Usamos o contador de alta resolucao do sistema porque a funcao
   clock() so enxerga ate 1 ms e, para 100 elementos, o tempo de
   ordenacao e muito menor que isso.
   Medimos antes e depois da chamada da funcao de ordenacao; a
   diferenca e o tempo de execucao. */
double agora_ms(void)
{
#ifdef _WIN32
    LARGE_INTEGER frequencia, contador;
    QueryPerformanceFrequency(&frequencia);
    QueryPerformanceCounter(&contador);
    return (double)contador.QuadPart * 1000.0 / (double)frequencia.QuadPart;
#else
    struct timespec t;
    clock_gettime(CLOCK_MONOTONIC, &t);
    return t.tv_sec * 1000.0 + t.tv_nsec / 1000000.0;
#endif
}

/* Escreve o horario do relogio (data e hora) no texto recebido.
   Serve para mostrar o INICIO e o FIM de cada ordenacao. */
void horario_atual(char texto[])
{
    time_t agora = time(NULL);
    struct tm *info = localtime(&agora);
    strftime(texto, 30, "%Y-%m-%d %H:%M:%S", info);
}

#endif
