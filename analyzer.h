#ifndef ANALYZER_H
#define ANALYZER_H
#include "hashtable.h"


typedef struct {
    const char *filename;
    long long char_count;
    int word_count;
    int line_count;
    int *char_freq;
    HashTable *word_counts;
} AppStats;

int analyze_file(AppStats *stats);

#endif // ANALYZER_H