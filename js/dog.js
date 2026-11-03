'use strict';

// Dog's Room: Dog herself.
// She is drawn in code, pixel by pixel, from Daniel's reference photos:
// a cream and fawn Himalayan / Scottish Fold with a seal-brown mask, paws
// and folded ears, blue eyes, a big chest ruff and a smoky plume of a tail.
// Local coordinates: x grows toward her nose, y = 0 is the floor line.

window.DogSprite = (function () {
  var C = {
    cream: '#f2e5cd', fawn: '#ddc39c', shade: '#c7a77d', ruff: '#fbf4e7',
    pt: '#4e3528', ptD: '#34231b', tail: '#a07e62', tailD: '#6b4f3c',
    eye: '#8fc6ee', pupil: '#24384f', nose: '#2a1a14', tongue: '#ef8d9a',
    whisker: 'rgba(255,250,240,0.85)'
  };

  function hash(x, y) {
    var h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  function painter(c, ox, oy, dir) {
    var p = {
      px: function (x, y, col) {
        x = Math.round(x); y = Math.round(y);
        c.fillStyle = col;
        c.fillRect(dir > 0 ? ox + x : ox - x - 1, oy + y, 1, 1);
      },
      rect: function (x, y, w, h, col) {
        x = Math.round(x); y = Math.round(y);
        if (w <= 0 || h <= 0) return;
        c.fillStyle = col;
        c.fillRect(dir > 0 ? ox + x : ox - x - w, oy + y, w, h);
      },
      // A fuzzy filled ellipse: the edge noise reads as fur.
      blob: function (cx, cy, rx, ry, col, fuzz) {
        if (fuzz == null) fuzz = 0.4;
        var x0 = Math.floor(cx - rx - 1), x1 = Math.ceil(cx + rx + 1);
        var y0 = Math.floor(cy - ry - 1), y1 = Math.ceil(cy + ry + 1);
        for (var y = y0; y <= y1; y++) {
          for (var x = x0; x <= x1; x++) {
            var nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry;
            var d = nx * nx + ny * ny;
            if (d < 1 + fuzz * (hash(x, y) - 0.5)) {
              p.px(x, y, typeof col === 'function' ? col(nx, ny, x, y) : col);
            }
          }
        }
      }
    };
    return p;
  }

  function bodyCol(nx, ny, x, y) {
    if (nx < -0.7 && ny < 0.2) return C.shade;
    if (ny < -0.5) return hash(x, y + 7) < 0.5 ? C.shade : C.fawn;
    if (ny < 0.35) return C.fawn;
    return C.cream;
  }
  function ruffCol(nx, ny) { return ny > 0.55 ? C.cream : C.ruff; }

  function head(p, hx, hy, a) {
    p.blob(hx - 1, hy + 2.5, 6, 4, C.ruff, 0.8);
    p.blob(hx, hy, 6, 5.5, C.cream, 0.45);
    p.blob(hx + 2.5, hy + 0.8, 4, 4.2, C.pt, 0.35);
    p.blob(hx + 5.2, hy + 1.6, 1.8, 1.6, C.ptD, 0);
    // Folded ears: small dark caps lying forward on the head
    p.rect(hx - 3, hy - 6, 4, 2, C.pt);
    p.px(hx + 1, hy - 5, C.pt);
    p.rect(hx + 1, hy - 6, 2, 1, C.ptD);
    if (a.eyesClosed || a.blink) {
      p.rect(hx + 3, hy, 2, 1, C.ptD);
    } else {
      p.rect(hx + 3, hy - 1, 2, 2, C.eye);
      p.px(hx + 4, hy, C.pupil);
      p.px(hx + 3, hy - 1, '#ffffff');
    }
    p.px(hx + 7, hy + 1, C.nose);
    p.px(hx + 8, hy + 2, C.whisker);
    p.px(hx + 9, hy + 3, C.whisker);
    if (a.blep) {
      p.px(hx + 6, hy + 3, C.tongue);
      p.px(hx + 6, hy + 4, C.tongue);
    }
  }

  function legs(p, a, far) {
    var amp = a.move ? (a.run ? 3 : 1.6) : 0;
    var set = far ? [[-7, Math.PI], [9, 0]] : [[-10, 0], [6, Math.PI]];
    for (var i = 0; i < set.length; i++) {
      var ph = a.phase + set[i][1];
      var dx = Math.sin(ph) * amp;
      var lift = a.move ? Math.round(Math.max(0, Math.cos(ph)) * (a.run ? 2 : 1)) : 0;
      p.rect(set[i][0] + dx, -5, 3, 5 - lift, far ? C.ptD : C.pt);
    }
  }

  function tailPlume(p, a, base) {
    var s = a.tail;
    var pts = a.run
      ? [[-14, -11, 3.8], [-18, -12, 3.8], [-22, -13, 3.5], [-25, -14, 3]]
      : [[-13, -11, 4], [-16, -14, 4.2], [-17 + s, -18, 4], [-16 + s * 2, -22, 3.6], [-14 + s * 2.5, -25, 3]];
    for (var i = 0; i < pts.length; i++) {
      p.blob(pts[i][0] + base, pts[i][1], pts[i][2], pts[i][2], i < 2 ? C.tail : C.tailD, 0.9);
    }
  }

  var POSES = {
    stand: function (p, a) {
      tailPlume(p, a, 0);
      legs(p, a, true);
      if (a.run) p.blob(-1, -9, 14, 5.5, bodyCol, 0.5);
      else p.blob(-1, -9.5, 13, 6.5, bodyCol, 0.5);
      p.blob(0, -4.5, 10.5, 2.5, C.cream, 1);
      p.blob(8, -9.5, 6, 6.5, ruffCol, 0.7);
      legs(p, a, false);
      if (a.drink) head(p, 14, -8, a);
      else head(p, 12, -16, a);
    },
    sit: function (p, a) {
      p.blob(-3, -7.5, 9, 7.5, bodyCol, 0.5);
      p.rect(-1, -3, 5, 3, C.pt);
      p.blob(4, -11.5, 6, 7.5, ruffCol, 0.7);
      p.rect(3, -5, 2, 5, C.ptD);
      p.rect(6, -5, 2, 5, C.pt);
      for (var i = 0; i < 6; i++) {
        var tip = i === 5 ? a.tail : 0;
        p.blob(-11 + i * 3.2 + tip, -2, 3, 2.4, i > 3 ? C.tailD : C.tail, 0.6);
      }
      head(p, 6, -22, a);
    },
    loaf: function (p, a) {
      p.blob(-1, -6, 13, 6, bodyCol, 0.5);
      p.blob(8, -7, 5, 5.5, ruffCol, 0.6);
      p.rect(11, -2, 4, 2, C.pt);
      for (var i = 0; i < 6; i++) p.blob(-12 + i * 3.4, -1.5, 2.6, 2, i > 3 ? C.tailD : C.tail, 0.6);
      head(p, 11, -12, a);
    },
    curl: function (p, a) {
      var breath = a.breath > 0 ? 0.5 : 0;
      p.blob(0, -6, 12, 6 + breath, bodyCol, 0.5);
      p.blob(7, -6, 5, 4.5, C.cream, 0.5);
      p.blob(8.5, -5, 3.5, 3.2, C.pt, 0.3);
      p.rect(8, -6, 2, 1, C.ptD);
      p.rect(5, -10, 3, 1, C.pt);
      var tail = [[10, -2, 2.6], [5, -1.5, 2.6], [0, -1.5, 2.4], [-5, -1.5, 2.2]];
      for (var i = 0; i < tail.length; i++) p.blob(tail[i][0], tail[i][1], tail[i][2], 2, C.tailD, 0.6);
    },
    flop: function (p, a) {
      for (var t = 0; t < 3; t++) p.blob(-14 - t * 4, -3, 3, 2.5, t ? C.tailD : C.tail, 0.6);
      var wig = a.wiggle;
      var lx = [-8, -5, 6, 9];
      for (var i = 0; i < lx.length; i++) {
        var w = Math.round(Math.sin(wig + i) * 1);
        p.rect(lx[i], -13 + w, 2, 6, C.pt);
      }
      p.blob(0, -5, 13, 5, function (nx, ny) { return ny < -0.1 ? C.ruff : C.fawn; }, 0.5);
      p.blob(13, -4, 5.5, 5, C.cream, 0.45);
      p.blob(14, -3, 3.5, 3.5, C.pt, 0.3);
      if (a.blink) p.rect(15, -3, 2, 1, C.ptD);
      else { p.rect(15, -3, 2, 2, C.eye); p.px(16, -3, C.pupil); }
      p.rect(10, 0, 3, 1, C.pt);
    }
  };

  function draw(c, dog, t) {
    var ox = Math.round(dog.x);
    var oy = Math.round(dog.y);
    // Soft shadow under her
    if (!dog.airborne) {
      c.fillStyle = 'rgba(40,24,48,0.22)';
      c.fillRect(ox - 13, oy - 1, 26, 2);
      c.fillRect(ox - 10, oy, 20, 1);
    }
    var p = painter(c, ox, oy, dog.dir);
    var a = {
      phase: dog.phase,
      tail: Math.round(Math.sin(t * (dog.pose === 'walk' ? 2.6 : 1.3)) * 1.5),
      blink: dog.blink,
      blep: dog.blep,
      breath: Math.sin(t * 2.2),
      wiggle: t * 5,
      eyesClosed: false,
      move: dog.pose === 'walk' || dog.pose === 'run' || dog.pose === 'leap',
      run: dog.pose === 'run' || dog.pose === 'leap',
      drink: dog.pose === 'drink'
    };
    if (dog.pose === 'drink' && Math.sin(t * 9) > 0.3) a.blep = true;
    if (dog.pose === 'leap') a.phase = 0.6;
    var poseFn = POSES[dog.pose] || (dog.pose === 'curl' ? POSES.curl : POSES.stand);
    poseFn(p, a);
  }

  return { draw: draw };
})();
