'use strict';

// Dog's Room: drawing Dog from her painted poses, with gentle life added in code:
// breathing, a walking and running cycle, kneading paws, a pounce wiggle.

window.DogSprite = (function () {
  var WALK = ['walk1', 'walk2', 'walk3', 'walk4'];
  var RUN = ['run1', 'run2', 'run3', 'run4'];

  function currentImage(dog) {
    if (dog.moving) {
      var frames = dog.running ? RUN : WALK;
      return frames[Math.floor(dog.phase) % frames.length];
    }
    return dog.sprite;
  }

  function bounds(dog) {
    var img = Scene.images[currentImage(dog)];
    if (!img) return null;
    var w = img.width * dog.s, h = img.height * dog.s;
    return { x: dog.x - w / 2, y: dog.y - h, w: w, h: h };
  }

  function draw(c, dog, t, reduced) {
    if (dog.hidden) return;
    var name = currentImage(dog);
    var img = Scene.images[name];
    if (!img) return;
    var calm = reduced ? 0 : 1;
    var sx = 1, sy = 1, dx = 0, dy = 0, rot = 0;
    switch (dog.anim) {
      case 'breathe':
        sy = 1 + 0.014 * Math.sin(t * 2.2) * calm;
        sx = 1 - 0.006 * Math.sin(t * 2.2) * calm;
        break;
      case 'knead':
        dy = -Math.abs(Math.sin(t * 5)) * 6 * calm;
        rot = Math.sin(t * 5) * 0.025 * calm;
        break;
      case 'wiggle':
        rot = Math.sin(t * 16) * 0.035 * calm;
        dx = Math.sin(t * 16) * 3 * calm;
        break;
      case 'eat':
        dy = Math.abs(Math.sin(t * 7)) * 4 * calm;
        break;
      case 'groom':
        rot = Math.sin(t * 4) * 0.03 * calm;
        break;
      case 'purr':
        sy = 1 + 0.02 * Math.sin(t * 9) * calm;
        break;
    }
    if (dog.moving && !reduced) dy -= Math.abs(Math.sin(dog.phase * Math.PI)) * (dog.running ? 8 : 4);

    c.save();
    if (dog.clip) {
      c.beginPath();
      c.rect(dog.clip[0], dog.clip[1], dog.clip[2], dog.clip[3]);
      c.clip();
    }
    if (!dog.airborne && !dog.clip) {
      Scene.softShadow(c, dog.x, dog.y - 2, img.width * dog.s * 0.42, 16 * dog.s / 0.72, 0.32);
    }
    c.translate(dog.x + dx, dog.y + dy);
    if (rot) c.rotate(rot * dog.dir);
    c.scale(dog.dir * dog.s * sx, dog.s * sy);
    c.drawImage(img, -img.width / 2, -img.height);
    c.restore();
  }

  return { draw: draw, bounds: bounds };
})();
