(function () {
  const PI = Math.PI;
  const { sin, cos, sqrt } = Math;

  const hypotenuse = (a, b) => Math.sqrt(a * a + b * b);
  const distance = (x1, y1, x2, y2) => hypotenuse(x2 - x1, y2 - y1);

  let t = 0;
  let frame = 0;
  const start = Date.now();
  const seed = -25;

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

  const canvas = {
    width: window.innerWidth,
    height: window.innerHeight,
    hyp: hypotenuse(window.innerWidth, window.innerHeight)
  };

  const resizeHandler = () => {
    camera.left = window.innerWidth / -2;
    camera.right = window.innerWidth / 2;
    camera.bottom = window.innerHeight / -2;
    camera.top = window.innerHeight / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.hyp = hypotenuse(canvas.width, canvas.height);
  };

  resizeHandler();

  window.addEventListener("resize", resizeHandler, false);
  document.body.appendChild(renderer.domElement);

  const side = hypotenuse(canvas.width, canvas.height) / 45;
  const geometry = new THREE.BoxGeometry(side + 1, side + 1, side + 5);
  const cubes = [];
  const xside = side;
  const yside = side;

  for (let x = camera.left * 1.3; x <= camera.right * 1.3; x += xside) {
    for (let y = camera.bottom * 1.3; y <= camera.top * 1.3; y += yside) {
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
          e.preventDefault();
          e = e.touches[0];
        }
        Mouse.x = (Mouse.x + e.pageX) * 0.5;
        Mouse.y = (Mouse.y + e.pageY) * 0.5;
        Mouse.x0 = Mouse.x - canvas.width / 2;
        return (Mouse.y0 = Mouse.y - canvas.height / 2);
      },
      down: function (e) {
        return (Mouse.down = !Mouse.down);
      },
      up: function (e) {
        return (Mouse.down = !Mouse.down);
      },
    },
  };

  window.addEventListener("mousemove", Mouse.events.move, false);
  window.addEventListener("mousedown", Mouse.events.down, false);
  window.addEventListener("mouseup", Mouse.events.up, false);
  window.addEventListener("touchmove", Mouse.events.move, false);
  window.addEventListener("touchstart", Mouse.events.down, false);
  window.addEventListener("touchstop", Mouse.events.up, false);
  camera.up.set(0, 1, 0);
  camera.position.set(side * 10, side * 10, -side * 10);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  const animloop = () => {
    animloop.id = requestAnimationFrame(animloop);
    t = (Date.now() - start) / 1000 + seed;
    frame++;

    if (Mouse.down) {
      Mouse.held++;
    }

    const cubesLength = cubes.length;
    for (let i = 0; i < cubesLength; i++) {
      const cube = cubes[i];
      const dist = distance(-Mouse.x0, -Mouse.y0, cube.position.x, cube.position.y);
      const distneg = distance(Mouse.x0, Mouse.y0, cube.position.x, cube.position.y);

      cube.scale.y =
        2.25 +
        1.25 *
        sin((dist / canvas.hyp) * PI * 7 - t * 0.8 - Mouse.held / 50) *
        cos((dist / canvas.hyp) * PI * 4 - t * 1.5 - Mouse.held / 50) +
        (1 + sin(((distneg - dist) / canvas.hyp) * PI * 1));

      const scaleYDiv = cube.scale.y / 3.5;
      const heldDiv80 = Mouse.held / 80;
      const heldDiv81 = Mouse.held / 81;
      const heldDiv82 = Mouse.held / 82;
      const distNegNorm = (distneg / canvas.hyp) * PI * 2 * 0.75;

      const r = 0.4 + 0.4 * sin(distNegNorm - t / 3.0 + 3 + heldDiv80 + scaleYDiv);
      const g = 0.4 + 0.4 * sin(distNegNorm - t / 3.1 + 2 + heldDiv81 + scaleYDiv);
      const b = 0.4 + 0.4 * sin(distNegNorm - t / 3.2 + 1 + heldDiv82 + scaleYDiv);

      cube.material.color.setRGB(r, g, b);
    }

    renderer.render(scene, camera);
  };

  animloop();
}).call(this);
