/*
 * main.c  -  Programa principal (menu)
 * ---------------------------------------------------------------
 * Disciplina : Estrutura de Dados II  (Multivix - Sistemas de Informacao)
 * Trabalho   : Avaliacao pratica do 2o bimestre
 *
 * O usuario escolhe o TIPO do vetor (aleatorio, crescente ou
 * decrescente) e o TAMANHO (100, 1.000, 10.000, 100.000 ou 1.000.000).
 * O programa gera o vetor, guarda um backup e testa os tres algoritmos
 * mostrando o horario de inicio, o de fim e o tempo em milissegundos.
 *
 * Arquivos do projeto:
 *     sort.h      -> junta os 3 algoritmos (cada um em seu arquivo)
 *     vetor.h     -> gerar, copiar (backup) e conferir o vetor
 *     tempo.h     -> cronometro e horario
 *     teste.h     -> executa os testes e grava o CSV
 *
 * Como compilar (sem otimizacao, para o tempo ser o do algoritmo puro):
 *     gcc -O0 main.c -o ordenacao
 */

#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#include "teste.h"


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
