# Text Analyzer Pro & CLI

A comprehensive text and file analysis suite. This repository contains a compiled C-based Command-Line Interface (CLI) utility and a modern, high-fidelity single-page Web Application.

---

## 🌐 Web Application (Text Analyzer Pro)

A client-side analysis application featuring high-end glassmorphism design, real-time metrics tracking, interactive SVG charts, readability analysis, and sentiment indexing.

### How to Run
Since the web application runs entirely client-side in the browser, you can open the website instantly without installing any server dependencies:
1. Locate the file [index.html](file:///d:/C/Project/text-file-analyzer/index.html) in your file explorer.
2. Double-click it (or right-click and choose **Open with**) to launch it in any modern web browser (Chrome, Edge, Firefox, Safari).

### Features
- **Flexible Input Modes**: Analyze text by dragging and dropping local files, choosing a file via the browser, or typing/pasting text live in the built-in text editor.
- **KPI Metrics Dashboard**: Instantly tracks:
  - Total Words
  - Total Characters (with and without space support)
  - Total Lines
  - Paragraph Count
  - Estimated Reading Time (based on a standard 200 WPM rate)
- **Interactive Word Frequency Table**: Displays sorted list of words by count, featuring dynamic search and word-length filters.
- **Character Frequency Chart**: Generates a responsive, vector-based SVG bar chart showing the frequencies of the top 15 printable characters.
- **Readability Insights**: Calculates average sentence and word lengths, and computes the Flesch Reading Ease score to assess text difficulty.
- **Sentiment Gauge**: Dynamically scans text against positive/negative lexicons to gauge overall sentiment.
- **Data Exporting**: Download your comprehensive report in formatted Plain Text (`.txt`), structured JSON data (`.json`), or a comma-separated word list table (`.csv`).
- **Responsive Dark/Light Theme**: Sleek dark mode by default, with a toggle button to switch to light mode.

---

## 💻 CLI Application (C Utility)

A lightweight CLI tool written in standard C that uses an optimized Hash Table to parse files and output character/word statistics and sorted word frequency lists.

### How to Compile
Compile the source code with any standard C compiler (such as GCC) by running:
```powershell
gcc main.c analyzer.c hashtable.c -o analyzer.exe
```

### How to Run
Run the compiled binary from your command line:
```powershell
# Analyze a file and show the full report (overall stats + frequencies)
.\analyzer.exe test.txt

# Show only overall statistics (characters, words, and lines)
.\analyzer.exe -c -w -l test.txt

# Show only character and word frequency tables
.\analyzer.exe --freq test.txt
```

### File Structure
- [main.c](file:///d:/C/Project/text-file-analyzer/main.c): Parses command line arguments, handles reporting outputs, and manages memory.
- [analyzer.c](file:///d:/C/Project/text-file-analyzer/analyzer.c): Reads files character-by-character to calculate metrics and extract word tokens.
- [hashtable.c](file:///d:/C/Project/text-file-analyzer/hashtable.c): A custom, collision-resolved hash table implementation to count word occurrences quickly.
- [hashtable.h](file:///d:/C/Project/text-file-analyzer/hashtable.h): Header containing struct definitions and function prototypes for the hash table.
- [analyzer.h](file:///d:/C/Project/text-file-analyzer/analyzer.h): Header containing statistics structs and analyzer function declarations.
