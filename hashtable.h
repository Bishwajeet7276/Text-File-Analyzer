
#ifndef HASHTABLE_H
#define HASHTABLE_H


typedef struct Node {
    
    char *word;

    
    int count;

   
    struct Node *next;
} Node;

typedef struct HashTable {
    
    int size;

    Node **table;
} HashTable;

unsigned int hash(const char *word);
HashTable *create_hash_table(int size);
void insert_word(HashTable *ht, const char *word);
void free_hash_table(HashTable *ht);

#endif 