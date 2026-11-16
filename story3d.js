/* ============================================================
   3D SCROLL EXPERIENCE CONFIG — Personalize text & headings here
   ============================================================ */
export const CONFIG_3D = {
  name: "Papaw",
  scene1: {
    headingMain: "Just for",
    headingAccent: "you.",
    subtext: "A special surprise wrapped with love"
  },
  scene2: {
    headingMain: "More",
    headingAccent: "joy.",
    subtext: "Filled with moments that make you smile"
  },
  scene3: {
    headingMain: "Make a",
    headingAccent: "wish.",
    subtext: "Close your eyes, make it count",
    buttonText: "Blow the candles",
    blownText: "Wish made ✨",
    hintText: "tap to blow ✨"
  },
  scene4: {
    headingMain: "Happy",
    headingAccent: "birthday!",
    name: "Papaw",
    subtext: "Keep scrolling for your surprise",
    scrollCue: "↓ scroll down ↓"
  }
};

/* Helper: Check WebGL availability */
export function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

/* Helper: Create procedural 3D Heart geometry */
function createHeartGeometry(THREE, scale = 1) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.35 * scale);
  shape.bezierCurveTo(0, 0.65 * scale, -0.45 * scale, 0.95 * scale, -0.75 * scale, 0.65 * scale);
  shape.bezierCurveTo(-1.05 * scale, 0.35 * scale, -0.85 * scale, -0.15 * scale, 0, -0.85 * scale);
  shape.bezierCurveTo(0.85 * scale, -0.15 * scale, 1.05 * scale, 0.35 * scale, 0.75 * scale, 0.65 * scale);
  shape.bezierCurveTo(0.45 * scale, 0.95 * scale, 0, 0.65 * scale, 0, 0.35 * scale);

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: 0.35 * scale,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.12 * scale,
    bevelThickness: 0.12 * scale
  });
  geom.center();
  return geom;
}

