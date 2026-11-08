# Dog's Room

A cozy, hand-painted living room starring Dog: a fluffy cream and seal-brown Himalayan / Scottish Fold with folded ears, blue eyes and very strong opinions.

It's a sunny afternoon. The TV is playing a singer with an oud, and Dog lives her life: she observes regally, loafs, naps in her playpen, kneads the sofa blanket, watches TV, drinks her water, climbs the cat tree, races up the dining chair, claims the roof of her blue cube house and, now and then, gets the zoomies.

**Play it:** https://room.catnamed.dog

## Play

- **Click things in the room:** the cat tree, her playpen, the blanket on the sofa, the laptop, the TV, her blue cube house and the dining chair.
- **Toy buttons:** sparkle ball, dangling mouse (dolphin hops), rainbow snake, ribbon wand, present bows (lick first, sniff second), paper bag, cardboard box and dinner time.
- **Pet her** by clicking her or the Pet Dog button. Pet her too many times in a row and she'll swat.
- **Music** is off by default. The button at the top right turns it on; the track loops with a soft crossfade.

Every control is a real button, so the keyboard works too (Tab, then Enter or Space).

## Run it locally

1. Open the `dogs-room` folder.
2. Double-click `index.html`. It opens in your default browser (Edge or Chrome).

No install, no server, no account, and nothing is sent anywhere. Everything runs from these files.

To edit in Visual Studio: **File > Open > Folder**, choose `dogs-room`, edit a file, save, then refresh the browser tab.

## How it was built

Dog's Room was built by Daniel with the help of AI tools. Daniel set the direction, supplied reference photos of Dog and the room, made the creative decisions and published the site; the AI tools helped with planning, code, artwork, music and testing. Nothing was copied from existing games or films.

### Tools

