/* ==========================================================================
   Photorealistic 4K IMAX Interstellar Gargantua & 3D Endurance Engine
   Schwarzschild Geodesic Raymarching, Relativistic Doppler Beaming,
   Gravitational Lensing Halo, Dynamic Camera Tracking & Section Navigation
   ========================================================================== */
(function() {
  class Gargantua4KEngine {
    constructor() {
      this.canvas = document.getElementById('blackhole-canvas');
      this.overlayCanvas = document.getElementById('spacecraft-overlay');
      if (!this.canvas) return;

      this.gl = this.canvas.getContext('webgl2') || 
                this.canvas.getContext('webgl') || 
                this.canvas.getContext('experimental-webgl');
      if (!this.gl) {
        console.warn('WebGL not available for Gargantua simulation.');
        return;
      }

      this.ctx = this.overlayCanvas ? this.overlayCanvas.getContext('2d') : null;
      this.time = 0;
      this.diskBoost = 0.0;
      this.theme = document.documentElement.getAttribute('data-theme') === 'light' ? 1.0 : 0.0;

      // Cinematic camera navigation state
      this.currentTheta = 0.5;
      this.targetTheta = 0.5;
      this.currentPhi = 1.49;
      this.targetPhi = 1.49;
      this.currentRadius = 20.0;
      this.targetRadius = 20.0;
      this.scrollProgress = 0;

      // Mouse parallax
      this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

      // Distinct cinematic camera vantage points per academic section
      this.tabAngles = {
        'home':         { phi: 1.49, theta: 0.50, radius: 20.0 },
        'research':     { phi: 1.32, theta: 1.25, radius: 21.5 },
        'proposal':     { phi: 1.12, theta: 2.15, radius: 23.0 },
        'publications': { phi: 1.42, theta: 3.10, radius: 19.5 },
        'talks':        { phi: 1.26, theta: 4.15, radius: 22.0 },
        'cv':           { phi: 1.46, theta: 5.05, radius: 20.5 },
        'code':         { phi: 1.34, theta: 5.95, radius: 22.5 },
        'contact':      { phi: 1.51, theta: 0.80, radius: 18.5 }
      };

      this.initWebGL();
      this.bindEvents();
      this.resize();
      this.animate();
    }

    initWebGL() {
      const gl = this.gl;
      const vs = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vs, "attribute vec2 position;\nvoid main() {\n  gl_Position = vec4(position, 0.0, 1.0);\n}");
      gl.compileShader(vs);
      if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        console.error('VS Error:', gl.getShaderInfoLog(vs));
        return;
      }

      const fs = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fs, "precision highp float;\n\nuniform vec2  iResolution;\nuniform float iTime;\nuniform vec3  camPos;\nuniform vec3  camRight;\nuniform vec3  camUp;\nuniform vec3  camForward;\nuniform float camFov;\nuniform float uRs;\nuniform float uDiskInner;\nuniform float uDiskOuter;\nuniform float uDiskRotSpeed;\nuniform float uDiskSpin;\nuniform float uExposure;\nuniform float uAxisTilt;\nuniform float uTheme;\nuniform float uDiskBoost;\n\nconst int   MAX_STEPS = 140;\nconst float PI = 3.14159265359;\n\n// ---- hash / noise -------------------------------------------------------\nfloat hash13(vec3 p3) {\n  p3 = fract(p3 * 0.1031);\n  p3 += dot(p3, p3.yzx + 33.33);\n  return fract((p3.x + p3.y) * p3.z);\n}\n\nfloat noise3(vec3 x) {\n  vec3 i = floor(x);\n  vec3 f = fract(x);\n  f = f * f * (3.0 - 2.0 * f);\n  return mix(\n    mix(mix(hash13(i + vec3(0.0,0.0,0.0)), hash13(i + vec3(1.0,0.0,0.0)), f.x),\n        mix(hash13(i + vec3(0.0,1.0,0.0)), hash13(i + vec3(1.0,1.0,0.0)), f.x), f.y),\n    mix(mix(hash13(i + vec3(0.0,0.0,1.0)), hash13(i + vec3(1.0,0.0,1.0)), f.x),\n        mix(hash13(i + vec3(0.0,1.0,1.0)), hash13(i + vec3(1.0,1.0,1.0)), f.x), f.y),\n    f.z);\n}\n\nfloat fbm(vec3 p) {\n  float v = 0.0;\n  float a = 0.5;\n  for (int i = 0; i < 5; i++) {\n    v += a * noise3(p);\n    p *= 2.02;\n    a *= 0.5;\n  }\n  return v;\n}\n\nvec3 nebula(vec3 dir) {\n  float n = fbm(dir * 2.2 + 5.0);\n  float mask = smoothstep(0.66, 0.92, n);\n  vec3 deepBlue = vec3(0.02, 0.03, 0.07);\n  vec3 cyan     = vec3(0.02, 0.08, 0.09);\n  float colorMix = hash13(floor(dir * 3.0 + 100.0));\n  vec3 tint = mix(deepBlue, cyan, colorMix);\n  return tint * mask * 0.35;\n}\n\nvec3 sampleCloud(vec3 dir, vec3 cdir, vec3 col, float size, float seed) {\n  float ang = acos(clamp(dot(dir, cdir), -1.0, 1.0));\n  float shape = fbm(dir * 3.5 + seed);\n  float falloff = exp(-(ang * ang) / (size * size));\n  return col * falloff * (0.35 + 0.9 * shape) * 0.5;\n}\n\nvec3 nebulaClouds(vec3 dir) {\n  vec3 col = vec3(0.0);\n  col += sampleCloud(dir, normalize(vec3(-0.72,  0.48,  0.30)), vec3(0.55, 0.20, 0.06), 0.42, 0.0);\n  col += sampleCloud(dir, normalize(vec3( 0.58, -0.52, -0.42)), vec3(0.42, 0.12, 0.05), 0.32, 17.0);\n  col += sampleCloud(dir, normalize(vec3(-0.15, -0.68,  0.58)), vec3(0.06, 0.08, 0.16), 0.42, 34.0);\n  col += sampleCloud(dir, normalize(vec3( 0.35,  0.62, -0.55)), vec3(0.34, 0.10, 0.44), 0.20, 51.0);\n  return col;\n}\n\nvec3 starfield(vec3 dir) {\n  vec3 col = vec3(0.0);\n  vec3 p = dir * 260.0;\n  vec3 ip = floor(p);\n  vec3 fp = fract(p);\n  float d = hash13(ip);\n\n  if (d > 0.9994) {\n    float warm = step(0.5, hash13(ip + 9.9));\n    vec3 tint = mix(vec3(0.6, 0.8, 1.4), vec3(1.35, 0.9, 0.55), warm);\n    float dist = length(fp - 0.5);\n    float star = smoothstep(0.42, 0.0, dist);\n    col += tint * star * 5.5;\n  } else if (d > 0.9935) {\n    float brightness = hash13(ip + 7.7);\n    vec3 starColor = mix(vec3(0.8, 0.85, 1.0), vec3(1.0, 0.9, 0.75), hash13(ip + 3.3));\n    float dist = length(fp - 0.5);\n    float star = smoothstep(0.35, 0.0, dist) * brightness;\n    col += starColor * star * 3.2;\n  }\n\n  col += nebula(dir);\n  return col;\n}\n\nvec3 randDir(float seed) {\n  float a = hash13(vec3(seed, 1.7, 9.2)) * 6.2831853;\n  float z = hash13(vec3(seed, 4.4, 2.1)) * 2.0 - 1.0;\n  float rr = sqrt(max(0.0, 1.0 - z * z));\n  return vec3(rr * cos(a), z, rr * sin(a));\n}\n\nvec3 sampleBigStar(vec3 dir, vec3 sdir, vec3 scol, float size) {\n  float ang = acos(clamp(dot(dir, sdir), -1.0, 1.0));\n  float core = smoothstep(size, 0.0, ang);\n  float glow = exp(-(ang * ang) / (size * size * 8.0)) * 0.5;\n  return scol * (core * 2.2 + glow);\n}\n\nvec3 bigStars(vec3 dir) {\n  vec3 col = vec3(0.0);\n  col += sampleBigStar(dir, normalize(vec3( 0.42,  0.16, -0.35)), vec3(0.55, 0.75, 1.7),  0.013);\n  col += sampleBigStar(dir, normalize(vec3(-0.55, -0.10,  0.30)), vec3(1.7,  1.15, 0.55), 0.0024);\n  col += sampleBigStar(dir, normalize(vec3( 0.10,  0.62,  0.48)), vec3(1.55, 1.55, 1.65), 0.015);\n  col += sampleBigStar(dir, normalize(vec3(-0.30,  0.34, -0.62)), vec3(0.6,  0.85, 1.6),  0.0020);\n  col += sampleBigStar(dir, normalize(vec3( 0.68, -0.22,  0.18)), vec3(1.65, 1.2,  0.7),  0.011);\n  col += sampleBigStar(dir, normalize(vec3( 1.00,  0.03,  0.08)), vec3(2.0,  0.32, 0.14), 0.020);\n  col += sampleBigStar(dir, normalize(vec3(-0.53, -0.29, -0.77)), vec3(0.5,  0.85, 2.1),  0.022);\n  return col;\n}\n\nvec3 comets(vec3 dir, float time) {\n  vec3 col = vec3(0.0);\n  for (int i = 0; i < 2; i++) {\n    float seed = float(i) * 17.13;\n    vec3 axis = randDir(seed);\n    vec3 arbitrary = (abs(axis.y) < 0.95) ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);\n    vec3 e1 = normalize(cross(arbitrary, axis));\n    vec3 e2 = cross(axis, e1);\n    float polar0 = mix(0.3, PI - 0.3, hash13(vec3(seed, 6.6, 2.9)));\n\n    float period = 18.0 + hash13(vec3(seed, 5.5, 1.1)) * 14.0;\n    float speed = 6.2831853 / period;\n    float phase = hash13(vec3(seed, 8.8, 3.3)) * 6.2831853;\n    float headAng = time * speed + phase;\n\n    float polarDir = acos(clamp(dot(dir, axis), -1.0, 1.0));\n    float crossTrack = polarDir - polar0;\n\n    float x = dot(dir, e1);\n    float y = dot(dir, e2);\n    float thetaDir = atan(y, x);\n\n    float along = headAng - thetaDir;\n    along = mod(along + PI, 2.0 * PI) - PI;\n\n    float scale = 0.35 + hash13(vec3(seed, 4.1, 7.7)) * 1.05;\n    float invScale2 = 1.0 / (scale * scale);\n\n    float cross2 = crossTrack * crossTrack;\n    float core = exp(-(along * along * 700.0 + cross2 * 9000.0) * invScale2);\n\n    float sBehind = max(along, 0.0);\n    float tailWidth = (0.0018 + sBehind * 0.012) * scale;\n    float tail = exp(-sBehind * 13.0 / scale) * exp(-cross2 / (tailWidth * tailWidth)) * step(0.0, along);\n\n    float csel = hash13(vec3(seed, 2.2, 6.6));\n    vec3 tint = vec3(1.55, 1.05, 0.45);\n    if (csel < 0.34) {\n      tint = vec3(0.5, 1.3, 1.6);\n    } else if (csel < 0.67) {\n      tint = vec3(0.4, 1.45, 0.65);\n    }\n\n    col += tint * (core * 2.4 + tail * 0.9) * scale;\n  }\n  return col;\n}\n\nfloat fbmFlow(vec3 p, float stretch) {\n  float v = 0.0;\n  float a = 0.5;\n  for (int i = 0; i < 5; i++) {\n    vec3 q = vec3(p.x / stretch, p.y, p.z);\n    v += a * noise3(q);\n    p *= 2.3;\n    a *= 0.55;\n  }\n  return v;\n}\n\nvec3 diskRamp(float t) {\n  vec3 white     = vec3(1.0, 1.0, 1.0)      * 2.8;\n  vec3 paleGold  = vec3(1.0, 0.85, 0.65)    * 2.0;\n  vec3 redOrange = vec3(0.95, 0.30, 0.06)   * 1.35;\n  vec3 deepRed   = vec3(0.55, 0.09, 0.02)   * 0.95;\n  vec3 ember     = vec3(0.12, 0.02, 0.0)    * 0.55;\n\n  vec3 c = mix(white, paleGold, smoothstep(0.0, 0.06, t));\n  c = mix(c, redOrange, smoothstep(0.04, 0.24, t));\n  c = mix(c, deepRed, smoothstep(0.22, 0.65, t));\n  c = mix(c, ember, smoothstep(0.55, 1.0, t));\n  c = mix(c, vec3(0.0), smoothstep(0.95, 1.2, t));\n  return c;\n}\n\nvec3 diskColor(vec3 p, vec3 rayDir, float innerR, float outerR, float time) {\n  float r = length(p.xz);\n  float phi = atan(p.z, p.x);\n\n  float t = max((r - innerR) / (outerR - innerR), 0.0);\n  float omega = 1.15 / pow(r / innerR, 1.5);\n  float windTime = 12.0 + time + uDiskBoost * 3.0;\n  float swirl = phi - omega * windTime * uDiskRotSpeed * uDiskSpin;\n\n  vec2 flowXY = vec2(cos(swirl), sin(swirl)) * r;\n  vec3 flowP = vec3(flowXY.x * 0.22, flowXY.y * 0.22, r * 0.035 - time * 0.05);\n  float n = fbmFlow(flowP, 2.6);\n  n = clamp(n, 0.0, 1.0);\n\n  float lanes = noise3(vec3(flowXY.x * 0.5, flowXY.y * 0.5, time * 0.08));\n  float dust = smoothstep(0.2, 0.8, lanes);\n\n  vec3 baseColor = diskRamp(t + (n - 0.5) * 0.07);\n\n  float edgeNoise = fbm(vec3(cos(phi) * 2.4, sin(phi) * 2.4, time * 0.025));\n  float outerEdge = 0.88 + edgeNoise * 0.4;\n  float density = smoothstep(0.0, 0.045, t) * (1.0 - smoothstep(0.55, outerEdge, t));\n  density *= (0.65 + 0.45 * n) * mix(0.7, 1.0, dust);\n\n  vec3 tangent = normalize(vec3(-p.z, 0.0, p.x)) * uDiskSpin;\n  float vOrb = clamp(sqrt(uRs / (2.0 * r)), 0.0, 0.95);\n\n  float mu = dot(tangent, -rayDir);\n  float dopplerFactor = 1.0 / max(0.15, (1.0 - vOrb * mu));\n  float beaming = pow(dopplerFactor, 1.8);\n\n  vec3 col = baseColor * density * beaming;\n  col.b *= clamp(dopplerFactor, 0.5, 1.8);\n  col.r *= clamp(2.0 - dopplerFactor, 0.4, 1.5);\n\n  col = col / (1.0 + 0.6 * col);\n  return max(col, 0.0);\n}\n\nvec3 acesFilm(vec3 x) {\n  const float a = 2.51;\n  const float b = 0.03;\n  const float c = 2.43;\n  const float d = 0.59;\n  const float e = 0.14;\n  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);\n}\n\nvec3 rotateX(vec3 v, float a) {\n  float c = cos(a);\n  float s = sin(a);\n  return vec3(v.x, v.y * c - v.z * s, v.y * s + v.z * c);\n}\n\nvec3 traceRay(vec3 ro, vec3 rd) {\n  vec3 pos = rotateX(ro, -uAxisTilt);\n  vec3 dir = rotateX(rd, -uAxisTilt);\n  vec3 h = cross(pos, dir);\n  float h2 = dot(h, h);\n\n  float escapeR = uRs * 140.0;\n  bool hitHorizon = false;\n\n  float lensR = uDiskOuter * 0.5;\n  float photonR = uRs * 2.2;\n  float ringWidth = uRs * 0.055;\n  vec3 ringGlowCol = vec3(2.0, 1.9, 1.7);\n  float minR = escapeR;\n\n  vec3 accumColor = vec3(0.0);\n  float accumAlpha = 0.0;\n\n  for (int i = 0; i < MAX_STEPS; i++) {\n    float r = length(pos);\n    minR = min(minR, r);\n    if (r < uRs * 1.02) { hitHorizon = true; break; }\n    if (r > escapeR || accumAlpha > 0.995) { break; }\n\n    float dt = clamp(r * 0.12, 0.015, 1.4);\n\n    float atten = 1.0 / (1.0 + pow(r / lensR, 8.0));\n    vec3 accel = -1.5 * uRs * h2 * pos / pow(r, 5.0) * atten;\n    vec3 newDir = normalize(dir + accel * dt);\n    vec3 newPos = pos + newDir * dt;\n\n    if (sign(pos.y) != sign(newPos.y)) {\n      float tc = pos.y / (pos.y - newPos.y);\n      vec3 hitP = mix(pos, newPos, tc);\n      float rHit = length(hitP.xz);\n\n      if (rHit > uDiskInner && rHit < uDiskOuter * 1.3) {\n        vec3 dcol = diskColor(hitP, newDir, uDiskInner, uDiskOuter, iTime);\n        float a = clamp(max(max(dcol.r, dcol.g), dcol.b) * 0.75, 0.0, 1.0);\n        accumColor += (1.0 - accumAlpha) * dcol;\n        accumAlpha += (1.0 - accumAlpha) * a;\n      }\n    }\n\n    pos = newPos;\n    dir = newDir;\n  }\n\n  vec3 bg = hitHorizon ? vec3(0.0) : (starfield(dir) + bigStars(dir) + comets(dir, iTime) + nebulaClouds(dir));\n  if (uTheme > 0.5) {\n    bg = mix(bg, vec3(0.85, 0.88, 0.95), 0.25);\n  }\n  float ringGlow = exp(-pow((minR - photonR) / ringWidth, 2.0));\n  vec3 ring = ringGlowCol * ringGlow * 2.8;\n  return accumColor + (1.0 - accumAlpha) * (bg + ring);\n}\n\nvoid main() {\n  vec2 uv = (gl_FragCoord.xy / iResolution.xy - 0.5) * 2.0;\n  uv.x *= iResolution.x / iResolution.y;\n\n  float tanFov = tan(camFov * 0.5);\n  vec3 rayDir = normalize(camForward + uv.x * tanFov * camRight + uv.y * tanFov * camUp);\n\n  vec3 col = traceRay(camPos, rayDir);\n\n  float exposure = uExposure;\n  if (uTheme > 0.5) {\n    exposure *= 0.85;\n  }\n  col = acesFilm(col * exposure);\n  col = pow(col, vec3(1.0 / 2.2));\n\n  gl_FragColor = vec4(col, 1.0);\n}");
      gl.compileShader(fs);
      if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        console.error('FS Error:', gl.getShaderInfoLog(fs));
        return;
      }

      this.program = gl.createProgram();
      gl.attachShader(this.program, vs);
      gl.attachShader(this.program, fs);
      gl.linkProgram(this.program);
      if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        console.error('Program Error:', gl.getProgramInfoLog(this.program));
        return;
      }
      gl.useProgram(this.program);

      // Fullscreen quad buffer
      const posBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
      const posLoc = gl.getAttribLocation(this.program, 'position');
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      // Uniform locations cache
      this.uniforms = {
        iResolution:    gl.getUniformLocation(this.program, 'iResolution'),
        iTime:          gl.getUniformLocation(this.program, 'iTime'),
        camPos:         gl.getUniformLocation(this.program, 'camPos'),
        camRight:       gl.getUniformLocation(this.program, 'camRight'),
        camUp:          gl.getUniformLocation(this.program, 'camUp'),
        camForward:     gl.getUniformLocation(this.program, 'camForward'),
        camFov:         gl.getUniformLocation(this.program, 'camFov'),
        uRs:            gl.getUniformLocation(this.program, 'uRs'),
        uDiskInner:     gl.getUniformLocation(this.program, 'uDiskInner'),
        uDiskOuter:     gl.getUniformLocation(this.program, 'uDiskOuter'),
        uDiskRotSpeed:  gl.getUniformLocation(this.program, 'uDiskRotSpeed'),
        uDiskSpin:      gl.getUniformLocation(this.program, 'uDiskSpin'),
        uExposure:      gl.getUniformLocation(this.program, 'uExposure'),
        uAxisTilt:      gl.getUniformLocation(this.program, 'uAxisTilt'),
        uTheme:         gl.getUniformLocation(this.program, 'uTheme'),
        uDiskBoost:     gl.getUniformLocation(this.program, 'uDiskBoost')
      };
    }

    bindEvents() {
      // Mouse move with damping
      window.addEventListener('mousemove', (e) => {
        this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2.0;
        this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2.0;
      });

      // Scroll interaction: subtle azimuth rotation and zoom
      window.addEventListener('scroll', () => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        this.scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      });

      // Interactive tab navigation triggers dynamic vantage shifts and accretion surge
      const triggerSectionTransition = (tabId) => {
        if (this.tabAngles[tabId]) {
          const cfg = this.tabAngles[tabId];
          this.targetPhi = cfg.phi;
          this.targetTheta = cfg.theta;
          this.targetRadius = cfg.radius;
          this.diskBoost = 1.0; // Energetic accretion pulse!
        }
      };

      document.querySelectorAll('.nav-link[data-tab]').forEach(link => {
        link.addEventListener('click', () => {
          triggerSectionTransition(link.getAttribute('data-tab'));
        });
      });

      document.querySelectorAll('[data-target-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
          triggerSectionTransition(btn.getAttribute('data-target-tab'));
        });
      });

      // Window hash changes (direct URL navigation)
      window.addEventListener('hashchange', () => {
        const hash = (window.location.hash || '').replace('#', '');
        if (hash) triggerSectionTransition(hash);
      });

      // Keyboard navigation
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' || e.key === ' ') {
          this.diskBoost = 1.0;
        }
      });

      // Theme toggle observer
      const observer = new MutationObserver(() => {
        this.theme = document.documentElement.getAttribute('data-theme') === 'light' ? 1.0 : 0.0;
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      // High-performance resolution scaling (crisp 4K look with silky 60fps)
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const w = window.innerWidth;
      const h = window.innerHeight;

      this.canvas.width = Math.floor(w * dpr);
      this.canvas.height = Math.floor(h * dpr);
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

      if (this.overlayCanvas) {
        this.overlayCanvas.width = w;
        this.overlayCanvas.height = h;
      }
    }

    // 3D vector math helpers
    normalize(v) {
      const len = Math.hypot(v[0], v[1], v[2]) || 1;
      return [v[0]/len, v[1]/len, v[2]/len];
    }
    cross(a, b) {
      return [
        a[1]*b[2] - a[2]*b[1],
        a[2]*b[0] - a[0]*b[2],
        a[0]*b[1] - a[1]*b[0]
      ];
    }
    rotateX(p, a) {
      const c = Math.cos(a), s = Math.sin(a);
      return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
    }
    rotateY(p, a) {
      const c = Math.cos(a), s = Math.sin(a);
      return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
    }
    rotateZ(p, a) {
      const c = Math.cos(a), s = Math.sin(a);
      return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]];
    }

    /* ------------------------------------------------------------------------
       Endurance Spacecraft (3D Realistic Kinematics & Shading)
       12 Modular Habitation Pods, Central Navigation Hub, 4 Radial Truss Spokes,
       2 Docked Ranger Shuttles, Rotating Artificial Gravity, Blue Ion Thruster Plumes
       ------------------------------------------------------------------------ */
    drawEndurance() {
      if (!this.ctx || !this.overlayCanvas) return;
      const ctx = this.ctx;
      const w = this.overlayCanvas.width;
      const h = this.overlayCanvas.height;
      ctx.clearRect(0, 0, w, h);

      // Realistic orbital motion: inclined Keplerian ellipse around Gargantua
      const orbitSpeed = 0.14;
      const orbitAngle = this.time * orbitSpeed + this.scrollProgress * 1.5;
      const orbitRadX = w * 0.35;
      const orbitRadY = h * 0.18;
      const orbitTilt = 0.32; // orbital inclination

      let shipPos = [
        Math.cos(orbitAngle) * orbitRadX,
        Math.sin(orbitAngle) * orbitRadY * Math.cos(orbitTilt) - Math.sin(orbitAngle) * 35,
        Math.sin(orbitAngle) * 130
      ];

      // Parallax interaction
      shipPos[0] += this.mouse.x * 30;
      shipPos[1] += this.mouse.y * 22;

      const screenX = w * 0.5 + shipPos[0];
      const screenY = h * 0.5 + shipPos[1];
      const depthScale = Math.max(0.45, Math.min(1.4, 1.0 / (1.0 - shipPos[2] / 650)));

      // Endurance attitude & rotation for artificial gravity (1 RPM)
      const spin = this.time * 0.65;
      const pitch = 0.42 + Math.sin(orbitAngle) * 0.12;
      const yaw = -orbitAngle + Math.PI * 0.5;
      const roll = Math.cos(orbitAngle) * 0.18;

      const ringRadius = 38 * depthScale;
      const transformPoint = (p) => {
        let pt = this.rotateZ(p, spin);
        pt = this.rotateX(pt, pitch);
        pt = this.rotateY(pt, yaw);
        pt = this.rotateZ(pt, roll);
        return {
          x: screenX + pt[0] * depthScale,
          y: screenY + pt[1] * depthScale,
          z: shipPos[2] + pt[2] * depthScale
        };
      };

      const polygons = [];

      // 1. Central Navigation Hub
      const hubRad = 9 * depthScale;
      const hubLen = 12 * depthScale;
      const hubSteps = 8;
      const hubFront = [], hubBack = [];
      for (let i = 0; i < hubSteps; i++) {
        const a = (i / hubSteps) * Math.PI * 2;
        hubFront.push(transformPoint([Math.cos(a) * hubRad, Math.sin(a) * hubRad, hubLen * 0.5]));
        hubBack.push(transformPoint([Math.cos(a) * hubRad, Math.sin(a) * hubRad, -hubLen * 0.5]));
      }
      for (let i = 0; i < hubSteps; i++) {
        const next = (i + 1) % hubSteps;
        const pts = [hubFront[i], hubFront[next], hubBack[next], hubBack[i]];
        const avgZ = (pts[0].z + pts[1].z + pts[2].z + pts[3].z) * 0.25;
        polygons.push({ pts, z: avgZ, color: '#94a3b8', stroke: '#64748b' });
      }

      // 2. 4 Structural Spoke Trusses connecting hub to modules
      for (let s = 0; s < 4; s++) {
        const sa = (s * Math.PI * 0.5);
        const inner = transformPoint([Math.cos(sa) * hubRad, Math.sin(sa) * hubRad, 0]);
        const outer = transformPoint([Math.cos(sa) * (ringRadius - 6 * depthScale), Math.sin(sa) * (ringRadius - 6 * depthScale), 0]);
        polygons.push({
          type: 'line',
          p1: inner,
          p2: outer,
          z: (inner.z + outer.z) * 0.5,
          color: '#64748b',
          width: Math.max(1.5, 2.5 * depthScale)
        });
      }

      // 3. Ring Truss Circular Structure
      const ringSteps = 36;
      for (let i = 0; i < ringSteps; i++) {
        const a1 = (i / ringSteps) * Math.PI * 2;
        const a2 = ((i + 1) / ringSteps) * Math.PI * 2;
        const p1 = transformPoint([Math.cos(a1) * ringRadius, Math.sin(a1) * ringRadius, 0]);
        const p2 = transformPoint([Math.cos(a2) * ringRadius, Math.sin(a2) * ringRadius, 0]);
        polygons.push({
          type: 'line',
          p1, p2,
          z: (p1.z + p2.z) * 0.5,
          color: '#475569',
          width: Math.max(1.2, 2.0 * depthScale)
        });
      }

      // 4. 12 Habitat & Command Modules
      const modW = 9 * depthScale, modH = 6 * depthScale, modD = 7 * depthScale;
      for (let m = 0; m < 12; m++) {
        const ma = (m / 12) * Math.PI * 2;
        const mx = Math.cos(ma) * ringRadius;
        const my = Math.sin(ma) * ringRadius;

        const v = [
          transformPoint([mx - modW*0.5, my - modH*0.5, -modD*0.5]),
          transformPoint([mx + modW*0.5, my - modH*0.5, -modD*0.5]),
          transformPoint([mx + modW*0.5, my + modH*0.5, -modD*0.5]),
          transformPoint([mx - modW*0.5, my + modH*0.5, -modD*0.5]),
          transformPoint([mx - modW*0.5, my - modH*0.5,  modD*0.5]),
          transformPoint([mx + modW*0.5, my - modH*0.5,  modD*0.5]),
          transformPoint([mx + modW*0.5, my + modH*0.5,  modD*0.5]),
          transformPoint([mx - modW*0.5, my + modH*0.5,  modD*0.5])
        ];

        const faces = [
          [v[0], v[1], v[2], v[3]],
          [v[4], v[5], v[6], v[7]],
          [v[0], v[1], v[5], v[4]],
          [v[2], v[3], v[7], v[6]],
          [v[0], v[3], v[7], v[4]],
          [v[1], v[2], v[6], v[5]]
        ];

        // Lighting from accretion disk glow
        const distToHole = Math.hypot(w*0.5 - (screenX + mx), h*0.5 - (screenY + my)) || 1;
        const lightGlow = Math.min(1.0, 220 / distToHole);

        faces.forEach((face, fIdx) => {
          const avgZ = (face[0].z + face[1].z + face[2].z + face[3].z) * 0.25;
          const baseBright = 175 + (fIdx % 3) * 22;
          const r = Math.min(255, Math.floor(baseBright * (1.0 + 0.35 * lightGlow)));
          const g = Math.min(255, Math.floor(baseBright * (0.95 + 0.16 * lightGlow)));
          const b = Math.min(255, Math.floor(baseBright * 0.88));
          polygons.push({
            pts: face,
            z: avgZ,
            color: `rgb(${r},${g},${b})`,
            stroke: 'rgba(255,255,255,0.25)'
          });
        });

        // Ion Thruster plume on command modules
        if (m === 0 || m === 6) {
          const thrusterPt = transformPoint([mx - Math.cos(ma) * 3, my - Math.sin(ma) * 3, -modD*0.5]);
          polygons.push({
            type: 'thruster',
            pt: thrusterPt,
            z: thrusterPt.z - 2,
            scale: depthScale
          });
        }
      }

      // 5. Docked Ranger Shuttles (2 crafts docked at hub)
      [-1, 1].forEach(side => {
        const rx = side * 12 * depthScale;
        const pNose = transformPoint([rx, 0, 14 * depthScale]);
        const pLeft = transformPoint([rx - 5 * depthScale, -4 * depthScale, -3 * depthScale]);
        const pRight = transformPoint([rx + 5 * depthScale, -4 * depthScale, -3 * depthScale]);
        const pTop = transformPoint([rx, 3 * depthScale, -3 * depthScale]);

        polygons.push({
          pts: [pNose, pLeft, pRight],
          z: (pNose.z + pLeft.z + pRight.z) / 3,
          color: '#f1f5f9',
          stroke: '#0f172a'
        });
        polygons.push({
          pts: [pNose, pRight, pTop],
          z: (pNose.z + pRight.z + pTop.z) / 3,
          color: '#cbd5e1',
          stroke: '#0f172a'
        });
      });

      // Painter's algorithm: sort back-to-front
      polygons.sort((a, b) => a.z - b.z);

      polygons.forEach(poly => {
        if (poly.type === 'line') {
          ctx.beginPath();
          ctx.moveTo(poly.p1.x, poly.p1.y);
          ctx.lineTo(poly.p2.x, poly.p2.y);
          ctx.strokeStyle = poly.color;
          ctx.lineWidth = poly.width;
          ctx.stroke();
        } else if (poly.type === 'thruster') {
          const pulse = (5 + Math.sin(this.time * 20) * 1.8 + this.diskBoost * 4) * poly.scale;
          const grad = ctx.createRadialGradient(poly.pt.x, poly.pt.y, 1, poly.pt.x, poly.pt.y, pulse);
          grad.addColorStop(0, 'rgba(56, 189, 248, 0.95)');
          grad.addColorStop(0.35, 'rgba(14, 165, 233, 0.6)');
          grad.addColorStop(1, 'rgba(2, 132, 199, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(poly.pt.x, poly.pt.y, pulse, 0, Math.PI * 2);
          ctx.fill();
        } else if (poly.pts) {
          ctx.beginPath();
          ctx.moveTo(poly.pts[0].x, poly.pts[0].y);
          for (let i = 1; i < poly.pts.length; i++) {
            ctx.lineTo(poly.pts[i].x, poly.pts[i].y);
          }
          ctx.closePath();
          ctx.fillStyle = poly.color;
          ctx.fill();
          if (poly.stroke) {
            ctx.strokeStyle = poly.stroke;
            ctx.lineWidth = Math.max(0.6, 0.9 * depthScale);
            ctx.stroke();
          }
        }
      });
    }

    animate(now = 0) {
      requestAnimationFrame((t) => this.animate(t));
      this.time = now * 0.001;

      // Smooth decay of accretion surge
      this.diskBoost = Math.max(0, this.diskBoost - 0.015);

      // Smooth camera interpolation (cinematic gliding)
      this.currentTheta += (this.targetTheta + this.scrollProgress * 0.85 - this.currentTheta) * 0.05;
      this.currentPhi += (this.targetPhi - this.currentPhi) * 0.05;
      this.currentRadius += (this.targetRadius - this.currentRadius) * 0.05;

      // Mouse damping
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.08;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.08;

      // Dynamic camera orbit calculation
      const phiWithMouse = Math.min(Math.PI - 0.15, Math.max(0.15, this.currentPhi + this.mouse.y * 0.08));
      const thetaWithMouse = this.currentTheta + this.mouse.x * 0.09;
      const r = this.currentRadius;

      const camPos = [
        r * Math.sin(phiWithMouse) * Math.sin(thetaWithMouse),
        r * Math.cos(phiWithMouse),
        r * Math.sin(phiWithMouse) * Math.cos(thetaWithMouse)
      ];

      const camForward = this.normalize([-camPos[0], -camPos[1], -camPos[2]]);
      const worldUp = [0, 1, 0];
      const camRight = this.normalize(this.cross(camForward, worldUp));
      const camUp = this.normalize(this.cross(camRight, camForward));

      const gl = this.gl;
      gl.useProgram(this.program);

      gl.uniform2f(this.uniforms.iResolution, this.canvas.width, this.canvas.height);
      gl.uniform1f(this.uniforms.iTime, this.time);
      gl.uniform3fv(this.uniforms.camPos, camPos);
      gl.uniform3fv(this.uniforms.camForward, camForward);
      gl.uniform3fv(this.uniforms.camRight, camRight);
      gl.uniform3fv(this.uniforms.camUp, camUp);
      gl.uniform1f(this.uniforms.camFov, 50.0 * Math.PI / 180.0);
      gl.uniform1f(this.uniforms.uRs, 1.0);
      gl.uniform1f(this.uniforms.uDiskInner, 3.0);
      gl.uniform1f(this.uniforms.uDiskOuter, 17.0);
      gl.uniform1f(this.uniforms.uDiskRotSpeed, 1.0);
      gl.uniform1f(this.uniforms.uDiskSpin, 1.0);
      gl.uniform1f(this.uniforms.uExposure, 1.3);
      gl.uniform1f(this.uniforms.uAxisTilt, 0.0);
      gl.uniform1f(this.uniforms.uTheme, this.theme);
      gl.uniform1f(this.uniforms.uDiskBoost, this.diskBoost);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // Render 3D Endurance spacecraft overlay
      this.drawEndurance();
    }
  }

  // Initialize immediately or on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new Gargantua4KEngine());
  } else {
    new Gargantua4KEngine();
  }
})();