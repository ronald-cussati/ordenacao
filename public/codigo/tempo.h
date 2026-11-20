/* tempo.h - cronometro e horario */

#ifndef TEMPO_H
#define TEMPO_H

#include <stdio.h>
#include <time.h>

#ifdef _WIN32
#include <windows.h>
#endif

/* Devolve o tempo atual em milissegundos.
   Nao usei clock() porque ele so enxerga ate 1 ms e, com 100 elementos,
   a ordenacao leva bem menos que isso. */
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

/* escreve a data e a hora atual no texto (para mostrar inicio e fim) */
void horario_atual(char texto[])
{
    time_t agora = time(NULL);
    struct tm *info = localtime(&agora);
    strftime(texto, 30, "%Y-%m-%d %H:%M:%S", info);
}

#endif
