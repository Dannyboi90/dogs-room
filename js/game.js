'use strict';

// Dog's Room: the game loop, Dog's personality, the toys and the music.
// Dog follows a queue of small steps (walk, pose, jump, do). One animation
// loop drives everything, so rapid clicks never leave her stuck.

(function () {
  var W = Scene.W, H = Scene.H, SP = Scene.SPOTS, P = Scene.props;
  var FLOOR_Y = Scene.FLOOR_Y, FLOOR_S = Scene.FLOOR_SCALE;
  var MIN_X = 520, MAX_X = 1500;

  var canvas = document.getElementById('room');
  var ctx = canvas.getContext('2d');
  canvas.width = W;
  canvas.height = H;
  var captionEl = document.getElementById('caption');

  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = motionQuery.matches;
  var onMotion = function (e) { reduced = e.matches; };
  if (motionQuery.addEventListener) motionQuery.addEventListener('change', onMotion);
  else if (motionQuery.addListener) motionQuery.addListener(onMotion);

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, k) { return a + (b - a) * k; }

  // ---------- Captions ----------

  var T = {
    observe: ['Dog is regally observing her kingdom.', 'Dog surveys the room. Everything is in order.', 'Quietly. Majestically. Watching.'],
    loaf: ['Dog has become a loaf.', 'A perfect loaf. Ten out of ten.'],
    nap: ['Nap time. Do not disturb the Keeper.', 'Dog curls up for a well-earned nap.'],
    wake: ['A big stretch. Nap complete.', 'She wakes and stretches every inch.'],
    tv: ['Dog is watching the singer and the lights.', 'Front row seat for the oud.', 'She is enjoying the show.'],
    toWater: ['Time for a drink.'],
    drink: ['Lap, lap, lap. She loves her water.', 'Hydration, taken very seriously.'],
    groom: ['A little grooming. Looking flawless.', 'Paw licking, very thorough.'],
    stretch: ['The big stretch.', 'Stretching out every inch.'],
    knead: ['Kneading the soft blanket. Making biscuits.', 'Biscuits are being made.'],
    pen: ['Into her room for a nap on the blue blanket.', 'Her room, her rules, her nap.'],
    cube: ['She claims the roof of her blue house.', 'The view from the cube is excellent.'],
    chair: ['She races up the dining chair!', 'Up the chair in one flight!'],
    chairSit: ['Perched on top of the chair, keeping watch.'],
    tree: ['Up the cat tree she goes.', 'Climbing to the top of her tower.'],
    treeTop: ['Queen of the cat tree.'],
    fly: ['She flies onto the couch!', 'Up she goes!'],
    zoom: ['Zoomies! Clear the room!', 'She has the zoomies!'],
    afterZoom: ['And just like that, calm again.', 'She pretends nothing happened.'],
    flop: ['Belly up. It is a trap.', 'She flops over. Do not trust the belly.'],
    blep: ['Blep.', 'A tiny tongue appears. Blep.'],
    laptop: ['She claims the laptop. asdfjjjjkl;;;;', 'Your keyboard belongs to Dog now.'],
    sparkleSpot: ['A sparkle ball! Eyes locked.', 'Something shiny appears...'],
    pounce: ['Pounce!', 'Gotcha!'],
    chase: ['It escapes! The chase is on!'],
    win: ['Victory. The sparkle ball is defeated.', 'She sits proudly over her prize.'],
    mouse: ['The mouse dangles... she is ready.'],
    hop: ['Dolphin hop!', 'Boing!', 'Higher!'],
    caught: ['Caught it! What a hunter.'],
    snake: ['The rainbow snake slithers by!'],
    snakeWin: ['The rainbow snake is captured.'],
    ribbon: ['Ribbons! Bat, bat, bat!'],
    ribbonEnd: ['She pretends she was never interested.'],
    bowsLick: ['Lick first...'],
    bowsSniff: ['...sniff second. Always in that order.'],
    bowsWin: ['The bows have been defeated.'],
    bag: ['A paper bag! It must be investigated.'],
    bagIn: ['She is in the bag. She lives here now.', 'Bag claimed. Do not disturb.'],
    bagOut: ['She emerges, majestic.'],
    box: ['A box! Of course she has to.'],
    boxIn: ['If it fits, she sits.', 'The box is hers now.'],
    dinner: ['Dinner is served!'],
    crunch: ['Crunch. Crunch. CRUNCH.', 'The loudest, happiest crunching.'],
    gravy: ['Licking off every bit of gravy.'],
    pet: ['Purrrrr...', 'She leans into the pets. Purring.', 'Soft purrs and slow blinks.'],
    petSleep: ['She opens one eye, slow blinks, and goes back to sleep.'],
    swat: ['One pet too many. Swat!'],
    swatAfter: ['She needs a minute. Respect the Keeper.']
  };

  var lastCaption = '';
  function say(text) {
    if (!text) return;
    if (text === lastCaption) text = text + ' ';
    lastCaption = text;
    captionEl.textContent = text;
  }

  // ---------- Dog ----------

  var dog = {
    x: 900, y: FLOOR_Y, s: FLOOR_S, dir: 1,
    sprite: 'sit', anim: 'breathe', moving: false, running: false, phase: 0,
    airborne: false, clip: null, hidden: false, spot: null,
    sleeping: false, watching: false, typing: false,
    queue: [], step: null
  };

  // Step builders
  function walk(x, opts) { opts = opts || {}; return { type: 'walk', x: x, run: !!opts.run, caption: opts.caption, face: opts.face }; }
  function pose(sprite, dur, caption, opts) {
    opts = opts || {};
    return { type: 'pose', sprite: sprite, dur: dur, caption: caption, anim: opts.anim || 'breathe', dir: opts.dir, flag: opts.flag };
  }
  function jump(x, y, s, opts) {
    opts = opts || {};
    return { type: 'jump', x: x, y: y, s: s, h: opts.h == null ? 90 : opts.h, dur: opts.dur || 0.6, sprite: opts.sprite || 'pounce', caption: opts.caption, spot: opts.spot || null };
  }
  function doIt(fn) { return { type: 'do', fn: fn }; }
  function val(v) { return typeof v === 'function' ? v() : v; }

  function down() {
    var steps = [];
    if (dog.spot === 'pen') {
      steps.push(doIt(function () { dog.clip = null; }));
      steps.push(jump(640, FLOOR_Y, FLOOR_S, { h: 40 }));
    } else if (dog.spot === 'tree') {
      steps.push(jump(SP.treeStep.x, SP.treeStep.y, SP.treeStep.s, { h: 30 }));
      steps.push(jump(MIN_X + 20, FLOOR_Y, FLOOR_S, { h: 30 }));
    } else if (dog.spot === 'chair') {
      steps.push(jump(SP.cube.x, SP.cube.y, SP.cube.s, { h: 30 }));
      steps.push(jump(MAX_X, FLOOR_Y, FLOOR_S, { h: 30 }));
    } else if (dog.spot === 'inside') {
      steps.push(doIt(function () { dog.clip = null; }));
      steps.push(jump(clamp(dog.x + 200, MIN_X, MAX_X), FLOOR_Y, FLOOR_S, { h: 60 }));
    } else if (dog.spot) {
      steps.push(jump(clamp(dog.x + rnd(-60, 60), MIN_X, MAX_X), FLOOR_Y, FLOOR_S, { h: 40 }));
    }
    return steps;
  }

  // ---------- Idle personality ----------

  function floorX() { return rnd(MIN_X, MAX_X); }

  var idle = {
    wander: function () { return [walk(floorX()), pose('sit', rnd(1.2, 2.4))]; },
    observe: function () { return [pose('sit', rnd(6, 10), pick(T.observe))]; },
    loaf: function () { return [walk(clamp(dog.x + rnd(-200, 200), MIN_X, MAX_X)), pose('loaf', rnd(8, 12), pick(T.loaf))]; },
    nap: function () { return [walk(rnd(700, 1300)), pose('loaf', 2), pose('curl', rnd(16, 24), pick(T.nap), { flag: 'sleeping' }), pose('stretch', 1.8, pick(T.wake))]; },
    pen: function () { return plans.pen(); },
    tv: function () { return plans.tv(); },
    drink: function () { return [walk(SP.water.x - 105, { caption: pick(T.toWater), face: 1 }), pose('eat', rnd(4, 6), pick(T.drink), { anim: 'eat', dir: 1 }), pose('sit', 2)]; },
    groom: function () { return [pose('groom', rnd(4, 6), pick(T.groom), { anim: 'groom' })]; },
    stretch: function () { return [pose('stretch', 2.5, pick(T.stretch))]; },
    knead: function () { return plans.blanket(); },
    cube: function () { return plans.cube(); },
    chair: function () { return plans.chair(); },
    tree: function () { return plans.tree(); },
    zoom: function () {
      if (reduced) return idle.observe();
      return [walk(MAX_X, { run: true, caption: pick(T.zoom) }), walk(MIN_X, { run: true }), walk(rnd(800, 1200), { run: true }), pose('sit', 3, pick(T.afterZoom))];
    },
    flop: function () { return [pose('loaf', 1), pose('flop', rnd(4, 6), pick(T.flop)), pose('sit', 2)]; },
    blep: function () { return [pose('blep', rnd(3, 4), pick(T.blep))]; },
    bag: function () { return P.bag.on ? plans.bag() : idle.observe(); },
    box: function () { return P.box.on ? plans.box() : idle.observe(); }
  };
  var weights = { wander: 3, observe: 3, loaf: 2, nap: 1.5, pen: 1.2, tv: 2, drink: 1, groom: 1.5, stretch: 1, knead: 1.4, cube: 1.1, chair: 1, tree: 1, zoom: 0.5, flop: 0.7, blep: 0.5, bag: 1.5, box: 1.5 };

  var lastIdle = '';
  function planNext() {
    if (dog.spot) return down();
    var names = Object.keys(weights).filter(function (n) {
      if (n === lastIdle && n !== 'wander') return false;
      if (n === 'bag' && !P.bag.on) return false;
      if (n === 'box' && !P.box.on) return false;
      return true;
    });
    var total = names.reduce(function (s, n) { return s + weights[n]; }, 0);
    var r = Math.random() * total;
    for (var i = 0; i < names.length; i++) {
      r -= weights[names[i]];
      if (r <= 0) { lastIdle = names[i]; return idle[names[i]](); }
    }
    return idle.wander();
  }

  // ---------- Things to do (hotspots and toys) ----------

  var plans = {
    blanket: function () {
      return [walk(1270), jump(SP.sofa.x, SP.sofa.y, SP.sofa.s, { h: 150, caption: pick(T.fly), spot: 'sofa' }),
        pose('knead', rnd(5, 7), pick(T.knead), { anim: 'knead' }),
        pose('curl', rnd(12, 18), pick(T.nap), { flag: 'sleeping' })];
    },
    laptop: function () {
      return [walk(990), jump(SP.table.x, SP.table.y, SP.table.s, { h: 140, spot: 'table' }),
        pose('loaf', rnd(6, 8), pick(T.laptop), { flag: 'typing', dir: -1 })];
    },
    pen: function () {
      return [walk(640), jump(SP.pen.x, SP.pen.y, SP.pen.s, { h: 50, spot: 'pen' }),
        doIt(function () { dog.clip = SP.pen.clip; }),
        pose('curl', rnd(14, 20), pick(T.pen), { flag: 'sleeping' })];
    },
    tv: function () { return [walk(SP.tv.x, { face: 1 }), pose('sit', rnd(10, 14), pick(T.tv), { dir: 1, flag: 'watching' })]; },
    cube: function () {
      return [walk(1480), jump(SP.cube.x, SP.cube.y, SP.cube.s, { h: 120, spot: 'cube' }),
        pose('loaf', rnd(7, 10), pick(T.cube), { dir: -1 })];
    },
    chair: function () {
      return [walk(1480, { run: true }), jump(SP.cube.x, SP.cube.y, SP.cube.s, { h: 90, dur: 0.45, caption: pick(T.chair) }),
        jump(SP.chair.x, SP.chair.y, SP.chair.s, { h: 110, dur: 0.5, spot: 'chair' }),
        pose('loaf', rnd(7, 10), pick(T.chairSit), { dir: -1 })];
    },
    tree: function () {
      return [walk(MIN_X), jump(SP.treeStep.x, SP.treeStep.y, SP.treeStep.s, { h: 120, caption: pick(T.tree) }),
        jump(SP.tree.x, SP.tree.y, SP.tree.s, { h: 90, spot: 'tree' }),
        pose('sit', rnd(7, 10), pick(T.treeTop), { dir: 1 })];
    },
    sparkle: function () {
      var bx = dog.x > 1000 ? dog.x - 340 : dog.x + 340;
      var away = bx > dog.x ? 1 : -1;
      var end = clamp(bx + away * 230, MIN_X, MAX_X);
      return [
        doIt(function () { P.sparkle.on = true; P.sparkle.x = bx; P.sparkle.y = 1018; P.sparkle.vx = 0; dog.dir = away; }),
        pose('crouch', 1.4, pick(T.sparkleSpot), { anim: 'wiggle', dir: away }),
        jump(bx - away * 70, FLOOR_Y, FLOOR_S, { h: 80, caption: pick(T.pounce) }),
        doIt(function () { P.sparkle.vx = away * 520; }),
        walk(end - away * 90, { run: true, caption: pick(T.chase) }),
        pose('crouch', 0.8, null, { anim: 'wiggle', dir: away }),
        jump(end - away * 40, FLOOR_Y, FLOOR_S, { h: 60, caption: pick(T.pounce) }),
        doIt(function () { P.sparkle.on = false; }),
        pose('sit', 3, pick(T.win))
      ];
    },
    mouse: function () {
      var steps = [doIt(function () { P.mouse.on = true; P.mouse.x = dog.x + dog.dir * 30; }), pose('sit', 1.4, pick(T.mouse))];
      for (var i = 0; i < 3; i++) {
        steps.push(jump(function () { return dog.x; }, FLOOR_Y, FLOOR_S, { h: 170 + i * 30, dur: 0.7, sprite: 'hop', caption: T.hop[i] }));
        steps.push(pose('sit', 0.5));
      }
      steps.push(doIt(function () { P.mouse.on = false; }));
      steps.push(pose('sit', 2.5, pick(T.caught)));
      return steps;
    },
    snake: function () {
      var steps = [doIt(function () { P.snake.on = true; }), pose('crouch', 1, pick(T.snake), { anim: 'wiggle' })];
      for (var i = 0; i < 3; i++) {
        steps.push(walk(function () { return clamp(P.snake.x - 60, MIN_X, MAX_X); }, { run: true }));
        steps.push(pose('crouch', 0.5, null, { anim: 'wiggle' }));
      }
      steps.push(jump(function () { return clamp(P.snake.x, MIN_X, MAX_X); }, FLOOR_Y, FLOOR_S, { h: 70, caption: pick(T.pounce) }));
      steps.push(doIt(function () { P.snake.on = false; }));
      steps.push(pose('sit', 2.5, pick(T.snakeWin)));
      return steps;
    },
    ribbon: function () {
      return [doIt(function () { P.ribbon.on = true; P.ribbon.x = dog.x + dog.dir * 110; P.ribbon.y = 860; }),
        pose('sit', 0.8, pick(T.ribbon)),
        jump(function () { return dog.x; }, FLOOR_Y, FLOOR_S, { h: 80, dur: 0.5, sprite: 'hop' }), pose('sit', 0.4),
        jump(function () { return dog.x; }, FLOOR_Y, FLOOR_S, { h: 100, dur: 0.5, sprite: 'hop' }), pose('sit', 0.4),
        doIt(function () { P.ribbon.on = false; }),
        pose('groom', 3, pick(T.ribbonEnd), { anim: 'groom' })];
    },
    bows: function () {
      var dir = dog.x > 1000 ? -1 : 1;
      var bx = clamp(dog.x + dir * 300, MIN_X + 60, MAX_X - 60);
      return [doIt(function () { P.bows.on = true; P.bows.x = bx; P.bows.scatter = 0; }),
        walk(bx - dir * 140, { face: dir }),
        pose('eat', 2.2, T.bowsLick[0], { anim: 'eat', dir: dir }),
        pose('eat', 2.2, T.bowsSniff[0], { anim: 'eat', dir: dir }),
        pose('crouch', 1, null, { anim: 'wiggle', dir: dir }),
        jump(bx - dir * 30, FLOOR_Y, FLOOR_S, { h: 70, caption: pick(T.pounce) }),
        doIt(function () { P.bows.scattering = true; }),
        pose('sit', 2.5, pick(T.bowsWin)),
        doIt(function () { P.bows.on = false; P.bows.scattering = false; })];
    },
    bag: function () {
      var b = P.bag;
      return [doIt(function () { b.on = true; }),
        walk(b.x - 250, { face: 1, caption: pick(T.bag) }),
        pose('crouch', 1.2, null, { anim: 'wiggle', dir: 1 }),
        jump(b.x - 60, FLOOR_Y, FLOOR_S, { h: 110, caption: pick(T.pounce) }),
        doIt(function () { b.wobble = 1.2; }),
        doIt(function () {
          dog.x = b.x + 30; dog.y = b.y - 10; dog.s = 0.5; dog.dir = 1; dog.spot = 'inside';
          dog.clip = [b.x + 6, b.y - 135, 110, 128];
        }),
        pose('loaf', rnd(6, 8), pick(T.bagIn), { dir: 1 }),
        doIt(function () { dog.clip = null; dog.spot = null; dog.x = b.x + 120; dog.y = FLOOR_Y; dog.s = FLOOR_S; b.wobble = 0.6; }),
        walk(clamp(b.x + 280, MIN_X, MAX_X)), pose('sit', 2, pick(T.bagOut))];
    },
    box: function () {
      var b = P.box;
      return [doIt(function () { b.on = true; }),
        walk(b.x - 250, { face: 1, caption: pick(T.box) }),
        pose('crouch', 0.9, null, { anim: 'wiggle', dir: 1 }),
        jump(b.x, b.y - 30, 0.5, { h: 150, spot: 'inside' }),
        doIt(function () { b.wobble = 0.8; dog.clip = [b.x - 140, 600, 280, b.y - 92 - 600]; }),
        pose('sit', rnd(6, 8), pick(T.boxIn), { dir: 1 })];
    },
    dinner: function () {
      return [doIt(function () { P.kibble.on = true; }),
        walk(SP.food.x - 110, { run: !reduced, face: 1, caption: pick(T.dinner) }),
        pose('eat', 4, pick(T.crunch), { anim: 'eat', dir: 1 }),
        pose('eat', 2, pick(T.gravy), { anim: 'eat', dir: 1 }),
        doIt(function () { P.kibble.on = false; }),
        pose('blep', 2, pick(T.blep), { dir: 1 }),
        walk(SP.water.x - 105, { face: 1 }),
        pose('eat', 3, pick(T.drink), { anim: 'eat', dir: 1 }),
        pose('groom', 3, pick(T.groom), { anim: 'groom' })];
    }
  };

  // ---------- Step engine ----------

  function clearToys() {
    P.sparkle.on = false; P.mouse.on = false; P.snake.on = false; P.ribbon.on = false;
    P.kibble.on = false; P.bows.on = false; P.bows.scattering = false;
    dog.typing = false; dog.watching = false; dog.sleeping = false;
  }

  function interrupt(planFn) {
    var st = dog.step;
    if (st && st.type === 'jump' && st.tx != null) {
      dog.x = st.tx; dog.y = st.ty; dog.s = st.s; dog.airborne = false;
      dog.spot = st.spot;
    }
    dog.step = null;
    clearToys();
    dog.queue = down().concat(planFn());
  }

  function startStep(st) {
    dog.step = st;
    st.t = 0;
    dog.moving = false; dog.running = false;
    dog.typing = false; dog.watching = false; dog.sleeping = false;
    if (st.caption) say(st.caption);
    if (st.type === 'walk') {
      st.tx = clamp(val(st.x), MIN_X, MAX_X);
      if (dog.y !== FLOOR_Y) { dog.y = FLOOR_Y; dog.s = FLOOR_S; }
      if (Math.abs(st.tx - dog.x) > 2) dog.dir = st.tx > dog.x ? 1 : -1;
      dog.moving = true; dog.running = st.run;
      dog.spot = null;
    } else if (st.type === 'pose') {
      dog.sprite = st.sprite; dog.anim = st.anim;
      if (st.dir) dog.dir = st.dir;
      if (st.flag) dog[st.flag] = true;
    } else if (st.type === 'jump') {
      st.x0 = dog.x; st.y0 = dog.y; st.s0 = dog.s;
      st.tx = val(st.x); st.ty = st.y;
      if (Math.abs(st.tx - dog.x) > 2) dog.dir = st.tx > dog.x ? 1 : -1;
      dog.sprite = st.sprite; dog.anim = 'none'; dog.airborne = true;
    } else if (st.type === 'do') {
      st.fn();
    }
  }

  function finishStep() {
    var st = dog.step;
    if (st && st.type === 'walk') {
      dog.moving = false;
      if (st.face) dog.dir = st.face;
      dog.sprite = 'sit'; dog.anim = 'breathe';
    }
    if (st && st.type === 'jump') {
      dog.airborne = false;
      dog.spot = st.spot;
      dog.sprite = 'sit'; dog.anim = 'breathe';
    }
    if (st && st.type === 'pose' && st.flag) dog[st.flag] = false;
    dog.step = null;
  }

  function update(dt, t) {
    var guard = 0;
    while (!dog.step && guard++ < 20) {
      if (!dog.queue.length) dog.queue = planNext();
      startStep(dog.queue.shift());
      if (dog.step && dog.step.type === 'do') finishStep();
    }
    var st = dog.step;
    if (st) {
      st.t += dt;
      if (st.type === 'walk') {
        var speed = st.run ? 640 : 210;
        var d = st.tx - dog.x;
        if (reduced || Math.abs(d) <= speed * dt) { dog.x = st.tx; finishStep(); }
        else { dog.x += Math.sign(d) * speed * dt; dog.phase += dt * (st.run ? 14 : 7); }
      } else if (st.type === 'pose') {
        if (st.t >= st.dur) finishStep();
      } else if (st.type === 'jump') {
        var k = reduced ? 1 : Math.min(1, st.t / st.dur);
        dog.x = lerp(st.x0, st.tx, k);
        dog.y = lerp(st.y0, st.ty, k) - Math.sin(Math.PI * k) * st.h;
        dog.s = lerp(st.s0, st.s, k);
        if (k >= 1) { dog.x = st.tx; dog.y = st.ty; dog.s = st.s; finishStep(); }
      }
    }

    // Toys in motion
    var sp = P.sparkle;
    if (sp.on && sp.vx) {
      sp.x += sp.vx * dt;
      sp.spin += sp.vx * dt / 25;
      var f = 560 * dt;
      sp.vx = Math.abs(sp.vx) <= f ? 0 : sp.vx - Math.sign(sp.vx) * f;
      sp.x = clamp(sp.x, MIN_X - 40, MAX_X + 120);
    }
    if (P.mouse.on) P.mouse.y = 690 + Math.sin(t * (reduced ? 0.5 : 2.2)) * 45;
    if (P.snake.on) { P.snake.x = 1000 + Math.sin(t * (reduced ? 0.3 : 1.2)) * 360; P.snake.y = 1060; }
    if (P.bows.scattering) P.bows.scatter = Math.min(1, P.bows.scatter + dt * 3);
    [P.bag, P.box].forEach(function (b) { if (b.wobble > 0) b.wobble = Math.max(0, b.wobble - dt); });

    // Particles
    particleTimer -= dt;
    if (particleTimer <= 0) {
      particleTimer = 0.3;
      if (dog.sleeping && Math.random() < 0.25) {
        P.zs.push({ x: dog.x + dog.dir * 70 * dog.s, y: dog.y - 150 * dog.s, vy: 40, life: 2.4, seed: Math.random() * 6 });
      }
      if (dog.watching && Math.random() < 0.5) {
        P.notes.push({ ch: pick(['♪', '♫']), x: rnd(1640, 1840), y: rnd(380, 560), vy: 45, life: 2.4, seed: Math.random() * 6 });
      }
    }
    if (dog.typing && Math.random() < dt * 8) {
      P.letters.push({ ch: pick('asdfjkl;qwerty'.split('')), x: rnd(930, 1030), y: rnd(620, 660), vy: 70, life: 1.4, seed: Math.random() * 6 });
    }
    if (music.on && Math.random() < dt * 0.8) {
      P.notes.push({ ch: pick(['♪', '♫']), x: rnd(1620, 1860), y: rnd(380, 600), vy: 40, life: 2.6, seed: Math.random() * 6 });
    }
    Scene.updateParticles(dt, reduced);
  }
  var particleTimer = 0;

  // ---------- Petting ----------

  var petTimes = [];
  function pet() {
    var now = performance.now() / 1000;
    petTimes = petTimes.filter(function (x) { return now - x < 6; });
    petTimes.push(now);
    var b = DogSprite.bounds(dog);
    var hx = b ? b.x + b.w / 2 : dog.x, hy = b ? b.y : dog.y - 200;
    for (var i = 0; i < 4; i++) P.hearts.push({ x: hx + rnd(-60, 60), y: hy + rnd(-10, 40), vy: rnd(50, 90), life: 1.8, seed: Math.random() * 6 });
    if (dog.sleeping) { say(pick(T.petSleep)); return; }
    if (petTimes.length >= 5) {
      petTimes = [];
      interrupt(function () {
        return [pose('crouch', 0.6, pick(T.swat), { anim: 'wiggle' }),
          jump(function () { return clamp(dog.x + dog.dir * 60, MIN_X, MAX_X); }, FLOOR_Y, FLOOR_S, { h: 40, dur: 0.35 }),
          walk(function () { return dog.x > 1000 ? MIN_X + 60 : MAX_X - 60; }),
          pose('groom', 3, pick(T.swatAfter), { anim: 'groom' })];
      });
      return;
    }
    var keepSpot = dog.spot && dog.spot !== 'inside';
    dog.queue = [];
    if (dog.step && dog.step.type === 'jump') return;
    dog.step = null;
    clearToys();
    var sprite = keepSpot && (dog.spot === 'sofa' || dog.spot === 'table' || dog.spot === 'cube' || dog.spot === 'chair') ? 'loaf' : 'sit';
    dog.queue = [pose(sprite, 3, pick(T.pet), { anim: 'purr' })];
  }

  // ---------- Music: off by default, seamless loop ----------

  var music = { on: false, a: null, b: null, active: null, fading: false };
  var MUSIC_SRC = 'assets/audio/' + encodeURIComponent("Dog's Afternoon.mp3");
  var LOOP_START = 5, FADE = 4, VOL = 0.5;

  function makeTrack() {
    var el = new Audio(MUSIC_SRC);
    el.preload = 'auto';
    el.volume = 0;
    return el;
  }

  function musicTick() {
    if (!music.on || !music.active) return;
    var el = music.active;
    if (!music.fading && el.duration && el.currentTime > el.duration - 8) {
      music.fading = true;
      var next = el === music.a ? music.b : music.a;
      next.currentTime = LOOP_START;
      next.volume = 0;
      next.play().catch(function () {});
      var start = performance.now();
      var timer = setInterval(function () {
        var k = Math.min(1, (performance.now() - start) / (FADE * 1000));
        next.volume = VOL * k;
        el.volume = VOL * (1 - k);
        if (k >= 1 || !music.on) {
          clearInterval(timer);
          el.pause();
          music.active = next;
          music.fading = false;
        }
      }, 50);
    }
  }

  function setMusic(on) {
    var btn = document.getElementById('music');
    if (on) {
      if (!music.a) { music.a = makeTrack(); music.b = makeTrack(); music.active = music.a; }
      music.on = true;
      music.active.volume = VOL;
      music.active.play().then(function () {
        btn.setAttribute('aria-pressed', 'true');
        btn.textContent = 'Music: on';
      }).catch(function () {
        music.on = false;
        say('The music file could not be played in this browser.');
      });
    } else {
      music.on = false;
      [music.a, music.b].forEach(function (el) { if (el) el.pause(); });
      btn.setAttribute('aria-pressed', 'false');
      btn.textContent = 'Music: off';
    }
  }

  // ---------- Input ----------

  var actions = {
    tree: plans.tree, pen: plans.pen, blanket: plans.blanket, laptop: plans.laptop, tv: plans.tv,
    cube: plans.cube, chair: plans.chair, sparkle: plans.sparkle, mouse: plans.mouse, snake: plans.snake,
    ribbon: plans.ribbon, bows: plans.bows, bag: plans.bag, box: plans.box, dinner: plans.dinner
  };

  function buildHotspots() {
    var layer = document.getElementById('hotspots');
    Scene.HOTSPOTS.forEach(function (h) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'hotspot';
      b.setAttribute('aria-label', h.label);
      b.title = h.label;
      b.style.left = (h.rect[0] / W * 100) + '%';
      b.style.top = (h.rect[1] / H * 100) + '%';
      b.style.width = (h.rect[2] / W * 100) + '%';
      b.style.height = (h.rect[3] / H * 100) + '%';
      b.addEventListener('click', function () { interrupt(actions[h.id]); });
      layer.appendChild(b);
    });
  }

  document.querySelectorAll('[data-action]').forEach(function (b) {
    b.addEventListener('click', function () {
      var a = b.getAttribute('data-action');
      if (a === 'pet') pet();
      else if (actions[a]) interrupt(actions[a]);
    });
  });
  document.getElementById('music').addEventListener('click', function () { setMusic(!music.on); });

  canvas.addEventListener('click', function (e) {
    var r = canvas.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width * W;
    var y = (e.clientY - r.top) / r.height * H;
    var b = DogSprite.bounds(dog);
    if (b && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) pet();
  });

  // ---------- Loop ----------

  function render(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    Scene.drawBackground(ctx, t, { reduced: reduced });
    Scene.drawBear(ctx);
    var items = Scene.floorProps().map(function (p) { return { y: p.y, prop: p }; });
    items.push({ y: dog.clip ? 99999 : dog.y, dog: true });
    items.sort(function (a, b) { return a.y - b.y; });
    items.forEach(function (it) {
      if (it.dog) DogSprite.draw(ctx, dog, t, reduced);
      else Scene.drawProp(ctx, it.prop, t);
    });
    Scene.drawAirToys(ctx, t);
    Scene.drawLight(ctx, t, { reduced: reduced });
    Scene.drawParticles(ctx);
  }

  var last = null;
  function frame(now) {
    var t = now / 1000;
    var dt = last === null ? 0 : Math.min(0.05, t - last);
    last = t;
    update(dt, t);
    musicTick();
    render(t);
    requestAnimationFrame(frame);
  }

  say('Loading Dog’s room...');
  Scene.load().then(function () {
    buildHotspots();
    say('Dog is surveying her kingdom.');
    dog.queue = [pose('sit', 3)];
    requestAnimationFrame(frame);
  });

  window.DogsRoom = { dog: dog, props: P, interrupt: interrupt, actions: actions, pet: pet };
})();
