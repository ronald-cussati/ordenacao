/*
 * sort.h  -  Biblioteca de ordenacao
 * ---------------------------------------------------------------
 * Disciplina : Estrutura de Dados II  (Multivix - Sistemas de Informacao)
 * Trabalho   : Avaliacao pratica do 2o bimestre
 *
 * Este arquivo junta os tres algoritmos de ordenacao. Cada um fica
 * no seu proprio arquivo, para ficar mais facil de ler:
 *
 *     selection_sort.h   ->  void selection_sort(int v[], int n)
 *     insertion_sort.h   ->  void insertion_sort(int v[], int n)
 *     bubble_sort.h      ->  void bubble_sort(int v[], int n)
 *
 * Todos ordenam um vetor de INTEIROS em ordem CRESCENTE.
 *     v[] -> o vetor que sera ordenado
 *     n   -> a quantidade de elementos do vetor
 *
 * Para usar, basta escrever  #include "sort.h"  no programa.
 */

#ifndef SORT_H
#define SORT_H

#include "selection_sort.h"
#include "insertion_sort.h"
#include "bubble_sort.h"

#endif
