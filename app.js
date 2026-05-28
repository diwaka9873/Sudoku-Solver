/* ============================================
   SUDOKU SOLVER — Backtracking Algorithm
   ============================================ */

// ---- DOM References ----
const boardEl = document.getElementById('sudoku-board');
const btnGenerate = document.getElementById('btn-generate');
const btnSolve = document.getElementById('btn-solve');
const btnClear = document.getElementById('btn-clear');
const btnPdf = document.getElementById('btn-download-pdf');
const speedSlider = document.getElementById('speed-slider');
const speedLabel = document.getElementById('speed-label');
const statTime = document.getElementById('stat-time');
const statSteps = document.getElementById('stat-steps');
const statBacktracks = document.getElementById('stat-backtracks');
const statCells = document.getElementById('stat-cells');
const statusMessage = document.getElementById('status-message');
const statusText = statusMessage.querySelector('.status-text');

// ---- State ----
let board = Array.from({ length: 9 }, () => Array(9).fill(0));
let givenCells = Array.from({ length: 9 }, () => Array(9).fill(false));
let cells = [];
let solving = false;
let difficulty = 'easy';
let animationSpeed = 15; // ms per step
let steps = 0;
let backtracks = 0;
let solveAborted = false;

// ---- Initialize Board ----
function createBoard() {
    boardEl.innerHTML = '';
    cells = [];
    for (let r = 0; r < 9; r++) {
        cells[r] = [];
        for (let c = 0; c < 9; c++) {
            const cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            cell.dataset.row = r;
            cell.dataset.col = c;

            // Sub-grid borders
            if (c === 2 || c === 5) cell.classList.add('border-right');
            if (r === 2 || r === 5) cell.classList.add('border-bottom');

            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            input.setAttribute('aria-label', `Row ${r + 1} Column ${c + 1}`);
            input.addEventListener('input', (e) => {
                const val = e.target.value.replace(/[^1-9]/g, '');
                e.target.value = val;
                board[r][c] = val ? parseInt(val) : 0;
                updateFilledCount();
            });
            input.addEventListener('focus', () => cell.style.boxShadow = '0 0 0 2px var(--accent-1) inset');
            input.addEventListener('blur', () => cell.style.boxShadow = 'none');

            cell.appendChild(input);
            boardEl.appendChild(cell);
            cells[r][c] = cell;
        }
    }
}

// ---- Render Board ----
function renderBoard() {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const input = cells[r][c].querySelector('input');
            const val = board[r][c];
            input.value = val || '';
            cells[r][c].className = 'sudoku-cell';
            // Re-add border classes
            if (c === 2 || c === 5) cells[r][c].classList.add('border-right');
            if (r === 2 || r === 5) cells[r][c].classList.add('border-bottom');
            if (givenCells[r][c] && val) {
                cells[r][c].classList.add('given');
                input.readOnly = true;
            } else {
                input.readOnly = false;
            }
        }
    }
    updateFilledCount();
}

// ---- Update Filled Count ----
function updateFilledCount() {
    let count = 0;
    for (let r = 0; r < 9; r++)
        for (let c = 0; c < 9; c++)
            if (board[r][c] !== 0) count++;
    statCells.textContent = `${count}/81`;
}

// ---- Validation ----
function isValid(board, row, col, num) {
    // Check row
    for (let c = 0; c < 9; c++) {
        if (board[row][c] === num) return false;
    }
    // Check column
    for (let r = 0; r < 9; r++) {
        if (board[r][col] === num) return false;
    }
    // Check 3x3 sub-grid
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = startRow; r < startRow + 3; r++) {
        for (let c = startCol; c < startCol + 3; c++) {
            if (board[r][c] === num) return false;
        }
    }
    return true;
}

// ---- Solve with Animation ----
async function solveAnimated() {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (solveAborted) return false;
            if (board[r][c] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (solveAborted) return false;
                    steps++;
                    statSteps.textContent = steps.toLocaleString();

                    if (isValid(board, r, c, num)) {
                        board[r][c] = num;
                        const input = cells[r][c].querySelector('input');
                        input.value = num;
                        cells[r][c].classList.remove('backtrack');
                        cells[r][c].classList.add('trying');
                        updateFilledCount();

                        if (animationSpeed > 0) {
                            await sleep(animationSpeed);
                        }

                        cells[r][c].classList.remove('trying');
                        cells[r][c].classList.add('solved');

                        if (await solveAnimated()) return true;

                        // Backtrack
                        backtracks++;
                        statBacktracks.textContent = backtracks.toLocaleString();
                        board[r][c] = 0;
                        input.value = '';
                        cells[r][c].classList.remove('solved');
                        cells[r][c].classList.add('backtrack');
                        updateFilledCount();

                        if (animationSpeed > 0) {
                            await sleep(animationSpeed);
                        }
                        cells[r][c].classList.remove('backtrack');
                    }
                }
                return false; // Trigger backtrack
            }
        }
    }
    return true; // All cells filled
}

