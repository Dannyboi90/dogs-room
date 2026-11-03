'use strict';

// Dog's Room: the living room.
// Everything is drawn at a native 320 x 180 pixel resolution and scaled up
// with crisp pixels by CSS. drawStatic() runs once; drawDynamic() and
// drawLighting() run every frame.

window.Room = (function () {
  var W = 320;
  var H = 180;

  var PAL = {
    wall: '#e6d3b3', wallD: '#dbc6a4', wallL: '#efe0c4',
    mold: '#f3e9d6', base: '#cdb999',
    floor: '#d8c8aa', floorD: '#cbb995', grout: '#c0ad8b',
    rug: '#8fa3b9', rugD: '#7d91a8', rugL: '#dfe2d6', fringe: '#ece6d2',
    sofa: '#3c4a6c', sofaD: '#2f3b58', sofaL: '#4b5b83', leg: '#2a1d18',
    leafBg: '#ebe6d4', leaf: '#5f9b8f', leaf2: '#8cbcae',
    knit: '#f2ede1', knitD: '#ddd6c5',
    navy: '#2d4079', navyD: '#22325f', navyL: '#3a4f8f',
    wood: '#6b3025', woodD: '#4f221a', woodL: '#874130',
    black: '#1c1c22', blackL: '#2c2c35', blackD: '#121216',
    curtain: '#d9c088', curtainD: '#c5aa70', curtainL: '#e9d4a2',
    frame: '#f4ecdc', frameD: '#dcd1bb',
    iron: '#2b2521', shade: '#f1ddb2', shadeD: '#d9c08f', brass: '#b28c4f',
    brown: '#7a4a2e', brownL: '#d9b48a', plaidO: '#e2792a', plaidK: '#2b231f'
  };

  function R(c, x, y, w, h, col) {
    c.fillStyle = col;
    c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  function hash(x, y) {
    var h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  function dither(c, x, y, w, h, col, density, seed) {
    for (var j = y; j < y + h; j++) {
      for (var i = x; i < x + w; i++) {
        if (hash(i + (seed || 0), j) < density) R(c, i, j, 1, 1, col);
      }
    }
  }

  function roundRect(c, x, y, w, h, col) {
    R(c, x + 1, y, w - 2, h, col);
    R(c, x, y + 1, w, h - 2, col);
  }

  function diamond(c, cx, cy, r, col) {
    for (var k = 0; k <= r; k++) {
      R(c, cx - r + k, cy - k, 1, 1, col);
      R(c, cx - r + k, cy + k, 1, 1, col);
      R(c, cx + r - k, cy - k, 1, 1, col);
      R(c, cx + r - k, cy + k, 1, 1, col);
    }
  }

  // ---------- Static scene ----------

  function drawStatic(c) {
    // Wall
    R(c, 0, 0, W, 124, PAL.wall);
    dither(c, 0, 5, W, 119, PAL.wallD, 0.05, 11);
    dither(c, 0, 5, W, 119, PAL.wallL, 0.04, 37);
    R(c, 0, 0, W, 4, PAL.mold);
    R(c, 0, 4, W, 1, PAL.wallD);

    // Baseboard and floor tiles
    R(c, 0, 124, W, 6, PAL.base);
    R(c, 0, 124, W, 1, PAL.mold);
    R(c, 0, 130, W, 50, PAL.floor);
    dither(c, 0, 130, W, 50, PAL.floorD, 0.06, 5);
    var rows = [130, 137, 146, 158, 172];
    for (var i = 0; i < rows.length; i++) {
      R(c, 0, rows[i], W, 1, PAL.grout);
      var top = rows[i];
      var bottom = i + 1 < rows.length ? rows[i + 1] : H;
      var step = 34 + i * 10;
      for (var x = (i % 2) * (step / 2); x < W; x += step) R(c, x, top, 1, bottom - top, PAL.grout);
    }

    drawWindowFrame(c);
    drawCurtains(c);
    drawLamp(c);
    drawArtFrames(c);
    drawSofa(c);
    drawRug(c);
    drawCoffeeTable(c);
    drawTvAndConsole(c);
    drawChandelier(c);
    drawWaterBowl(c);
  }

  function drawWindowFrame(c) {
    R(c, 14, 20, 56, 90, PAL.frame);
    R(c, 14, 20, 56, 1, PAL.frameD);
    R(c, 12, 108, 60, 4, PAL.frame);
    R(c, 12, 112, 60, 1, PAL.frameD);
  }

  function drawCurtains(c) {
    R(c, 2, 14, 82, 2, PAL.brass);
    R(c, 1, 13, 3, 4, PAL.brass);
    R(c, 82, 13, 3, 4, PAL.brass);
    var panels = [[4, 18], [62, 18]];
    for (var p = 0; p < panels.length; p++) {
      var x0 = panels[p][0];
      var w = panels[p][1];
      for (var y = 16; y < 122; y++) {
        var flare = y > 100 ? Math.floor((y - 100) / 7) : 0;
        for (var i = -flare; i < w + flare; i++) {
          var band = ((i + 30) % 5);
          var col = band === 0 ? PAL.curtainD : band === 2 ? PAL.curtainL : PAL.curtain;
          R(c, x0 + i, y, 1, 1, col);
        }
      }
    }
  }

  function drawLamp(c) {
    R(c, 80, 136, 15, 3, PAL.iron);
    R(c, 86, 62, 2, 74, PAL.iron);
    for (var j = 0; j < 14; j++) {
      var w = Math.round(11 + j * 7 / 13);
      R(c, 87 - w / 2, 49 + j, w, 1, j > 10 ? PAL.shadeD : PAL.shade);
    }
  }

  function drawArtFrames(c) {
    // Frame for Daniel's crayon drawing (image drawn each frame)
    R(c, 127, 32, 26, 30, PAL.woodD);
    R(c, 128, 33, 24, 28, PAL.wood);
    R(c, 129, 34, 22, 26, '#f5f0e4');

    // Small seascape
    R(c, 168, 38, 34, 22, PAL.black);
    var bands = ['#9cc0d6', '#9cc0d6', '#86b0cb', '#4f86a6', '#3d6f8f', '#2f5c7a', '#2f5c7a', '#d9c39a', '#cdb48a'];
    for (var y = 0; y < 20; y++) {
      R(c, 169, 39 + y, 32, 1, bands[Math.min(bands.length - 1, Math.floor(y / 20 * bands.length))]);
    }
    dither(c, 169, 47, 32, 7, '#e8f2f6', 0.08, 3);
  }

  function drawSofa(c) {
    // Back cushions
    roundRect(c, 98, 92, 104, 30, PAL.sofa);
    R(c, 100, 92, 100, 1, PAL.sofaL);
    R(c, 150, 94, 1, 26, PAL.sofaD);
    dither(c, 98, 93, 104, 28, PAL.sofaD, 0.06, 21);
    // Arms
    roundRect(c, 90, 104, 12, 36, PAL.sofa);
    R(c, 91, 104, 10, 1, PAL.sofaL);
    roundRect(c, 198, 104, 12, 36, PAL.sofa);
    R(c, 199, 104, 10, 1, PAL.sofaL);
    // Seat
    R(c, 100, 120, 100, 4, PAL.sofaL);
    R(c, 100, 124, 100, 12, PAL.sofa);
    R(c, 150, 120, 1, 16, PAL.sofaD);
    R(c, 92, 136, 116, 4, PAL.sofaD);
    R(c, 96, 140, 3, 3, PAL.leg);
    R(c, 201, 140, 3, 3, PAL.leg);

    // Leaf pillow
    roundRect(c, 104, 99, 18, 21, PAL.leafBg);
    var strokes = [[107, 103], [113, 101], [109, 109], [116, 107], [106, 114], [114, 114]];
    for (var s = 0; s < strokes.length; s++) {
      for (var k = 0; k < 4; k++) {
        R(c, strokes[s][0] + k, strokes[s][1] + k, 1, 1, k % 2 ? PAL.leaf2 : PAL.leaf);
      }
    }
    // Cream knit pillow
    roundRect(c, 125, 101, 17, 19, PAL.knit);
    for (var y = 102; y < 119; y += 2) {
      for (var x = 126 + (y % 4 === 0 ? 0 : 1); x < 141; x += 2) R(c, x, y, 1, 1, PAL.knitD);
    }
    // Navy pillow (her cushion)
    roundRect(c, 178, 100, 19, 20, PAL.navy);
    R(c, 179, 100, 17, 1, PAL.navyL);
    dither(c, 178, 101, 19, 18, PAL.navyD, 0.18, 9);

    // Bear plush
    drawBear(c, 160, 109);
  }

  function drawBear(c, x, y) {
    R(c, x, y, 2, 2, PAL.brown);
    R(c, x + 7, y, 2, 2, PAL.brown);
    roundRect(c, x, y + 1, 9, 5, PAL.brown);
    R(c, x + 3, y + 3, 3, 2, PAL.brownL);
    R(c, x + 2, y + 2, 1, 1, PAL.plaidK);
    R(c, x + 6, y + 2, 1, 1, PAL.plaidK);
    R(c, x + 4, y + 3, 1, 1, PAL.plaidK);
    for (var j = 0; j < 5; j++) {
      for (var i = 0; i < 9; i++) {
        var on = ((i >> 1) + (j >> 1)) % 2 === 0;
        R(c, x + i, y + 6 + j, 1, 1, on ? PAL.plaidO : PAL.plaidK);
      }
    }
  }

  function drawRug(c) {
    R(c, 64, 148, 212, 24, PAL.rug);
    dither(c, 64, 148, 212, 24, PAL.rugD, 0.22, 2);
    R(c, 66, 150, 208, 1, PAL.rugL);
    R(c, 66, 169, 208, 1, PAL.rugL);
    var centers = [104, 170, 236];
    for (var i = 0; i < centers.length; i++) {
      diamond(c, centers[i], 159, 7, PAL.rugL);
      diamond(c, centers[i], 159, 3, PAL.rugL);
    }
    for (var y = 149; y < 171; y += 2) {
      R(c, 61, y, 3, 1, PAL.fringe);
      R(c, 276, y, 3, 1, PAL.fringe);
    }
  }

  function drawCoffeeTable(c) {
    R(c, 212, 138, 42, 1, PAL.woodL);
    R(c, 212, 139, 42, 3, PAL.wood);
    R(c, 213, 142, 40, 3, PAL.woodD);
    R(c, 214, 145, 3, 15, PAL.woodD);
    R(c, 249, 145, 3, 15, PAL.woodD);
    // Rainbow runner
    var stripes = ['#d8434d', '#ef8a3c', '#f2c94c', '#5bb6a6', '#4b7bd1', '#9a5bc2'];
    for (var y = 137; y < 150; y++) {
      R(c, 235, y, 13, 1, stripes[Math.floor((y - 137) / 2) % stripes.length]);
    }
    // Laptop shell (screen drawn each frame)
    R(c, 216, 124, 15, 12, '#3a3d44');
    R(c, 214, 136, 19, 1, '#a7adb5');
    R(c, 214, 137, 19, 1, '#7d838c');
  }

  function drawTvAndConsole(c) {
    R(c, 262, 64, 56, 48, PAL.black);
    R(c, 286, 112, 8, 4, PAL.black);
    R(c, 262, 116, 56, 24, PAL.black);
    R(c, 262, 116, 56, 1, PAL.blackL);
    R(c, 265, 120, 22, 8, PAL.blackD);
    R(c, 291, 120, 24, 8, PAL.blackD);
    R(c, 265, 131, 50, 7, PAL.blackD);
    var spines = ['#c0533f', '#e0b04a', '#4f7fa8', '#7aa66a', '#d98c6c', '#8a6fb0', '#e5ddc8'];
    for (var i = 0; i < 9; i++) R(c, 266 + i * 2, 121 + (i % 3 === 0 ? 1 : 0), 2, 7 - (i % 3 === 0 ? 1 : 0), spines[i % spines.length]);
    // The "D"
    var D = ['111.', '1..1', '1..1', '1..1', '111.'];
    for (var y = 0; y < D.length; y++) {
      for (var x = 0; x < 4; x++) if (D[y][x] === '1') R(c, 300 + x, 122 + y, 1, 1, '#efe6d2');
    }
    for (var k = 0; k < 12; k++) R(c, 267 + k * 4, 133, 3, 5, spines[(k + 3) % spines.length]);
    R(c, 264, 140, 3, 2, PAL.blackD);
    R(c, 313, 140, 3, 2, PAL.blackD);
  }

  function drawChandelier(c) {
    R(c, 159, 4, 2, 10, PAL.iron);
    R(c, 151, 14, 18, 2, PAL.iron);
    R(c, 148, 16, 3, 1, PAL.iron);
    R(c, 169, 16, 3, 1, PAL.iron);
    R(c, 156, 16, 8, 3, PAL.iron);
    var xs = [146, 152, 158, 164, 170];
    for (var i = 0; i < xs.length; i++) {
      R(c, xs[i], 18, 4, 1, PAL.shadeD);
      R(c, xs[i], 19, 4, 3, PAL.shade);
      R(c, xs[i] + 1, 22, 2, 1, PAL.shadeD);
    }
  }

  function drawWaterBowl(c) {
    R(c, 292, 155, 11, 1, '#f3f0ea');
    R(c, 292, 156, 11, 3, '#d9d4cb');
    R(c, 293, 155, 9, 1, '#7fb6d6');
  }

  // ---------- Dynamic scene ----------

  var drops = [];
  for (var d = 0; d < 26; d++) {
    drops.push({ x: 18 + Math.random() * 48, y: 24 + Math.random() * 80, s: 45 + Math.random() * 30 });
  }
  var lastT = null;

  var SKY = [[0, [42, 43, 88]], [0.45, [108, 79, 138]], [0.75, [224, 135, 122]], [1, [244, 196, 140]]];

  function skyColor(k) {
    for (var i = 1; i < SKY.length; i++) {
      if (k <= SKY[i][0]) {
        var a = SKY[i - 1];
        var b = SKY[i];
        var f = (k - a[0]) / (b[0] - a[0]);
        return 'rgb(' + [0, 1, 2].map(function (n) { return Math.round(a[1][n] + (b[1][n] - a[1][n]) * f); }).join(',') + ')';
      }
    }
    return 'rgb(244,196,140)';
  }

  function hsl(h, s, l) {
    s /= 100; l /= 100;
    var k = function (n) { return (n + h / 30) % 12; };
    var a = s * Math.min(l, 1 - l);
    var f = function (n) { return l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); };
    return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
  }

  function beat(t) {
    var b = (t * 124 / 60) % 1;
    return Math.pow(1 - b, 3);
  }

  function drawDynamic(c, t, o) {
    var dt = lastT === null ? 0 : Math.min(0.05, t - lastT);
    lastT = t;
    var calm = o.reduced ? 0.15 : 1;

    // Window: dusk sky, sun, skyline, palm, rain
    for (var y = 24; y < 104; y += 2) {
      var k = Math.round(((y - 24) / 80) * 16) / 16;
      R(c, 18, y, 48, 2, skyColor(k));
    }
    for (var sy = -5; sy <= 5; sy++) {
      for (var sx = -5; sx <= 5; sx++) {
        if (sx * sx + sy * sy <= 25) R(c, 50 + sx, 93 + sy, 1, 1, '#ffdca6');
      }
    }
    for (var bx = 18; bx < 66; bx += 4) {
      var bh = 4 + Math.floor(hash(bx, 3) * 11);
      R(c, bx, 104 - bh, 4, bh, '#3b2d4f');
      for (var wy = 104 - bh + 1; wy < 103; wy += 2) {
        if (hash(bx, wy) < 0.25 && Math.sin(t * 0.4 * calm + bx + wy) > -0.6) R(c, bx + 1 + (wy % 2), wy, 1, 1, '#ffd38a');
      }
    }
    // Palm silhouette
    for (var py = 0; py < 26; py++) R(c, 28 + Math.round(py * py / 220), 103 - py, 2, 1, '#2e2340');
    var fronds = [[-1, -1], [1, -1], [-1, 0], [1, 0], [0, -1]];
    for (var f = 0; f < fronds.length; f++) {
      for (var fl = 0; fl < 8; fl++) {
        var sway = Math.round(Math.sin(t * 0.8 * calm + f) * 0.6);
        R(c, 31 + fronds[f][0] * fl, 76 + Math.round(fl * fl / 14) + fronds[f][1] * 2 + sway, 2, 1, '#2e2340');
      }
    }
    c.fillStyle = 'rgba(225,232,255,0.55)';
    for (var r = 0; r < drops.length; r++) {
      var dr = drops[r];
      dr.y += dr.s * dt * calm;
      if (dr.y > 104) { dr.y = 22; dr.x = 18 + Math.random() * 46; }
      c.fillRect(Math.round(dr.x), Math.round(dr.y), 1, 3);
    }
    R(c, 41, 24, 2, 80, PAL.frame);
    R(c, 18, 62, 48, 2, PAL.frame);

    // Framed crayon drawing
    if (o.images.crayon.complete && o.images.crayon.naturalWidth) {
      c.drawImage(o.images.crayon, 129, 34, 22, 26);
    }

    // Laptop screen
    if (o.laptopTyping) {
      R(c, 217, 125, 13, 10, '#101a14');
      for (var ln = 0; ln < 4; ln++) {
        var len = Math.floor(hash(ln, Math.floor(t * 6)) * 11) + 1;
        R(c, 218, 126 + ln * 2, len, 1, '#7ee2a0');
      }
    } else if (o.images.wallpaper.complete && o.images.wallpaper.naturalWidth) {
      c.drawImage(o.images.wallpaper, 217, 125, 13, 9);
      R(c, 217, 134, 13, 1, '#3a3d44');
    } else {
      R(c, 217, 125, 13, 10, '#3b2a6b');
    }

    // TV: an abstract live set, lights and music
    var tt = t * calm;
    var pulse = o.reduced ? 0.4 : beat(t);
    R(c, 264, 66, 52, 44, '#0e0a20');
    for (var b = 0; b < 4; b++) {
      var hue = (tt * 25 + b * 70) % 360;
      var rgb = hsl(hue, 85, 62);
      var ox = 270 + b * 13;
      var ang = Math.sin(tt * 0.9 + b * 1.3) * 0.6;
      c.fillStyle = 'rgba(' + rgb.join(',') + ',' + (0.35 + 0.35 * pulse).toFixed(2) + ')';
      for (var by = 0; by < 34; by++) {
        var spread = Math.floor(by / 6);
        c.fillRect(Math.round(ox + Math.sin(ang) * by) - spread, 66 + by, 1 + spread * 2, 1);
      }
    }
    for (var bar = 0; bar < 12; bar++) {
      var h = 2 + Math.round((Math.sin(tt * 3 + bar * 1.7) * 0.5 + 0.5) * 9 * (0.6 + 0.4 * pulse));
      var col = hsl((tt * 25 + bar * 18) % 360, 80, 66);
      R(c, 266 + bar * 4, 100 - h, 3, h, 'rgb(' + col.join(',') + ')');
    }
    for (var cx = 264; cx < 316; cx++) {
      var head = hash(cx, 1) < 0.35 ? 1 : 0;
      R(c, cx, 104 - head, 1, 6 + head, '#05040c');
      if (pulse > 0.6 && hash(cx, 2) < 0.08) R(c, cx, 100, 1, 3, '#05040c');
    }
  }

  // ---------- Lighting (runs after Dog is drawn) ----------

  var motes = [];
  for (var m = 0; m < 14; m++) motes.push({ x: 70 + Math.random() * 40, y: 66 + Math.random() * 70, p: Math.random() * 6 });

  function glow(c, x, y, r, rgb, a) {
    var g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(' + rgb.join(',') + ',' + a.toFixed(3) + ')');
    g.addColorStop(1, 'rgba(' + rgb.join(',') + ',0)');
    c.fillStyle = g;
    c.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // Dusk shade for the room. Runs before Dog is drawn, so her coat keeps
  // its true colors and she stays easy to spot.
  function drawShade(c) {
    c.save();
    c.globalCompositeOperation = 'multiply';
    c.fillStyle = '#a28db3';
    c.fillRect(0, 0, W, H);
    var g = c.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.45, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(120,100,150,0.35)');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    c.restore();
  }

  function drawLighting(c, t, o) {
    var calm = o.reduced ? 0 : 1;
    var pulse = o.reduced ? 0.4 : beat(t);
    c.save();
    c.globalCompositeOperation = 'screen';
    var flicker = 1 + calm * 0.04 * Math.sin(t * 7) * Math.sin(t * 3.1);
    glow(c, 87, 58, 100, [255, 170, 90], 0.55 * flicker);
    glow(c, 90, 150, 70, [255, 170, 90], 0.2 * flicker);
    glow(c, 160, 22, 70, [255, 196, 140], 0.26);
    glow(c, 290, 88, 70, hsl((t * (o.reduced ? 3 : 25)) % 360, 80, 60), 0.16 + 0.14 * pulse);
    glow(c, 42, 66, 55, [255, 150, 150], 0.14);
    c.restore();

    c.fillStyle = 'rgba(255,240,210,0.7)';
    for (var i = 0; i < motes.length; i++) {
      var mo = motes[i];
      var mx = mo.x + Math.sin(t * 0.3 * calm + mo.p) * 6;
      var my = mo.y + Math.sin(t * 0.2 * calm + mo.p * 2) * 8;
      if (Math.sin(t * 0.7 + mo.p) > -0.3) c.fillRect(Math.round(mx), Math.round(my), 1, 1);
    }
  }

  return { W: W, H: H, drawStatic: drawStatic, drawDynamic: drawDynamic, drawShade: drawShade, drawLighting: drawLighting };
})();
