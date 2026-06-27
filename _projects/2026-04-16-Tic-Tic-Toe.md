---
layout: page
title: "Tic Tac Toe"
date: 2026-04-16
description: "A graphical, pixel-art style Tic-Tac-Toe game built with Python and Pygame. It features classic two-player action with automated win detection and particle effects."
tags: [Python, Pygame, Game Development, Pixel Art]
---

### TL;DR

- **Python & Pygame Game**: A fully functional graphical Tic-Tac-Toe game featuring classic **human-vs-human gameplay**.
- **Retro Aesthetic**: Designed with a **pixel-art style**, custom fonts, and **confetti particle effects** for win celebrations.
- **Ready to Run**: Easily installable via `pip` or `uv`, with future plans for **AI opponents** and **multiplayer modes**.

<div align="center">
  <img width="35%" src="https://github.com/iamprasadraju/tic-tac-toe/raw/main/assets/tic-tac-toe.png">
  <h2>Endless Tic-Tac-Toe</h2>
</div>

A graphical Tic-Tac-Toe game built with **Python** and **Pygame**, featuring a **pixel-art aesthetic** and a **classic two-player experience**.

## What are its features?

- **Human vs Human** — Two players take turns on the same machine (hot-seat).
- **Human vs AI** — *(Work in progress, not yet playable.)*
- **3×3 Grid** — Turn-based play with alternating **X** and **O**.
- **Win & Draw Detection** — Automatically detects all 8 winning lines and board fills.
- **Confetti Celebration** — Particle effects when a player wins.
- **Pixel-Art Styling** — Custom pixel fonts for a retro look.
- **Play Again** — Quick restart from the result screen.

## How do you get started?

### What are the prerequisites?

- Python **3.13** or higher

### How do you install it?

```bash
pip install -r requirements.txt
```

Or with [uv](https://docs.astral.sh/uv/):

```bash
uv sync
```

### How do you run the game?

```bash
python game.py
```

## How do you play?

- **Left-click** a cell to place your mark (**X** or **O**).
- Click **"Play Again!"** after a win or draw to start a new game.

## How is the project structured?

```
├── game.py          — Entry point and main game loop
├── board.py         — Game board, grid rendering, move logic, win/draw detection
├── effects.py       — Confetti particle system for win celebrations
├── assets/          — Fonts and images
│   ├── PixeloidSans.ttf
│   ├── PixeloidSans-Bold.ttf
│   └── tic-tac-toe.png
├── requirements.txt — Runtime dependency (pygame)
└── pyproject.toml   — Project metadata and Python version
```

## What technologies were used?

- [Python](https://www.python.org/) 3.13+
- [Pygame](https://www.pygame.org/) — Game framework
- [Ruff](https://docs.astral.sh/ruff/) — Linting
- [uv](https://docs.astral.sh/uv/) — Package management

## What are the current limitations?

- **Human vs AI mode** is a stub and not yet functional. Selecting it will cause a runtime error. Only **Human vs Human** is fully implemented.

## What is the future roadmap?

- [ ] Implement **AI opponent** (random move / minimax)
- [ ] Add menu improvements and game state polish
- [ ] **Online multiplayer** (future stretch goal)