// ---- Instant Solve (no animation) ----
function solveInstant(board) {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r][c] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isValid(board, r, c, num)) {
                        board[r][c] = num;
                        if (solveInstant(board)) return true;
                        board[r][c] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

// ---- Generate Puzzle ----
function generatePuzzle() {
    // Start with empty board and solve it
    board = Array.from({ length: 9 }, () => Array(9).fill(0));

    // Fill diagonal 3x3 boxes first (independent)
    for (let box = 0; box < 9; box += 3) {
        fillBox(box, box);
    }
    // Solve the rest
    solveInstant(board);

    // Remove cells based on difficulty
    const cellsToRemove = { easy: 35, medium: 45, hard: 55 }[difficulty];
    let removed = 0;
    const positions = [];
    for (let r = 0; r < 9; r++)
        for (let c = 0; c < 9; c++)
            positions.push([r, c]);

    shuffleArray(positions);

    for (const [r, c] of positions) {
        if (removed >= cellsToRemove) break;
        board[r][c] = 0;
        removed++;
    }

    // Mark given cells
    givenCells = Array.from({ length: 9 }, () => Array(9).fill(false));
    for (let r = 0; r < 9; r++)
        for (let c = 0; c < 9; c++)
            if (board[r][c] !== 0) givenCells[r][c] = true;

    renderBoard();
    resetStats();
    setStatus('Puzzle generated — press Solve!', '');
}

function fillBox(rowStart, colStart) {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    shuffleArray(nums);
    let idx = 0;
    for (let r = rowStart; r < rowStart + 3; r++) {
        for (let c = colStart; c < colStart + 3; c++) {
            board[r][c] = nums[idx++];
        }
    }
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

// ---- Helpers ----
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function resetStats() {
    steps = 0;
    backtracks = 0;
    statTime.textContent = '0 ms';
    statSteps.textContent = '0';
    statBacktracks.textContent = '0';
    updateFilledCount();
}

function setStatus(text, type) {
    statusText.textContent = text;
    statusMessage.className = 'status-message ' + type;
}

function setButtonsDisabled(disabled) {
    btnGenerate.disabled = disabled;
    btnSolve.disabled = disabled;
    btnClear.disabled = disabled;
}

function updateSpeedLabel() {
    const v = parseInt(speedSlider.value);
    animationSpeed = Math.max(0, 200 - v * 2);
    if (v > 80) speedLabel.textContent = 'Fast';
    else if (v > 40) speedLabel.textContent = 'Medium';
    else speedLabel.textContent = 'Slow';
}

// ---- Event Listeners ----
btnGenerate.addEventListener('click', () => {
    if (solving) return;
    generatePuzzle();
});

btnSolve.addEventListener('click', async () => {
    if (solving) return;
    solving = true;
    solveAborted = false;
    setButtonsDisabled(true);
    btnSolve.disabled = true;
    resetStats();
    setStatus('Solving...', 'solving');

    // Mark current non-zero cells as given
    for (let r = 0; r < 9; r++)
        for (let c = 0; c < 9; c++)
            if (board[r][c] !== 0) {
                givenCells[r][c] = true;
                cells[r][c].classList.add('given');
                cells[r][c].querySelector('input').readOnly = true;
            }

    const startTime = performance.now();
    const solved = await solveAnimated();
    const elapsed = performance.now() - startTime;

    statTime.textContent = `${elapsed.toFixed(1)} ms`;
    solving = false;
    setButtonsDisabled(false);

    if (solveAborted) {
        setStatus('Solve aborted', '');
    } else if (solved) {
        setStatus('✅ Puzzle solved successfully!', 'solved');
        celebrateAnimation();
    } else {
        setStatus('❌ No solution exists for this puzzle', 'error');
    }
});

btnClear.addEventListener('click', () => {
    if (solving) {
        solveAborted = true;
        solving = false;
        setButtonsDisabled(false);
    }
    board = Array.from({ length: 9 }, () => Array(9).fill(0));
    givenCells = Array.from({ length: 9 }, () => Array(9).fill(false));
    renderBoard();
    resetStats();
    setStatus('Ready — Generate or enter a puzzle', '');
});

speedSlider.addEventListener('input', updateSpeedLabel);

// Difficulty buttons
document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        difficulty = btn.dataset.difficulty;
    });
});

// ---- Celebration Animation ----
function celebrateAnimation() {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            setTimeout(() => {
                cells[r][c].classList.add('valid-flash');
                setTimeout(() => cells[r][c].classList.remove('valid-flash'), 500);
            }, (r * 9 + c) * 25);
        }
    }
}