export async function initStory3D() {
  const section = document.getElementById('story3d');
  const loader = document.getElementById('storyLoader');
  const canvas = document.getElementById('storyCanvas');
  const blowBtn = document.getElementById('blowCandlesBtn');
  const candleHint = document.getElementById('candleHint');
  const fbBlowBtn = document.getElementById('fbBlowCandlesBtn');

  if (!section || !canvas) return;

  let candlesBlown = false;

  // Fallback handler for blow candles button (2D fallback or 3D)
  function handleBlowCandles() {
    candlesBlown = true;
    if (blowBtn) {
      blowBtn.textContent = CONFIG_3D.scene3.blownText;
      blowBtn.classList.add('blown');
      blowBtn.classList.remove('pulse-attract');
    }
    if (fbBlowBtn) {
      fbBlowBtn.textContent = CONFIG_3D.scene3.blownText;
      fbBlowBtn.classList.add('blown');
    }
    if (candleHint) candleHint.classList.remove('visible');
  }

  if (fbBlowBtn) fbBlowBtn.addEventListener('click', handleBlowCandles);

  // Check WebGL or reduced motion
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!isWebGLAvailable() || reduceMotion) {
    section.classList.add('no-webgl');
    if (loader) loader.classList.add('loaded');
    return;
  }

  // Import Three.js module locally
  let THREE;
  try {
    THREE = await import('./vendor/three.module.min.js');
  } catch (err) {
    console.error('Failed to load Three.js:', err);
    section.classList.add('no-webgl');
    if (loader) loader.classList.add('loaded');
    return;
  }

  // Three.js Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, window.innerWidth < 480 ? 9.2 : 7.6);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  // Lights
  const ambientLight = new THREE.AmbientLight(0xfff5f8, 1.3);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.8);
  dirLight1.position.set(5, 8, 5);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0x90caf9, 1.1);
  dirLight2.position.set(-6, -2, 4);
  scene.add(dirLight2);

  const pinkRim = new THREE.DirectionalLight(0xff80ab, 1.4);
  pinkRim.position.set(0, -6, -3);
  scene.add(pinkRim);

  // Materials
  const matBoxPink = new THREE.MeshStandardMaterial({ color: 0xfda4ba, roughness: 0.35, metalness: 0.08 });
  const matMint = new THREE.MeshStandardMaterial({ color: 0xc8f7dc, roughness: 0.28, metalness: 0.05 });
  const matHeartPink = new THREE.MeshStandardMaterial({ color: 0xff5376, roughness: 0.18, metalness: 0.15 });
  const matCakeBottom = new THREE.MeshStandardMaterial({ color: 0xffb7b2, roughness: 0.32, metalness: 0.05 });
  const matCakeTop = new THREE.MeshStandardMaterial({ color: 0xfff0f5, roughness: 0.22, metalness: 0.05 });
  const matPlate = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.2 });
  const matGoldHeart = new THREE.MeshStandardMaterial({ color: 0xffd166, roughness: 0.2, metalness: 0.3 });

  // ================= SCENE 1 OBJECTS: Gift Box & Heart =================
  const groupScene1 = new THREE.Group();

  // Box Base
  const boxBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.3, 1.6), matBoxPink);
  const ribbonBaseV1 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.32, 1.62), matMint);
  const ribbonBaseV2 = new THREE.Mesh(new THREE.BoxGeometry(1.62, 1.32, 0.25), matMint);
  boxBase.add(ribbonBaseV1);
  boxBase.add(ribbonBaseV2);
  groupScene1.add(boxBase);

  // Box Lid Group
  const boxLidGroup = new THREE.Group();
  boxLidGroup.position.set(0, 0.8, 0);
  const lidTop = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.28, 1.72), matBoxPink);
  const ribbonLidV1 = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.30, 1.74), matMint);
  const ribbonLidV2 = new THREE.Mesh(new THREE.BoxGeometry(1.74, 0.30, 0.27), matMint);
  lidTop.add(ribbonLidV1);
  lidTop.add(ribbonLidV2);

  // Bow
  const bowCenter = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), matMint);
  bowCenter.position.set(0, 0.2, 0);
  const bowLoop1 = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.065, 16, 32), matMint);
  bowLoop1.position.set(-0.16, 0.22, 0);
  bowLoop1.rotation.set(0, 0, Math.PI / 4);
  const bowLoop2 = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.065, 16, 32), matMint);
  bowLoop2.position.set(0.16, 0.22, 0);
  bowLoop2.rotation.set(0, 0, -Math.PI / 4);
  lidTop.add(bowCenter);
  lidTop.add(bowLoop1);
  lidTop.add(bowLoop2);
  boxLidGroup.add(lidTop);
  groupScene1.add(boxLidGroup);

  // Floating Heart next to Box
  const smallHeart = new THREE.Mesh(createHeartGeometry(THREE, 0.42), matHeartPink);
  smallHeart.position.set(1.4, 0.3, 0.3);
  groupScene1.add(smallHeart);

  groupScene1.position.set(0, -0.2, 0);
  scene.add(groupScene1);

  // ================= SCENE 2 OBJECTS: Pastel Balloons & Streamers =================
  const groupScene2 = new THREE.Group();
  const balloonColors = [0xffb3ba, 0xbaffc9, 0xd7bde2, 0xffffba, 0xbae1ff, 0xffdfba];
  const balloonOffsets = [
    [-0.7, 0.3, 0.2], [0.6, 0.4, -0.2], [-0.15, 0.85, -0.3],
    [0.75, -0.25, 0.3], [-0.55, -0.35, -0.2], [0.15, -0.15, 0.4]
  ];
  const balloonMeshes = [];
  const balloonGeo = new THREE.SphereGeometry(0.5, 32, 24);
  const knotGeo = new THREE.ConeGeometry(0.08, 0.12, 16);
  const stringGeo = new THREE.CylinderGeometry(0.007, 0.007, 1.6, 8);
  const matString = new THREE.MeshBasicMaterial({ color: 0xeeeeee });

  balloonOffsets.forEach((pos, i) => {
    const bGroup = new THREE.Group();
    const bMat = new THREE.MeshStandardMaterial({
      color: balloonColors[i % balloonColors.length],
      roughness: 0.2,
      metalness: 0.12
    });
    const bSphere = new THREE.Mesh(balloonGeo, bMat);
    bSphere.scale.set(1, 1.2, 1);
    const bKnot = new THREE.Mesh(knotGeo, bMat);
    bKnot.position.set(0, -0.62, 0);
    const bString = new THREE.Mesh(stringGeo, matString);
    bString.position.set(0, -1.45, 0);

    bGroup.add(bSphere);
    bGroup.add(bKnot);
    bGroup.add(bString);
    bGroup.position.set(pos[0], pos[1], pos[2]);
    balloonMeshes.push(bGroup);
    groupScene2.add(bGroup);
  });

  groupScene2.position.set(0, -6, 0);
  scene.add(groupScene2);

  // Confetti particles (reused across scenes)
  const confettiCount = window.innerWidth < 480 ? 110 : 160;
  const confettiGeo = new THREE.PlaneGeometry(0.09, 0.13);
  const confettiMeshes = [];
  const confettiGroup = new THREE.Group();
  for (let i = 0; i < confettiCount; i++) {
    const cMat = new THREE.MeshBasicMaterial({
      color: balloonColors[i % balloonColors.length],
      side: THREE.DoubleSide
    });
    const cMesh = new THREE.Mesh(confettiGeo, cMat);
    cMesh.position.set(
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 4
    );
    cMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    cMesh.userData = {
      rotX: (Math.random() - 0.5) * 0.05,
      rotY: (Math.random() - 0.5) * 0.05,
      speedY: 0.01 + Math.random() * 0.02
    };
    confettiMeshes.push(cMesh);
    confettiGroup.add(cMesh);
  }
  scene.add(confettiGroup);

  // ================= SCENE 3 OBJECTS: Cake & Candles =================
  const groupScene3 = new THREE.Group();

  // Cake Stand
  const plateMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.9, 0.12, 32), matPlate);
  plateMesh.position.set(0, -0.6, 0);
  groupScene3.add(plateMesh);

  // Tier 1 (bottom)
  const tier1Mesh = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.7, 32), matCakeBottom);
  tier1Mesh.position.set(0, -0.15, 0);
  const tier1Rim = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.055, 16, 36), matCakeTop);
  tier1Rim.rotation.x = Math.PI / 2;
  tier1Rim.position.set(0, 0.2, 0);
  tier1Mesh.add(tier1Rim);
  groupScene3.add(tier1Mesh);

  // Tier 2 (top)
  const tier2Mesh = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.58, 32), matCakeTop);
  tier2Mesh.position.set(0, 0.49, 0);
  const tier2Rim = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.05, 16, 36), matCakeBottom);
  tier2Rim.rotation.x = Math.PI / 2;
  tier2Rim.position.set(0, 0.28, 0);
  tier2Mesh.add(tier2Rim);
  groupScene3.add(tier2Mesh);

  // Candles & Flames
  const candlePositions = [[-0.45, 0.78, 0], [0, 0.78, 0.26], [0.45, 0.78, 0]];
  const candleGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.42, 16);
  const wickGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.07, 8);
  const matWick = new THREE.MeshBasicMaterial({ color: 0x333333 });
  const flameGeo = new THREE.SphereGeometry(0.065, 16, 16);
  const matFlame = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
  const candleFlames = [];

  const candleLight = new THREE.PointLight(0xffa726, 2.2, 4);
  candleLight.position.set(0, 1.3, 0.2);
  groupScene3.add(candleLight);

  candlePositions.forEach((cPos, i) => {
    const cMat = new THREE.MeshStandardMaterial({
      color: balloonColors[(i + 1) % balloonColors.length],
      roughness: 0.3
    });
    const cMesh = new THREE.Mesh(candleGeo, cMat);
    cMesh.position.set(cPos[0], cPos[1], cPos[2]);
    const wick = new THREE.Mesh(wickGeo, matWick);
    wick.position.set(0, 0.24, 0);
    cMesh.add(wick);

    const flame = new THREE.Mesh(flameGeo, matFlame);
    flame.scale.set(0.85, 1.7, 0.85);
    flame.position.set(0, 0.32, 0);
    cMesh.add(flame);
    candleFlames.push(flame);

    groupScene3.add(cMesh);
  });

  // Floating Golden Heart (rises on blow)
  const wishHeart = new THREE.Mesh(createHeartGeometry(THREE, 0.5), matGoldHeart);
  wishHeart.position.set(0, 0.9, 0);
  wishHeart.scale.setScalar(0.001);
  groupScene3.add(wishHeart);

  // Smoke Puff particles
  const smokeParticles = [];
  const smokeGeo = new THREE.SphereGeometry(0.06, 12, 12);
  const matSmoke = new THREE.MeshBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0 });
  for (let i = 0; i < 15; i++) {
    const sp = new THREE.Mesh(smokeGeo, matSmoke.clone());
    sp.position.set((Math.random() - 0.5) * 0.6, 1.0, (Math.random() - 0.5) * 0.4);
    groupScene3.add(sp);
    smokeParticles.push(sp);
  }

  groupScene3.position.set(0, -6, 0);
  scene.add(groupScene3);

  // ================= SCENE 4 OBJECTS: Big 3D Heart & Balloons =================
  const groupScene4 = new THREE.Group();
  const bigHeart = new THREE.Mesh(createHeartGeometry(THREE, 1.45), matHeartPink);
  groupScene4.add(bigHeart);

  // Backing balloons
  const backB1 = new THREE.Mesh(balloonGeo, new THREE.MeshStandardMaterial({ color: 0xd7bde2, roughness: 0.2 }));
  backB1.scale.set(0.9, 1.1, 0.9);
  backB1.position.set(-1.25, 0.7, -0.6);
  groupScene4.add(backB1);

  const backB2 = new THREE.Mesh(balloonGeo, new THREE.MeshStandardMaterial({ color: 0xbaffc9, roughness: 0.2 }));
  backB2.scale.set(0.9, 1.1, 0.9);
  backB2.position.set(1.25, 0.7, -0.6);
  groupScene4.add(backB2);

  groupScene4.position.set(0, 0, 0);
  groupScene4.scale.setScalar(0.001);
  scene.add(groupScene4);

  // Wire Candle Button Click
  if (blowBtn) {
    blowBtn.addEventListener('click', () => {
      handleBlowCandles();
      // Smoke puff burst
      smokeParticles.forEach((sp, i) => {
        sp.material.opacity = 0.8;
        sp.position.set(
          candlePositions[i % 3][0] + (Math.random() - 0.5) * 0.15,
          1.1 + Math.random() * 0.1,
          candlePositions[i % 3][2] + (Math.random() - 0.5) * 0.15
        );
      });
      // Heart pop
      wishHeart.scale.setScalar(1);
    });
  }

  // Animation & Scroll timeline
  let clock = new THREE.Clock();
  let animationFrameId = null;
  let isIntersecting = true;

  // UI Scene Headings
  const ui1 = document.getElementById('uiScene1');
  const ui2 = document.getElementById('uiScene2');
  const ui3 = document.getElementById('uiScene3');
  const ui4 = document.getElementById('uiScene4');

  function updateTimeline(progress) {
    let activeProgress = progress;
    if (!candlesBlown && progress >= 0.70) {
      activeProgress = 0.70;
      if (candleHint) candleHint.classList.add('visible');
      if (blowBtn) blowBtn.classList.add('pulse-attract');
    } else if (candlesBlown || progress < 0.65) {
      if (candleHint) candleHint.classList.remove('visible');
      if (blowBtn) blowBtn.classList.remove('pulse-attract');
    }

    // Toggle UI Headings
    if (ui1) ui1.classList.toggle('active', activeProgress < 0.23);
    if (ui2) ui2.classList.toggle('active', activeProgress >= 0.23 && activeProgress < 0.48);
    if (ui3) ui3.classList.toggle('active', activeProgress >= 0.48 && activeProgress < 0.73);
    if (ui4) ui4.classList.toggle('active', activeProgress >= 0.73);

    // Hide candle button outside Scene 3
    if (blowBtn) {
      const showCandleBtn = activeProgress >= 0.48 && activeProgress < 0.74;
      blowBtn.style.opacity = showCandleBtn ? '1' : '0';
      blowBtn.style.pointerEvents = showCandleBtn ? 'auto' : 'none';
    }

    // SCENE 1 ANIMATIONS (0.0 -> 0.25)
    if (activeProgress < 0.26) {
      groupScene1.visible = true;
      const s1Prog = Math.min(1, activeProgress / 0.20);
      boxLidGroup.position.y = 0.8 + s1Prog * 1.8;
      boxLidGroup.rotation.x = -s1Prog * 0.65;
      boxLidGroup.rotation.z = s1Prog * 0.25;
      groupScene1.rotation.y = s1Prog * 0.6;
      groupScene1.position.y = -0.2 - Math.max(0, activeProgress - 0.20) * 16;
    } else {
      groupScene1.visible = false;
    }

    // SCENE 2 ANIMATIONS (0.20 -> 0.52)
    if (activeProgress >= 0.20 && activeProgress < 0.54) {
      groupScene2.visible = true;
      if (activeProgress < 0.32) {
        const riseT = (activeProgress - 0.20) / 0.12;
        groupScene2.position.y = -5 + riseT * 5.2;
        groupScene2.scale.setScalar(0.4 + riseT * 0.6);
      } else if (activeProgress < 0.45) {
        groupScene2.position.y = 0.2;
        groupScene2.scale.setScalar(1);
      } else {
        const exitT = (activeProgress - 0.45) / 0.09;
        groupScene2.position.y = 0.2 + exitT * 7.5;
        groupScene2.scale.setScalar(Math.max(0.01, 1 - exitT * 0.4));
      }
    } else {
      groupScene2.visible = false;
    }

    // SCENE 3 ANIMATIONS (0.46 -> 0.76)
    if (activeProgress >= 0.46 && activeProgress < 0.78) {
      groupScene3.visible = true;
      if (activeProgress < 0.55) {
        const riseT = (activeProgress - 0.46) / 0.09;
        groupScene3.position.y = -5.5 + riseT * 5.1;
      } else if (activeProgress < 0.72) {
        groupScene3.position.y = -0.4;
      } else {
        const exitT = (activeProgress - 0.72) / 0.06;
        groupScene3.position.y = -0.4 - exitT * 5.5;
      }
    } else {
      groupScene3.visible = false;
    }

    // SCENE 4 ANIMATIONS (0.72 -> 1.0)
    if (activeProgress >= 0.72) {
      groupScene4.visible = true;
      const enterT = Math.min(1, (activeProgress - 0.72) / 0.09);
      groupScene4.scale.setScalar(enterT);
      groupScene4.position.y = -0.1;
    } else {
      groupScene4.visible = false;
    }
  }

  // Scroll listener
  function onScroll() {
    const rect = section.getBoundingClientRect();
    const totalScroll = section.offsetHeight - window.innerHeight;
    const currentScroll = -rect.top;
    let progress = Math.max(0, Math.min(1, currentScroll / Math.max(1, totalScroll)));

    // Candle Gate: Clamps scroll position until candles are blown
    const isAtCandleGate = !candlesBlown && progress >= 0.70;
    if (isAtCandleGate) {
      const lockScrollY = section.offsetTop + totalScroll * 0.70;
      if (window.scrollY > lockScrollY + 5) {
        window.scrollTo({ top: lockScrollY, behavior: 'instant' });
      }
      progress = 0.70;
      if (candleHint) candleHint.classList.add('visible');
      if (blowBtn) blowBtn.classList.add('pulse-attract');
    }

    updateTimeline(progress);
  }

  window.addEventListener('scroll', onScroll, { passive: false });
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.position.z = window.innerWidth < 480 ? 9.2 : 7.6;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Render loop
  function animate() {
    if (!isIntersecting) return;
    animationFrameId = requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // Floating heart bobbing (Scene 1)
    if (groupScene1.visible) {
      smallHeart.position.y = 0.35 + Math.sin(time * 3) * 0.12;
      smallHeart.rotation.y = time * 1.4;
    }

    // Balloons floating (Scene 2)
    if (groupScene2.visible) {
      balloonMeshes.forEach((bm, i) => {
        bm.position.y = balloonOffsets[i][1] + Math.sin(time * 2 + i * 1.2) * 0.15;
        bm.rotation.z = Math.sin(time * 1.5 + i) * 0.08;
      });
    }

    // Candle flames flicker & smoke puff (Scene 3)
    if (groupScene3.visible) {
      if (!candlesBlown) {
        candleFlames.forEach((fl, i) => {
          const fScale = 0.85 + Math.sin(time * 12 + i * 2) * 0.18;
          fl.scale.set(0.85 * fScale, 1.7 * fScale, 0.85 * fScale);
        });
        candleLight.intensity = 2.0 + Math.sin(time * 15) * 0.5;
      } else {
        // Smoke rise
        smokeParticles.forEach((sp, i) => {
          if (sp.material.opacity > 0) {
            sp.position.y += 0.015;
            sp.position.x += (Math.sin(time * 4 + i) * 0.005);
            sp.scale.addScalar(0.02);
            sp.material.opacity -= 0.012;
          }
        });
        // Wish heart rise
        if (wishHeart.scale.x > 0.01) {
          wishHeart.position.y += 0.012;
          wishHeart.rotation.y = time * 2;
        }
      }
    }

    // Big heart heartbeat pulse (Scene 4)
    if (groupScene4.visible) {
      const beat = 1 + Math.sin(time * 3.5) * 0.045;
      bigHeart.scale.set(beat, beat, beat);
      backB1.position.y = 0.7 + Math.sin(time * 2) * 0.12;
      backB2.position.y = 0.7 + Math.sin(time * 2 + 1.5) * 0.12;
    }

    // Confetti particles gentle drift
    confettiMeshes.forEach(cm => {
      cm.position.y -= cm.userData.speedY;
      cm.rotation.x += cm.userData.rotX;
      cm.rotation.y += cm.userData.rotY;
      if (cm.position.y < -4) cm.position.y = 5;
    });

    renderer.render(scene, camera);
  }

  // IntersectionObserver to pause rendering when section is off-screen
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isIntersecting = entry.isIntersecting;
      if (isIntersecting) {
        clock.start();
        animate();
      } else {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      }
    });
  }, { threshold: 0.01 });

  observer.observe(section);

  // Initial trigger
  updateTimeline(0);
  if (loader) loader.classList.add('loaded');
}
