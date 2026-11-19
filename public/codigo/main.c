/*
 * main.c  -  Programa de teste dos algoritmos de ordenacao
 * ---------------------------------------------------------------
 * Disciplina : Estrutura de Dados II  (Multivix - Sistemas de Informacao)
 * Trabalho   : Avaliacao pratica do 2o bimestre
 *
 * O que o programa faz:
 *   1) O usuario escolhe o TIPO do vetor (aleatorio, crescente ou
 *      decrescente) e o TAMANHO (100, 1.000, 10.000, 100.000 ou 1.000.000).
 *   2) O programa cria o vetor e guarda uma COPIA DE BACKUP dele.
 *   3) Para cada algoritmo (selection, insertion e bubble) o vetor de
 *      trabalho e restaurado a partir do backup, ou seja, os tres
 *      algoritmos ordenam EXATAMENTE os mesmos numeros.
 *   4) Mostra o nome do algoritmo, o horario de inicio, o horario de
 *      fim e o tempo gasto em milissegundos (ms).
 *
 * Opcao extra: a "bateria completa" roda todos os tipos e tamanhos e
 * grava os resultados no arquivo resultados.csv (usado no site).
 *
 * Como compilar (sem otimizacao, para o tempo ser o do algoritmo puro):
 *     gcc -O0 main.c -o ordenacao
 */

#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#include "sort.h"      /* nossa biblioteca com os 3 algoritmos */

/* Para o cronometro de alta precisao no Windows */
#ifdef _WIN32
#include <windows.h>
#endif

/* ---------- constantes ---------- */
#define QTD_TAMANHOS 5
#define QTD_TIPOS    3
#define QTD_ALGORITMOS 3

/* tamanhos pedidos no enunciado */
int tamanhos[QTD_TAMANHOS] = {100, 1000, 10000, 100000, 1000000};

/* nomes que aparecem na tela e no arquivo de resultados */
char *nomes_tipos[QTD_TIPOS] = {"aleatorio", "crescente", "decrescente"};
char *nomes_algoritmos[QTD_ALGORITMOS] = {"selection sort", "insertion sort", "bubble sort"};


/* ===============================================================
 * CRONOMETRO
 * Devolve o tempo atual em milissegundos (com casas decimais).
 * Usamos o contador de alta resolucao do sistema porque a funcao
 * clock() so enxerga ate 1 ms e, para 100 elementos, o tempo de
 * ordenacao e muito menor que isso.
 * Medimos antes e depois da chamada da funcao de ordenacao; a
 * diferenca e o tempo de execucao.
 * =============================================================== */
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


/* ===============================================================
 * FUNCOES DE VETOR
 * =============================================================== */

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


/* ===============================================================
 * EXECUCAO DE UM ALGORITMO
 * Chama o algoritmo escolhido e mede o tempo.
 * Preenche inicio e fim (texto) e devolve o tempo gasto em ms.
 * O tempo conta somente a chamada da funcao de ordenacao.
 * =============================================================== */
double executar_algoritmo(int algoritmo, int v[], int n, char inicio[], char fim[])
{
    double t_inicio, t_fim;

    horario_atual(inicio);
    t_inicio = agora_ms();           /* <<< comeca a contar */

    if (algoritmo == 0)
    {
        selection_sort(v, n);
    }
    else if (algoritmo == 1)
    {
        insertion_sort(v, n);
    }
    else
    {
        bubble_sort(v, n);
    }

    t_fim = agora_ms();              /* <<< para de contar */
    horario_atual(fim);

    return t_fim - t_inicio;
}


/* ===============================================================
 * TESTE COMPLETO DE UM TIPO E UM TAMANHO
 * - gera o vetor original (novo a cada repeticao)
 * - faz o backup
 * - restaura o backup antes de cada algoritmo
 * - mostra os tempos e, se csv != NULL, grava no arquivo
 * =============================================================== */
void testar(int tipo, int n, int repeticoes, FILE *csv)
{
    int *original;                         /* vetor gerado (fica de backup) */
    int *v;                                /* vetor que sera ordenado       */
    double soma[QTD_ALGORITMOS] = {0, 0, 0};
    double tempo;
    char inicio[30], fim[30];
    int r, a;

    /* aloca os dois vetores na memoria */
    original = (int *)malloc(n * sizeof(int));
    v = (int *)malloc(n * sizeof(int));
    if (original == NULL || v == NULL)
    {
        printf("Erro: memoria insuficiente para %d elementos.\n", n);
        return;
    }

    printf("\n--- vetor %s com %d elementos ---\n", nomes_tipos[tipo - 1], n);

    for (r = 1; r <= repeticoes; r++)
    {
        /* novo vetor a cada repeticao (no tipo aleatorio, e um novo sorteio) */
        gerar_vetor(original, n, tipo);

        if (repeticoes > 1)
        {
            printf("repeticao %d de %d\n", r, repeticoes);
        }

        for (a = 0; a < QTD_ALGORITMOS; a++)
        {
            /* restaura o vetor a partir do backup: os 3 algoritmos
               recebem exatamente os mesmos dados */
            copiar_vetor(original, v, n);

            tempo = executar_algoritmo(a, v, n, inicio, fim);
            soma[a] = soma[a] + tempo;

            /* saida no formato do enunciado + horarios de inicio e fim */
            printf("%s %.3f ms   (inicio %s | fim %s)\n",
                   nomes_algoritmos[a], tempo, inicio, fim);

            if (!esta_ordenado(v, n))
            {
                printf("ERRO: %s nao ordenou o vetor!\n", nomes_algoritmos[a]);
            }

            /* grava uma linha no arquivo: tipo,tamanho,algoritmo,repeticao,inicio,fim,ms */
            if (csv != NULL)
            {
                fprintf(csv, "%s,%d,%s,%d,%s,%s,%.3f\n",
                        nomes_tipos[tipo - 1], n, nomes_algoritmos[a], r,
                        inicio, fim, tempo);
                fflush(csv);   /* salva na hora, caso o teste demore horas */
            }
        }
    }

    /* quando houve varias repeticoes, mostra a media de cada algoritmo */
    if (repeticoes > 1)
    {
        printf("MEDIA de %d repeticoes:\n", repeticoes);
        for (a = 0; a < QTD_ALGORITMOS; a++)
        {
            printf("%s %.3f ms\n", nomes_algoritmos[a], soma[a] / repeticoes);
        }
    }

    free(original);
    free(v);
}

