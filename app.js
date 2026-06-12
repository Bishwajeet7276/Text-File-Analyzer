/**
 * Text Analyzer Pro - Frontend JavaScript Logic
 * Completely client-side analysis and visualization.
 */

document.addEventListener('DOMContentLoaded', () => {
    // ---- DOM Elements ----
    const themeToggle = document.getElementById('themeToggle');
    const tabUpload = document.getElementById('tabUpload');
    const tabInput = document.getElementById('tabInput');
    const paneUpload = document.getElementById('paneUpload');
    const paneInput = document.getElementById('paneInput');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileDetailsBar = document.getElementById('fileDetailsBar');
    const selectedFileName = document.getElementById('selectedFileName');
    const selectedFileSize = document.getElementById('selectedFileSize');
    const clearFileBtn = document.getElementById('clearFileBtn');
    const textEditor = document.getElementById('textEditor');
    const editorCharCount = document.getElementById('editorCharCount');
    const copyTextBtn = document.getElementById('copyTextBtn');
    const clearTextBtn = document.getElementById('clearTextBtn');
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    const resultsContainer = document.getElementById('resultsContainer');

    // KPI stats
    const statWords = document.getElementById('statWords');
    const statChars = document.getElementById('statChars');
    const statCharsNoSpaces = document.getElementById('statCharsNoSpaces');
    const statLines = document.getElementById('statLines');
    const statParagraphs = document.getElementById('statParagraphs');
    const statReadingTime = document.getElementById('statReadingTime');

    // Word Table & Filter
    const wordSearch = document.getElementById('wordSearch');
    const wordLengthFilter = document.getElementById('wordLengthFilter');
    const wordLengthVal = document.getElementById('wordLengthVal');
    const wordTableBody = document.getElementById('wordTableBody');
    const noWordsMessage = document.getElementById('noWordsMessage');

    // Char Chart
    const charSortOrder = document.getElementById('charSortOrder');
    const charChartWrapper = document.getElementById('charChartWrapper');

    // Insights & Sentiment
    const readabilityScore = document.getElementById('readabilityScore');
    const readabilityDesc = document.getElementById('readabilityDesc');
    const avgWordLength = document.getElementById('avgWordLength');
    const avgSentenceLength = document.getElementById('avgSentenceLength');
    const sentimentNeedle = document.getElementById('sentimentNeedle');
    const sentimentText = document.getElementById('sentimentText');
    const negCountEl = document.getElementById('negCount');
    const posCountEl = document.getElementById('posCount');

    // Exports
    const exportTxt = document.getElementById('exportTxt');
    const exportJson = document.getElementById('exportJson');
    const exportCsv = document.getElementById('exportCsv');

    // ---- State Variables ----
    let activeText = '';
    let currentFileName = '';
    let analysisResults = null;

    // ---- Lexicons for Sentiment Analysis ----
    const positiveWords = new Set([
        'good', 'great', 'awesome', 'excellent', 'wonderful', 'beautiful', 'happy', 'love', 'nice', 'best', 
        'brilliant', 'fantastic', 'superb', 'perfect', 'success', 'successful', 'creative', 'enjoy', 'glad', 
        'smart', 'easy', 'helpful', 'useful', 'trust', 'honest', 'friendly', 'cool', 'amazing', 'outstanding', 
        'positive', 'yes', 'win', 'satisfy', 'satisfied', 'pleased', 'delight', 'delighted', 'progress', 'strong'
    ]);

    const negativeWords = new Set([
        'bad', 'worst', 'hate', 'sad', 'angry', 'terrible', 'awful', 'fail', 'failure', 'poor', 'error', 
        'mistake', 'wrong', 'difficult', 'negative', 'no', 'lose', 'defeat', 'reject', 'dislike', 'worry', 
        'anxious', 'scared', 'hurt', 'pain', 'cruel', 'ugly', 'boring', 'useless', 'slow', 'break', 'broken', 
        'problem', 'issue', 'complaint', 'criticize', 'conflict', 'ruin', 'destroy', 'stupid', 'dumb', 'weak'
    ]);

    // ---- Initialize Theme ----
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
    }

    themeToggle.addEventListener('click', () => {
        if (document.body.classList.contains('dark-theme')) {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        }
        // Redraw chart to update axis/label styling if results exist
        if (analysisResults) {
            renderCharChart();
        }
    });

    // ---- Tab Toggling ----
    tabUpload.addEventListener('click', () => {
        tabUpload.classList.add('active');
        tabInput.classList.remove('active');
        paneUpload.classList.add('active');
        paneInput.classList.remove('active');
        // Reset to loaded file if there is one
        if (currentFileName) {
            triggerAnalysis(activeText);
        } else {
            resetResults();
        }
    });

    tabInput.addEventListener('click', () => {
        tabInput.classList.add('active');
        tabUpload.classList.remove('active');
        paneInput.classList.add('active');
        paneUpload.classList.remove('active');
        // Load editor text
        triggerAnalysis(textEditor.value);
    });

    // ---- Direct Text Editor Events ----
    textEditor.addEventListener('input', () => {
        const text = textEditor.value;
        editorCharCount.textContent = `${text.length} character${text.length === 1 ? '' : 's'}`;
        triggerAnalysis(text);
    });

    copyTextBtn.addEventListener('click', () => {
        if (!textEditor.value) return;
        navigator.clipboard.writeText(textEditor.value)
            .then(() => {
                const originalText = copyTextBtn.innerHTML;
                copyTextBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
                setTimeout(() => {
                    copyTextBtn.innerHTML = originalText;
                }, 1500);
            })
            .catch(err => console.error('Failed to copy text: ', err));
    });

    clearTextBtn.addEventListener('click', () => {
        textEditor.value = '';
        editorCharCount.textContent = '0 characters';
        triggerAnalysis('');
    });

    // ---- DropZone & File Upload Events ----
    // Click triggers file browser
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // Drag-and-drop
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('dragover');
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    clearFileBtn.addEventListener('click', () => {
        fileInput.value = '';
        currentFileName = '';
        fileDetailsBar.classList.add('hidden');
        dropZone.classList.remove('hidden');
        resetResults();
    });

    function handleFile(file) {
        if (file.size > 10 * 1024 * 1024) {
            alert('File size exceeds the 10MB limit.');
            return;
        }

        currentFileName = file.name;
        selectedFileName.textContent = file.name;
        selectedFileSize.textContent = formatBytes(file.size);
        
        fileDetailsBar.classList.remove('hidden');
        dropZone.classList.add('hidden');
        
        loadingState.classList.remove('hidden');
        emptyState.classList.add('hidden');
        resultsContainer.classList.add('hidden');

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            loadingState.classList.add('hidden');
            triggerAnalysis(text);
        };
        reader.onerror = () => {
            loadingState.classList.add('hidden');
            alert('Error reading file.');
            resetResults();
        };
        reader.readAsText(file);
    }

    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // ---- ANALYSIS ENGINE ----
    function triggerAnalysis(text) {
        activeText = text;
        if (!text || text.trim().length === 0) {
            resetResults();
            return;
        }

        emptyState.classList.add('hidden');
        resultsContainer.classList.remove('hidden');

        // Run analytical processing
        analysisResults = performAnalysis(text);

        // Update UI
        updateKPIs();
        renderWordTable();
        renderCharChart();
        updateInsights();
    }

    function resetResults() {
        activeText = '';
        analysisResults = null;
        emptyState.classList.remove('hidden');
        resultsContainer.classList.add('hidden');
        loadingState.classList.add('hidden');
    }

    function performAnalysis(text) {
        const stats = {
            charCount: text.length,
            charCountNoSpaces: text.replace(/\s/g, '').length,
            lineCount: 0,
            wordCount: 0,
            paragraphCount: 0,
            charFreq: {},
            wordFreq: {},
            avgSentenceLen: 0,
            avgWordLen: 0,
            readabilityScore: 0,
            sentiment: {
                positive: 0,
                negative: 0,
                score: 0 // -1 to +1
            }
        };

        // Lines
        // Splitting by \n or \r\n
        const lines = text.split(/\r?\n/);
        stats.lineCount = lines.length;
        // Adjust for trailing newlines or empty single line
        if (lines.length === 1 && lines[0] === '') {
            stats.lineCount = 0;
        }

        // Paragraphs
        // Splitting by consecutive newlines
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        stats.paragraphCount = paragraphs.length;

        // Process words and characters
        // Extract words using regex matching alphanumeric strings (matches C version)
        const wordRegex = /[a-zA-Z0-9]+/g;
        const matches = text.match(wordRegex) || [];
        stats.wordCount = matches.length;

        let totalWordLength = 0;
        let totalSyllables = 0;

        matches.forEach(word => {
            const lowerWord = word.toLowerCase();
            totalWordLength += word.length;

            // Word frequency
            stats.wordFreq[lowerWord] = (stats.wordFreq[lowerWord] || 0) + 1;

            // Syllables count for readability
            totalSyllables += countSyllables(lowerWord);

            // Sentiment lookup
            if (positiveWords.has(lowerWord)) {
                stats.sentiment.positive++;
            } else if (negativeWords.has(lowerWord)) {
                stats.sentiment.negative++;
            }
        });

        // Avg Word Length
        stats.avgWordLen = stats.wordCount > 0 ? (totalWordLength / stats.wordCount) : 0;

        // Sentence extraction (splitting by periods, exclamations, questions)
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const sentenceCount = sentences.length || 1; // avoid divide by zero
        stats.avgSentenceLen = stats.wordCount > 0 ? (stats.wordCount / sentenceCount) : 0;

        // Character frequencies (only printable characters)
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            // Check if char is printable (ASCII 32 to 126) or standard spacing/newlines if wanted.
            // C analyzer code: counts[i] > 0 && isprint(i)
            const code = char.charCodeAt(0);
            if (code >= 32 && code <= 126) {
                stats.charFreq[char] = (stats.charFreq[char] || 0) + 1;
            } else if (char === ' ' || char === '\n' || char === '\t') {
                // We display spaces nicely as '[Space]' or similar in the chart,
                // matching the C analyzer which prints printable chars, but since spaces are printable, ' ' is included.
                // Newlines '\n' or tabs '\t' are not printable by isprint(), so they are ignored in C.
                if (char === ' ') {
                    stats.charFreq[' '] = (stats.charFreq[' '] || 0) + 1;
                }
            }
        }

        // Flesch Reading Ease Readability Calculation
        // Formula: 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
        if (stats.wordCount > 0 && sentenceCount > 0) {
            const score = 206.835 - (1.015 * (stats.wordCount / sentenceCount)) - (84.6 * (totalSyllables / stats.wordCount));
            stats.readabilityScore = Math.max(0, Math.min(100, score)); // clamp to 0-100
        } else {
            stats.readabilityScore = 0;
        }

        // Sentiment Ratio Score (-1 to +1)
        const totalSentimentWords = stats.sentiment.positive + stats.sentiment.negative;
        if (totalSentimentWords > 0) {
            stats.sentiment.score = (stats.sentiment.positive - stats.sentiment.negative) / totalSentimentWords;
        } else {
            stats.sentiment.score = 0;
        }

        return stats;
    }

    // Syllable counter heuristic helper (English)
    function countSyllables(word) {
        word = word.toLowerCase();
        if (word.length <= 3) return 1;
        
        // Remove silent e at the end
        if (word.slice(-1) === 'e') {
            word = word.slice(0, -1);
        }
        
        // Count consecutive vowel blocks
        const vowelRegex = /[aeiouy]+/g;
        const matches = word.match(vowelRegex);
        const count = matches ? matches.length : 0;
        
        return count === 0 ? 1 : count;
    }

    // ---- UI UPDATING HELPERS ----
    
    // 1. Dashboard counts
    function updateKPIs() {
        if (!analysisResults) return;
        
        animateCount(statWords, analysisResults.wordCount);
        animateCount(statChars, analysisResults.charCount);
        statCharsNoSpaces.textContent = `${analysisResults.charCountNoSpaces.toLocaleString()} without spaces`;
        animateCount(statLines, analysisResults.lineCount);
        animateCount(statParagraphs, analysisResults.paragraphCount);
        
        // Reading time calculation
        const wpm = 200;
        const totalSeconds = Math.round((analysisResults.wordCount / wpm) * 60);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        statReadingTime.textContent = mins > 0 ? `~${mins}m ${secs}s` : `~${secs}s`;
    }

    function animateCount(element, target) {
        const duration = 800; // ms
        const start = parseInt(element.textContent.replace(/,/g, '')) || 0;
        const range = target - start;
        if (range === 0) {
            element.textContent = target.toLocaleString();
            return;
        }
        
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + range * easeProgress);
            
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = target.toLocaleString();
            }
        }
        
        requestAnimationFrame(update);
    }

    // 2. Word Frequency Table
    function renderWordTable() {
        if (!analysisResults) return;

        const searchTerm = wordSearch.value.toLowerCase().trim();
        const minLength = parseInt(wordLengthFilter.value);
        wordLengthVal.textContent = minLength;

        // Convert freq object to sorted array
        const sortedWords = Object.keys(analysisResults.wordFreq)
            .map(word => ({
                word: word,
                count: analysisResults.wordFreq[word]
            }))
            .filter(entry => entry.word.length >= minLength && entry.word.includes(searchTerm))
            .sort((a, b) => {
                if (b.count !== a.count) {
                    return b.count - a.count; // sort descending by count
                }
                return a.word.localeCompare(b.word); // sort ascending alphabetically
            });

        // Clear existing rows
        wordTableBody.innerHTML = '';

        if (sortedWords.length === 0) {
            noWordsMessage.classList.remove('hidden');
            return;
        }
        noWordsMessage.classList.add('hidden');

        sortedWords.forEach((entry, idx) => {
            const density = ((entry.count / analysisResults.wordCount) * 100).toFixed(2);
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td style="font-family: var(--font-mono); font-weight: 500;">${escapeHtml(entry.word)}</td>
                <td>${entry.count.toLocaleString()}</td>
                <td style="color: var(--text-muted);">${density}%</td>
            `;
            wordTableBody.appendChild(tr);
        });
    }

    // Slider and Search Input events
    wordSearch.addEventListener('input', renderWordTable);
    wordLengthFilter.addEventListener('input', renderWordTable);

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // 3. Character Frequency SVG Chart
    function renderCharChart() {
        if (!analysisResults) return;

        const sortOrder = charSortOrder.value;

        // Parse frequencies
        let charArray = Object.keys(analysisResults.charFreq).map(char => ({
            char: char,
            count: analysisResults.charFreq[char]
        }));

        if (charArray.length === 0) {
            charChartWrapper.innerHTML = '<div class="no-results">No characters to display</div>';
            return;
        }

        // Sort data
        if (sortOrder === 'desc') {
            charArray.sort((a, b) => b.count - a.count);
        } else if (sortOrder === 'asc') {
            charArray.sort((a, b) => a.count - b.count);
        } else if (sortOrder === 'alpha') {
            charArray.sort((a, b) => {
                const charA = a.char === ' ' ? 'Space' : a.char;
                const charB = b.char === ' ' ? 'Space' : b.char;
                return charA.localeCompare(charB);
            });
        }

        // Limit to top 15 characters to keep the chart elegant
        charArray = charArray.slice(0, 15);

        // Chart dimensions
        const width = charChartWrapper.clientWidth || 500;
        const height = 280;
        const paddingLeft = 40;
        const paddingRight = 20;
        const paddingTop = 30;
        const paddingBottom = 40;

        const maxCount = Math.max(...charArray.map(d => d.count)) || 1;

        // Build SVG content
        const svgWidth = width;
        const svgHeight = height;
        const chartW = svgWidth - paddingLeft - paddingRight;
        const chartH = svgHeight - paddingTop - paddingBottom;
        
        const barWidth = Math.max(5, (chartW / charArray.length) - 8);
        const barGap = (chartW - (barWidth * charArray.length)) / (charArray.length - 1 || 1);

        // Color definitions based on current theme variables
        const gridStroke = document.body.classList.contains('light-theme') ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
        const textFill = document.body.classList.contains('light-theme') ? '#64748b' : '#94a3b8';
        const valueTextFill = document.body.classList.contains('light-theme') ? '#0f172a' : '#f1f5f9';

        let svgHtml = `
            <svg class="chart-svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
                <defs>
                    <linearGradient id="bar-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="var(--grad-1)" />
                        <stop offset="100%" stop-color="var(--grad-2)" />
                    </linearGradient>
                    <linearGradient id="bar-gradient-hover" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="var(--grad-2)" />
                        <stop offset="100%" stop-color="var(--grad-3)" />
                    </linearGradient>
                </defs>
        `;

        // Horizontal gridlines (3 lines)
        const gridLines = 3;
        for (let i = 0; i <= gridLines; i++) {
            const y = paddingTop + (chartH / gridLines) * i;
            const value = Math.round(maxCount - (maxCount / gridLines) * i);
            svgHtml += `
                <line class="chart-grid-line" x1="${paddingLeft}" y1="${y}" x2="${svgWidth - paddingRight}" y2="${y}" stroke="${gridStroke}" />
                <text x="${paddingLeft - 10}" y="${y + 4}" fill="${textFill}" font-size="10" font-family="var(--font-sans)" text-anchor="end">${value}</text>
            `;
        }

        // Draw bars
        charArray.forEach((item, index) => {
            const x = paddingLeft + index * (barWidth + barGap);
            const barH = (item.count / maxCount) * chartH;
            const y = paddingTop + chartH - barH;

            // Readable label
            let displayChar = item.char;
            if (displayChar === ' ') displayChar = '␣'; // visual space character
            
            svgHtml += `
                <g class="chart-bar-group">
                    <!-- Value tooltip on hover -->
                    <text class="chart-value-label" x="${x + barWidth / 2}" y="${y - 8}" fill="${valueTextFill}" font-size="10" font-family="var(--font-sans)" font-weight="600" text-anchor="middle">${item.count}</text>
                    
                    <!-- Bar -->
                    <rect class="chart-bar" x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="4" ry="4" />
                    
                    <!-- X Axis Label -->
                    <text class="chart-label" x="${x + barWidth / 2}" y="${svgHeight - paddingBottom + 20}" fill="${textFill}" font-size="11" font-family="var(--font-mono)" text-anchor="middle">${escapeHtml(displayChar)}</text>
                </g>
            `;
        });

        // X-Axis line
        svgHtml += `
            <line class="chart-axis-line" x1="${paddingLeft}" y1="${paddingTop + chartH}" x2="${svgWidth - paddingRight}" y2="${paddingTop + chartH}" />
            </svg>
        `;

        charChartWrapper.innerHTML = svgHtml;
    }

    charSortOrder.addEventListener('change', renderCharChart);
    window.addEventListener('resize', renderCharChart);

    // 4. Insights, Readability & Sentiment
    function updateInsights() {
        if (!analysisResults) return;

        // Display average values
        avgWordLength.textContent = `${analysisResults.avgWordLen.toFixed(1)} chars`;
        avgSentenceLength.textContent = `${analysisResults.avgSentenceLen.toFixed(1)} words`;

        // Readability Score
        const score = analysisResults.readabilityScore;
        readabilityScore.textContent = score.toFixed(1);

        // Describe readability ease
        let desc = '';
        if (score >= 90) desc = 'Very Easy (5th grade reading level)';
        else if (score >= 80) desc = 'Easy (6th grade reading level)';
        else if (score >= 70) desc = 'Fairly Easy (7th grade reading level)';
        else if (score >= 60) desc = 'Standard / Plain English (8th-9th grade)';
        else if (score >= 50) desc = 'Fairly Difficult (High School)';
        else if (score >= 30) desc = 'Difficult (College level)';
        else desc = 'Very Difficult (College Graduate level)';

        readabilityDesc.textContent = desc;

        // Sentiment gauge rotation
        // Gauge is 180 deg. -90deg is Left (Negative), 0deg is Center (Neutral), 90deg is Right (Positive)
        const rotation = analysisResults.sentiment.score * 90;
        sentimentNeedle.style.transform = `translateX(-50%) rotate(${rotation}deg)`;

        // Update sentiment labels
        negCountEl.textContent = analysisResults.sentiment.negative;
        posCountEl.textContent = analysisResults.sentiment.positive;

        let label = 'Neutral';
        const ratio = analysisResults.sentiment.score;
        if (ratio > 0.15) {
            label = 'Positive';
            sentimentText.style.color = 'var(--color-success)';
        } else if (ratio < -0.15) {
            label = 'Negative';
            sentimentText.style.color = 'var(--color-danger)';
        } else {
            label = 'Neutral';
            sentimentText.style.color = 'var(--color-warning)';
        }
        sentimentText.textContent = label;
    }

    // ---- EXPORTS AND DOWNLOADS ----
    
    // Export 1: Plain Text
    exportTxt.addEventListener('click', () => {
        if (!analysisResults) return;

        let report = `=== Text Analysis Report ===\n`;
        if (currentFileName) report += `Source File: ${currentFileName}\n`;
        report += `Generated: ${new Date().toLocaleString()}\n\n`;
        
        report += `--- Statistics ---\n`;
        report += `Total Words: ${analysisResults.wordCount}\n`;
        report += `Total Characters (with spaces): ${analysisResults.charCount}\n`;
        report += `Total Characters (without spaces): ${analysisResults.charCountNoSpaces}\n`;
        report += `Total Lines: ${analysisResults.lineCount}\n`;
        report += `Paragraphs: ${analysisResults.paragraphCount}\n`;
        report += `Average Sentence Length: ${analysisResults.avgSentenceLen.toFixed(2)} words\n`;
        report += `Average Word Length: ${analysisResults.avgWordLen.toFixed(2)} characters\n`;
        report += `Flesch Reading Ease: ${analysisResults.readabilityScore.toFixed(2)}\n\n`;

        report += `--- Sentiment Analysis ---\n`;
        report += `Score: ${analysisResults.sentiment.score.toFixed(2)} (${sentimentText.textContent})\n`;
        report += `Positive words matched: ${analysisResults.sentiment.positive}\n`;
        report += `Negative words matched: ${analysisResults.sentiment.negative}\n\n`;

        report += `--- Top 25 Words ---\n`;
        const topWords = Object.keys(analysisResults.wordFreq)
            .map(word => ({ word, count: analysisResults.wordFreq[word] }))
            .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
            .slice(0, 25);
            
        topWords.forEach((w, i) => {
            const density = ((w.count / analysisResults.wordCount) * 100).toFixed(2);
            report += `  ${i + 1}. ${w.word.padEnd(20)}: ${w.count} (${density}%)\n`;
        });

        downloadFile(report, 'text/plain', `${currentFileName || 'text'}_analysis_report.txt`);
    });

    // Export 2: JSON
    exportJson.addEventListener('click', () => {
        if (!analysisResults) return;

        const dataStr = JSON.stringify(analysisResults, null, 2);
        downloadFile(dataStr, 'application/json', `${currentFileName || 'text'}_analysis_data.json`);
    });

    // Export 3: CSV (Word list)
    exportCsv.addEventListener('click', () => {
        if (!analysisResults) return;

        let csv = 'Rank,Word,Frequency,Density (%)\n';
        const sortedWords = Object.keys(analysisResults.wordFreq)
            .map(word => ({ word, count: analysisResults.wordFreq[word] }))
            .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));

        sortedWords.forEach((w, i) => {
            const density = ((w.count / analysisResults.wordCount) * 100).toFixed(2);
            // Escape double quotes if any in word
            const formattedWord = w.word.replace(/"/g, '""');
            csv += `${i + 1},"${formattedWord}",${w.count},${density}\n`;
        });

        downloadFile(csv, 'text/csv', `${currentFileName || 'text'}_word_frequencies.csv`);
    });

    function downloadFile(content, contentType, fileName) {
        const a = document.createElement('a');
        const file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(a.href);
    }
});
