# 🧩 Sudoku Solver — Backtracking Algorithm

A beautiful, interactive web application that generates and solves Sudoku puzzles using the **Backtracking Algorithm** with real-time visualization.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

## ✨ Features

- **Puzzle Generator** — Generate random Sudoku puzzles with Easy, Medium, and Hard difficulty levels
- **Backtracking Solver** — Watch the algorithm solve puzzles step-by-step with animated visualization
- **Adjustable Speed** — Control the animation speed from slow (educational) to instant
- **Manual Input** — Enter your own puzzles and solve them
- **Live Statistics** — Track solve time, steps taken, and backtracks in real-time
- **DSA Explanation Sheet** — Download a comprehensive PDF explaining the algorithm
- **Premium Dark Theme** — Modern UI with glassmorphism, gradients, and micro-animations
- **Responsive Design** — Works on desktop and mobile devices

## 🚀 Live Demo

🔗 [View Live on GitHub Pages](https://diwaka9873.github.io/Sudoko-solver/)

## 🛠️ Technologies Used

| Technology | Usage |
|-----------|-------|
| **HTML5** | Semantic page structure |
| **CSS3** | Dark theme, animations, glassmorphism, responsive layout |
| **JavaScript (ES6+)** | Backtracking solver, DOM manipulation, async visualization |
| **GitHub Pages** | Deployment & hosting |

## 📊 Algorithm — Backtracking

### Time Complexity: `O(9^m)` where m = empty cells
### Space Complexity: `O(m)` recursion stack

The solver uses a depth-first search approach:
1. Find an empty cell
2. Try digits 1–9
3. Validate against row, column, and 3×3 sub-grid constraints
4. Recurse to the next cell or backtrack if no valid digit exists

## 📂 Project Structure

```
Sudoko-solver/
├── index.html    # Main HTML file
├── styles.css    # Premium dark theme styles
├── app.js        # Solver logic & UI interactions
└── README.md     # Project documentation
```

## 🖥️ How to Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/diwaka9873/Sudoko-solver.git
   ```
2. Open `index.html` in your browser

## 📋 DSA Explanation Sheet

Click the **"DSA Sheet"** button in the app to generate a comprehensive PDF covering:
- Problem statement & constraints
- Backtracking algorithm explanation
- Pseudocode & JavaScript implementation
- Complexity analysis
- Step-by-step trace example
- Optimization techniques

## 👤 Author

**Diwakar** — B.Tech Computer Science

---

⭐ Star this repo if you found it useful!