// ---- PDF Generation ----
btnPdf.addEventListener('click', generateDSAPdf);

function generateDSAPdf() {
    // Create a printable HTML document for the DSA explanation sheet
    const pdfContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>DSA Explanation Sheet — Sudoku Solver using Backtracking</title>
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.7; padding: 40px; max-width: 900px; margin: 0 auto; }
    h1 { font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
    .subtitle { font-size: 14px; color: #64748b; margin-bottom: 30px; }
    h2 { font-size: 20px; font-weight: 700; color: #1e293b; margin: 28px 0 12px; padding-bottom: 6px; border-bottom: 2px solid #818cf8; }
    h3 { font-size: 16px; font-weight: 600; color: #334155; margin: 18px 0 8px; }
    p { font-size: 14px; margin-bottom: 10px; color: #334155; }
    ul, ol { margin: 8px 0 12px 24px; font-size: 14px; color: #334155; }
    li { margin-bottom: 4px; }
    code { font-family: 'JetBrains Mono', monospace; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
    pre { background: #0f172a; color: #e2e8f0; padding: 20px; border-radius: 10px; font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.8; overflow-x: auto; margin: 12px 0 16px; }
    .highlight { background: linear-gradient(135deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .box { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #818cf8; padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 12px 0; }
    .box-title { font-weight: 700; font-size: 14px; color: #1e293b; margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 14px; }
    th, td { padding: 10px 14px; border: 1px solid #e2e8f0; text-align: left; }
    th { background: #f1f5f9; font-weight: 600; color: #1e293b; }
    .badge { display: inline-block; background: #818cf8; color: white; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
    @media print { body { padding: 20px; } pre { font-size: 11px; } }
</style>
</head>
<body>
<h1>📋 DSA Explanation Sheet</h1>
<p class="subtitle">Sudoku Solver using Backtracking Algorithm | HTML, CSS, JavaScript</p>

<h2>1. Problem Statement</h2>
<p>Given a partially filled 9×9 Sudoku grid, fill every empty cell such that each row, each column, and each 3×3 sub-grid contains all digits from 1 to 9 exactly once.</p>
<div class="box">
    <div class="box-title">Constraints</div>
    <ul>
        <li>The grid is always 9×9</li>
        <li>Empty cells are represented by 0</li>
        <li>Given clues are immutable and form a valid partial solution</li>
        <li>There is exactly one solution for a well-formed puzzle</li>
    </ul>
</div>

<h2>2. Algorithm — Backtracking</h2>
<p><strong>Backtracking</strong> is a general algorithmic technique that incrementally builds candidates for a solution and abandons a candidate ("backtracks") as soon as it determines that the candidate cannot lead to a valid solution.</p>
<h3>Core Idea</h3>
<ol>
    <li><strong>Find an empty cell</strong> — Scan left-to-right, top-to-bottom.</li>
    <li><strong>Try digits 1–9</strong> — For each digit, check if it is valid in the current cell.</li>
    <li><strong>Place and recurse</strong> — If valid, place the digit and recursively solve the rest.</li>
    <li><strong>Backtrack</strong> — If the recursive call fails, undo the placement (set to 0) and try the next digit.</li>
    <li><strong>Base case</strong> — If no empty cell remains, the puzzle is solved.</li>
</ol>

<h2>3. Pseudocode</h2>
<pre>
function solveSudoku(board):
    for row from 0 to 8:
        for col from 0 to 8:
            if board[row][col] == 0:          // empty cell found
                for num from 1 to 9:
                    if isValid(board, row, col, num):
                        board[row][col] = num   // place digit
                        if solveSudoku(board):  // recurse
                            return true         // solved!
                        board[row][col] = 0     // undo (backtrack)
                return false                    // no digit works → backtrack

    return true                                // all cells filled

function isValid(board, row, col, num):
    // 1. Check if 'num' exists in the same ROW
    for c from 0 to 8:
        if board[row][c] == num: return false

    // 2. Check if 'num' exists in the same COLUMN
    for r from 0 to 8:
        if board[r][col] == num: return false

    // 3. Check if 'num' exists in the 3×3 SUB-GRID
    startRow = row - (row % 3)
    startCol = col - (col % 3)
    for r from startRow to startRow+2:
        for c from startCol to startCol+2:
            if board[r][c] == num: return false

    return true
</pre>

<h2>4. JavaScript Implementation</h2>
<pre>
function isValid(board, row, col, num) {
    for (let c = 0; c &lt; 9; c++)
        if (board[row][c] === num) return false;
    for (let r = 0; r &lt; 9; r++)
        if (board[r][col] === num) return false;
    const sr = Math.floor(row / 3) * 3;
    const sc = Math.floor(col / 3) * 3;
    for (let r = sr; r &lt; sr + 3; r++)
        for (let c = sc; c &lt; sc + 3; c++)
            if (board[r][c] === num) return false;
    return true;
}

function solve(board) {
    for (let r = 0; r &lt; 9; r++) {
        for (let c = 0; c &lt; 9; c++) {
            if (board[r][c] === 0) {
                for (let num = 1; num &lt;= 9; num++) {
                    if (isValid(board, r, c, num)) {
                        board[r][c] = num;
                        if (solve(board)) return true;
                        board[r][c] = 0; // backtrack
                    }
                }
                return false;
            }
        }
    }
    return true;
}
</pre>

<h2>5. Complexity Analysis</h2>
<table>
    <tr><th>Aspect</th><th>Value</th><th>Explanation</th></tr>
    <tr><td><strong>Time Complexity</strong></td><td><code>O(9^m)</code></td><td>Where m = number of empty cells. Each cell tries at most 9 digits.</td></tr>
    <tr><td><strong>Space Complexity</strong></td><td><code>O(m)</code></td><td>Recursion stack depth equals the number of empty cells (max 81).</td></tr>
    <tr><td><strong>Best Case</strong></td><td><code>O(n²)</code></td><td>Puzzle is almost complete; very few backtracks needed.</td></tr>
    <tr><td><strong>Worst Case</strong></td><td><code>O(9^81)</code></td><td>Entirely empty board; maximum exploration.</td></tr>
</table>

<h2>6. Step-by-Step Trace Example</h2>
<div class="box">
    <div class="box-title">Example: Solving cell (0, 2)</div>
    <p>Given row 0 has [5, 3, _, _, 7, _, _, _, _]</p>
    <ol>
        <li>Try 1 → Check row ✅, col ✅, box → has 1? → No ✅ → Place 1, recurse</li>
        <li>Recursion fails → Backtrack → Remove 1</li>
        <li>Try 2 → Row ✅, col ✅, box ✅ → Place 2, recurse → ... continues</li>
        <li>Eventually finds correct digit through depth-first exploration</li>
    </ol>
</div>

<h2>7. Why Backtracking Works for Sudoku</h2>
<ul>
    <li><strong>Constraint satisfaction</strong> — Sudoku is a CSP; backtracking is natural.</li>
    <li><strong>Pruning</strong> — The <code>isValid</code> check eliminates invalid branches early.</li>
    <li><strong>Guaranteed solution</strong> — For valid puzzles, backtracking always finds the answer.</li>
    <li><strong>Simple implementation</strong> — No complex data structures required.</li>
</ul>

<h2>8. Possible Optimizations</h2>
<table>
    <tr><th>Technique</th><th>Description</th></tr>
    <tr><td>Constraint Propagation</td><td>Maintain sets of possible values per cell; reduce search space.</td></tr>
    <tr><td>MRV Heuristic</td><td>Choose the cell with Minimum Remaining Values first.</td></tr>
    <tr><td>Dancing Links (DLX)</td><td>Model Sudoku as Exact Cover and use Knuth's Algorithm X.</td></tr>
    <tr><td>Bitmasking</td><td>Use bitmasks for rows, columns, and boxes for O(1) validation.</td></tr>
</table>

<h2>9. Technologies Used</h2>
<ul>
    <li><strong>HTML5</strong> — Semantic page structure</li>
    <li><strong>CSS3</strong> — Premium dark theme, animations, glassmorphism, responsive design</li>
    <li><strong>JavaScript (ES6+)</strong> — Solver logic, DOM manipulation, async visualization</li>
    <li><strong>GitHub Pages</strong> — Deployment and hosting</li>
</ul>

<h2>10. Key DSA Concepts Demonstrated</h2>
<ul>
    <li><strong>Recursion</strong> — The solver calls itself on the remaining sub-problem.</li>
    <li><strong>Backtracking</strong> — Undoing invalid choices to explore alternatives.</li>
    <li><strong>Depth-First Search</strong> — Exploring one path fully before trying another.</li>
    <li><strong>Constraint Checking</strong> — Validating against row, column, and sub-grid rules.</li>
    <li><strong>2D Array Manipulation</strong> — Representing and modifying the 9×9 grid.</li>
</ul>

<div class="footer">
    DSA Explanation Sheet — Sudoku Solver using Backtracking | © 2026 Diwakar
</div>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(pdfContent);
    printWindow.document.close();
    printWindow.onload = () => {
        printWindow.print();
    };
}

// ---- Smooth Scroll for Nav ----
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        }
    });
});

// ---- Init ----
createBoard();
updateSpeedLabel();
renderBoard();
