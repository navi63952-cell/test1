# Zero-budget GTA-style game plan

## What the research gets right

- Godot is free and open source, and GDScript is a reasonable language for a small game that Codex can build and explain step by step.
- Blender is a free, open-source 3D creation tool for making or adapting original models.
- A small playable slice is a much more achievable first goal than a full open-world game.

## What needs adjusting

- Godot does not create realistic cars, buildings, animation, or a city by itself. Visual quality depends heavily on the 3D models, materials, lighting, sound, and art direction.
- “Eventually a complete GTA” is not a realistic solo beginner target. A polished five-minute driving demo is a strong and achievable portfolio project.
- Starting with police, traffic, missions, and a huge map would make the first version harder to finish. Build and polish one car and one small location first.
- Free assets still have licenses. Check whether each asset permits use in a public portfolio and keep its license and source with the project.
- Code written by AI still needs to be run in Godot and errors need to be shared back for fixing. You can avoid hand-writing code, but you will need to install the tools, open the project, and press Play.

## Recommended free toolchain

- **Godot 4.7.2 stable** for the game. Use the **Forward+** renderer for a desktop 3D project when the computer supports it. If it runs poorly, switch to Mobile or Compatibility and lower effects.
- **Blender** for original vehicle and environment models, if we need models beyond simple blockout shapes.
- **Godot Asset Library and other clearly licensed sources** for optional starter assets. Keep an `ASSET_SOURCES.md` note with each asset name, URL, author, and license.
- **Codex** writes the scripts and scene setup in the project. Your steps are to install/open Godot, press Play, and send back any error text or screenshot.

Godot's official release archive currently marks 4.7.2 as stable; 4.8 is still in development. Its docs describe Forward+ as the advanced desktop renderer and Compatibility as the broadest hardware option. Choose Forward+ first for a desktop 3D slice, then adapt only if the PC struggles.

## First playable slice

Make a fictional, original street-driving demo rather than copying GTA assets or branding:

1. **Night garage:** one compact, atmospheric garage with a nice camera, practical lights, reflections, and a static original coupe.
2. **Car showcase:** orbit the camera, change the paint and wheels, and save a build card. This keeps the current customizer idea and gives us an early portfolio result.
3. **Driving:** enter the car, drive around a small closed test lot, brake, reverse, and follow a chase camera.
4. **One activity:** add a short delivery or checkpoint challenge with a timer and finish screen.
5. **Polish:** improve car handling, UI, lighting, sound, and frame rate before adding one traffic vehicle or a second location.

Do not start open-world streaming, crowds, police, or a wanted system until the first four milestones are playable and stable.

## Project structure

```text
project.godot
README.md
ASSET_SOURCES.md
scenes/
  main/main.tscn
  garage/garage.tscn
  car/player_car.tscn
  test_lot/test_lot.tscn
  ui/customizer.tscn
scripts/
  car/car_controller.gd
  car/chase_camera.gd
  garage/customizer.gd
  activities/checkpoint_run.gd
  ui/build_save.gd
assets/
  models/
  materials/
  textures/
  audio/
```

Keep each feature in its own scene and script. The car is a reusable scene; the garage and test lot use that same car. Tuning values belong in exported properties or a small car configuration resource instead of being scattered through unrelated scripts.

## Build rules for our AI workflow

- Change one feature at a time and keep the project runnable after each step.
- Before asking for code changes, provide the current error text or screenshot; do not silently replace unrelated files.
- Make the smallest scene that proves a feature works before adding polish.
- Use original fictional names and models. Do not claim the prototype is GTA or a FiveM mod.
- Record exact Godot version, renderer, and asset licenses in the README.

## Immediate next step

Install Godot 4.7.2 stable and open a new project with the Forward+ renderer. Then build the first garage scene and car showcase before the driving controller. Keep the existing browser configurator as a separate quick portfolio preview until the Godot scene replaces it.
