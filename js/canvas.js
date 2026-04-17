(function () {
  const PI = Math.PI;
  const { sin, cos } = Math;

  const hypotenuse = (a, b) => Math.sqrt(a * a + b * b);
  const distance = (x1, y1, x2, y2) => hypotenuse(x2 - x1, y2 - y1);

  // Skip scene/WebGL setup when canvas can never be enabled.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  let t = 0;
  let animId = null;
  const startTime = Date.now();
  const seed = -25;

  let rPhase = 3;
  let gPhase = 2;
  let bPhase = 1;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(
    window.innerWidth / -2,
    window.innerWidth / 2,
    window.innerHeight / 2,
    window.innerHeight / -2,
    -5000,
    30000
  );
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  if (renderer.setPixelRatio) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }

  const canvas = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  canvas.hyp = hypotenuse(canvas.width, canvas.height);
  canvas.hypInv = 1 / canvas.hyp;

  const updateCanvasSize = () => {
    camera.left = window.innerWidth / -2;
    camera.right = window.innerWidth / 2;
    camera.bottom = window.innerHeight / -2;
    camera.top = window.innerHeight / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.hyp = hypotenuse(canvas.width, canvas.height);
    canvas.hypInv = 1 / canvas.hyp;
  };

  let resizeTimeout;
  const resizeHandler = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateCanvasSize, 100);
  };

  updateCanvasSize();

  window.addEventListener("resize", resizeHandler, false);
  document.body.appendChild(renderer.domElement);

  const side = hypotenuse(canvas.width, canvas.height) / 45;
  const geometry = new THREE.BoxGeometry(side + 1, side + 1, side + 5);
  const cubes = [];

  for (let x = camera.left * 1.3; x <= camera.right * 1.3; x += side) {
    for (let y = camera.bottom * 1.3; y <= camera.top * 1.3; y += side) {
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        wireframe: false,
        opacity: 1,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, x + y);
      cubes.push(mesh);
      scene.add(mesh);
    }
  }

  const Mouse = {
    down: false,
    held: 0,
    x: canvas.width / 2,
    y: canvas.height / 2,
    x0: 0,
    y0: 0,
    events: {
      move: function (e) {
        if ("touches" in e) {
          e = e.touches[0];
        }
        Mouse.x = (Mouse.x + e.pageX) * 0.5;
        Mouse.y = (Mouse.y + e.pageY) * 0.5;
        Mouse.x0 = Mouse.x - canvas.width / 2;
        return (Mouse.y0 = Mouse.y - canvas.height / 2);
      },
      down: function () {
        Mouse.down = true;
      },
      up: function () {
        Mouse.down = false;
      },
    },
  };

  window.addEventListener("mousemove", Mouse.events.move, false);
  window.addEventListener("mousedown", Mouse.events.down, false);
  window.addEventListener("mouseup", Mouse.events.up, false);
  window.addEventListener("touchmove", Mouse.events.move, { passive: true });
  window.addEventListener("touchstart", Mouse.events.down, { passive: true });
  window.addEventListener("touchend", Mouse.events.up, { passive: true });
  camera.up.set(0, 1, 0);
  camera.position.set(side * 10, side * 10, -side * 10);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  const cubesLength = cubes.length;

  const animloop = () => {
    animId = requestAnimationFrame(animloop);
    t = (Date.now() - startTime) / 1000 + seed;

    if (Mouse.down) {
      Mouse.held++;
    }

    const hypInv = canvas.hypInv;
    const mx = -Mouse.x0;
    const my = -Mouse.y0;
    const mxPos = Mouse.x0;
    const myPos = Mouse.y0;
    const heldDiv80 = Mouse.held / 80;
    const heldDiv81 = Mouse.held / 81;
    const heldDiv82 = Mouse.held / 82;
    const heldDiv50 = Mouse.held / 50;
    const tDiv3_0 = t / 3.0;
    const tDiv3_1 = t / 3.1;
    const tDiv3_2 = t / 3.2;
    const t08 = t * 0.8;
    const t15 = t * 1.5;

    for (let i = 0; i < cubesLength; i++) {
      const cube = cubes[i];
      const px = cube.position.x;
      const py = cube.position.y;
      const dist = distance(mx, my, px, py);
      const distneg = distance(mxPos, myPos, px, py);

      const distNorm = dist * hypInv;
      const distnegNorm = distneg * hypInv;

      cube.scale.y =
        2.25 +
        1.25 *
        sin(distNorm * PI * 7 - t08 - heldDiv50) *
        cos(distNorm * PI * 4 - t15 - heldDiv50) +
        (1 + sin((distnegNorm - distNorm) * PI));

      const scaleYDiv = cube.scale.y / 3.5;
      const distNegPI = distnegNorm * PI * 1.5;

      const r = 0.4 + 0.4 * sin(distNegPI - tDiv3_0 + rPhase + heldDiv80 + scaleYDiv);
      const g = 0.4 + 0.4 * sin(distNegPI - tDiv3_1 + gPhase + heldDiv81 + scaleYDiv);
      const b = 0.4 + 0.4 * sin(distNegPI - tDiv3_2 + bPhase + heldDiv82 + scaleYDiv);

      cube.material.color.setRGB(r, g, b);
    }

    renderer.render(scene, camera);
  };

  const startAnimation = () => {
    if (animId !== null) return;
    animloop();
  };

  const stopAnimation = () => {
    if (animId !== null) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  };

  window.startCanvasAnimation = startAnimation;
  window.stopCanvasAnimation = stopAnimation;
  window.setCanvasColor = (r, g, b) => {
    rPhase = r;
    gPhase = g;
    bPhase = b;
  };

  animloop();
})();
