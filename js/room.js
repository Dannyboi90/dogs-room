'use strict';

// Dog's Room: the living room, painted in a soft hand-drawn anime style.
// The world is laid out in 320 x 180 units and rendered at 5x (1600 x 900)
// for smooth painted shapes. drawStatic() runs once; drawDynamic() and
// drawLighting() run every frame.

window.Room = (function () {
  var W = 320;
  var H = 180;
  var S = 5;

  // ---------- Helpers ----------

  function rng(seed) {
    return function () {
      seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function rgba(rgb, a) { return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + a + ')'; }

  function lin(c, x0, y0, x1, y1, stops) {
    var g = c.createLinearGradient(x0, y0, x1, y1);
    for (var i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
    return g;
  }

  function rad(c, x, y, r, stops) {
    var g = c.createRadialGradient(x, y, 0, x, y, r);
    for (var i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
    return g;
  }

  function rr(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  function fillRR(c, x, y, w, h, r, style) { rr(c, x, y, w, h, r); c.fillStyle = style; c.fill(); }

  function ellipse(c, x, y, rx, ry, style, rot) {
    c.beginPath();
    c.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2);
    c.fillStyle = style;
    c.fill();
  }

  function blot(c, x, y, r, rgb, a) {
    c.fillStyle = rad(c, x, y, r, [[0, rgba(rgb, a)], [1, rgba(rgb, 0)]]);
    c.fillRect(x - r, y - r, r * 2, r * 2);
  }

  function hsl(h, s, l, a) { return 'hsla(' + Math.round(h) + ',' + s + '%,' + l + '%,' + (a == null ? 1 : a) + ')'; }

  function beat(t) {
    var b = (t * 124 / 60) % 1;
    return Math.pow(1 - b, 3);
  }

  // ---------- Static scene ----------

  function drawStatic(c) {
    drawWall(c);
    drawFloor(c);
    drawWindowFrame(c);
    drawLamp(c);
    drawArtFrames(c);
    drawChandelier(c);
    drawHangingPlant(c);
    drawSofa(c);
    drawRug(c);
    drawCoffeeTable(c);
    drawTvAndConsole(c);
    drawWaterBowl(c);
    drawFloorPlant(c);
  }

  function drawWall(c) {
    c.fillStyle = lin(c, 0, 0, 0, 130, [[0, '#f7ecd6'], [0.6, '#f0e0c2'], [1, '#e8d3b1']]);
    c.fillRect(0, 0, W, 130);
    var r = rng(7);
    for (var i = 0; i < 70; i++) blot(c, r() * W, r() * 124, 6 + r() * 22, [190, 160, 120], 0.045);
    for (var j = 0; j < 40; j++) blot(c, r() * W, r() * 124, 6 + r() * 20, [255, 252, 240], 0.08);
    // Crown molding
    c.fillStyle = lin(c, 0, 0, 0, 6, [[0, '#fbf5e8'], [1, '#efe2c9']]);
    c.fillRect(0, 0, W, 6);
    c.fillStyle = lin(c, 0, 6, 0, 11, [[0, 'rgba(140,105,75,0.18)'], [1, 'rgba(140,105,75,0)']]);
    c.fillRect(0, 6, W, 5);
    // Soft shade where wall meets floor
    c.fillStyle = lin(c, 0, 112, 0, 124, [[0, 'rgba(120,90,65,0)'], [1, 'rgba(120,90,65,0.16)']]);
    c.fillRect(0, 112, W, 12);
    // Baseboard
    c.fillStyle = lin(c, 0, 123, 0, 130, [[0, '#f6ecd8'], [1, '#e2d1b2']]);
    c.fillRect(0, 123, W, 7);
    c.fillStyle = 'rgba(120,90,65,0.25)';
    c.fillRect(0, 129.4, W, 0.6);
  }

  function drawFloor(c) {
    c.fillStyle = lin(c, 0, 130, 0, 180, [[0, '#dfcdac'], [1, '#d2bb95']]);
    c.fillRect(0, 130, W, 50);
    var r = rng(19);
    var rows = [130, 137, 146, 158, 172, 180];
    for (var i = 0; i < rows.length - 1; i++) {
      var step = 34 + i * 10;
      for (var x = -(i % 2) * step / 2; x < W; x += step) {
        c.fillStyle = r() < 0.5 ? 'rgba(255,250,235,0.07)' : 'rgba(150,120,85,0.06)';
        c.fillRect(x, rows[i], step, rows[i + 1] - rows[i]);
        c.fillStyle = 'rgba(140,110,80,0.22)';
        c.fillRect(x, rows[i], 0.35, rows[i + 1] - rows[i]);
      }
      c.fillStyle = 'rgba(140,110,80,0.22)';
      c.fillRect(0, rows[i], W, 0.35);
    }
    // Soft reflection of the window on the tiles
    c.fillStyle = lin(c, 0, 131, 0, 175, [[0, 'rgba(255,255,255,0.22)'], [1, 'rgba(255,255,255,0)']]);
    c.fillRect(16, 131, 52, 44);
  }

  function drawWindowFrame(c) {
    c.fillStyle = 'rgba(120,90,60,0.18)';
    rr(c, 11, 15, 64, 98, 2); c.fill();
    fillRR(c, 10, 14, 64, 98, 2, lin(c, 10, 14, 74, 112, [[0, '#fffaf0'], [1, '#efe3cc']]));
    // Sill
    fillRR(c, 7, 106, 70, 5, 1.2, lin(c, 0, 106, 0, 111, [[0, '#fffaf0'], [1, '#e6d8bd']]));
    c.fillStyle = lin(c, 0, 111, 0, 115, [[0, 'rgba(120,90,60,0.22)'], [1, 'rgba(120,90,60,0)']]);
    c.fillRect(7, 111, 70, 4);
    // Curtain rod
    c.fillStyle = lin(c, 0, 10, 0, 12.5, [[0, '#d8b673'], [1, '#9c7a43']]);
    rr(c, 0, 10, 86, 2.2, 1); c.fill();
    ellipse(c, 1, 11.1, 2, 2, '#b8924f');
    ellipse(c, 85, 11.1, 2, 2, '#b8924f');
  }

  function drawLamp(c) {
    ellipse(c, 88, 137, 8, 1.8, 'rgba(90,60,40,0.22)');
    ellipse(c, 88, 135.6, 6, 1.6, '#3a302a');
    c.fillStyle = lin(c, 87, 0, 89, 0, [[0, '#2c2420'], [0.5, '#6b5a4c'], [1, '#2c2420']]);
    c.fillRect(87.3, 62, 1.4, 74);
    c.beginPath();
    c.moveTo(82.5, 47); c.lineTo(93.5, 47); c.lineTo(97, 63); c.lineTo(79, 63); c.closePath();
    c.fillStyle = lin(c, 79, 0, 97, 0, [[0, '#ead2a3'], [0.45, '#fff2d2'], [1, '#e3c58f']]);
    c.fill();
    c.fillStyle = 'rgba(160,120,70,0.25)';
    c.fillRect(79, 62.2, 18, 0.8);
  }

  function drawArtFrames(c) {
    // Frame for Daniel's crayon drawing; the picture itself is drawn each frame
    c.fillStyle = 'rgba(90,60,40,0.22)';
    rr(c, 127.2, 31.2, 26, 31, 1); c.fill();
    fillRR(c, 126, 30, 26, 31, 1, lin(c, 126, 30, 152, 61, [[0, '#9a6343'], [1, '#6b3f27']]));
    fillRR(c, 127.5, 31.5, 23, 28, 0.6, '#f7f2e6');

    // Seascape painting
    c.fillStyle = 'rgba(90,60,40,0.22)';
    rr(c, 167.2, 37.2, 38, 25, 0.8); c.fill();
    fillRR(c, 166, 36, 38, 25, 0.8, '#2b2a2e');
    c.save();
    rr(c, 167.2, 37.2, 35.6, 22.6, 0.4); c.clip();
    c.fillStyle = lin(c, 0, 37, 0, 60, [[0, '#b9d8ea'], [0.42, '#e7eef0'], [0.45, '#5c94b4'], [0.78, '#2f6385'], [0.82, '#e6cf9f'], [1, '#d5b985']]);
    c.fillRect(166, 36, 40, 26);
    var r = rng(4);
    for (var i = 0; i < 26; i++) {
      c.fillStyle = 'rgba(255,255,255,' + (0.35 + r() * 0.4).toFixed(2) + ')';
      c.fillRect(167 + r() * 36, 48 + r() * 8, 1.5 + r() * 3, 0.35);
    }
    blot(c, 196, 42, 4, [255, 240, 210], 0.6);
    c.restore();
  }

  function drawChandelier(c) {
    c.strokeStyle = '#3a2f29';
    c.lineWidth = 0.6;
    c.beginPath(); c.moveTo(160, 6); c.lineTo(160, 15); c.stroke();
    ellipse(c, 160, 16, 3.2, 1.6, '#3a2f29');
    var xs = [146, 152, 160, 168, 174];
    for (var i = 0; i < xs.length; i++) {
      c.beginPath();
      c.moveTo(160, 16.5);
      c.quadraticCurveTo((160 + xs[i]) / 2, 22, xs[i], 19.5);
      c.stroke();
      c.beginPath();
      c.moveTo(xs[i] - 2.2, 21.5); c.lineTo(xs[i] - 1.2, 17.6); c.lineTo(xs[i] + 1.2, 17.6); c.lineTo(xs[i] + 2.2, 21.5); c.closePath();
      c.fillStyle = lin(c, xs[i] - 2, 0, xs[i] + 2, 0, [[0, '#e8cf9f'], [0.5, '#fff3d6'], [1, '#e1c38c']]);
      c.fill();
    }
  }

  function leaf(c, x, y, len, w, ang, col) {
    c.save();
    c.translate(x, y);
    c.rotate(ang);
    c.beginPath();
    c.moveTo(0, 0);
    c.quadraticCurveTo(len * 0.5, -w, len, 0);
    c.quadraticCurveTo(len * 0.5, w, 0, 0);
    c.fillStyle = col;
    c.fill();
    c.restore();
  }

  function drawHangingPlant(c) {
    c.strokeStyle = 'rgba(150,120,85,0.8)';
    c.lineWidth = 0.35;
    c.beginPath();
    c.moveTo(236, 6); c.lineTo(231, 34);
    c.moveTo(236, 6); c.lineTo(241, 34);
    c.moveTo(236, 6); c.lineTo(236, 34);
    c.stroke();
    fillRR(c, 230, 33, 12, 7, 3, lin(c, 230, 0, 242, 0, [[0, '#c87d55'], [0.5, '#e09b70'], [1, '#b56b45']]));
    var greens = ['#5f9a52', '#78b366', '#4b8446', '#8cc477'];
    var r = rng(31);
    var vines = [[232, 34, 30], [236, 37, 42], [240, 34, 26], [243, 36, 18]];
    for (var v = 0; v < vines.length; v++) {
      var vx = vines[v][0], vy = vines[v][1], vl = vines[v][2];
      c.strokeStyle = '#4f7f45';
      c.lineWidth = 0.3;
      c.beginPath();
      c.moveTo(vx, vy);
      c.quadraticCurveTo(vx + (r() - 0.5) * 6, vy + vl / 2, vx + (r() - 0.5) * 4, vy + vl);
      c.stroke();
      for (var k = 0; k < vl; k += 3) {
        var lx = vx + Math.sin(k * 0.4 + v) * 1.5;
        leaf(c, lx, vy + k, 3.2, 1.4, (k % 6 ? 0.6 : 2.5), greens[Math.floor(r() * greens.length)]);
      }
    }
    for (var n = 0; n < 9; n++) leaf(c, 230 + r() * 12, 32 + r() * 2, 4, 1.8, -0.4 - r() * 2.2, greens[n % greens.length]);
  }

  function drawSofa(c) {
    ellipse(c, 150, 142, 64, 4, 'rgba(70,45,40,0.22)');
    // Back
    fillRR(c, 96, 89, 108, 36, 7, lin(c, 0, 89, 0, 125, [[0, '#566ba3'], [1, '#3e5286']]));
    fillRR(c, 99, 91, 51, 31, 6, lin(c, 0, 91, 0, 122, [[0, '#5d73ad'], [1, '#43578d']]));
    fillRR(c, 150, 91, 51, 31, 6, lin(c, 0, 91, 0, 122, [[0, '#5d73ad'], [1, '#43578d']]));
    c.fillStyle = 'rgba(255,255,255,0.12)';
    rr(c, 102, 92, 45, 3, 1.5); c.fill();
    rr(c, 153, 92, 45, 3, 1.5); c.fill();
    // Arms
    fillRR(c, 87, 103, 17, 39, 6, lin(c, 87, 0, 104, 0, [[0, '#4a5e96'], [1, '#384a7c']]));
    fillRR(c, 196, 103, 17, 39, 6, lin(c, 196, 0, 213, 0, [[0, '#384a7c'], [1, '#4a5e96']]));
    c.fillStyle = 'rgba(255,255,255,0.14)';
    rr(c, 89, 104, 13, 3, 1.5); c.fill();
    rr(c, 198, 104, 13, 3, 1.5); c.fill();
    // Seat and front
    fillRR(c, 100, 117, 100, 9, 3, lin(c, 0, 117, 0, 126, [[0, '#6479b1'], [1, '#4d6299']]));
    c.fillStyle = 'rgba(40,40,70,0.3)';
    c.fillRect(150, 118, 0.5, 8);
    fillRR(c, 98, 124, 104, 15, 4, lin(c, 0, 124, 0, 139, [[0, '#45598f'], [1, '#33446f']]));
    c.fillStyle = 'rgba(30,30,60,0.35)';
    c.fillRect(100, 124.3, 100, 0.5);
    // Legs
    fillRR(c, 96, 138.5, 3, 4, 1, '#3a2620');
    fillRR(c, 201, 138.5, 3, 4, 1, '#3a2620');

    // Leaf pillow
    pillow(c, 103, 98, 20, 22, '#f1ead8', '#ddd2b9');
    var r = rng(12);
    c.save();
    rr(c, 103, 98, 20, 22, 6); c.clip();
    for (var i = 0; i < 9; i++) leaf(c, 104 + r() * 17, 100 + r() * 19, 6, 1.6, r() * 6.28, i % 2 ? '#6aa497' : '#94c4b4');
    c.restore();
    // Cream knit pillow
    pillow(c, 125, 100, 18, 20, '#f6f1e5', '#e1d9c6');
    c.strokeStyle = 'rgba(190,175,150,0.6)';
    c.lineWidth = 0.3;
    for (var y = 103; y < 118; y += 2.2) {
      c.beginPath();
      for (var x = 127; x < 141; x += 2) c.arc(x + 1, y, 0.9, Math.PI, 0);
      c.stroke();
    }
    // Navy pillow (her cushion)
    pillow(c, 177, 99, 21, 21, '#3a4f92', '#2a3a72');
    c.fillStyle = 'rgba(255,255,255,0.08)';
    for (var k = 0; k < 6; k++) c.fillRect(179, 102 + k * 3, 17, 0.6);

    drawBear(c, 160.5, 108.5);
  }

  function pillow(c, x, y, w, h, light, dark) {
    c.fillStyle = 'rgba(30,30,60,0.25)';
    rr(c, x + 0.8, y + 1, w, h, 6); c.fill();
    fillRR(c, x, y, w, h, 6, lin(c, x, y, x + w * 0.4, y + h, [[0, light], [1, dark]]));
    c.fillStyle = 'rgba(255,255,255,0.25)';
    rr(c, x + 2, y + 1.5, w - 6, 2, 1); c.fill();
  }

  function drawBear(c, x, y) {
    // Body in orange plaid
    fillRR(c, x, y + 6, 10, 7, 3, '#e47b2f');
    c.save();
    rr(c, x, y + 6, 10, 7, 3); c.clip();
    c.fillStyle = 'rgba(40,30,25,0.55)';
    for (var i = 0; i < 10; i += 2.5) c.fillRect(x + i, y + 6, 1.1, 7);
    for (var j = 0; j < 7; j += 2.5) c.fillRect(x, y + 6 + j, 10, 1.1);
    c.restore();
    // Head
    ellipse(c, x + 1.6, y + 1.2, 1.7, 1.7, '#7a4b30');
    ellipse(c, x + 8.4, y + 1.2, 1.7, 1.7, '#7a4b30');
    ellipse(c, x + 5, y + 3.6, 4.8, 3.9, lin(c, 0, y, 0, y + 7, [[0, '#93603f'], [1, '#6e432a']]));
    ellipse(c, x + 5, y + 5, 2, 1.3, '#e4c19a');
    ellipse(c, x + 3.4, y + 3.3, 0.45, 0.55, '#2a1d17');
    ellipse(c, x + 6.6, y + 3.3, 0.45, 0.55, '#2a1d17');
    ellipse(c, x + 5, y + 4.6, 0.55, 0.38, '#2a1d17');
    ellipse(c, x + 2.6, y + 4.6, 0.7, 0.45, 'rgba(255,150,160,0.5)');
    ellipse(c, x + 7.4, y + 4.6, 0.7, 0.45, 'rgba(255,150,160,0.5)');
  }

  function drawRug(c) {
    ellipse(c, 170, 172.5, 108, 2.2, 'rgba(80,60,50,0.18)');
    fillRR(c, 64, 148, 212, 24, 2, lin(c, 0, 148, 0, 172, [[0, '#9fb3c8'], [1, '#869cb4']]));
    var r = rng(27);
    for (var i = 0; i < 60; i++) blot(c, 64 + r() * 212, 148 + r() * 24, 2 + r() * 5, r() < 0.5 ? [255, 255, 255] : [60, 80, 110], 0.06);
    c.strokeStyle = 'rgba(244,240,226,0.85)';
    c.lineWidth = 0.55;
    c.strokeRect(66.5, 150, 207, 20);
    var centers = [104, 170, 236];
    for (var k = 0; k < centers.length; k++) {
      var cx = centers[k];
      c.beginPath();
      c.moveTo(cx - 9, 160); c.lineTo(cx, 153); c.lineTo(cx + 9, 160); c.lineTo(cx, 167); c.closePath();
      c.moveTo(cx - 4, 160); c.lineTo(cx, 157); c.lineTo(cx + 4, 160); c.lineTo(cx, 163); c.closePath();
      c.stroke();
    }
    c.strokeStyle = 'rgba(244,238,220,0.9)';
    c.lineWidth = 0.4;
    for (var y = 149; y < 171.5; y += 1.4) {
      c.beginPath(); c.moveTo(64, y); c.lineTo(61.3, y + 0.3); c.stroke();
      c.beginPath(); c.moveTo(276, y); c.lineTo(278.7, y + 0.3); c.stroke();
    }
  }

  function drawCoffeeTable(c) {
    ellipse(c, 233, 160, 26, 2, 'rgba(70,40,35,0.3)');
    fillRR(c, 213, 141, 3, 19, 1, '#5a271d');
    fillRR(c, 250, 141, 3, 19, 1, '#5a271d');
    fillRR(c, 211, 140, 44, 4, 1, '#6a2e22');
    fillRR(c, 209.5, 135.6, 47, 4.8, 1.5, lin(c, 0, 135.6, 0, 140.4, [[0, '#a95a40'], [0.35, '#86402e'], [1, '#62291e']]));
    c.fillStyle = 'rgba(255,230,200,0.35)';
    c.fillRect(211, 136, 44, 0.5);
    // Rainbow runner
    var stripes = ['#de5b62', '#f29a5d', '#f3d067', '#71c0ae', '#5f8cd8', '#a873d2'];
    for (var i = 0; i < 7; i++) {
      c.fillStyle = stripes[i % stripes.length];
      c.fillRect(235, 135.2 + i * 2, 13, 2.05);
    }
    c.fillStyle = 'rgba(255,255,255,0.15)';
    c.fillRect(235, 135.2, 13, 0.6);
    c.fillStyle = 'rgba(60,30,30,0.2)';
    c.fillRect(247.4, 135.2, 0.6, 14);
    // Laptop shell (screen drawn each frame)
    fillRR(c, 213.5, 121.5, 19, 14, 1, '#3c4048');
    fillRR(c, 211.5, 134.6, 23, 1.6, 0.6, lin(c, 0, 134.6, 0, 136.2, [[0, '#d2d7de'], [1, '#8f969f']]));
    // Mug of tea
    c.strokeStyle = '#efe6d6';
    c.lineWidth = 0.8;
    c.beginPath(); c.arc(255.3, 132.8, 1.5, -Math.PI / 2, Math.PI / 2); c.stroke();
    fillRR(c, 249.5, 129.5, 5.6, 6.3, 1.2, lin(c, 249.5, 0, 255, 0, [[0, '#fbf6ec'], [1, '#e2d8c6']]));
    ellipse(c, 252.3, 129.8, 2.6, 0.7, '#7a4a2a');
  }

  function drawTvAndConsole(c) {
    // Console
    ellipse(c, 290, 141, 32, 2, 'rgba(50,40,40,0.28)');
    fillRR(c, 260, 113.5, 60, 27.5, 2, lin(c, 0, 113.5, 0, 141, [[0, '#33343d'], [1, '#22232a']]));
    c.fillStyle = 'rgba(255,255,255,0.08)';
    c.fillRect(261, 114, 58, 0.6);
    fillRR(c, 263.5, 118, 24, 9.5, 1, '#17171c');
    fillRR(c, 291, 118, 26, 9.5, 1, '#17171c');
    fillRR(c, 263.5, 130, 53.5, 8.5, 1, '#17171c');
    var spines = ['#d0644d', '#e8bb57', '#5b8bb5', '#82b072', '#e09a77', '#9579bd', '#efe6d0'];
    for (var i = 0; i < 9; i++) {
      var h = 7 + (i % 3 === 0 ? -1.2 : 0);
      fillRR(c, 264.6 + i * 2.4, 127 - h, 2.1, h, 0.4, spines[i % spines.length]);
    }
    for (var k = 0; k < 11; k++) fillRR(c, 265 + k * 4.6, 132.2, 3.8, 6, 0.4, spines[(k + 3) % spines.length]);
    c.fillStyle = '#f3ead8';
    c.font = 'bold 8px Georgia, "Times New Roman", serif';
    c.textBaseline = 'alphabetic';
    c.fillText('D', 300, 126.4);
    fillRR(c, 263, 140.5, 3, 2, 0.5, '#1a1a1f');
    fillRR(c, 314, 140.5, 3, 2, 0.5, '#1a1a1f');
    // TV
    fillRR(c, 286, 108, 8, 6, 1, '#22232a');
    fillRR(c, 261, 62.5, 58, 46.5, 2, '#1e1f26');
    c.fillStyle = 'rgba(255,255,255,0.08)';
    c.fillRect(262, 63, 56, 0.5);
  }

  function drawWaterBowl(c) {
    ellipse(c, 297.5, 159.4, 7, 1.4, 'rgba(70,50,40,0.25)');
    c.beginPath();
    c.moveTo(291.5, 155.5); c.lineTo(303.5, 155.5); c.lineTo(302.3, 159); c.lineTo(292.7, 159); c.closePath();
    c.fillStyle = lin(c, 291, 0, 304, 0, [[0, '#f3efe8'], [1, '#d2ccc2']]);
    c.fill();
    ellipse(c, 297.5, 155.5, 6, 1.2, '#eef4f6');
    ellipse(c, 297.5, 155.6, 4.8, 0.8, '#8cc3dc');
  }

  function drawFloorPlant(c) {
    ellipse(c, 30, 151, 10, 2, 'rgba(70,50,40,0.25)');
    var r = rng(55);
    var greens = ['#4f8a4a', '#69a35a', '#86bf6f', '#3f7442'];
    for (var i = 0; i < 22; i++) {
      var ang = -Math.PI / 2 + (r() - 0.5) * 2.4;
      var len = 10 + r() * 14;
      var bx = 30 + (r() - 0.5) * 4;
      c.strokeStyle = '#3f6e3c';
      c.lineWidth = 0.35;
      c.beginPath();
      c.moveTo(bx, 140);
      var ex = bx + Math.cos(ang) * len, ey = 140 + Math.sin(ang) * len;
      c.quadraticCurveTo(bx, 140 - len * 0.4, ex, ey);
      c.stroke();
      leaf(c, ex, ey, 7 + r() * 3, 3 + r() * 1.2, ang + (r() - 0.5) * 0.8, greens[i % greens.length]);
    }
    c.beginPath();
    c.moveTo(23, 139); c.lineTo(37, 139); c.lineTo(35, 151); c.lineTo(25, 151); c.closePath();
    c.fillStyle = lin(c, 23, 0, 37, 0, [[0, '#b9694a'], [0.45, '#e09a72'], [1, '#a95d40']]);
    c.fill();
    fillRR(c, 22, 137.5, 16, 2.5, 1, '#c97a55');
  }

  // ---------- Dynamic scene ----------

  var clouds = [
    { x: 18, y: 34, s: 1.0, v: 0.55 },
    { x: 52, y: 52, s: 0.75, v: 0.4 },
    { x: 80, y: 28, s: 0.9, v: 0.5 }
  ];
  var lastT = null;

  function cloud(c, x, y, s) {
    var puffs = [[0, 0, 7], [7, -3, 8], [15, 0, 6.5], [-6, 2, 5], [11, 3, 6], [3, 3, 6]];
    for (var i = 0; i < puffs.length; i++) {
      ellipse(c, x + puffs[i][0] * s, y + puffs[i][1] * s + 1.6 * s, puffs[i][2] * s, puffs[i][2] * s * 0.85, 'rgba(176,196,222,0.9)');
    }
    for (var j = 0; j < puffs.length; j++) {
      ellipse(c, x + puffs[j][0] * s, y + puffs[j][1] * s, puffs[j][2] * s, puffs[j][2] * s * 0.85, '#fdfdfb');
    }
    for (var k = 0; k < 3; k++) ellipse(c, x + puffs[k][0] * s - 1.5 * s, y + puffs[k][1] * s - 2 * s, puffs[k][2] * s * 0.5, puffs[k][2] * s * 0.35, 'rgba(255,255,255,0.9)');
  }

  function foliage(c, x, y, s, sway, shades) {
    var blobs = [[0, 0, 9], [-8, 4, 8], [8, 3, 9], [-3, -7, 7], [6, -6, 7], [0, 8, 9]];
    for (var p = 0; p < shades.length; p++) {
      for (var i = 0; i < blobs.length; i++) {
        var off = p * 1.2;
        ellipse(c, x + (blobs[i][0] - off) * s + sway * (1 - p * 0.3), y + (blobs[i][1] - off) * s, blobs[i][2] * s * (1 - p * 0.18), blobs[i][2] * s * (0.85 - p * 0.15), shades[p]);
      }
    }
  }

  function drawWindowView(c, t, calm) {
    c.save();
    rr(c, 14, 18, 56, 88, 0.5);
    c.clip();
    c.fillStyle = lin(c, 0, 18, 0, 106, [[0, '#5fa8de'], [0.55, '#a9d6ef'], [1, '#f6efd6']]);
    c.fillRect(14, 18, 56, 88);
    blot(c, 62, 30, 22, [255, 250, 225], 0.55);
    for (var i = 0; i < clouds.length; i++) {
      var cl = clouds[i];
      var cx = ((cl.x + t * cl.v * calm) % 110) - 25;
      cloud(c, cx, cl.y, cl.s);
    }
    // Distant hills
    c.fillStyle = '#9fc79a';
    c.beginPath(); c.moveTo(14, 92);
    c.quadraticCurveTo(30, 82, 46, 90); c.quadraticCurveTo(58, 85, 70, 89); c.lineTo(70, 106); c.lineTo(14, 106); c.closePath();
    c.fill();
    var sway = Math.sin(t * 0.9 * calm) * 0.9;
    foliage(c, 20, 96, 1.0, sway, ['#3f7a45', '#5a9a52', '#7cb766']);
    foliage(c, 64, 92, 1.1, sway * 0.8, ['#3b7241', '#548f4d', '#76af63']);
    foliage(c, 42, 104, 0.8, sway * 0.6, ['#43804a', '#62a159', '#89c273']);
    // A palm frond leaning into the top corner
    c.save();
    c.translate(70, 18);
    c.rotate(0.15 + Math.sin(t * 1.1 * calm) * 0.05);
    c.strokeStyle = '#4b7d3e';
    c.lineWidth = 0.6;
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-12, 6, -24, 16); c.stroke();
    for (var f = 1; f < 12; f++) {
      var fx = -f * 2, fy = f * 1.35;
      leaf(c, fx, fy, 6, 0.9, 1.9, f % 2 ? '#5f9a4e' : '#4d8642');
      leaf(c, fx, fy, 6, 0.9, 3.4, f % 2 ? '#4d8642' : '#6aa457');
    }
    c.restore();
    // Glass sheen
    c.fillStyle = 'rgba(255,255,255,0.12)';
    c.beginPath(); c.moveTo(20, 18); c.lineTo(32, 18); c.lineTo(16, 60); c.lineTo(14, 60); c.lineTo(14, 34); c.closePath(); c.fill();
    c.restore();
    // Mullions
    fillRR(c, 40.8, 18, 2.4, 88, 0.5, '#f7efdf');
    fillRR(c, 14, 61, 56, 2.4, 0.5, '#f7efdf');
    c.fillStyle = 'rgba(120,90,60,0.15)';
    c.fillRect(14, 63.4, 56, 0.6);
  }

  function drawCurtains(c, t, calm) {
    var panels = [[1, 21], [63, 21]];
    for (var p = 0; p < panels.length; p++) {
      var x0 = panels[p][0], w = panels[p][1];
      var folds = 5;
      for (var f = 0; f < folds; f++) {
        var fx = x0 + (f / folds) * w;
        var fw = w / folds + 1.2;
        var sway = Math.sin(t * 0.9 * calm + f * 0.7 + p) * 2.2 * calm;
        c.beginPath();
        c.moveTo(fx, 11.5);
        c.lineTo(fx + fw, 11.5);
        c.bezierCurveTo(fx + fw + sway * 0.2, 50, fx + fw + sway * 0.7, 90, fx + fw + sway + (p ? 1.5 : -1.5), 124);
        c.lineTo(fx + sway + (p ? 1.5 : -1.5), 124);
        c.bezierCurveTo(fx + sway * 0.7, 90, fx + sway * 0.2, 50, fx, 11.5);
        c.closePath();
        c.fillStyle = lin(c, fx, 0, fx + fw, 0, [[0, 'rgba(226,203,155,0.82)'], [0.5, 'rgba(250,236,203,0.78)'], [1, 'rgba(220,196,148,0.82)']]);
        c.fill();
      }
    }
  }

  function drawTvScreen(c, t, o) {
    var calm = o.reduced ? 0.15 : 1;
    var tt = t * calm;
    var pulse = o.reduced ? 0.4 : beat(t);
    c.save();
    rr(c, 264, 65.5, 52, 41, 1);
    c.clip();
    var hue = (tt * 18) % 360;
    c.fillStyle = lin(c, 0, 65, 0, 107, [[0, hsl(hue + 240, 60, 14)], [1, hsl(hue + 280, 55, 24)]]);
    c.fillRect(264, 65, 52, 42);
    c.globalCompositeOperation = 'screen';
    for (var b = 0; b < 4; b++) {
      var ox = 270 + b * 13;
      var ang = Math.sin(tt * 0.9 + b * 1.3) * 0.5;
      c.save();
      c.translate(ox, 65);
      c.rotate(ang);
      c.beginPath(); c.moveTo(-0.6, 0); c.lineTo(0.6, 0); c.lineTo(5, 38); c.lineTo(-5, 38); c.closePath();
      c.fillStyle = lin(c, 0, 0, 0, 38, [[0, hsl(hue + b * 70, 90, 70, 0.55 + 0.35 * pulse)], [1, hsl(hue + b * 70, 90, 60, 0)]]);
      c.fill();
      c.restore();
    }
    for (var k = 0; k < 9; k++) {
      var bx = 268 + ((k * 37 + tt * 6) % 46);
      var by = 72 + ((k * 23) % 20);
      blot(c, bx, by, 2 + (k % 3) + pulse * 1.5, [255, 210, 240], 0.35);
    }
    c.globalCompositeOperation = 'source-over';
    for (var bar = 0; bar < 11; bar++) {
      var h = 2 + (Math.sin(tt * 3 + bar * 1.7) * 0.5 + 0.5) * 9 * (0.6 + 0.4 * pulse);
      fillRR(c, 266.5 + bar * 4.4, 100 - h, 2.8, h, 1, hsl(hue + bar * 18, 80, 70, 0.9));
    }
    c.fillStyle = '#0b0915';
    c.beginPath();
    c.moveTo(264, 107);
    for (var cx = 264; cx <= 316; cx += 3) {
      var raise = pulse > 0.6 && (cx % 9 === 0) ? 3 : 0;
      c.quadraticCurveTo(cx + 1.5, 101.5 - raise, cx + 3, 104);
    }
    c.lineTo(316, 107);
    c.closePath();
    c.fill();
    c.restore();
  }

  function drawDynamic(c, t, o) {
    var dt = lastT === null ? 0 : Math.min(0.05, t - lastT);
    lastT = t;
    var calm = o.reduced ? 0.1 : 1;

    drawWindowView(c, t, calm);
    drawCurtains(c, t, calm);

    // Sun patch on the floor, with window bar shadows
    var shimmer = 0.26 + 0.03 * Math.sin(t * 1.3 * calm);
    c.save();
    c.beginPath();
    c.moveTo(56, 146); c.lineTo(100, 146); c.lineTo(126, 176); c.lineTo(76, 176); c.closePath();
    c.fillStyle = 'rgba(255,238,190,' + shimmer.toFixed(3) + ')';
    c.fill();
    c.fillStyle = 'rgba(160,120,80,0.08)';
    c.beginPath(); c.moveTo(77, 146); c.lineTo(80, 146); c.lineTo(103, 176); c.lineTo(99, 176); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(62, 159); c.lineTo(110, 159); c.lineTo(111.5, 161); c.lineTo(63.5, 161); c.closePath(); c.fill();
    c.restore();

    // Framed crayon drawing
    if (o.images.crayon.complete && o.images.crayon.naturalWidth) {
      c.drawImage(o.images.crayon, 128, 32, 22, 27);
    }

    // Laptop screen
    c.save();
    rr(c, 214.7, 122.7, 16.6, 11.6, 0.6);
    c.clip();
    if (o.laptopTyping) {
      c.fillStyle = '#0f1a14';
      c.fillRect(214, 122, 18, 13);
      for (var ln = 0; ln < 5; ln++) {
        var len = 3 + ((Math.floor(t * 6) * 7 + ln * 13) % 12);
        fillRR(c, 216, 124 + ln * 2, len, 0.9, 0.4, '#8be8aa');
      }
    } else if (o.images.wallpaper.complete && o.images.wallpaper.naturalWidth) {
      c.drawImage(o.images.wallpaper, 214.7, 122.7, 16.6, 11.6);
    } else {
      c.fillStyle = '#3b2a6b';
      c.fillRect(214, 122, 18, 13);
    }
    c.restore();

    drawTvScreen(c, t, o);

    // Steam from the tea
    if (!o.reduced) {
      c.strokeStyle = 'rgba(255,255,255,0.45)';
      c.lineWidth = 0.5;
      c.lineCap = 'round';
      for (var s = 0; s < 2; s++) {
        var ph = t * 1.4 + s * 2.2;
        var rise = (ph % 3) / 3;
        c.globalAlpha = 1 - rise;
        c.beginPath();
        var sx = 251.5 + s * 1.6;
        c.moveTo(sx, 128.5 - rise * 6);
        c.bezierCurveTo(sx + 1.6, 126 - rise * 6, sx - 1.6, 123.5 - rise * 6, sx, 121 - rise * 6);
        c.stroke();
      }
      c.globalAlpha = 1;
    }
  }

  // ---------- Light (runs after Dog is drawn) ----------

  var motes = [];
  (function () {
    var r = rng(91);
    for (var m = 0; m < 26; m++) motes.push({ x: r(), y: r(), p: r() * 6.28, s: 0.3 + r() * 0.5 });
  })();

  function drawLighting(c, t, o) {
    var calm = o.reduced ? 0 : 1;
    c.save();
    c.globalCompositeOperation = 'screen';
    // Sunbeams from the window
    var beams = [[18, 30, 60, 0.11], [34, 44, 74, 0.09], [50, 60, 92, 0.1]];
    for (var i = 0; i < beams.length; i++) {
      var a = beams[i][3] * (1 + 0.25 * calm * Math.sin(t * 0.7 + i * 1.7));
      c.beginPath();
      c.moveTo(beams[i][0], 20);
      c.lineTo(beams[i][1], 20);
      c.lineTo(beams[i][2] + 60, 176);
      c.lineTo(beams[i][0] + 50, 176);
      c.closePath();
      c.fillStyle = lin(c, 30, 20, 110, 176, [[0, 'rgba(255,236,190,' + a.toFixed(3) + ')'], [1, 'rgba(255,236,190,0)']]);
      c.fill();
    }
    // Lamp, chandelier and TV glow
    blot(c, 88, 56, 34, [255, 214, 150], 0.28);
    blot(c, 160, 20, 26, [255, 222, 170], 0.18);
    var pulse = o.reduced ? 0.4 : beat(t);
    var tvHue = (t * (o.reduced ? 2 : 18)) % 360;
    c.fillStyle = 'hsla(' + Math.round(tvHue + 260) + ',80%,60%,' + (0.08 + 0.08 * pulse).toFixed(3) + ')';
    c.beginPath(); c.ellipse(290, 88, 46, 40, 0, 0, Math.PI * 2); c.fill();
    c.restore();

    // Warm afternoon grade
    c.save();
    c.globalCompositeOperation = 'soft-light';
    c.fillStyle = lin(c, 0, 0, W, H, [[0, 'rgba(255,200,130,0.45)'], [0.6, 'rgba(255,225,190,0.15)'], [1, 'rgba(120,110,170,0.25)']]);
    c.fillRect(0, 0, W, H);
    c.restore();

    // Dust sparkling in the sunbeams
    for (var m = 0; m < motes.length; m++) {
      var mo = motes[m];
      var k = mo.y;
      var mx = 26 + mo.x * 40 + k * 60 + Math.sin(t * 0.35 * calm + mo.p) * 4;
      var my = 30 + k * 130 + Math.sin(t * 0.25 * calm + mo.p * 2) * 5;
      var tw = 0.35 + 0.65 * Math.max(0, Math.sin(t * 1.2 + mo.p * 3));
      ellipse(c, mx, my, mo.s, mo.s, 'rgba(255,248,225,' + (0.75 * tw).toFixed(3) + ')');
    }
  }

  return { W: W, H: H, S: S, drawStatic: drawStatic, drawDynamic: drawDynamic, drawLighting: drawLighting };
})();
