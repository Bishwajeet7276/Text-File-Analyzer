#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "hashtable.h"

unsigned int hash(const char *word) {
    unsigned long h = 5381;
    int c;
    while ((c = *word++)) {
        h = ((h << 5) + h) + c; // h * 33 + c
    }
    return (unsigned int)(h);
}

HashTable *create_hash_table(int size) {
    HashTable *ht = malloc(sizeof(HashTable));
    if (!ht) {
        perror("malloc failed for HashTable");
        return NULL;
    }

    ht->size = size;
    ht->table = calloc(size, sizeof(Node *)); // safer than malloc+loop
    if (!ht->table) {
        perror("malloc failed for HashTable table");
        free(ht);
        return NULL;
    }

    return ht;
}

void insert_word(HashTable *ht, const char *word) {
    unsigned int index = hash(word) % ht->size;

    Node *current = ht->table[index];
    while (current) {
        if (strcmp(current->word, word) == 0) {
            current->count++;
            return;
        }
        current = current->next;
    }

    Node *newNode = malloc(sizeof(Node));
    if (!newNode) {
        perror("malloc failed for new Node");
        return;
    }

    newNode->word = strdup(word); // safer, copies string
    if (!newNode->word) {
        perror("malloc failed for Node's word");
        free(newNode);
        return;
    }

    newNode->count = 1;
    newNode->next = ht->table[index];
    ht->table[index] = newNode;
}

void free_hash_table(HashTable *ht) {
    if (!ht) return;
    for (int i = 0; i < ht->size; i++) {
        Node *current = ht->table[i];
        while (current) {
            Node *tmp = current;
            current = current->next;
            free(tmp->word);
            free(tmp);
        }
    }
    free(ht->table);
    free(ht);
}
