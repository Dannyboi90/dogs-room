# Dog's Room

A cozy lofi pixel room starring Dog, Keeper of the Mantle: a fluffy cream and seal-brown Himalayan / Scottish Fold with folded ears and very strong opinions.

Rain falls past the window, the lamp glows, a live music set plays on the TV, and Dog lives her life. She wanders, observes regally, loafs, naps, watches the lights, drinks her water, flies onto the couch, and now and then gets the zoomies.

## Run it

1. Open the `dogs-room` folder.
2. Double-click `index.html`. It opens in your default browser (Edge or Chrome).

That's it. No install, no server, no account, and nothing is sent anywhere. Everything runs locally from these files.

To edit in Visual Studio: **File > Open > Folder**, choose `dogs-room`, edit a file, save, then refresh the browser tab.

## Controls

Milestone 1 is watch-only. Toys, the cushion and the laptop become interactive in Milestone 2.

## How it's built

Plain HTML, CSS and JavaScript. No framework, no build step, no dependencies.

| File | What it does |
| --- | --- |
| `index.html` | The page |
| `styles.css` | Page layout and the lofi film grain, scanlines and vignette |
| `js/room.js` | The living room: furniture, window, rain, TV lights, lamp glow |
| `js/dog.js` | Dog's pixel art and poses, drawn in code |
| `js/game.js` | The game loop and Dog's personality (what she decides to do next) |
| `assets/` | Two tiny pixel images: the framed crayon drawing and the laptop wallpaper |

The scene is drawn at 320 x 180 pixels and scaled up with crisp edges. Dog runs on a simple queue of steps (walk here, sit for a while, jump up), handled by one animation loop. That keeps her from getting stuck when things change quickly.

## Art and privacy

- Dog and the room are original pixel art drawn in code, based on Daniel's reference photos of Dog and the living room.
- The framed crayon drawing and the laptop wallpaper are tiny pixel versions of images Daniel created with ChatGPT.
- The `reference` folder (photos and videos) is excluded from Git by `.gitignore`. The photos contain location data and never leave this computer.

## Accessibility

- The scene has a text description, and a live caption narrates what Dog is doing.
- With reduced motion turned on in Windows or the browser, movement becomes instant or very slow, the zoomies are skipped and the film grain stops.

## Milestones

1. **Room with Dog** (done): lofi room, Dog's idle life, captions.
2. **Play**: toy, cushion and laptop interactions, plus petting her.
3. **Polish**: keyboard and touch controls, phone layout, reset, and a final check.

## Known limitations

- On a phone in portrait, the room is small. Turning the phone sideways helps.
- No sound yet. If music is added later, it will be off by default.

## Future ideas

- A paper bag that appears on the floor (she cannot resist).
- The dangling mouse toy and her dolphin hops.
- Dry-food crunch time, and licking things before sniffing them.
- The cat tree and its bubble bowl.
- An optional lofi soundtrack, made in Suno.