| Tool | Role in the project |
| --- | --- |
| [ChatGPT](https://chatgpt.com) by [OpenAI](https://openai.com) | Drafted the original project brief and created the crayon drawing framed on the wall |
| [Claude](https://claude.ai) by [Anthropic](https://www.anthropic.com) | Planned the game, wrote the code, wrote the image prompts, prepared the sprites, tested the site and wrote this README |
| [Magnific](https://www.magnific.com), using Google's Nano Banana 2 image model | Generated the room painting, Dog's poses and the toys from reference photos |
| [Suno](https://suno.com) | Generated the soundtrack, *Dog's Afternoon* |
| [Visual Studio](https://visualstudio.microsoft.com) and [GitHub](https://github.com) | Editing, version control and the repository |
| [GitHub Pages](https://pages.github.com) | Hosts the live site |

### How it came together

1. **Brief.** The project started as a small side-view pixel-art room where Dog reacts to a few objects, built with plain HTML, CSS and JavaScript and no frameworks.
2. **Reference material.** Photos and videos of Dog, her toys and the living room, plus notes on her personality and habits, guided the art and behavior. Location data was removed from every photo before it was used.
3. **Art direction.** Early pixel-art and code-drawn versions were replaced with generated artwork in a soft, hand-painted animation style. Character designs and room layouts were generated as options, one of each was chosen, and the room was refined with her real furniture, toys and favorite spots.
4. **Animation and behavior.** Each pose and toy was cut out as a transparent sprite, and Dog was given a personality: naps, loafs, kneading, zoomies, licking before sniffing, and a swat if petted too much.
5. **Music.** The soundtrack was generated in Suno from a short brief and set up as a seamless loop that stays off until you turn it on.
6. **Testing and launch.** Every interaction was tested in a headless browser at desktop and phone sizes, the Git history was checked for private data, and the site was published with GitHub Pages.

### Prompts

The image prompts below are close to what was sent to Magnific, shortened for length.

<details>
<summary>Dog's character sheet</summary>

> Character design sheet for an animated film: the cat in the reference photos, drawn as a hand-painted 2D anime-style character. She is a very fluffy female Himalayan / Scottish Fold: cream and fawn coat, dark seal-brown face mask, seal-brown paws and legs, small folded ears that lie flat forward on her round head, big round blue eyes, a huge fluffy cream chest ruff, and a big smoky-brown plume tail. Keep her recognizable as this exact cat.
>
> The same cat in six poses, all facing right, evenly spaced in a 3 by 2 grid: walking with tail raised high; sitting upright with tail wrapped around her paws; loaf position; curled up asleep; lying on her back, paws in the air; sitting three-quarter view with a tiny pink tongue poking out.
>
> Style: soft watercolor-and-gouache animation look, clean thin warm-brown line art, gentle cel shading, warm soft lighting, cute and expressive but anatomically believable. Plain flat white background, no text.

Follow-up sheets used the same description for eight action poses (pounce crouch, mid-pounce leap, dolphin hop, kneading, eating, grooming, stretching, running) and for walk and run cycles.

</details>

<details>
<summary>The room</summary>

> A hand-painted background painting for a 2D animated film, based on the living room in the reference photos, seen from the side like a stage set ... Warm late-afternoon sunlight streaming through the window, soft light beams, cozy, peaceful, lush. Soft watercolor and gouache painting style with rich detail and gentle color, like a background from a classic hand-drawn animated feature. No people, no animals, no text.

The chosen room was then repainted with additions:

> Keep its exact style, camera angle, light, layout and all its furniture ... Add: a dark cherry-wood console table with a round sunburst mirror; a small red and black pop-up pet playpen with a soft blue blanket inside; a tall light-wood cat tree with rope-wrapped posts and a clear bubble bowl; a navy blue fabric cube cat house with a fluffy white arched doorway, draped with a light blue fleece blanket with colorful dog-bone and paw-print patterns; two soft fluffy throw blankets on the sofa; one tall dining chair with gold-and-brown vertical stripes. The TV is turned on: it shows a warm stage scene of a singer in a white thobe and red-and-white shemagh, singing into a microphone while playing an oud, soft stage lights.

</details>

<details>
<summary>The toys</summary>

> Game props sheet for a 2D animated film, painted in the same soft watercolor-and-gouache style ... a small round brown teddy bear plush with an orange and black buffalo-plaid shirt; a sparkly gold-and-rainbow tinsel ball cat toy; a wand with a long fluffy rainbow caterpillar snake; a wand with rainbow ribbons; a small grey felt mouse dangling from an elastic string; a pile of three shiny gift-wrap present bows in pink, blue and gold; an open brown cardboard box; an open brown paper shopping bag lying on its side.

</details>

<details>
<summary>The soundtrack (approximate)</summary>

> An instrumental lofi loop for a cozy, sunny afternoon: soft oud melody over warm, mellow beats, gentle and unhurried, no vocals, made to loop quietly in the background.

</details>

## Code structure

Plain HTML, CSS and JavaScript. No framework, no build step, no dependencies.

| File | What it does |
| --- | --- |
| `index.html` | The page, the toy buttons and the music toggle |
| `styles.css` | Layout, buttons and the paper texture |
| `js/scene.js` | The room painting, spots Dog can reach, props, particles and sunbeams |
| `js/dog.js` | Draws Dog from her painted poses and adds breathing, walking, kneading and wiggles |
| `js/game.js` | Dog's personality, the toys, petting and the music |
| `assets/room.jpg` | The room painting |
| `assets/crayon-art.png` | The framed crayon drawing on the wall |
| `assets/sprites/` | Dog's 22 poses and 8 toys and props |
| `assets/audio/` | The soundtrack |
| `LICENSE` | MIT License for the code |
| `ASSETS-LICENSE.md` | Rights notice for the artwork and music |
| `CNAME` | Tells GitHub Pages to serve the site at room.catnamed.dog (do not delete) |

The scene is 1920 x 1072. Dog runs on a simple queue of steps (walk, pose, jump, do), handled by one animation loop, so rapid clicks never leave her stuck.

## Hosting and deployment

- The repository and the website are both public.
- GitHub Pages serves the site from the root of the `main` branch at https://room.catnamed.dog, with HTTPS enforced. The certificate renews automatically.
- DNS lives at GoDaddy: a `room` CNAME record points to `dannyboi90.github.io`, and a TXT record verifies the domain with GitHub. The main catnamed.dog domain is separate and unaffected.
- Every push to `main` goes live within a minute or two. There is no separate deploy step, so test locally first.
- Everything in the repository, including its full history, is public. Never commit anything private; the `reference` folder stays excluded.
- GitHub Pages is free for public repositories, so the site does not depend on a paid GitHub plan.

## Making changes

1. In Visual Studio, **Git > Pull** first so your copy matches GitHub.
2. For anything bigger than a typo, create a branch, make the change and test it by opening `index.html`.
3. Commit with a message that says what changed, push, and open a pull request.
4. Merge into `main` when it's ready. The site updates automatically.

Ideas go in Discussions. Bugs and confirmed work go in Issues.

## Art, music and privacy

- The room painting, Dog's poses and the toys were generated as hand-painted, anime-inspired artwork from Daniel's photos of Dog and the living room, using Magnific. The style is inspired by the general feel of hand-painted animated films; no specific characters, scenes or artwork are copied. The singer on the TV is a generic character, not a real artist.
- The framed crayon drawing was created with ChatGPT.
- The soundtrack, *Dog's Afternoon*, was generated with Suno.
- Daniel confirmed his plans with these services allow him to publish the outputs.
- The `reference` folder of original photos and videos is excluded from Git by `.gitignore` and has never been committed. Location data was removed from the copies used to generate the art.

## License

- **Code:** the HTML, CSS and JavaScript are released under the [MIT License](LICENSE). Fork it, learn from it, build your own pet's room.
- **Artwork and music:** everything in the `assets` folder is © 2026 Daniel Nader, all rights reserved. See [ASSETS-LICENSE.md](ASSETS-LICENSE.md). If you reuse the code, please bring your own art and music.

## Accessibility

- The scene has a text description, and a live caption narrates what Dog is doing.
- Hotspots and toys are keyboard-focusable buttons with names.
- With reduced motion turned on, movement is instant, the zoomies are skipped and the effects stay still.
- Music never plays until you turn it on.

## Known limitations

- On a phone in portrait the room is small; turning the phone sideways helps.
- Dog's poses are still images brought to life with gentle motion, not frame-by-frame animation.

## Future ideas

- Sound effects: purrs, the kibble crunch, bag rustles.
- Day and evening lighting.
- Her majestic litter-box exit.
