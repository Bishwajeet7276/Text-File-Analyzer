#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include "analyzer.h"

#define MAX_WORD_LEN 256

int analyze_file(AppStats *stats) {
    FILE *file = fopen(stats->filename, "r");
    if (!file) {
        perror("Error opening file");
        return -1;
    }

    stats->char_count = 0;
    stats->word_count = 0;
    stats->line_count = 0;

    int c;
    int last_c = '\n'; // Default to newline to handle files correctly
    char word_buf[MAX_WORD_LEN];
    int word_len = 0;

    while ((c = fgetc(file)) != EOF) {
        stats->char_count++;

        // Update character frequency
        if (c >= 0 && c < 256) {
            stats->char_freq[c]++;
        }

        // Track lines
        if (c == '\n') {
            stats->line_count++;
        }

        // Word extraction: Alphanumeric characters
        if (isalnum(c)) {
            if (word_len < MAX_WORD_LEN - 1) {
                word_buf[word_len++] = tolower(c);
            }
        } else {
            if (word_len > 0) {
                word_buf[word_len] = '\0';
                insert_word(stats->word_counts, word_buf);
                stats->word_count++;
                word_len = 0;
            }
        }
        last_c = c;
    }

    // Check for trailing word without subsequent punctuation
    if (word_len > 0) {
        word_buf[word_len] = '\0';
        insert_word(stats->word_counts, word_buf);
        stats->word_count++;
    }

    // If file is not empty and doesn't end with a newline, count the final line
    if (stats->char_count > 0 && last_c != '\n') {
        stats->line_count++;
    }

    fclose(file);
    return 0;
}
