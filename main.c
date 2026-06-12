#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <stdbool.h>

#include "analyzer.h"   // Provides AppStats, analyze_file, HashTable, Node, etc.

#define HASH_TABLE_SIZE 4096

// ---- Command-line options struct ----
typedef struct {
    bool show_overall_stats;
    bool show_char_freq;
    bool show_word_freq;
} AnalysisOptions;

// ---- Function prototypes ----
void print_report(const AppStats *stats, const AnalysisOptions *options);
void print_char_frequency(int counts[]);
void print_sorted_word_frequency(HashTable *word_counts);

// ---- MAIN ----
int main(int argc, char *argv[]) {
    if (argc < 2) {
        fprintf(stderr, "Usage: %s [options] <filename>\n", argv[0]);
        fprintf(stderr, "Options:\n");
        fprintf(stderr, "  -c, -w, -l    Show overall statistics (characters, words, lines).\n");
        fprintf(stderr, "  --freq        Show character and word frequency tables.\n");
        fprintf(stderr, "If no options are specified, the full report is shown.\n");
        exit(EXIT_FAILURE);
    }

    AnalysisOptions options = { false, false, false };
    bool any_option_set = false;
    char *filename = NULL;

    // Parse arguments
    for (int i = 1; i < argc; i++) {
        char *arg = argv[i];
        if (strcmp(arg, "-c") == 0 || strcmp(arg, "-w") == 0 || strcmp(arg, "-l") == 0) {
            options.show_overall_stats = true;
            any_option_set = true;
        } else if (strcmp(arg, "--freq") == 0) {
            options.show_char_freq = true;
            options.show_word_freq = true;
            any_option_set = true;
        } else if (arg[0] == '-') {
            fprintf(stderr, "Error: Unknown option '%s'\n", arg);
            exit(EXIT_FAILURE);
        } else {
            if (filename != NULL) {
                fprintf(stderr, "Error: Multiple filenames provided. Please specify only one.\n");
                exit(EXIT_FAILURE);
            }
            filename = arg;
        }
    }

    if (filename == NULL) {
        fprintf(stderr, "Error: No filename specified.\n");
        exit(EXIT_FAILURE);
    }

    if (!any_option_set) {
        options.show_overall_stats = true;
        options.show_char_freq = true;
        options.show_word_freq = true;
    }

    // Setup data structures
    int main_char_freq[256];
    memset(main_char_freq, 0, sizeof(main_char_freq));

    HashTable *word_counts = create_hash_table(HASH_TABLE_SIZE);
    if (word_counts == NULL) {
        fprintf(stderr, "Fatal: Could not create hash table.\n");
        exit(EXIT_FAILURE);
    }

    AppStats stats = {0};
    stats.filename = filename;
    stats.char_freq = main_char_freq;
    stats.word_counts = word_counts;

    if (analyze_file(&stats) != 0) {
        fprintf(stderr, "Analysis failed for file: %s\n", filename);
        free_hash_table(word_counts);
        exit(EXIT_FAILURE);
    }

    print_report(&stats, &options);
    free_hash_table(stats.word_counts);

    return 0;
}

// ---- REPORTING FUNCTIONS ----
void print_report(const AppStats *stats, const AnalysisOptions *options) {
    printf("--- Analysis Report for %s ---\n\n", stats->filename);

    if (options->show_overall_stats) {
        printf("Overall Statistics:\n");
        printf("Total Characters:\t%lld\n", stats->char_count);
        printf("Total Words:\t\t%d\n", stats->word_count);
        printf("Total Lines:\t\t%d\n\n", stats->line_count);
    }

    if (options->show_char_freq) {
        printf("Character Frequency:\n");
        print_char_frequency(stats->char_freq);
        printf("\n");
    }

    if (options->show_word_freq) {
        printf("Word Frequency (sorted by count):\n");
        print_sorted_word_frequency(stats->word_counts);
    }
}

void print_char_frequency(int counts[]) {
    printf("\n--- Character Frequencies ---\n");
    for (int i = 0; i < 256; i++) {
        if (counts[i] > 0 && isprint(i)) {
            printf("'%c' : %d\n", i, counts[i]);
        }
    }
}

// ---- SORTED WORD FREQUENCY ----
typedef struct {
    char *word;
    int count;
} WordEntry;

int compare_word_entries(const void *a, const void *b) {
    const WordEntry *wa = (const WordEntry *)a;
    const WordEntry *wb = (const WordEntry *)b;
    // Sort descending by count, then alphabetically
    if (wb->count != wa->count) {
        return wb->count - wa->count;
    }
    return strcmp(wa->word, wb->word);
}

void print_sorted_word_frequency(HashTable *word_counts) {
    int capacity = 1024;
    int size = 0;
    WordEntry *entries = malloc(capacity * sizeof(WordEntry));
    if (!entries) {
        fprintf(stderr, "Memory allocation failed for word frequency sorting.\n");
        return;
    }

    // Collect words from hash table
    for (int i = 0; i < word_counts->size; i++) {
        Node *current = word_counts->table[i];
        while (current != NULL) {
            if (size >= capacity) {
                capacity *= 2;
                entries = realloc(entries, capacity * sizeof(WordEntry));
                if (!entries) {
                    fprintf(stderr, "Memory reallocation failed.\n");
                    return;
                }
            }
            entries[size].word = current->word;
            entries[size].count = current->count;
            size++;
            current = current->next;
        }
    }

    // Sort entries
    qsort(entries, size, sizeof(WordEntry), compare_word_entries);

    // Print sorted list
    for (int i = 0; i < size; i++) {
        printf("  %-20s %d\n", entries[i].word, entries[i].count);
    }

    free(entries);
}
