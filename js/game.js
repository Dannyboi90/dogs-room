'use strict';

// Dog's Room: the game loop and Dog's personality.
// One animation loop, one queue of small steps. Dog is always doing exactly
// one step; when the queue runs out she picks her next idea. No stacked timers.

(function () {
  var W = Room.W, H = Room.H, S = Room.S;
  var FLOOR = 160;
  var SEAT = 121;

  var canvas = document.getElementById('room');
  canvas.width = W * S;
  canvas.height = H * S;
  var ctx = canvas.getContext('2d');
  var captionEl = document.getElementById('caption');

  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = motionQuery.matches;
  var onMotionChange = function (e) { reduced = e.matches; };
  if (motionQuery.addEventListener) motionQuery.addEventListener('change', onMotionChange);
  else if (motionQuery.addListener) motionQuery.addListener(onMotionChange);

  function loadImage(src) { var i = new Image(); i.src = src; return i; }
  var images = {
    crayon: loadImage('assets/crayon-art.png'),
    wallpaper: loadImage('assets/laptop-wallpaper.png')
  };

  var background = document.createElement('canvas');
  background.width = W * S;
  background.height = H * S;
  var bctx = background.getContext('2d');
  bctx.setTransform(S, 0, 0, S, 0, 0);
  Room.drawStatic(bctx);

  // ---------- Helpers ----------

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, k) { return a + (b - a) * k; }

  // ---------- Captions ----------

  var T = {
    observe: ['Dog is regally observing her kingdom.', 'Dog surveys the room. Everything is in order.', 'Dog is watching. Quietly. Majestically.'],
    loaf: ['Dog has become a loaf.', 'A perfect loaf. Ten out of ten.'],
    nap: ['Nap time. Do not disturb the Keeper.', 'Dog curls up for a well-earned nap.', 'The Keeper rests.'],
    wake: ['Dog wakes up and stretches.', 'Nap complete. Kingdom still standing.'],
    toTv: ['Something is happening on the TV.', 'The lights on the TV caught her eye.'],
    tv: ['Dog is watching the lights and the music.', 'Dog is vibing to the set.', 'Dog is enjoying the show.'],
    fly: ['Dog flies onto the couch!', 'Up she goes. The couch is hers now.'],
    zoom: ['Zoomies! Clear the room!', 'Dog has the zoomies!'],
    afterZoom: ['And just like that, calm again.', 'Dog pretends nothing happened.'],
    flop: ['Belly up. It is a trap.', 'Dog flops over. Do not trust the belly.'],
    blep: ['Blep.', 'A tiny tongue appears. Blep.'],
    toWater: ['Dog heads for her water bowl.'],
    drink: ['Lap, lap, lap. Hydration is important.', 'Dog is drinking her water.'],
    hopDown: ['Dog hops down to explore.']
  };

  var lastCaption = '';
  function say(text) {
    if (!text) return;
    // Identical text would not be re-announced, so nudge it.
    if (text === lastCaption) text = text + ' ';
    lastCaption = text;
    captionEl.textContent = text;
  }

  // ---------- Dog ----------

  var dog = {
    x: 150, y: FLOOR, dir: 1, pose: 'sit',
    phase: 0, blink: false, blinkTimer: 3, blinkLeft: 0,
    blep: false, airborne: false, onSofa: false,
    queue: [], step: null
  };

  function walk(x, speed, caption) { return { type: 'walk', x: x, speed: speed || 18, caption: caption }; }
  function pose(name, dur, caption, dir, blep) { return { type: 'pose', pose: name, dur: dur, caption: caption, dir: dir, blep: blep }; }
  function jump(x, y, h, caption) { return { type: 'jump', x: x, y: y, h: h, dur: 0.55, caption: caption }; }

  var floorPlans = {
    wander: function () { return [walk(clamp(dog.x + rnd(-90, 90), 24, 296)), pose('stand', rnd(1.2, 2.5))]; },
    observe: function () { return [pose('sit', rnd(6, 10), pick(T.observe))]; },
    loaf: function () { return [walk(clamp(dog.x + rnd(-40, 40), 24, 296)), pose('loaf', rnd(8, 12), pick(T.loaf))]; },
    nap: function () { return [walk(rnd(110, 200)), pose('loaf', 2), pose('curl', rnd(16, 24), pick(T.nap)), pose('stand', 1.4, pick(T.wake))]; },
    tv: function () { return [walk(rnd(228, 246), 18, pick(T.toTv)), pose('sit', rnd(9, 13), pick(T.tv), 1)]; },
    sofa: function () {
      var x = rnd(112, 188);
      return [walk(x), pose('sit', 0.7), jump(x, SEAT, 18, pick(T.fly)), pose('loaf', rnd(6, 10))];
    },
    zoom: function () {
      if (reduced) return floorPlans.observe();
      return [walk(296, 120, pick(T.zoom)), walk(24, 130), walk(rnd(140, 220), 110), pose('stand', 1), pose('sit', 3, pick(T.afterZoom))];
    },
    flop: function () { return [pose('loaf', 1), pose('flop', rnd(4, 6), pick(T.flop)), pose('sit', 2)]; },
    blep: function () { return [pose('sit', rnd(3, 4), pick(T.blep), 0, true)]; },
    drink: function () { return [walk(284, 18, pick(T.toWater)), pose('drink', rnd(4, 6), pick(T.drink), 1), pose('sit', 2)]; }
  };
  var floorWeights = { wander: 3, observe: 3, loaf: 2, nap: 2, tv: 2.5, sofa: 1.5, drink: 1, zoom: 0.5, flop: 0.6, blep: 0.4 };

  var sofaPlans = {
    observe: function () { return [pose('sit', rnd(6, 10), pick(T.observe))]; },
    loaf: function () { return [pose('loaf', rnd(8, 12), pick(T.loaf))]; },
    nap: function () { return [pose('curl', rnd(16, 24), pick(T.nap)), pose('sit', 1.5, pick(T.wake))]; },
    down: function () { return [jump(clamp(dog.x + rnd(-30, 30), 40, 280), FLOOR, 8, pick(T.hopDown)), pose('stand', 1)]; }
  };
  var sofaWeights = { observe: 2, loaf: 2, nap: 2, down: 2.5 };

  var lastPlan = '';
  function planNext() {
    var plans = dog.onSofa ? sofaPlans : floorPlans;
    var weights = dog.onSofa ? sofaWeights : floorWeights;
    var names = Object.keys(weights).filter(function (n) { return n !== lastPlan || n === 'wander'; });
    var total = names.reduce(function (s, n) { return s + weights[n]; }, 0);
    var r = Math.random() * total;
    for (var i = 0; i < names.length; i++) {
      r -= weights[names[i]];
      if (r <= 0) { lastPlan = names[i]; return plans[names[i]](); }
    }
    lastPlan = names[0];
    return plans[names[0]]();
  }

  function startStep(st) {
    dog.step = st;
    st.t = 0;
    dog.blep = false;
    if (st.caption) say(st.caption);
    if (st.type === 'walk') {
      if (Math.abs(st.x - dog.x) > 0.5) dog.dir = st.x > dog.x ? 1 : -1;
      dog.pose = st.speed > 60 ? 'run' : 'walk';
    } else if (st.type === 'pose') {
      dog.pose = st.pose;
      if (st.dir) dog.dir = st.dir;
      dog.blep = !!st.blep;
    } else if (st.type === 'jump') {
      st.x0 = dog.x;
      st.y0 = dog.y;
      if (Math.abs(st.x - dog.x) > 0.5) dog.dir = st.x > dog.x ? 1 : -1;
      dog.pose = 'leap';
      dog.airborne = true;
    }
  }

  function finishStep() {
    dog.step = null;
    dog.airborne = false;
  }

  function update(dt) {
    if (!dog.step) {
      if (!dog.queue.length) dog.queue = planNext();
      startStep(dog.queue.shift());
    }
    var st = dog.step;
    st.t += dt;

    if (st.type === 'walk') {
      var d = st.x - dog.x;
      if (reduced || Math.abs(d) <= st.speed * dt) {
        dog.x = st.x;
        finishStep();
      } else {
        dog.x += Math.sign(d) * st.speed * dt;
        dog.phase += dt * Math.min(st.speed * 0.35, 16);
      }
    } else if (st.type === 'pose') {
      if (st.t >= st.dur) finishStep();
    } else if (st.type === 'jump') {
      var k = reduced ? 1 : Math.min(1, st.t / st.dur);
      dog.x = lerp(st.x0, st.x, k);
      dog.y = lerp(st.y0, st.y, k) - Math.sin(Math.PI * k) * st.h;
      if (k >= 1) {
        dog.y = st.y;
        dog.onSofa = st.y === SEAT;
        finishStep();
      }
    }

    // Slow blinks
    if (dog.blinkLeft > 0) {
      dog.blinkLeft -= dt;
      dog.blink = dog.blinkLeft > 0;
    } else {
      dog.blinkTimer -= dt;
      if (dog.blinkTimer <= 0) {
        dog.blinkLeft = 0.16;
        dog.blink = true;
        dog.blinkTimer = rnd(2.5, 6);
      }
    }
  }

  // ---------- Sleepy z's ----------

  var zs = [];
  var zTimer = 0;
  function updateZs(dt) {
    if (dog.pose === 'curl') {
      zTimer -= dt;
      if (zTimer <= 0) {
        zs.push({ x: dog.x + dog.dir * 8, y: dog.y - 18, life: 2.4 });
        zTimer = 1.6;
      }
    }
    for (var i = zs.length - 1; i >= 0; i--) {
      zs[i].life -= dt;
      zs[i].y -= dt * (reduced ? 2 : 6);
      zs[i].x += dt * 2;
      if (zs[i].life <= 0) zs.splice(i, 1);
    }
  }
  function drawZs(c) {
    c.font = 'bold 5px "Segoe UI", "Trebuchet MS", sans-serif';
    c.lineWidth = 0.5;
    c.lineJoin = 'round';
    for (var i = 0; i < zs.length; i++) {
      var a = Math.min(1, zs[i].life);
      var size = 0.8 + (2.4 - zs[i].life) * 0.25;
      c.save();
      c.globalAlpha = a;
      c.translate(zs[i].x, zs[i].y);
      c.scale(size, size);
      c.strokeStyle = '#6b4a3a';
      c.fillStyle = '#fff6e6';
      c.strokeText('z', 0, 0);
      c.fillText('z', 0, 0);
      c.restore();
    }
  }

  // ---------- Loop ----------

  var last = null;
  function frame(now) {
    var t = now / 1000;
    var dt = last === null ? 0 : Math.min(0.05, t - last);
    last = t;

    update(dt);
    updateZs(dt);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(background, 0, 0);
    ctx.setTransform(S, 0, 0, S, 0, 0);
    Room.drawDynamic(ctx, t, { images: images, reduced: reduced, laptopTyping: false });
    DogSprite.draw(ctx, dog, t);
    Room.drawLighting(ctx, t, { reduced: reduced });
    drawZs(ctx);

    requestAnimationFrame(frame);
  }

  say('Dog is surveying her kingdom.');
  requestAnimationFrame(frame);

  // A small read-only window into the game, used for testing.
  window.DogsRoom = { dog: dog };
})();
