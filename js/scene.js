'use strict';

// Dog's Room: the painted room, its props and the light effects.
// The painting and all sprites are hand-painted artwork generated from
// Daniel's photos. The scene is laid out in 1920 x 1072 units.

window.Scene = (function () {
  var W = 1920;
  var H = 1072;

  var SPRITES = [
    'walk_pose', 'walk1', 'walk2', 'walk3', 'walk4', 'run', 'run1', 'run2', 'run3', 'run4',
    'sit', 'loaf', 'curl', 'flop', 'blep', 'crouch', 'pounce', 'hop', 'knead', 'eat', 'groom', 'stretch',
    'bear', 'sparkle', 'snake_wand', 'ribbon_wand', 'mouse', 'bows', 'box', 'bag'
  ];

  var images = {};
  function loadImage(src) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { resolve(null); };
      img.src = src;
    });
  }

  function load() {
    var jobs = [
      loadImage('assets/room.jpg').then(function (i) { images.room = i; }),
      loadImage('assets/crayon-art.png').then(function (i) { images.crayon = i; })
    ];
    SPRITES.forEach(function (name) {
      jobs.push(loadImage('assets/sprites/' + name + '.png').then(function (i) { images[name] = i; }));
    });
    return Promise.all(jobs).then(function () { return images; });
  }

  // ---------- Where things are in the painting ----------

  var FLOOR_Y = 995;
  var FLOOR_SCALE = 0.72;
  var SPOTS = {
    sofa: { x: 1318, y: 680, s: 0.46 },
    table: { x: 975, y: 705, s: 0.44 },
    cube: { x: 1688, y: 772, s: 0.58 },
    chair: { x: 1842, y: 552, s: 0.6 },
    treeStep: { x: 395, y: 625, s: 0.5 },
    tree: { x: 195, y: 503, s: 0.48 },
    pen: { x: 602, y: 884, s: 0.5, clip: [478, 770, 250, 118] },
    tv: { x: 1420, y: 965, s: 0.68 },
    water: { x: 1385, y: 1022 },
    food: { x: 1470, y: 1022 }
  };

  var HOTSPOTS = [
    { id: 'tree', label: 'Cat tree: Dog climbs to the top', rect: [60, 300, 380, 750] },
    { id: 'pen', label: 'Her red playpen: nap time inside', rect: [445, 650, 290, 262] },
    { id: 'blanket', label: 'Blanket on the sofa: kneading time', rect: [1225, 595, 180, 115] },
    { id: 'laptop', label: 'Laptop: she takes over the keyboard', rect: [915, 625, 135, 100] },
    { id: 'tv', label: 'TV: watch the singer with her', rect: [1585, 305, 300, 345] },
    { id: 'cube', label: 'Her blue cube house: she claims the roof', rect: [1548, 748, 285, 232] },
    { id: 'chair', label: 'Dining chair: she races up it', rect: [1762, 520, 158, 552] }
  ];

  // ---------- Props ----------

  var props = {
    bear: { img: 'bear', x: 1452, y: 676, s: 0.3, on: true },
    box: { img: 'box', x: 880, y: 1050, s: 0.6, on: false, wobble: 0 },
    bag: { img: 'bag', x: 1190, y: 1052, s: 0.62, on: false, wobble: 0 },
    sparkle: { img: 'sparkle', x: 0, y: 0, s: 0.22, on: false, vx: 0, spin: 0 },
    bows: { img: 'bows', x: 780, y: 1040, s: 0.34, on: false, scatter: 0 },
    mouse: { img: 'mouse', x: 0, y: 0, s: 0.5, on: false },
    snake: { img: 'snake_wand', x: 0, y: 0, s: 0.62, on: false },
    ribbon: { img: 'ribbon_wand', x: 0, y: 0, s: 0.62, on: false },
    kibble: { on: false },
    hearts: [], notes: [], zs: [], letters: []
  };

  function drawImg(c, name, x, y, s, flip, rot) {
    var img = images[name];
    if (!img) return;
    c.save();
    c.translate(x, y);
    if (rot) c.rotate(rot);
    c.scale((flip ? -1 : 1) * s, s);
    c.drawImage(img, -img.width / 2, -img.height);
    c.restore();
  }

  function softShadow(c, x, y, rx, ry, a) {
    c.save();
    c.translate(x, y);
    c.scale(1, ry / rx);
    var g = c.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, 'rgba(70,45,35,' + a + ')');
    g.addColorStop(1, 'rgba(70,45,35,0)');
    c.fillStyle = g;
    c.beginPath();
    c.arc(0, 0, rx, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }

  // ---------- Background and decor ----------

  function drawBackground(c, t, o) {
    if (images.room) c.drawImage(images.room, 0, 0, W, H);
    // Daniel's crayon drawing in the big frame on the console
    if (images.crayon) {
      c.save();
      c.globalAlpha = 0.95;
      c.drawImage(images.crayon, 513, 483, 31, 43);
      c.restore();
    }
    // Her bowls
    softShadow(c, SPOTS.water.x, SPOTS.water.y + 4, 40, 9, 0.3);
    bowl(c, SPOTS.water.x, SPOTS.water.y, '#8cc6e2');
    softShadow(c, SPOTS.food.x, SPOTS.food.y + 4, 40, 9, 0.3);
    bowl(c, SPOTS.food.x, SPOTS.food.y, props.kibble.on ? '#8a5a35' : '#d9cbb5');
    // TV glow on the screen
    var pulse = o.reduced ? 0.4 : beat(t);
    c.save();
    c.globalCompositeOperation = 'screen';
    c.fillStyle = 'hsla(' + Math.round(30 + 20 * Math.sin(t * 0.4)) + ',90%,60%,' + (0.05 + 0.07 * pulse).toFixed(3) + ')';
    c.fillRect(1592, 312, 285, 330);
    c.restore();
  }

  function bowl(c, x, y, fill) {
    c.save();
    c.beginPath();
    c.moveTo(x - 34, y - 18);
    c.quadraticCurveTo(x, y + 14, x + 34, y - 18);
    c.closePath();
    c.fillStyle = '#f4efe6';
    c.fill();
    c.strokeStyle = 'rgba(90,60,45,0.7)';
    c.lineWidth = 2.5;
    c.stroke();
    c.beginPath();
    c.ellipse(x, y - 18, 34, 8, 0, 0, Math.PI * 2);
    c.fillStyle = '#ffffff';
    c.fill();
    c.stroke();
    c.beginPath();
    c.ellipse(x, y - 17, 27, 5.5, 0, 0, Math.PI * 2);
    c.fillStyle = fill;
    c.fill();
    c.restore();
  }

  function beat(t) {
    var b = (t * 92 / 60) % 1;
    return Math.pow(1 - b, 3);
  }

  // Props that sit on the floor are drawn sorted with Dog by their y.
  function floorProps() {
    var list = [];
    if (props.box.on) list.push(props.box);
    if (props.bag.on) list.push(props.bag);
    if (props.bows.on) list.push(props.bows);
    if (props.sparkle.on) list.push(props.sparkle);
    return list;
  }

  function drawProp(c, p, t) {
    if (p === props.box || p === props.bag) {
      softShadow(c, p.x, p.y - 4, 100, 16, 0.3);
      var wob = p.wobble > 0 ? Math.sin(t * 30) * 0.03 * Math.min(1, p.wobble) : 0;
      drawImg(c, p.img, p.x, p.y, p.s, false, wob);
    } else if (p === props.bows) {
      softShadow(c, p.x, p.y - 2, 50, 8, 0.25);
      var sc = p.scatter;
      drawImg(c, 'bows', p.x - sc * 40, p.y - sc * 10, p.s, false, -sc * 0.4);
    } else if (p === props.sparkle) {
      softShadow(c, p.x, p.y, 26, 6, 0.3);
      drawImg(c, 'sparkle', p.x, p.y, p.s, false, p.spin);
    }
  }

  function drawBear(c) {
    if (props.bear.on) drawImg(c, 'bear', props.bear.x, props.bear.y, props.bear.s);
  }

  // Toys that dangle or are waved from above Dog
  function drawAirToys(c, t) {
    var m = props.mouse;
    if (m.on) {
      c.strokeStyle = 'rgba(120,90,60,0.8)';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(m.x, 0);
      c.lineTo(m.x, m.y - 150);
      c.stroke();
      drawImg(c, 'mouse', m.x, m.y, m.s, false, Math.sin(t * 3) * 0.12);
    }
    var s = props.snake;
    if (s.on) drawImg(c, 'snake_wand', s.x, s.y, s.s, false, Math.sin(t * 6) * 0.12);
    var r = props.ribbon;
    if (r.on) drawImg(c, 'ribbon_wand', r.x, r.y, r.s, false, Math.sin(t * 5) * 0.18);
  }

  // ---------- Particles ----------

  function updateParticles(dt, reduced) {
    var lists = [props.hearts, props.notes, props.zs, props.letters];
    for (var l = 0; l < lists.length; l++) {
      var list = lists[l];
      for (var i = list.length - 1; i >= 0; i--) {
        var p = list[i];
        p.life -= dt;
        if (!reduced) {
          p.y -= p.vy * dt;
          p.x += Math.sin(p.life * 3 + p.seed) * 12 * dt;
        }
        if (p.life <= 0) list.splice(i, 1);
      }
    }
  }

  function heart(c, x, y, size) {
    c.beginPath();
    c.moveTo(x, y + size * 0.3);
    c.bezierCurveTo(x, y, x - size * 0.5, y, x - size * 0.5, y + size * 0.3);
    c.bezierCurveTo(x - size * 0.5, y + size * 0.6, x, y + size * 0.8, x, y + size);
    c.bezierCurveTo(x, y + size * 0.8, x + size * 0.5, y + size * 0.6, x + size * 0.5, y + size * 0.3);
    c.bezierCurveTo(x + size * 0.5, y, x, y, x, y + size * 0.3);
    c.fill();
    c.stroke();
  }

  function drawParticles(c) {
    c.save();
    c.lineJoin = 'round';
    c.strokeStyle = 'rgba(110,60,50,0.8)';
    c.lineWidth = 2.5;
    props.hearts.forEach(function (p) {
      c.globalAlpha = Math.min(1, p.life);
      c.fillStyle = '#ff8fa8';
      heart(c, p.x, p.y, 26);
    });
    c.textAlign = 'center';
    c.font = 'bold 40px Georgia, serif';
    props.notes.forEach(function (p) {
      c.globalAlpha = Math.min(1, p.life) * 0.9;
      c.fillStyle = '#fff2c8';
      c.strokeText(p.ch, p.x, p.y);
      c.fillText(p.ch, p.x, p.y);
    });
    c.font = 'bold 34px "Segoe UI", sans-serif';
    props.zs.forEach(function (p) {
      c.globalAlpha = Math.min(1, p.life);
      c.fillStyle = '#fff6e6';
      c.strokeText('z', p.x, p.y);
      c.fillText('z', p.x, p.y);
    });
    c.font = 'bold 30px Consolas, "Courier New", monospace';
    props.letters.forEach(function (p) {
      c.globalAlpha = Math.min(1, p.life);
      c.fillStyle = '#9ff0b8';
      c.strokeText(p.ch, p.x, p.y);
      c.fillText(p.ch, p.x, p.y);
    });
    c.restore();
  }

  // ---------- Light ----------

  var motes = [];
  for (var m = 0; m < 34; m++) motes.push({ k: Math.random(), u: Math.random(), p: Math.random() * 6.28, r: 1.5 + Math.random() * 2.5 });

  function drawLight(c, t, o) {
    var calm = o.reduced ? 0 : 1;
    c.save();
    c.globalCompositeOperation = 'screen';
    var beams = [[130, 230, 0.1], [250, 340, 0.08], [360, 400, 0.07]];
    for (var i = 0; i < beams.length; i++) {
      var a = beams[i][2] * (1 + 0.3 * calm * Math.sin(t * 0.6 + i * 1.9));
      c.beginPath();
      c.moveTo(beams[i][0], 110);
      c.lineTo(beams[i][1], 110);
      c.lineTo(beams[i][1] + 620, 1072);
      c.lineTo(beams[i][0] + 420, 1072);
      c.closePath();
      var g = c.createLinearGradient(200, 110, 700, 1072);
      g.addColorStop(0, 'rgba(255,236,190,' + a.toFixed(3) + ')');
      g.addColorStop(1, 'rgba(255,236,190,0)');
      c.fillStyle = g;
      c.fill();
    }
    c.restore();
    for (var n = 0; n < motes.length; n++) {
      var mo = motes[n];
      var x = 160 + mo.u * 200 + mo.k * 480 + Math.sin(t * 0.3 * calm + mo.p) * 14;
      var y = 140 + mo.k * 860 + Math.sin(t * 0.22 * calm + mo.p * 2) * 18;
      var tw = 0.3 + 0.7 * Math.max(0, Math.sin(t * 1.1 + mo.p * 3));
      c.fillStyle = 'rgba(255,248,226,' + (0.7 * tw).toFixed(3) + ')';
      c.beginPath();
      c.arc(x, y, mo.r, 0, Math.PI * 2);
      c.fill();
    }
  }

  return {
    W: W, H: H, FLOOR_Y: FLOOR_Y, FLOOR_SCALE: FLOOR_SCALE, SPOTS: SPOTS, HOTSPOTS: HOTSPOTS,
    props: props, images: images, load: load, drawImg: drawImg, softShadow: softShadow,
    drawBackground: drawBackground, floorProps: floorProps, drawProp: drawProp, drawBear: drawBear,
    drawAirToys: drawAirToys, updateParticles: updateParticles, drawParticles: drawParticles, drawLight: drawLight
  };
})();
