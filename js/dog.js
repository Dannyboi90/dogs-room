'use strict';

// Dog's Room: Dog herself, drawn as a soft anime-style character.
// Based on Daniel's reference photos: a cream and fawn Himalayan / Scottish
// Fold with a seal-brown mask, paws and folded ears, big blue eyes, a huge
// chest ruff and a smoky plume of a tail.
// Local coordinates: x grows toward her nose, y = 0 is the floor line.

window.DogSprite = (function () {
  var C = {
    line: '#4a3026',
    cream: '#fcf3e3', fawn: '#ecd5b0', shade: '#d8b88e', ruff: '#fffaf0',
    point: '#5b3c2c', pointD: '#462d21',
    tailBase: '#cfa985', tailTip: '#6c4c3a',
    eyeTop: '#a9dcfa', eyeBot: '#3f84c2', pupil: '#1d2a3a',
    nose: '#2b1b15', blush: 'rgba(255,140,160,0.38)', tongue: '#f28fa0'
  };
  var LW = 0.42;

  // ---------- Shapes ----------

  // A fluffy outline: an ellipse whose edge is broken into soft tufts.
  function addFluff(path, cx, cy, rx, ry, tufts, amp, seed) {
    var steps = tufts * 8;
    for (var i = 0; i <= steps; i++) {
      var th = (i / steps) * Math.PI * 2;
      var bump = 1 + amp * (0.65 * Math.pow(0.5 + 0.5 * Math.cos(th * tufts + seed), 2.5) + 0.35 * Math.pow(0.5 + 0.5 * Math.cos(th * tufts * 1.7 + seed * 2.3), 3));
      var x = cx + Math.cos(th) * rx * bump;
      var y = cy + Math.sin(th) * ry * bump;
      if (i === 0) path.moveTo(x, y); else path.lineTo(x, y);
    }
    path.closePath();
  }

  function addEllipse(path, cx, cy, rx, ry, rot) {
    path.moveTo(cx + Math.cos(rot || 0) * rx, cy + Math.sin(rot || 0) * rx);
    path.ellipse(cx, cy, rx, ry, rot || 0, 0, Math.PI * 2);
    path.closePath();
  }

  function addPill(path, x, y, w, h) {
    var r = Math.min(w, h) / 2;
    path.moveTo(x + r, y);
    path.arcTo(x + w, y, x + w, y + h, r);
    path.arcTo(x + w, y + h, x, y + h, r);
    path.arcTo(x, y + h, x, y, r);
    path.arcTo(x, y, x + w, y, r);
    path.closePath();
  }

  function build(shapes) {
    var p = new Path2D();
    for (var i = 0; i < shapes.length; i++) {
      var s = shapes[i];
      if (s.f) addFluff(p, s.f[0], s.f[1], s.f[2], s.f[3], s.f[4] || 10, s.f[5] == null ? 0.14 : s.f[5], s.f[6] || 0);
      else if (s.e) addEllipse(p, s.e[0], s.e[1], s.e[2], s.e[3], s.e[4]);
      else if (s.pill) addPill(p, s.pill[0], s.pill[1], s.pill[2], s.pill[3]);
    }
    return p;
  }

  // Outline pass, then fill, then optional shading clipped to the shape.
  // Stroking every piece before filling leaves one clean outer outline.
  function group(c, shapes, fill, shade) {
    var p = build(shapes);
    c.lineJoin = 'round';
    c.lineWidth = LW * 2;
    c.strokeStyle = C.line;
    c.stroke(p);
    c.fillStyle = fill;
    c.fill(p);
    if (shade) {
      c.save();
      c.clip(p);
      shade();
      c.restore();
    }
  }

  function lin(c, x0, y0, x1, y1, stops) {
    var g = c.createLinearGradient(x0, y0, x1, y1);
    for (var i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
    return g;
  }

  function ell(c, x, y, rx, ry, style, rot) {
    c.beginPath();
    c.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2);
    c.fillStyle = style;
    c.fill();
  }

  function bodyFill(c, top, bottom) {
    return lin(c, 0, top, 0, bottom, [[0, C.shade], [0.35, C.fawn], [0.75, C.cream], [1, C.cream]]);
  }

  function bodyShade(c, cx, cy, rx, ry) {
    return function () {
      ell(c, cx + rx * 0.1, cy + ry * 0.95, rx * 1.05, ry * 0.45, 'rgba(190,150,110,0.35)');
      ell(c, cx - rx * 0.35, cy - ry * 0.65, rx * 0.45, ry * 0.22, 'rgba(255,255,255,0.45)');
    };
  }

  // ---------- Head ----------

  function head(c, hx, hy, a) {
    var ts = a.turn * 1.3;
    // Cheek ruff and folded ears sit behind the head
    group(c, [{ f: [hx - 0.4, hy + 3.6, 8.8, 4.4, 9, 0.11, 1] }], C.ruff);
    group(c, [
      { e: [hx - 4.4 + ts * 0.5, hy - 5.6, 2.7, 1.7, -0.45] },
      { e: [hx + 4.6 + ts * 0.5, hy - 5.7, 2.7, 1.7, 0.45] }
    ], C.point);
    // Head with the Himalayan mask
    group(c, [{ f: [hx, hy, 8.2, 7.2, 12, 0.055, 2] }], lin(c, 0, hy - 7, 0, hy + 7, [[0, C.fawn], [0.4, C.cream], [1, C.cream]]), function () {
      var mx = hx + 0.6 + ts, my = hy + 1.4;
      var g = c.createRadialGradient(mx, my, 0, mx, my, 6.4);
      g.addColorStop(0, 'rgba(62,40,30,0.97)');
      g.addColorStop(0.55, 'rgba(78,52,38,0.85)');
      g.addColorStop(1, 'rgba(110,76,56,0)');
      c.fillStyle = g;
      c.beginPath();
      c.ellipse(mx, my, 6.8, 6.2, 0, 0, Math.PI * 2);
      c.fill();
      ell(c, hx - 2.5, hy - 4.6, 3.2, 1.2, 'rgba(255,255,255,0.35)');
    });
    // Blush on the cheeks
    ell(c, hx - 5.6 + ts * 0.3, hy + 2.8, 1.5, 0.8, C.blush);
    ell(c, hx + 6.6 + ts * 0.5, hy + 2.8, 1.5, 0.8, C.blush);

    var eyes = [[hx - 2.7 + ts, hy + 0.1, 1.75, 2.05], [hx + 3.0 + ts, hy + 0.1, 1.95, 2.2]];
    c.lineCap = 'round';
    for (var i = 0; i < eyes.length; i++) {
      var ex = eyes[i][0], ey = eyes[i][1], rx = eyes[i][2], ry = eyes[i][3];
      if (a.closed || a.blink) {
        c.strokeStyle = '#1e140f';
        c.lineWidth = 0.45;
        c.beginPath();
        c.arc(ex, ey - 0.6, rx * 0.9, 0.15 * Math.PI, 0.85 * Math.PI);
        c.stroke();
        continue;
      }
      ell(c, ex, ey, rx + 0.45, ry + 0.45, 'rgba(240,226,206,0.55)');
      ell(c, ex, ey, rx, ry, lin(c, 0, ey - ry, 0, ey + ry, [[0, C.eyeTop], [1, C.eyeBot]]));
      ell(c, ex + 0.1, ey + 0.15, rx * 0.42, ry * 0.72, C.pupil);
      ell(c, ex - rx * 0.32, ey - ry * 0.38, rx * 0.34, rx * 0.34, '#ffffff');
      ell(c, ex + rx * 0.35, ey + ry * 0.42, rx * 0.17, rx * 0.17, 'rgba(255,255,255,0.9)');
      c.strokeStyle = '#1e140f';
      c.lineWidth = 0.42;
      c.beginPath();
      c.ellipse(ex, ey, rx, ry, 0, 1.1 * Math.PI, 1.9 * Math.PI);
      c.stroke();
    }
    // Nose and mouth
    var nx = hx + 0.3 + ts * 1.25, ny = hy + 2.9;
    c.beginPath();
    c.moveTo(nx - 0.8, ny - 0.4); c.lineTo(nx + 0.8, ny - 0.4); c.lineTo(nx, ny + 0.5); c.closePath();
    c.fillStyle = C.nose;
    c.fill();
    c.strokeStyle = '#2a1a14';
    c.lineWidth = 0.28;
    c.beginPath();
    c.moveTo(nx - 1.2, ny + 1.2); c.quadraticCurveTo(nx - 0.6, ny + 1.7, nx, ny + 0.6);
    c.quadraticCurveTo(nx + 0.6, ny + 1.7, nx + 1.2, ny + 1.2);
    c.stroke();
    if (a.blep) ell(c, nx, ny + 1.9, 0.75, 0.9, C.tongue);
    // Whiskers
    c.strokeStyle = 'rgba(255,252,244,0.85)';
    c.lineWidth = 0.18;
    for (var w = -1; w <= 1; w++) {
      c.beginPath(); c.moveTo(nx + 3, ny + 0.6 + w * 0.6); c.lineTo(nx + 9, ny + w * 1.4); c.stroke();
      c.beginPath(); c.moveTo(nx - 3, ny + 0.6 + w * 0.6); c.lineTo(nx - 8.5, ny + w * 1.4); c.stroke();
    }
    // A sleepy nose bubble
    if (a.bubble > 0) {
      var br = a.bubble;
      ell(c, nx + 1.2 + br, ny - 0.2, br, br, 'rgba(210,235,255,0.45)');
      c.strokeStyle = 'rgba(255,255,255,0.8)';
      c.lineWidth = 0.2;
      c.beginPath(); c.arc(nx + 1.2 + br, ny - 0.2, br, 0, Math.PI * 2); c.stroke();
      ell(c, nx + 0.9 + br * 0.7, ny - 0.2 - br * 0.4, br * 0.25, br * 0.18, 'rgba(255,255,255,0.9)');
    }
  }

  // ---------- Body parts ----------

  function legs(c, a, far) {
    var amp = a.move ? (a.run ? 3.4 : 1.8) : 0;
    var set = far ? [[-8, Math.PI], [8.5, 0]] : [[-11.5, 0], [4.8, Math.PI]];
    var shapes = [];
    for (var i = 0; i < set.length; i++) {
      var ph = a.phase + set[i][1];
      var dx = Math.sin(ph) * amp;
      var lift = a.move ? Math.max(0, Math.cos(ph)) * (a.run ? 2 : 1.1) : 0;
      shapes.push({ pill: [set[i][0] + dx, -6.6 - lift, 3.6, 6.6] });
    }
    group(c, shapes, far ? C.pointD : C.point);
  }

  function tailPlume(c, a) {
    var s = a.tail;
    var pts = a.run
      ? [[-15, -12, 4.2, 3.6], [-19.5, -13, 4.4, 3.8], [-24, -14, 4, 3.4], [-27.5, -15, 3.2, 2.8]]
      : [[-14, -12, 4.4, 4.2], [-17.5, -16, 4.8, 4.6], [-19 + s, -21, 4.6, 4.4], [-17.5 + s * 2, -26, 4, 3.8], [-14.5 + s * 2.6, -29.5, 3.2, 3]];
    var shapes = [];
    for (var i = 0; i < pts.length; i++) shapes.push({ f: [pts[i][0], pts[i][1], pts[i][2], pts[i][3], 7, 0.16, i] });
    group(c, shapes, lin(c, 0, -10, 0, -32, [[0, C.tailBase], [1, C.tailTip]]));
  }

  function wrappedTail(c, pts, tipShift) {
    var shapes = [];
    for (var i = 0; i < pts.length; i++) {
      shapes.push({ f: [pts[i][0] + (i === pts.length - 1 ? tipShift : 0), pts[i][1], pts[i][2], pts[i][3], 7, 0.14, i] });
    }
    group(c, shapes, lin(c, pts[0][0], 0, pts[pts.length - 1][0], 0, [[0, C.tailBase], [1, C.tailTip]]));
  }

  // ---------- Poses ----------

  var POSES = {
    stand: function (c, a) {
      tailPlume(c, a);
      legs(c, a, true);
      var rx = a.run ? 15.5 : 14.5, ry = a.run ? 6.6 : 7.4;
      group(c, [
        { f: [-1.5, -11.5, rx, ry, 13, 0.077, 1] },
        { f: [9, -12, 7.2, 8, 9, 0.11, 3] },
        { f: [-0.5, -6.6, 11.5, 3.4, 10, 0.165, 5] }
      ], bodyFill(c, -19, -4), bodyShade(c, -1.5, -11.5, rx, ry));
      legs(c, a, false);
      if (a.drink) head(c, 15.5, -12.5, a);
      else head(c, 13, -21.5, a);
    },
    sit: function (c, a) {
      group(c, [
        { f: [-4, -9.5, 10, 9.5, 12, 0.077, 1] },
        { f: [5, -14.5, 7.6, 9.8, 10, 0.11, 3] }
      ], bodyFill(c, -24, -1), bodyShade(c, -2, -10, 10, 9.5));
      group(c, [{ e: [-1, -1.7, 4.2, 1.9] }], C.point);
      group(c, [{ pill: [2.6, -8.2, 3.3, 8.2] }, { pill: [6.4, -8.2, 3.3, 8.2] }], C.point);
      wrappedTail(c, [[-14, -2.6, 3.8, 2.9], [-9, -2.4, 3.8, 2.9], [-4, -2.2, 3.6, 2.7], [1, -2.2, 3.3, 2.5], [5.5, -2.7, 3, 2.6]], a.tail * 0.6);
      head(c, 6, -28.5, a);
    },
    loaf: function (c, a) {
      group(c, [
        { f: [-1, -8, 15.5, 8, 13, 0.077, 1] },
        { f: [10, -8.5, 6.6, 7, 9, 0.11, 3] }
      ], bodyFill(c, -16, 0), bodyShade(c, -1, -8, 15.5, 8));
      group(c, [{ e: [13.8, -1.4, 2.7, 1.5] }, { e: [9.6, -1.4, 2.7, 1.5] }], C.point);
      wrappedTail(c, [[-15, -2.2, 3.4, 2.5], [-10, -1.9, 3.4, 2.4], [-5, -1.8, 3.2, 2.3], [0, -1.8, 3, 2.2]], a.tail * 0.5);
      head(c, 12.5, -15.5, a);
    },
    curl: function (c, a) {
      var breath = a.breath > 0 ? 0.5 : 0;
      group(c, [{ f: [0, -7.6, 14, 7.6 + breath, 13, 0.077, 1] }], bodyFill(c, -16, 0), bodyShade(c, 0, -7.6, 14, 7.6));
      wrappedTail(c, [[-7, -1.9, 3.4, 2.4], [-1, -1.8, 3.4, 2.4], [5, -2, 3.4, 2.5], [10.5, -3, 3.2, 2.7]], 0);
      c.save();
      c.translate(9, -8.5);
      c.scale(0.82, 0.82);
      c.rotate(0.25);
      head(c, 0, 0, { turn: 0.5, closed: true, bubble: a.bubble });
      c.restore();
    },
    flop: function (c, a) {
      wrappedTail(c, [[-15, -3, 3.6, 2.8], [-20, -2.8, 3.4, 2.6], [-24.5, -2.4, 3, 2.4]], 0);
      var lx = [-9.5, -6, 5.5, 9];
      var shapes = [];
      for (var i = 0; i < lx.length; i++) {
        var w = Math.sin(a.wiggle + i) * 0.8;
        shapes.push({ pill: [lx[i], -17 + w + (i % 2) * 1.2, 3.2, 7] });
      }
      group(c, shapes, C.point);
      group(c, [{ f: [0, -6.4, 15, 6.6, 13, 0.077, 1] }], lin(c, 0, -13, 0, 0, [[0, C.ruff], [0.5, C.cream], [1, C.fawn]]));
      c.save();
      c.translate(16, -7.5);
      c.rotate(Math.PI);
      head(c, 0, 0, a);
      c.restore();
    }
  };

  function draw(c, dog, t) {
    var x = dog.x, y = dog.y;
    c.save();
    if (!dog.airborne) {
      var g = c.createRadialGradient(x, y - 0.3, 0, x, y - 0.3, 18);
      g.addColorStop(0, 'rgba(70,45,40,0.32)');
      g.addColorStop(1, 'rgba(70,45,40,0)');
      c.fillStyle = g;
      c.beginPath();
      c.ellipse(x, y - 0.3, 18, 2.8, 0, 0, Math.PI * 2);
      c.fill();
    }
    c.translate(x, y);
    c.scale(dog.dir * 1.15, 1.15);
    var moving = dog.pose === 'walk' || dog.pose === 'run' || dog.pose === 'leap';
    var a = {
      phase: dog.pose === 'leap' ? 0.6 : dog.phase,
      tail: Math.sin(t * (dog.pose === 'walk' ? 2.6 : 1.3)) * 1.4,
      blink: dog.blink,
      blep: dog.blep || (dog.pose === 'drink' && Math.sin(t * 9) > 0.3),
      breath: Math.sin(t * 2.2),
      wiggle: t * 5,
      turn: moving ? 1 : 0.55,
      move: moving,
      run: dog.pose === 'run' || dog.pose === 'leap',
      drink: dog.pose === 'drink',
      bubble: dog.pose === 'curl' ? 0.6 + 1.6 * (0.5 + 0.5 * Math.sin(t * 1.6)) : 0
    };
    var fn = POSES[dog.pose] || POSES.stand;
    fn(c, a);
    c.restore();
  }

  return { draw: draw };
})();
