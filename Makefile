# The compiler we are using. 'gcc' is the GNU C Compiler.
CC = gcc

# Compiler flags that control the build process:
# -g:      Includes debugging information in the executable (essential for tools like GDB and Valgrind).
# -Wall:   Turns on 'all' reasonably common compiler warnings. This helps catch potential bugs early.
# -Wextra: Turns on even more warnings not covered by -Wall.
# -std=c11: Enforces the C11 standard for our code, ensuring modern features and consistency.
CFLAGS = -g -Wall -Wextra -std=c11

# The name of the final executable file we want to build.
TARGET = analyzer

# A list of all the source (.c) files in our project.
# 'make' will automatically use this list.
SOURCES = main.c analyzer.c hashtable.c

# Automatically generate a list of object (.o) files from our list of source files.
# This clever substitution replaces the '.c' suffix with a '.o' suffix for each file.
# So, this variable will hold "main.o analyzer.o hashtable.o".
OBJECTS = $(SOURCES:.c=.o)

# Phony targets are not files. They are just names for recipes to be executed.
# Declaring them as .PHONY prevents 'make' from getting confused if a file with
# the same name (e.g., a file named 'clean') ever exists in the directory.
.PHONY: all clean re

# The 'all' target is the default goal. When you just run 'make', this is what
# it will try to build. We make it depend on our final executable.
all: $(TARGET)

# This is the LINKING rule.
# It tells 'make' how to build the final TARGET executable.
# It depends on all of the object files defined in the $(OBJECTS) variable.
# 'make' will ensure all those .o files are up-to-date before running this rule.
$(TARGET): $(OBJECTS)
	# The recipe to execute. This command links all the object files together.
	# $@ is an automatic variable that means "the name of the target" (i.e., 'analyzer').
	# $^ is an automatic variable that means "the names of all the prerequisites" (i.e., all the .o files).
	$(CC) $(CFLAGS) -o $@ $^

# This is a generic COMPILATION rule.
# It tells 'make' how to create any .o file from a corresponding .c file.
# The '%' is a wildcard character. This rule means "To make a file that ends in .o,
# find a file with the same name that ends in .c".
%.o: %.c
	# The recipe to compile a single .c file into a .o file.
	# -c flag tells gcc to "compile only, do not link".
	# $< is an automatic variable that means "the name of the first prerequisite" (the .c file).
	$(CC) $(CFLAGS) -c -o $@ $<

# The 'clean' target. This is used to remove all generated files.
clean:
	# The 'rm -f' command forcefully removes files. We use it to delete all
	# object files and the final target executable. This is useful for starting
	# a fresh build.
	rm -f $(OBJECTS) $(TARGET)

# A common convenience target. 're' is short for 'rebuild'.
# It first runs the 'clean' recipe, then the 'all' recipe.
re: clean all