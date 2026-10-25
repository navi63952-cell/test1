# AFTERHOURS — Vehicle Atelier

A standalone browser concept for a premium FiveM-style vehicle customizer. The preview uses a procedurally assembled Three.js coupe with custom body geometry, metallic clearcoat, studio lights, and interactive orbit camera.

## Run it

Run a local web server from this folder, then open its local address in a current desktop browser. For example, with Python installed run `python -m http.server 8000` and visit `http://localhost:8000`. Browser modules require HTTP rather than opening `index.html` as a `file://` URL. For a clean showcase, click the expand icon in the preview controls to hide the editor chrome.

## Showcase controls

- Pick one of seven paint colors and switch between gloss, satin, and metallic finishes.
- Change the forged wheel style, underglow color, underglow toggle, and ride height.
- Use the side/front/rear controls or arrows to switch preview angle. Drag directly on the car to orbit the camera and scroll to zoom.
- Save Build downloads a JSON build card with the current choices and estimate.
- Reset returns every choice to factory spec.

## About this demo

This is a frontend visual concept, not an in-game vehicle replacement or a tested FiveM resource. The car is a procedurally modeled concept rather than a production GTA vehicle asset. Three.js loads from jsDelivr and fonts from Google Fonts, so an internet connection is needed for the full 3D scene and typography. Fonts fall back to system fonts if unavailable.

## Longer-term zero-budget game plan

See [GTA_LIKE_GAME_BLUEPRINT.md](GTA_LIKE_GAME_BLUEPRINT.md) for a checked Godot + Blender roadmap, a beginner-friendly project structure, realistic scope, and the order to build a small polished driving demo.

## FiveM car customizer resource

For the actual GTA car selector/customizer resource, see [afterhours_fivem/README.md](afterhours_fivem/README.md). It uses GTA V's in-game vehicles for the live preview and needs GTA V + FiveM to run.