/* Quantas vezes repetir cada teste na bateria completa.
   Vetores pequenos sao muito rapidos, entao repetimos mais vezes para
   tirar uma media melhor. Vetores grandes demoram muito: poucas vezes. */
int repeticoes_padrao(int n)
{
    if (n <= 100)    return 20;
    if (n <= 1000)   return 10;
    if (n <= 10000)  return 5;
    if (n <= 100000) return 3;
    return 1;
}

/* Roda todos os tipos para os tamanhos informados e grava no CSV */
void bateria_completa(char nome_arquivo[], int lista[], int qtd)
{
    FILE *csv;
    int i, t;

    /* "a" = acrescenta no fim; se o arquivo for novo, escreve o cabecalho */
    csv = fopen(nome_arquivo, "r");
    if (csv == NULL)
    {
        csv = fopen(nome_arquivo, "w");
        if (csv == NULL)
        {
            printf("Nao foi possivel criar %s\n", nome_arquivo);
            return;
        }
        fprintf(csv, "tipo,tamanho,algoritmo,repeticao,inicio,fim,tempo_ms\n");
    }
    else
    {
        fclose(csv);
        csv = fopen(nome_arquivo, "a");
    }

    for (i = 0; i < qtd; i++)
    {
        for (t = 1; t <= QTD_TIPOS; t++)
        {
            testar(t, lista[i], repeticoes_padrao(lista[i]), csv);
        }
    }

    fclose(csv);
    printf("\nResultados gravados em %s\n", nome_arquivo);
}


/* Le um numero inteiro digitado pelo usuario.
   Se o usuario digitar letras, avisa e pede de novo (evita travar o programa).
   Se a entrada acabar (fim do arquivo), devolve 0 para o programa encerrar. */
int ler_inteiro(void)
{
    int numero, c;

    while (scanf("%d", &numero) != 1)
    {
        if (feof(stdin))
        {
            return 0;
        }
        printf("Digite apenas numeros: ");
        /* descarta o que foi digitado errado ate o fim da linha */
        while ((c = getchar()) != '\n' && c != EOF)
        {
            ;
        }
    }
    return numero;
}


/* ===============================================================
 * PROGRAMA PRINCIPAL (menu)
 * =============================================================== */
int main(int argc, char *argv[])
{
    int opcao, tipo, op_tamanho, n, repeticoes, i;
    int lista[QTD_TAMANHOS];

    /* semente do gerador de numeros aleatorios: muda a cada execucao */
    srand((unsigned int)time(NULL));

    /* Modo direto (usado para rodar a bateria sem menu):
       ordenacao --bateria arquivo.csv 100 1000 10000 ... */
    if (argc >= 4 && argv[1][0] == '-' && argv[1][1] == '-' && argv[1][2] == 'b')
    {
        for (i = 3; i < argc && i - 3 < QTD_TAMANHOS; i++)
        {
            lista[i - 3] = atoi(argv[i]);
        }
        bateria_completa(argv[2], lista, i - 3);
        return 0;
    }

    do
    {
        printf("\n==============================================\n");
        printf("  ORDENACAO: selection, insertion e bubble sort\n");
        printf("==============================================\n");
        printf("1 - Executar um teste\n");
        printf("2 - Bateria completa (grava resultados.csv)\n");
        printf("0 - Sair\n");
        printf("Escolha: ");
        opcao = ler_inteiro();

        if (opcao == 1)
        {
            printf("\nTipo do vetor:\n");
            printf("1 - aleatorio\n2 - crescente\n3 - decrescente\n");
            printf("Escolha: ");
            tipo = ler_inteiro();

            printf("\nTamanho do vetor:\n");
            for (i = 0; i < QTD_TAMANHOS; i++)
            {
                printf("%d - %d elementos\n", i + 1, tamanhos[i]);
            }
            printf("Escolha: ");
            op_tamanho = ler_inteiro();

            printf("\nQuantas repeticoes (para tirar a media)? ");
            repeticoes = ler_inteiro();

            if (tipo < 1 || tipo > 3 || op_tamanho < 1 || op_tamanho > QTD_TAMANHOS || repeticoes < 1)
            {
                printf("\nOpcao invalida!\n");
            }
            else
            {
                n = tamanhos[op_tamanho - 1];
                if (n >= 100000)
                {
                    printf("\nAtencao: com %d elementos pode demorar de minutos a horas.\n", n);
                }
                testar(tipo, n, repeticoes, NULL);
            }
        }
        else if (opcao == 2)
        {
            for (i = 0; i < QTD_TAMANHOS; i++)
            {
                lista[i] = tamanhos[i];
            }
            printf("\nA bateria completa com 1.000.000 de elementos pode levar varias horas.\n");
            bateria_completa("resultados.csv", lista, QTD_TAMANHOS);
        }
        else if (opcao != 0)
        {
            printf("\nOpcao invalida!\n");
        }

    } while (opcao != 0);

    printf("\nPrograma encerrado.\n");
    return 0;
}
