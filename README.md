# Dog's Room

A cozy, hand-painted living room starring Dog, Keeper of the Mantle: a fluffy cream and seal-brown Himalayan / Scottish Fold with folded ears, blue eyes and very strong opinions.

It's a sunny afternoon. The TV is playing a singer with an oud, and Dog lives her life: she observes regally, loafs, naps in her playpen, kneads the sofa blanket, watches TV, drinks her water, climbs the cat tree, races up the dining chair, claims the roof of her blue cube house and, now and then, gets the zoomies.

## Run it

1. Open the `dogs-room` folder.
2. Double-click `index.html`. It opens in your default browser (Edge or Chrome).

No install, no server, no account, and nothing is sent anywhere. Everything runs locally from these files.

To edit in Visual Studio: **File > Open > Folder**, choose `dogs-room`, edit a file, save, then refresh the browser tab.

## Play

- **Click things in the room:** the cat tree, her playpen, the blanket on the sofa, the laptop, the TV, her blue cube house and the dining chair.
- **Toy buttons:** sparkle ball, dangling mouse (dolphin hops), rainbow snake, ribbon wand, present bows (lick first, sniff second), paper bag, cardboard box and dinner time.
- **Pet her** by clicking her or the Pet Dog button. Pet her too many times in a row and she'll swat.
- **Music** is off by default. The button at the top right turns it on; the track loops with a soft crossfade.

Every control is a real button, so the keyboard works too (Tab, then Enter or Space).

## How it's built

Plain HTML, CSS and JavaScript. No framework, no build step, no dependencies.

| File | What it does |
| --- | --- |
| `index.html` | The page, the toy buttons and the music toggle |
| `styles.css` | Layout, buttons and the paper texture |
| `js/scene.js` | The room painting, spots Dog can reach, props, particles and sunbeams |
| `js/dog.js` | Draws Dog from her painted poses and adds breathing, walking, kneading and wiggles |
| `js/game.js` | Dog's personality, the toys, petting and the music |
| `assets/room.jpg` | The room painting |
| `assets/sprites/` | Dog's 22 poses and 8 toys and props |
| `assets/audio/` | The soundtrack |

The scene is 1920 x 1072. Dog runs on a simple queue of steps (walk, pose, jump, do), handled by one animation loop, so rapid clicks never leave her stuck.

## Art, music and privacy

- The room painting, Dog's poses and the toys were generated as hand-painted, anime-inspired artwork from Daniel's photos of Dog and the living room, using Magnific. The style is inspired by the general feel of hand-painted animated films; no specific characters, scenes or artwork are copied. The singer on the TV is a generic character, not a real artist.
- The framed crayon drawing is a small version of an image Daniel created with ChatGPT.
- The soundtrack, *Dog's Afternoon*, was made by Daniel in Suno.
- The `reference` folder (photos and videos) is excluded from Git by `.gitignore`. Location data was removed from the copies used to generate the art, and the originals never leave this computer.

## Accessibility

- The scene has a text description, and a live caption narrates what Dog is doing.
- Hotspots and toys are keyboard-focusable buttons with names.
- With reduced motion turned on, movement is instant, the zoomies are skipped and the effects stay still.
- Music never plays until you turn it on.

## Known limitations

- On a phone in portrait the room is small; turning the phone sideways helps.
- Dog's poses are still images brought to life with gentle motion, not frame-by-frame animation.
- Before the repo is ever made public: check the license terms for the generated art and the Suno track on your plans.

## Future ideas

- Sound effects: purrs, the kibble crunch, bag rustles.
- Day and evening lighting.
- Her majestic litter-box exit.
