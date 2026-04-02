# Retro Game Engine Lab

Browser game project for learning retro-style game engine architecture step by step while building a real game in JavaScript and Canvas.

Current features:
- low-resolution pixel canvas
- player movement with arrow keys or WASD
- short sword attack with Space after the sword is unlocked
- player health, damage flash, and a three-square HUD
- enemy patrol, chase, return-home behavior, damage flash, and two-hit health
- five connected rooms with sliding screen transitions
- an NPC conversation that unlocks the sword and can be paged with Space or Enter
- game-over screen with Space to restart the run
- separate modules for input, game state, player, sword, enemies, world, and UI

## Run

Start a small local server in the project folder:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Project structure

- `main.js`: bootstraps the canvas and runs the frame loop
- `game-state.js`: creates and resets the current game session
- `input.js`: tracks keyboard input state
- `game-utils.js`: shared utility helpers
- `dialogue/`: dialogue config, page-building, and dialogue state flow
- `player/`: player movement, health, HUD, and sword behavior
- `enemies/`: enemy behavior and room enemy setup
- `npcs/`: NPC placement, dialogue lookup, and NPC interaction rules
- `world/`: room data, wall rules, and room transition logic
- `ui/`: overlay rendering such as the game-over screen and dialogue box

## Current world

- Room 0: starting room with one enemy and an exit to the right
- Room 1: hub room with exits left, right, and up
- Room 2: room to the right of the hub
- Room 3: room above the hub with three enemies
- Room 4: room above room 3 with a town NPC who gives the player a sword

## Engine ideas this project practices

- input -> update -> collision/rules -> render
- plain data objects plus update/render functions instead of heavy abstractions
- separate modules for world rules, entities, and UI state
- transient game states such as room transitions, dialogue, and game over
