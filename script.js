/**
 * Soham Maity - Academic & Theoretical Physics Portfolio
 * Functionality: Scroll-triggered envelope animation, Tab routing, Request Forms, Theme & BibTeX
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initEnvelopeScroll();
  initTabs();
  initBibtexModal();
  initAbstractToggles();
  initRequestForms();
  initProfileImageFallback();
});

function initProfileImageFallback() {
  const profileImg = document.querySelector('.profile-avatar-img');
  if (profileImg) {
    profileImg.addEventListener('error', function handleImgErr() {
      profileImg.removeEventListener('error', handleImgErr);
      if (!profileImg.src.endsWith('profile_placeholder.svg')) {
        profileImg.src = 'assets/profile_placeholder.svg';
      }
    }, { once: true });
  }
}


(function() {
    'use strict';

    // Vertex Shader (Full-screen quad)
    const vsSource = [
      'attribute vec2 position;',
      'void main() {',
      '  gl_Position = vec4(position, 0.0, 1.0);',
      '}'
    ].join('\n');

    // Fragment Shader (General Relativistic Raymarcher)
    const fsSource = [
      'precision highp float;',
      'uniform vec2  iResolution;',
      'uniform float iTime;',
      'uniform vec3  camPos;',
      'uniform vec3  camRight;',
      'uniform vec3  camUp;',
      'uniform vec3  camForward;',
      'uniform float camFov;',
      'uniform float uRs;',
      'uniform float uDiskInner;',
      'uniform float uDiskOuter;',
      'uniform float uDiskRotSpeed;',
      'uniform float uDiskSpin;',
      'uniform float uExposure;',
      'uniform float uAxisTilt;',
      'uniform float uWarpWave;',
      'uniform float uTheme;',

      'const int   MAX_STEPS = 145;',
      'const float PI = 3.14159265359;',

      'float hash13(vec3 p3) {',
      '  p3 = fract(p3 * 0.1031);',
      '  p3 += dot(p3, p3.yzx + 33.33);',
      '  return fract((p3.x + p3.y) * p3.z);',
      '}',

      'float noise3(vec3 x) {',
      '  vec3 i = floor(x);',
      '  vec3 f = fract(x);',
      '  f = f * f * (3.0 - 2.0 * f);',
      '  return mix(',
      '    mix(mix(hash13(i + vec3(0,0,0)), hash13(i + vec3(1,0,0)), f.x),',
      '        mix(hash13(i + vec3(0,1,0)), hash13(i + vec3(1,1,0)), f.x), f.y),',
      '    mix(mix(hash13(i + vec3(0,0,1)), hash13(i + vec3(1,0,1)), f.x),',
      '        mix(hash13(i + vec3(0,1,1)), hash13(i + vec3(1,1,1)), f.x), f.y),',
      '    f.z);',
      '}',

      'float fbm(vec3 p) {',
      '  float v = 0.0;',
      '  float a = 0.5;',
      '  for (int i = 0; i < 4; i++) {',
      '    v += a * noise3(p);',
      '    p *= 2.05;',
      '    a *= 0.5;',
      '  }',
      '  return v;',
      '}',

      'float fbmFlow(vec3 p, float stretch) {',
      '  float v = 0.0;',
      '  float a = 0.5;',
      '  for (int i = 0; i < 4; i++) {',
      '    vec3 q = vec3(p.x / stretch, p.y, p.z);',
      '    v += a * noise3(q);',
      '    p *= 2.3;',
      '    a *= 0.55;',
      '  }',
      '  return v;',
      '}',

      'vec3 nebula(vec3 dir) {',
      '  float n = fbm(dir * 2.2 + 5.0);',
      '  float mask = smoothstep(0.66, 0.92, n);',
      '  vec3 deepBlue = vec3(0.02, 0.03, 0.07);',
      '  vec3 cyan     = vec3(0.02, 0.08, 0.09);',
      '  float colorMix = hash13(floor(dir * 3.0 + 100.0));',
      '  vec3 tint = mix(deepBlue, cyan, colorMix);',
      '  return tint * mask * 0.35;',
      '}',

      'vec3 nebulaClouds(vec3 dir) {',
      '  vec3 col = vec3(0.0);',
      '  vec3 dirs[4];',
      '  dirs[0] = normalize(vec3(-0.72,  0.48,  0.30));',
      '  dirs[1] = normalize(vec3( 0.58, -0.52, -0.42));',
      '  dirs[2] = normalize(vec3(-0.15, -0.68,  0.58));',
      '  dirs[3] = normalize(vec3( 0.35,  0.62, -0.55));',
      '  vec3 cols[4];',
      '  cols[0] = vec3(0.55, 0.20, 0.06);',
      '  cols[1] = vec3(0.42, 0.12, 0.05);',
      '  cols[2] = vec3(0.06, 0.08, 0.16);',
      '  cols[3] = vec3(0.34, 0.10, 0.44);',
      '  float sizes[4];',
      '  sizes[0] = 0.42; sizes[1] = 0.32; sizes[2] = 0.42; sizes[3] = 0.20;',
      '  for (int i = 0; i < 4; i++) {',
      '    float ang = acos(clamp(dot(dir, dirs[i]), -1.0, 1.0));',
      '    float shape = fbm(dir * 3.5 + float(i) * 17.0);',
      '    float falloff = exp(-(ang * ang) / (sizes[i] * sizes[i]));',
      '    col += cols[i] * falloff * (0.35 + 0.9 * shape) * 0.5;',
      '  }',
      '  return col;',
      '}',

      'vec3 starfield(vec3 dir) {',
      '  vec3 col = vec3(0.0);',
      '  vec3 p = dir * 260.0;',
      '  vec3 ip = floor(p);',
      '  vec3 fp = fract(p);',
      '  float d = hash13(ip);',
      '  if (d > 0.9994) {',
      '    bool warm = hash13(ip + 9.9) > 0.5;',
      '    vec3 tint = warm ? vec3(1.35, 0.9, 0.55) : vec3(0.6, 0.8, 1.4);',
      '    float dist = length(fp - 0.5);',
      '    float star = smoothstep(0.42, 0.0, dist);',
      '    col += tint * star * 5.5;',
      '  } else if (d > 0.9935) {',
      '    float brightness = hash13(ip + 7.7);',
      '    vec3 starColor = mix(vec3(0.8, 0.85, 1.0), vec3(1.0, 0.9, 0.75), hash13(ip + 3.3));',
      '    float dist = length(fp - 0.5);',
      '    float star = smoothstep(0.35, 0.0, dist) * brightness;',
      '    col += starColor * star * 3.2;',
      '  }',
      '  col += nebula(dir);',
      '  return col;',
      '}',

      'vec3 diskRamp(float t) {',
      '  vec3 white     = vec3(1.0, 1.0, 1.0)      * 3.2;',
      '  vec3 paleGold  = vec3(1.0, 0.88, 0.68)    * 2.2;',
      '  vec3 redOrange = vec3(0.95, 0.32, 0.07)   * 1.45;',
      '  vec3 deepRed   = vec3(0.55, 0.09, 0.02)   * 0.95;',
      '  vec3 ember     = vec3(0.12, 0.02, 0.0)    * 0.55;',
      '  vec3 c = mix(white, paleGold, smoothstep(0.0, 0.06, t));',
      '  c = mix(c, redOrange, smoothstep(0.04, 0.24, t));',
      '  c = mix(c, deepRed, smoothstep(0.22, 0.65, t));',
      '  c = mix(c, ember, smoothstep(0.55, 1.0, t));',
      '  c = mix(c, vec3(0.0), smoothstep(0.95, 1.25, t));',
      '  return c;',
      '}',

      'vec3 diskColor(vec3 p, vec3 rayDir, float innerR, float outerR, float time) {',
      '  float r = length(p.xz);',
      '  float phi = atan(p.z, p.x);',
      '  float t = max((r - innerR) / (outerR - innerR), 0.0);',
      '  float omega = 1.15 / pow(r / innerR, 1.5);',
      '  float windTime = 12.0 + time;',
      '  float swirl = phi - omega * windTime * uDiskRotSpeed * uDiskSpin;',
      '  vec2 flowXY = vec2(cos(swirl), sin(swirl)) * r;',
      '  vec3 flowP = vec3(flowXY.x * 0.22, flowXY.y * 0.22, r * 0.035 - time * 0.05);',
      '  float n = fbmFlow(flowP, 2.6);',
      '  n = clamp(n, 0.0, 1.0);',
      '  float lanes = noise3(vec3(flowXY.x * 0.5, flowXY.y * 0.5, time * 0.08));',
      '  float dust = smoothstep(0.2, 0.8, lanes);',
      '  vec3 baseColor = diskRamp(t + (n - 0.5) * 0.07);',
      '  float edgeNoise = fbm(vec3(cos(phi) * 2.4, sin(phi) * 2.4, time * 0.025));',
      '  float outerEdge = 0.88 + edgeNoise * 0.4;',
      '  float density = smoothstep(0.0, 0.045, t) * (1.0 - smoothstep(0.55, outerEdge, t));',
      '  density *= (0.65 + 0.45 * n) * mix(0.7, 1.0, dust);',
      '  vec3 tangent = normalize(vec3(-p.z, 0.0, p.x)) * uDiskSpin;',
      '  float vOrb = clamp(sqrt(uRs / (2.0 * r)), 0.0, 0.95);',
      '  float mu = dot(tangent, -rayDir);',
      '  float dopplerFactor = 1.0 / max(0.15, (1.0 - vOrb * mu));',
      '  float beaming = pow(dopplerFactor, 1.8);',
      '  vec3 col = baseColor * density * beaming;',
      '  col.b *= clamp(dopplerFactor, 0.5, 1.8);',
      '  col.r *= clamp(2.0 - dopplerFactor, 0.4, 1.5);',
      '  col = col / (1.0 + 0.5 * col);',
      '  return max(col, 0.0);',
      '}',

      'vec3 acesFilm(vec3 x) {',
      '  const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;',
      '  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);',
      '}',

      'vec3 rotateX(vec3 v, float a) {',
      '  float c = cos(a), s = sin(a);',
      '  return vec3(v.x, v.y * c - v.z * s, v.y * s + v.z * c);',
      '}',

      'vec3 traceRay(vec3 ro, vec3 rd) {',
      '  vec3 pos = rotateX(ro, -uAxisTilt);',
      '  vec3 dir = rotateX(rd, -uAxisTilt);',
      '  vec3 h = cross(pos, dir);',
      '  float h2 = dot(h, h);',
      '  float escapeR = uRs * 140.0;',
      '  bool hitHorizon = false;',
      '  float lensR = uDiskOuter * 0.52;',
      '  float photonR = uRs * 2.22;',
      '  float ringWidth = uRs * 0.052;',
      '  vec3 ringGlowCol = vec3(2.2, 2.05, 1.85);',
      '  float minR = escapeR;',
      '  vec3 accumColor = vec3(0.0);',
      '  float accumAlpha = 0.0;',
      '  for (int i = 0; i < MAX_STEPS; i++) {',
      '    float r = length(pos);',
      '    minR = min(minR, r);',
      '    if (r < uRs * 1.02) { hitHorizon = true; break; }',
      '    if (r > escapeR || accumAlpha > 0.992) { break; }',
      '    float dt = clamp(r * 0.12, 0.015, 1.35);',
      '    float atten = 1.0 / (1.0 + pow(r / lensR, 8.0));',
      '    vec3 accel = -1.5 * uRs * h2 * pos / pow(r, 5.0) * atten;',
      '    vec3 newDir = normalize(dir + accel * dt);',
      '    vec3 newPos = pos + newDir * dt;',
      '    if (sign(pos.y) != sign(newPos.y)) {',
      '      float tc = pos.y / (pos.y - newPos.y);',
      '      vec3 hitP = mix(pos, newPos, tc);',
      '      float rHit = length(hitP.xz);',
      '      if (rHit > uDiskInner && rHit < uDiskOuter * 1.35) {',
      '        vec3 dcol = diskColor(hitP, newDir, uDiskInner, uDiskOuter, iTime);',
      '        float a = clamp(max(max(dcol.r, dcol.g), dcol.b) * 0.75, 0.0, 1.0);',
      '        accumColor += (1.0 - accumAlpha) * dcol;',
      '        accumAlpha += (1.0 - accumAlpha) * a;',
      '      }',
      '    }',
      '    pos = newPos;',
      '    dir = newDir;',
      '  }',
      '  vec3 bg = hitHorizon ? vec3(0.0) : (starfield(dir) + nebulaClouds(dir));',
      '  float ringGlow = exp(-pow((minR - photonR) / ringWidth, 2.0));',
      '  vec3 ring = ringGlowCol * ringGlow * 3.0;',
      '  if (uWarpWave > 0.01) {',
      '    ring += vec3(0.2, 0.6, 1.0) * uWarpWave * 2.0;',
      '  }',
      '  vec3 finalCol = accumColor + (1.0 - accumAlpha) * (bg + ring);',
      '  if (uTheme < 0.5) {',
      '    finalCol *= 0.65;',
      '  }',
      '  return finalCol;',
      '}',

      'void main() {',
      '  vec2 uv = (gl_FragCoord.xy / iResolution.xy - 0.5) * 2.0;',
      '  uv.x *= iResolution.x / iResolution.y;',
      '  float tanFov = tan(camFov * 0.5);',
      '  vec3 rayDir = normalize(camForward + uv.x * tanFov * camRight + uv.y * tanFov * camUp);',
      '  vec3 col = traceRay(camPos, rayDir);',
      '  col = acesFilm(col * uExposure);',
      '  col = pow(col, vec3(1.0 / 2.2));',
      '  gl_FragColor = vec4(col, 1.0);',
      '}'
    ].join('\n');

    class GargantuaRenderer {
      constructor() {
        this.glCanvas = document.getElementById('blackhole-canvas');
        this.shipCanvas = document.getElementById('spacecraft-canvas');
        if (!this.glCanvas || !this.shipCanvas) return;

        this.gl = this.glCanvas.getContext('webgl', { powerPreference: 'high-performance', antialias: false, alpha: false }) ||
                  this.glCanvas.getContext('experimental-webgl');
        if (!this.gl) {
          console.warn('WebGL not supported, falling back to 2D');
          return;
        }

        this.ctx = this.shipCanvas.getContext('2d');
        this.initShaders();
        this.initGeometry();

        // 4K and Retina Scaling (DPR clamped to 1.5-2 for optimal 60fps performance on all GPUs)
        this.dpr = Math.min(window.devicePixelRatio || 1, 1.75);
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Camera Parameters (Near edge-on cinematic viewing angle)
        this.radius = 21.0;
        this.baseTheta = 0.45;
        this.theta = this.baseTheta;
        this.basePhi = 1.48; // ~85 degrees edge-on
        this.phi = this.basePhi;
        this.camFov = 50.0 * Math.PI / 180.0;

        // Gyro Tilt
        this.tiltX = 0;
        this.tiltY = 0;
        this.targetTiltX = 0;
        this.targetTiltY = 0;

        // Scroll
        this.lastScrollY = window.scrollY || 0;
        this.scrollVelocity = 0;
        this.diskRotSpeed = 1.0;

        // Interactive Gravitational Warp
        this.warpWave = 0.0;

        // Endurance Spacecraft
        this.endurance = {
          orbitAngle: 0.95,
          orbitSpeed: 0.004,
          orbitRadius: 6.8, // in units of Rs
          orbitTilt: 0.38,
          axialAngle: 0,
          axialSpeed: 0.05, // 5.6 RPM
          radius: 16,
          thrusterPulse: 1.0,
          trail: []
        };

        this.isDark = document.documentElement.getAttribute('data-theme') !== 'light';

        this.resize();
        this.bindEvents();

        this.lastTime = performance.now();
        requestAnimationFrame(this.render.bind(this));
      }

      initShaders() {
        const gl = this.gl;
        const vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, vsSource);
        gl.compileShader(vs);

        const fs = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fs, fsSource);
        gl.compileShader(fs);

        if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
          console.error('Fragment shader compile error:', gl.getShaderInfoLog(fs));
          return;
        }

        this.program = gl.createProgram();
        gl.attachShader(this.program, vs);
        gl.attachShader(this.program, fs);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
          console.error('Program link error:', gl.getProgramInfoLog(this.program));
          return;
        }

        gl.useProgram(this.program);

        // Uniform locations
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
          uWarpWave:      gl.getUniformLocation(this.program, 'uWarpWave'),
          uTheme:         gl.getUniformLocation(this.program, 'uTheme'),
        };

        // Static defaults
        gl.uniform1f(this.uniforms.uRs, 1.0);
        gl.uniform1f(this.uniforms.uDiskInner, 3.0);
        gl.uniform1f(this.uniforms.uDiskOuter, 17.5);
        gl.uniform1f(this.uniforms.uDiskSpin, 1.0);
        gl.uniform1f(this.uniforms.uExposure, 1.35);
        gl.uniform1f(this.uniforms.uAxisTilt, 0.0);
        gl.uniform1f(this.uniforms.camFov, this.camFov);
      }

      initGeometry() {
        const gl = this.gl;
        const quad = new Float32Array([
          -1.0, -1.0,
           1.0, -1.0,
          -1.0,  1.0,
           1.0,  1.0,
        ]);
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

        const posAttr = gl.getAttribLocation(this.program, 'position');
        gl.enableVertexAttribArray(posAttr);
        gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);
      }

      resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.dpr = Math.min(window.devicePixelRatio || 1, 1.75);

        const pw = Math.floor(this.width * this.dpr);
        const ph = Math.floor(this.height * this.dpr);

        this.glCanvas.width = pw;
        this.glCanvas.height = ph;
        this.gl.viewport(0, 0, pw, ph);

        this.shipCanvas.width = pw;
        this.shipCanvas.height = ph;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(this.dpr, this.dpr);

        this.gl.useProgram(this.program);
        this.gl.uniform2f(this.uniforms.iResolution, pw, ph);
      }

      bindEvents() {
        window.addEventListener('resize', () => this.resize(), { passive: true });

        // Scroll Tracking & Camera Fly-By Journey
        window.addEventListener('scroll', () => {
          const currentScrollY = window.scrollY || window.pageYOffset || 0;
          const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
          const scrollProgress = currentScrollY / maxScroll;

          const delta = Math.abs(currentScrollY - this.lastScrollY);
          this.scrollVelocity = Math.min(delta, 50);
          this.lastScrollY = currentScrollY;

          // Camera smoothly tilts and orbits as you explore the research sections
          this.targetTheta = this.baseTheta + scrollProgress * 0.70;
          this.targetPhi = this.basePhi - scrollProgress * 0.16;
          this.diskRotSpeed = 1.0 + this.scrollVelocity * 0.05;
        }, { passive: true });

        // Mouse Gyro Tilt
        window.addEventListener('mousemove', (e) => {
          this.targetTiltX = (e.clientX / this.width - 0.5) * 0.18;
          this.targetTiltY = (e.clientY / this.height - 0.5) * 0.14;
        }, { passive: true });

        // Gravitational Wave Shockwave on Click
        window.addEventListener('click', (e) => {
          if (!e.target.closest('a, button, input, textarea, select')) {
            this.warpWave = 1.0;
          }
        });

        // Tab Switching Event: Relativistic Warp Pulse & Spacecraft Thruster Burn
        document.querySelectorAll('.nav-link, [data-target-tab], [data-tab]').forEach(btn => {
          btn.addEventListener('click', () => {
            this.warpWave = 1.8;
            this.diskRotSpeed = 2.4;
            this.endurance.thrusterPulse = 3.8;
          });
        });

        // Theme Toggle Observation
        const observer = new MutationObserver(() => {
          this.isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      }

      render(now) {
        const dt = Math.min((now - this.lastTime) * 0.001, 0.1);
        this.lastTime = now;

        // Smooth camera damping
        this.tiltX += (this.targetTiltX - this.tiltX) * 0.05;
        this.tiltY += (this.targetTiltY - this.tiltY) * 0.05;

        const effectiveTheta = this.theta + this.tiltX;
        const effectivePhi = Math.max(0.2, Math.min(Math.PI - 0.2, this.phi + this.tiltY));

        this.diskRotSpeed += (1.0 - this.diskRotSpeed) * 0.05;
        this.warpWave *= 0.96;

        // 1. Compute 3D Camera Basis Vectors
        const camPos = [
          this.radius * Math.sin(effectivePhi) * Math.sin(effectiveTheta),
          this.radius * Math.cos(effectivePhi),
          this.radius * Math.sin(effectivePhi) * Math.cos(effectiveTheta)
        ];

        // Normalize forward = -camPos
        const cLen = Math.hypot(camPos[0], camPos[1], camPos[2]) || 1;
        const forward = [-camPos[0] / cLen, -camPos[1] / cLen, -camPos[2] / cLen];

        // Right = cross(forward, worldUp [0,1,0])
        const rX = forward[1] * 0 - forward[2] * 1;
        const rY = forward[2] * 0 - forward[0] * 0;
        const rZ = forward[0] * 1 - forward[1] * 0;
        const rLen = Math.hypot(rX, rZ) || 1;
        const right = [rX / rLen, 0, rZ / rLen];

        // Up = cross(right, forward)
        const up = [
          right[1] * forward[2] - right[2] * forward[1],
          right[2] * forward[0] - right[0] * forward[2],
          right[0] * forward[1] - right[1] * forward[0]
        ];

        // 2. Render WebGL Gargantua Black Hole
        const gl = this.gl;
        gl.useProgram(this.program);
        gl.uniform1f(this.uniforms.iTime, now * 0.001);
        gl.uniform3fv(this.uniforms.camPos, camPos);
        gl.uniform3fv(this.uniforms.camRight, right);
        gl.uniform3fv(this.uniforms.camUp, up);
        gl.uniform3fv(this.uniforms.camForward, forward);
        gl.uniform1f(this.uniforms.uDiskRotSpeed, this.diskRotSpeed);
        gl.uniform1f(this.uniforms.uWarpWave, this.warpWave);
        gl.uniform1f(this.uniforms.uTheme, this.isDark ? 1.0 : 0.0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        // 3. Render 3D Endurance Spacecraft on Overlay Canvas
        this.renderEndurance(dt, camPos, forward, right, up);

        requestAnimationFrame(this.render.bind(this));
      }

      renderEndurance(dt, camPos, forward, right, up) {
        const ctx = this.ctx;
        const e = this.endurance;
        ctx.clearRect(0, 0, this.width, this.height);

        // Orbital progress around Gargantua
        e.orbitAngle += (e.orbitSpeed * this.diskRotSpeed);
        if (e.orbitAngle > Math.PI * 2) e.orbitAngle -= Math.PI * 2;

        // Continuous axial rotation (5.6 RPM artificial gravity spin)
        e.axialAngle += e.axialSpeed;

        if (e.thrusterPulse > 1.0) {
          e.thrusterPulse -= 2.0 * dt;
          if (e.thrusterPulse < 1.0) e.thrusterPulse = 1.0;
        }

        // 3D Orbital Coordinates around Black Hole Center (0,0,0)
        const cosO = Math.cos(e.orbitAngle);
        const sinO = Math.sin(e.orbitAngle);
        const R = e.orbitRadius;

        // Inclined orbit plane
        const shipWorldPos = {
          x: R * cosO,
          y: R * sinO * Math.sin(e.orbitTilt),
          z: R * sinO * Math.cos(e.orbitTilt)
        };

        // Project 3D to 2D Screen Coordinates
        const dx = shipWorldPos.x - camPos[0];
        const dy = shipWorldPos.y - camPos[1];
        const dz = shipWorldPos.z - camPos[2];

        const zDist = dx * forward[0] + dy * forward[1] + dz * forward[2];
        if (zDist < 0.5) return; // Behind camera

        const xDist = dx * right[0] + dy * right[1] + dz * right[2];
        const yDist = dx * up[0] + dy * up[1] + dz * up[2];

        const aspect = this.width / this.height;
        const tanHalfFov = Math.tan(this.camFov * 0.5);

        const ndcX = xDist / (zDist * tanHalfFov * aspect);
        const ndcY = yDist / (zDist * tanHalfFov);

        const screenX = (ndcX * 0.5 + 0.5) * this.width;
        const screenY = (-ndcY * 0.5 + 0.5) * this.height;

        // Occlusion test: If ship is behind black hole (zDist > camera to center) and aligns with shadow
        const camToCenterDist = Math.hypot(camPos[0], camPos[1], camPos[2]);
        const isBehind = zDist > camToCenterDist;
        const distFromScreenCenter = Math.hypot(ndcX, ndcY);

        // If occluded by the black hole shadow
        if (isBehind && distFromScreenCenter < 0.22) {
          return;
        }

        const scale = (34.0 / zDist);

        // Spawn ion thruster exhaust particles
        const speedX = -R * sinO;
        const speedY = R * cosO * Math.sin(e.orbitTilt);
        const speedZ = R * cosO * Math.cos(e.orbitTilt);

        // Project velocity direction to screen space
        const vScreenX = speedX * right[0] + speedZ * right[2];
        const vScreenY = speedY * up[1] + speedZ * up[2];
        const vMag = Math.hypot(vScreenX, vScreenY) || 1;

        e.trail.push({
          x: screenX - (vScreenX / vMag) * (e.radius * scale * 0.95),
          y: screenY + (vScreenY / vMag) * (e.radius * scale * 0.95),
          vx: -(vScreenX / vMag) * (Math.random() * 1.8 + 1.2) * e.thrusterPulse,
          vy: (vScreenY / vMag) * (Math.random() * 1.8 + 1.2) * e.thrusterPulse,
          size: (Math.random() * 2.5 + 1.8) * scale * e.thrusterPulse,
          alpha: 0.95 * e.thrusterPulse,
          life: 1.0
        });

        // 1. Draw Electric Blue Ion Thruster Plume
        for (let i = e.trail.length - 1; i >= 0; i--) {
          const p = e.trail[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 2.2 * dt;
          p.size *= 0.96;
          if (p.life <= 0) {
            e.trail.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(56, 189, 248, ' + (p.alpha * p.life) + ')';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 10;
          ctx.fill();
        }
        ctx.shadowBlur = 0;

        // 2. Draw The Endurance Spacecraft
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.scale(scale, scale);
        ctx.rotate(e.axialAngle);

        const shipR = e.radius;

        // Outer circular structural ring truss
        ctx.beginPath();
        ctx.arc(0, 0, shipR, 0, Math.PI * 2);
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = this.isDark ? '#cbd5e1' : '#475569';
        ctx.stroke();

        // Central Docking Hub (With docked Ranger exploration shuttle)
        ctx.beginPath();
        ctx.arc(0, 0, shipR * 0.28, 0, Math.PI * 2);
        ctx.fillStyle = this.isDark ? '#e2e8f0' : '#1e293b';
        ctx.fill();
        ctx.lineWidth = 1.0;
        ctx.strokeStyle = '#38bdf8';
        ctx.stroke();

        // Docked Ranger shuttle silhouette
        ctx.beginPath();
        ctx.moveTo(0, -shipR * 0.32);
        ctx.lineTo(shipR * 0.16, shipR * 0.22);
        ctx.lineTo(-shipR * 0.16, shipR * 0.22);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // 4 Connecting Spokes
        for (let s = 0; s < 4; s++) {
          const spokeAngle = (s * Math.PI) / 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(spokeAngle) * shipR, Math.sin(spokeAngle) * shipR);
          ctx.lineWidth = 1.4;
          ctx.strokeStyle = '#cbd5e1';
          ctx.stroke();
        }

        // 12 Habitat & Cargo Box Modules
        const numModules = 12;
        const modWidth = shipR * 0.38;
        const modHeight = shipR * 0.22;

        for (let m = 0; m < numModules; m++) {
          const angle = (m * Math.PI * 2) / numModules;
          const mx = Math.cos(angle) * shipR;
          const my = Math.sin(angle) * shipR;

          ctx.save();
          ctx.translate(mx, my);
          ctx.rotate(angle + Math.PI / 2);

          // Box module
          ctx.beginPath();
          ctx.rect(-modWidth * 0.5, -modHeight * 0.5, modWidth, modHeight);
          if (m % 3 === 0) {
            ctx.fillStyle = this.isDark ? '#f8fafc' : '#334155'; // Habitat
          } else if (m % 3 === 1) {
            ctx.fillStyle = this.isDark ? '#cbd5e1' : '#475569'; // Lab
          } else {
            ctx.fillStyle = this.isDark ? '#94a3b8' : '#64748b'; // Engine/Cargo
          }
          ctx.fill();
          ctx.lineWidth = 0.8;
          ctx.strokeStyle = '#0f172a';
          ctx.stroke();

          // Accretion disk golden rim lighting on the black hole side
          ctx.beginPath();
          ctx.moveTo(-modWidth * 0.5, modHeight * 0.5);
          ctx.lineTo(modWidth * 0.5, modHeight * 0.5);
          ctx.lineWidth = 1.0;
          ctx.strokeStyle = 'rgba(255, 200, 80, 0.85)';
          ctx.stroke();

          // Cabin window dot
          if (m % 2 === 0) {
            ctx.beginPath();
            ctx.arc(0, 0, 0.9, 0, Math.PI * 2);
            ctx.fillStyle = '#fde047';
            ctx.fill();
          }

          ctx.restore();
        }

        // Active Ion Thruster Flame Glow
        ctx.beginPath();
        ctx.arc(0, shipR * 1.15, 3.2 * e.thrusterPulse, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.95)';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();
      }
    }

    // Start Engine when DOM is ready
    function initGargantua() {
      new GargantuaRenderer();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initGargantua);
    } else {
      initGargantua();
    }
  })();

(function() {
    'use strict';

    // Vertex Shader (Full-screen quad)
    const vsSource = [
      'attribute vec2 position;',
      'void main() {',
      '  gl_Position = vec4(position, 0.0, 1.0);',
      '}'
    ].join('\n');

    // Fragment Shader (General Relativistic Raymarcher)
    const fsSource = [
      'precision highp float;',
      'uniform vec2  iResolution;',
      'uniform float iTime;',
      'uniform vec3  camPos;',
      'uniform vec3  camRight;',
      'uniform vec3  camUp;',
      'uniform vec3  camForward;',
      'uniform float camFov;',
      'uniform float uRs;',
      'uniform float uDiskInner;',
      'uniform float uDiskOuter;',
      'uniform float uDiskRotSpeed;',
      'uniform float uDiskSpin;',
      'uniform float uExposure;',
      'uniform float uAxisTilt;',
      'uniform float uWarpWave;',
      'uniform float uTheme;',

      'const int   MAX_STEPS = 145;',
      'const float PI = 3.14159265359;',

      'float hash13(vec3 p3) {',
      '  p3 = fract(p3 * 0.1031);',
      '  p3 += dot(p3, p3.yzx + 33.33);',
      '  return fract((p3.x + p3.y) * p3.z);',
      '}',

      'float noise3(vec3 x) {',
      '  vec3 i = floor(x);',
      '  vec3 f = fract(x);',
      '  f = f * f * (3.0 - 2.0 * f);',
      '  return mix(',
      '    mix(mix(hash13(i + vec3(0,0,0)), hash13(i + vec3(1,0,0)), f.x),',
      '        mix(hash13(i + vec3(0,1,0)), hash13(i + vec3(1,1,0)), f.x), f.y),',
      '    mix(mix(hash13(i + vec3(0,0,1)), hash13(i + vec3(1,0,1)), f.x),',
      '        mix(hash13(i + vec3(0,1,1)), hash13(i + vec3(1,1,1)), f.x), f.y),',
      '    f.z);',
      '}',

      'float fbm(vec3 p) {',
      '  float v = 0.0;',
      '  float a = 0.5;',
      '  for (int i = 0; i < 4; i++) {',
      '    v += a * noise3(p);',
      '    p *= 2.05;',
      '    a *= 0.5;',
      '  }',
      '  return v;',
      '}',

      'float fbmFlow(vec3 p, float stretch) {',
      '  float v = 0.0;',
      '  float a = 0.5;',
      '  for (int i = 0; i < 4; i++) {',
      '    vec3 q = vec3(p.x / stretch, p.y, p.z);',
      '    v += a * noise3(q);',
      '    p *= 2.3;',
      '    a *= 0.55;',
      '  }',
      '  return v;',
      '}',

      'vec3 nebula(vec3 dir) {',
      '  float n = fbm(dir * 2.2 + 5.0);',
      '  float mask = smoothstep(0.66, 0.92, n);',
      '  vec3 deepBlue = vec3(0.02, 0.03, 0.07);',
      '  vec3 cyan     = vec3(0.02, 0.08, 0.09);',
      '  float colorMix = hash13(floor(dir * 3.0 + 100.0));',
      '  vec3 tint = mix(deepBlue, cyan, colorMix);',
      '  return tint * mask * 0.35;',
      '}',

      'vec3 nebulaClouds(vec3 dir) {',
      '  vec3 col = vec3(0.0);',
      '  vec3 dirs[4];',
      '  dirs[0] = normalize(vec3(-0.72,  0.48,  0.30));',
      '  dirs[1] = normalize(vec3( 0.58, -0.52, -0.42));',
      '  dirs[2] = normalize(vec3(-0.15, -0.68,  0.58));',
      '  dirs[3] = normalize(vec3( 0.35,  0.62, -0.55));',
      '  vec3 cols[4];',
      '  cols[0] = vec3(0.55, 0.20, 0.06);',
      '  cols[1] = vec3(0.42, 0.12, 0.05);',
      '  cols[2] = vec3(0.06, 0.08, 0.16);',
      '  cols[3] = vec3(0.34, 0.10, 0.44);',
      '  float sizes[4];',
      '  sizes[0] = 0.42; sizes[1] = 0.32; sizes[2] = 0.42; sizes[3] = 0.20;',
      '  for (int i = 0; i < 4; i++) {',
      '    float ang = acos(clamp(dot(dir, dirs[i]), -1.0, 1.0));',
      '    float shape = fbm(dir * 3.5 + float(i) * 17.0);',
      '    float falloff = exp(-(ang * ang) / (sizes[i] * sizes[i]));',
      '    col += cols[i] * falloff * (0.35 + 0.9 * shape) * 0.5;',
      '  }',
      '  return col;',
      '}',

      'vec3 starfield(vec3 dir) {',
      '  vec3 col = vec3(0.0);',
      '  vec3 p = dir * 260.0;',
      '  vec3 ip = floor(p);',
      '  vec3 fp = fract(p);',
      '  float d = hash13(ip);',
      '  if (d > 0.9994) {',
      '    bool warm = hash13(ip + 9.9) > 0.5;',
      '    vec3 tint = warm ? vec3(1.35, 0.9, 0.55) : vec3(0.6, 0.8, 1.4);',
      '    float dist = length(fp - 0.5);',
      '    float star = smoothstep(0.42, 0.0, dist);',
      '    col += tint * star * 5.5;',
      '  } else if (d > 0.9935) {',
      '    float brightness = hash13(ip + 7.7);',
      '    vec3 starColor = mix(vec3(0.8, 0.85, 1.0), vec3(1.0, 0.9, 0.75), hash13(ip + 3.3));',
      '    float dist = length(fp - 0.5);',
      '    float star = smoothstep(0.35, 0.0, dist) * brightness;',
      '    col += starColor * star * 3.2;',
      '  }',
      '  col += nebula(dir);',
      '  return col;',
      '}',

      'vec3 diskRamp(float t) {',
      '  vec3 white     = vec3(1.0, 1.0, 1.0)      * 3.2;',
      '  vec3 paleGold  = vec3(1.0, 0.88, 0.68)    * 2.2;',
      '  vec3 redOrange = vec3(0.95, 0.32, 0.07)   * 1.45;',
      '  vec3 deepRed   = vec3(0.55, 0.09, 0.02)   * 0.95;',
      '  vec3 ember     = vec3(0.12, 0.02, 0.0)    * 0.55;',
      '  c = mix(white, paleGold, smoothstep(0.0, 0.06, t));',
      '  c = mix(c, redOrange, smoothstep(0.04, 0.24, t));',
      '  c = mix(c, deepRed, smoothstep(0.22, 0.65, t));',
      '  c = mix(c, ember, smoothstep(0.55, 1.0, t));',
      '  c = mix(c, vec3(0.0), smoothstep(0.95, 1.25, t));',
      '  return c;',
      '}',

      'vec3 diskColor(vec3 p, vec3 rayDir, float innerR, float outerR, float time) {',
      '  float r = length(p.xz);',
      '  float phi = atan(p.z, p.x);',
      '  float t = max((r - innerR) / (outerR - innerR), 0.0);',
      '  float omega = 1.15 / pow(r / innerR, 1.5);',
      '  float windTime = 12.0 + time;',
      '  float swirl = phi - omega * windTime * uDiskRotSpeed * uDiskSpin;',
      '  vec2 flowXY = vec2(cos(swirl), sin(swirl)) * r;',
      '  vec3 flowP = vec3(flowXY.x * 0.22, flowXY.y * 0.22, r * 0.035 - time * 0.05);',
      '  float n = fbmFlow(flowP, 2.6);',
      '  n = clamp(n, 0.0, 1.0);',
      '  float lanes = noise3(vec3(flowXY.x * 0.5, flowXY.y * 0.5, time * 0.08));',
      '  float dust = smoothstep(0.2, 0.8, lanes);',
      '  vec3 c = vec3(0.0);',
      '  vec3 baseColor = diskRamp(t + (n - 0.5) * 0.07);',
      '  float edgeNoise = fbm(vec3(cos(phi) * 2.4, sin(phi) * 2.4, time * 0.025));',
      '  float outerEdge = 0.88 + edgeNoise * 0.4;',
      '  float density = smoothstep(0.0, 0.045, t) * (1.0 - smoothstep(0.55, outerEdge, t));',
      '  density *= (0.65 + 0.45 * n) * mix(0.7, 1.0, dust);',
      '  vec3 tangent = normalize(vec3(-p.z, 0.0, p.x)) * uDiskSpin;',
      '  float vOrb = clamp(sqrt(uRs / (2.0 * r)), 0.0, 0.95);',
      '  float mu = dot(tangent, -rayDir);',
      '  float dopplerFactor = 1.0 / max(0.15, (1.0 - vOrb * mu));',
      '  float beaming = pow(dopplerFactor, 1.8);',
      '  vec3 col = baseColor * density * beaming;',
      '  col.b *= clamp(dopplerFactor, 0.5, 1.8);',
      '  col.r *= clamp(2.0 - dopplerFactor, 0.4, 1.5);',
      '  col = col / (1.0 + 0.5 * col);',
      '  return max(col, 0.0);',
      '}',

      'vec3 acesFilm(vec3 x) {',
      '  const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;',
      '  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);',
      '}',

      'vec3 rotateX(vec3 v, float a) {',
      '  float c = cos(a), s = sin(a);',
      '  return vec3(v.x, v.y * c - v.z * s, v.y * s + v.z * c);',
      '}',

      'vec3 traceRay(vec3 ro, vec3 rd) {',
      '  vec3 pos = rotateX(ro, -uAxisTilt);',
      '  vec3 dir = rotateX(rd, -uAxisTilt);',
      '  vec3 h = cross(pos, dir);',
      '  float h2 = dot(h, h);',
      '  float escapeR = uRs * 140.0;',
      '  bool hitHorizon = false;',
      '  float lensR = uDiskOuter * 0.52;',
      '  float photonR = uRs * 2.22;',
      '  float ringWidth = uRs * 0.052;',
      '  vec3 ringGlowCol = vec3(2.2, 2.05, 1.85);',
      '  float minR = escapeR;',
      '  vec3 accumColor = vec3(0.0);',
      '  float accumAlpha = 0.0;',
      '  for (int i = 0; i < MAX_STEPS; i++) {',
      '    float r = length(pos);',
      '    minR = min(minR, r);',
      '    if (r < uRs * 1.02) { hitHorizon = true; break; }',
      '    if (r > escapeR || accumAlpha > 0.992) { break; }',
      '    float dt = clamp(r * 0.12, 0.015, 1.35);',
      '    float atten = 1.0 / (1.0 + pow(r / lensR, 8.0));',
      '    vec3 accel = -1.5 * uRs * h2 * pos / pow(r, 5.0) * atten;',
      '    vec3 newDir = normalize(dir + accel * dt);',
      '    vec3 newPos = pos + newDir * dt;',
      '    if (sign(pos.y) != sign(newPos.y)) {',
      '      float tc = pos.y / (pos.y - newPos.y);',
      '      vec3 hitP = mix(pos, newPos, tc);',
      '      float rHit = length(hitP.xz);',
      '      if (rHit > uDiskInner && rHit < uDiskOuter * 1.35) {',
      '        vec3 dcol = diskColor(hitP, newDir, uDiskInner, uDiskOuter, iTime);',
      '        float a = clamp(max(max(dcol.r, dcol.g), dcol.b) * 0.75, 0.0, 1.0);',
      '        accumColor += (1.0 - accumAlpha) * dcol;',
      '        accumAlpha += (1.0 - accumAlpha) * a;',
      '      }',
      '    }',
      '    pos = newPos;',
      '    dir = newDir;',
      '  }',
      '  vec3 bg = hitHorizon ? vec3(0.0) : (starfield(dir) + nebulaClouds(dir));',
      '  float ringGlow = exp(-pow((minR - photonR) / ringWidth, 2.0));',
      '  vec3 ring = ringGlowCol * ringGlow * 3.0;',
      '  if (uWarpWave > 0.01) {',
      '    ring += vec3(0.2, 0.6, 1.0) * uWarpWave * 2.0;',
      '  }',
      '  vec3 finalCol = accumColor + (1.0 - accumAlpha) * (bg + ring);',
      '  if (uTheme < 0.5) {',
      '    finalCol *= 0.65;',
      '  }',
      '  return finalCol;',
      '}',

      'void main() {',
      '  vec2 uv = (gl_FragCoord.xy / iResolution.xy - 0.5) * 2.0;',
      '  uv.x *= iResolution.x / iResolution.y;',
      '  float tanFov = tan(camFov * 0.5);',
      '  vec3 rayDir = normalize(camForward + uv.x * tanFov * camRight + uv.y * tanFov * camUp);',
      '  vec3 col = traceRay(camPos, rayDir);',
      '  col = acesFilm(col * uExposure);',
      '  col = pow(col, vec3(1.0 / 2.2));',
      '  gl_FragColor = vec4(col, 1.0);',
      '}'
    ].join('\n');

    class GargantuaRenderer {
      constructor() {
        this.glCanvas = document.getElementById('blackhole-canvas');
        this.shipCanvas = document.getElementById('spacecraft-canvas');
        if (!this.glCanvas || !this.shipCanvas) return;

        this.gl = this.glCanvas.getContext('webgl', { powerPreference: 'high-performance', antialias: false, alpha: false }) ||
                  this.glCanvas.getContext('experimental-webgl');
        if (!this.gl) {
          console.warn('WebGL not supported, falling back to 2D');
          return;
        }

        this.ctx = this.shipCanvas.getContext('2d');
        this.initShaders();
        this.initGeometry();

        this.dpr = Math.min(window.devicePixelRatio || 1, 1.75);
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Cinematic edge-on viewing angle
        this.radius = 21.0;
        this.baseTheta = 0.45;
        this.theta = this.baseTheta;
        this.targetTheta = this.baseTheta;
        this.basePhi = 1.48; // ~85 degrees edge-on
        this.phi = this.basePhi;
        this.targetPhi = this.basePhi;
        this.camFov = 50.0 * Math.PI / 180.0;

        // Gyro Tilt
        this.tiltX = 0;
        this.tiltY = 0;
        this.targetTiltX = 0;
        this.targetTiltY = 0;

        // Scroll
        this.lastScrollY = window.scrollY || 0;
        this.scrollVelocity = 0;
        this.diskRotSpeed = 1.0;

        // Interactive Gravitational Warp
        this.warpWave = 0.0;

        // Endurance Spacecraft
        this.endurance = {
          orbitAngle: 0.95,
          orbitSpeed: 0.004,
          orbitRadius: 6.8, // in units of Rs
          orbitTilt: 0.38,
          axialAngle: 0,
          axialSpeed: 0.05, // 5.6 RPM
          radius: 16,
          thrusterPulse: 1.0,
          trail: []
        };

        this.isDark = document.documentElement.getAttribute('data-theme') !== 'light';

        this.resize();
        this.bindEvents();

        this.lastTime = performance.now();
        requestAnimationFrame(this.render.bind(this));
      }

      initShaders() {
        const gl = this.gl;
        const vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, vsSource);
        gl.compileShader(vs);

        const fs = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fs, fsSource);
        gl.compileShader(fs);

        if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
          console.error('Fragment shader compile error:', gl.getShaderInfoLog(fs));
          return;
        }

        this.program = gl.createProgram();
        gl.attachShader(this.program, vs);
        gl.attachShader(this.program, fs);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
          console.error('Program link error:', gl.getProgramInfoLog(this.program));
          return;
        }

        gl.useProgram(this.program);

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
          uWarpWave:      gl.getUniformLocation(this.program, 'uWarpWave'),
          uTheme:         gl.getUniformLocation(this.program, 'uTheme'),
        };

        gl.uniform1f(this.uniforms.uRs, 1.0);
        gl.uniform1f(this.uniforms.uDiskInner, 3.0);
        gl.uniform1f(this.uniforms.uDiskOuter, 17.5);
        gl.uniform1f(this.uniforms.uDiskSpin, 1.0);
        gl.uniform1f(this.uniforms.uExposure, 1.35);
        gl.uniform1f(this.uniforms.uAxisTilt, 0.0);
        gl.uniform1f(this.uniforms.camFov, this.camFov);
      }

      initGeometry() {
        const gl = this.gl;
        const quad = new Float32Array([
          -1.0, -1.0,
           1.0, -1.0,
          -1.0,  1.0,
           1.0,  1.0,
        ]);
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

        const posAttr = gl.getAttribLocation(this.program, 'position');
        gl.enableVertexAttribArray(posAttr);
        gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);
      }

      resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.dpr = Math.min(window.devicePixelRatio || 1, 1.75);

        const pw = Math.floor(this.width * this.dpr);
        const ph = Math.floor(this.height * this.dpr);

        this.glCanvas.width = pw;
        this.glCanvas.height = ph;
        this.gl.viewport(0, 0, pw, ph);

        this.shipCanvas.width = pw;
        this.shipCanvas.height = ph;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(this.dpr, this.dpr);

        this.gl.useProgram(this.program);
        this.gl.uniform2f(this.uniforms.iResolution, pw, ph);
      }

      bindEvents() {
        window.addEventListener('resize', () => this.resize(), { passive: true });

        // Scroll Tracking & Camera Fly-By Orbital Journey
        window.addEventListener('scroll', () => {
          const currentScrollY = window.scrollY || window.pageYOffset || 0;
          const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
          const scrollProgress = currentScrollY / maxScroll;

          const delta = Math.abs(currentScrollY - this.lastScrollY);
          this.scrollVelocity = Math.min(delta, 50);
          this.lastScrollY = currentScrollY;

          this.targetTheta = this.baseTheta + scrollProgress * 0.70;
          this.targetPhi = this.basePhi - scrollProgress * 0.16;
          this.diskRotSpeed = 1.0 + this.scrollVelocity * 0.05;
        }, { passive: true });

        // Mouse Gyro Tilt
        window.addEventListener('mousemove', (e) => {
          this.targetTiltX = (e.clientX / this.width - 0.5) * 0.18;
          this.targetTiltY = (e.clientY / this.height - 0.5) * 0.14;
        }, { passive: true });

        // Gravitational Wave Shockwave on Click
        window.addEventListener('click', (e) => {
          if (!e.target.closest('a, button, input, textarea, select')) {
            this.warpWave = 1.0;
          }
        });

        // Tab Switching Event: Relativistic Warp Pulse & Spacecraft Thruster Burn
        document.querySelectorAll('.nav-link, [data-target-tab], [data-tab]').forEach(btn => {
          btn.addEventListener('click', () => {
            this.warpWave = 1.8;
            this.diskRotSpeed = 2.4;
            this.endurance.thrusterPulse = 3.8;
          });
        });

        // Theme Toggle Observation
        const observer = new MutationObserver(() => {
          this.isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      }

      render(now) {
        const dt = Math.min((now - this.lastTime) * 0.001, 0.1);
        this.lastTime = now;

        // Smooth camera damping
        this.tiltX += (this.targetTiltX - this.tiltX) * 0.05;
        this.tiltY += (this.targetTiltY - this.tiltY) * 0.05;
        this.theta += (this.targetTheta - this.theta) * 0.06;
        this.phi += (this.targetPhi - this.phi) * 0.06;

        const effectiveTheta = this.theta + this.tiltX;
        const effectivePhi = Math.max(0.2, Math.min(Math.PI - 0.2, this.phi + this.tiltY));

        this.diskRotSpeed += (1.0 - this.diskRotSpeed) * 0.05;
        this.warpWave *= 0.96;

        // Compute 3D Camera Basis Vectors
        const camPos = [
          this.radius * Math.sin(effectivePhi) * Math.sin(effectiveTheta),
          this.radius * Math.cos(effectivePhi),
          this.radius * Math.sin(effectivePhi) * Math.cos(effectiveTheta)
        ];

        const cLen = Math.hypot(camPos[0], camPos[1], camPos[2]) || 1;
        const forward = [-camPos[0] / cLen, -camPos[1] / cLen, -camPos[2] / cLen];

        const rX = forward[1] * 0 - forward[2] * 1;
        const rY = forward[2] * 0 - forward[0] * 0;
        const rZ = forward[0] * 1 - forward[1] * 0;
        const rLen = Math.hypot(rX, rZ) || 1;
        const right = [rX / rLen, 0, rZ / rLen];

        const up = [
          right[1] * forward[2] - right[2] * forward[1],
          right[2] * forward[0] - right[0] * forward[2],
          right[0] * forward[1] - right[1] * forward[0]
        ];

        // 1. Render WebGL Gargantua Black Hole
        const gl = this.gl;
        gl.useProgram(this.program);
        gl.uniform1f(this.uniforms.iTime, now * 0.001);
        gl.uniform3fv(this.uniforms.camPos, camPos);
        gl.uniform3fv(this.uniforms.camRight, right);
        gl.uniform3fv(this.uniforms.camUp, up);
        gl.uniform3fv(this.uniforms.camForward, forward);
        gl.uniform1f(this.uniforms.uDiskRotSpeed, this.diskRotSpeed);
        gl.uniform1f(this.uniforms.uWarpWave, this.warpWave);
        gl.uniform1f(this.uniforms.uTheme, this.isDark ? 1.0 : 0.0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        // 2. Render 3D Endurance Spacecraft on Overlay Canvas
        this.renderEndurance(dt, camPos, forward, right, up);

        requestAnimationFrame(this.render.bind(this));
      }

      renderEndurance(dt, camPos, forward, right, up) {
        const ctx = this.ctx;
        const e = this.endurance;
        ctx.clearRect(0, 0, this.width, this.height);

        // Orbital progress around Gargantua
        e.orbitAngle += (e.orbitSpeed * this.diskRotSpeed);
        if (e.orbitAngle > Math.PI * 2) e.orbitAngle -= Math.PI * 2;

        // Continuous axial rotation (5.6 RPM artificial gravity spin)
        e.axialAngle += e.axialSpeed;

        if (e.thrusterPulse > 1.0) {
          e.thrusterPulse -= 2.0 * dt;
          if (e.thrusterPulse < 1.0) e.thrusterPulse = 1.0;
        }

        // 3D Orbital Coordinates around Black Hole Center (0,0,0)
        const cosO = Math.cos(e.orbitAngle);
        const sinO = Math.sin(e.orbitAngle);
        const R = e.orbitRadius;

        const shipWorldPos = {
          x: R * cosO,
          y: R * sinO * Math.sin(e.orbitTilt),
          z: R * sinO * Math.cos(e.orbitTilt)
        };

        const dx = shipWorldPos.x - camPos[0];
        const dy = shipWorldPos.y - camPos[1];
        const dz = shipWorldPos.z - camPos[2];

        const zDist = dx * forward[0] + dy * forward[1] + dz * forward[2];
        if (zDist < 0.5) return; // Behind camera

        const xDist = dx * right[0] + dy * right[1] + dz * right[2];
        const yDist = dx * up[0] + dy * up[1] + dz * up[2];

        const aspect = this.width / this.height;
        const tanHalfFov = Math.tan(this.camFov * 0.5);

        const ndcX = xDist / (zDist * tanHalfFov * aspect);
        const ndcY = yDist / (zDist * tanHalfFov);

        const screenX = (ndcX * 0.5 + 0.5) * this.width;
        const screenY = (-ndcY * 0.5 + 0.5) * this.height;

        // Occlusion test: If ship is behind black hole and aligns with shadow
        const camToCenterDist = Math.hypot(camPos[0], camPos[1], camPos[2]);
        const isBehind = zDist > camToCenterDist;
        const distFromScreenCenter = Math.hypot(ndcX, ndcY);

        if (isBehind && distFromScreenCenter < 0.22) {
          return;
        }

        const scale = (34.0 / zDist);

        // Spawn ion thruster exhaust particles
        const speedX = -R * sinO;
        const speedY = R * cosO * Math.sin(e.orbitTilt);
        const speedZ = R * cosO * Math.cos(e.orbitTilt);

        const vScreenX = speedX * right[0] + speedZ * right[2];
        const vScreenY = speedY * up[1] + speedZ * up[2];
        const vMag = Math.hypot(vScreenX, vScreenY) || 1;

        e.trail.push({
          x: screenX - (vScreenX / vMag) * (e.radius * scale * 0.95),
          y: screenY + (vScreenY / vMag) * (e.radius * scale * 0.95),
          vx: -(vScreenX / vMag) * (Math.random() * 1.8 + 1.2) * e.thrusterPulse,
          vy: (vScreenY / vMag) * (Math.random() * 1.8 + 1.2) * e.thrusterPulse,
          size: (Math.random() * 2.5 + 1.8) * scale * e.thrusterPulse,
          alpha: 0.95 * e.thrusterPulse,
          life: 1.0
        });

        // 1. Draw Electric Blue Ion Thruster Plume
        for (let i = e.trail.length - 1; i >= 0; i--) {
          const p = e.trail[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 2.2 * dt;
          p.size *= 0.96;
          if (p.life <= 0) {
            e.trail.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(56, 189, 248, ' + (p.alpha * p.life) + ')';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 10;
          ctx.fill();
        }
        ctx.shadowBlur = 0;

        // 2. Draw The Endurance Spacecraft
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.scale(scale, scale);
        ctx.rotate(e.axialAngle);

        const shipR = e.radius;

        // Outer circular structural ring truss
        ctx.beginPath();
        ctx.arc(0, 0, shipR, 0, Math.PI * 2);
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = this.isDark ? '#cbd5e1' : '#475569';
        ctx.stroke();

        // Central Docking Hub (With docked Ranger exploration shuttle)
        ctx.beginPath();
        ctx.arc(0, 0, shipR * 0.28, 0, Math.PI * 2);
        ctx.fillStyle = this.isDark ? '#e2e8f0' : '#1e293b';
        ctx.fill();
        ctx.lineWidth = 1.0;
        ctx.strokeStyle = '#38bdf8';
        ctx.stroke();

        // Docked Ranger shuttle silhouette
        ctx.beginPath();
        ctx.moveTo(0, -shipR * 0.32);
        ctx.lineTo(shipR * 0.16, shipR * 0.22);
        ctx.lineTo(-shipR * 0.16, shipR * 0.22);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // 4 Connecting Spokes
        for (let s = 0; s < 4; s++) {
          const spokeAngle = (s * Math.PI) / 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(spokeAngle) * shipR, Math.sin(spokeAngle) * shipR);
          ctx.lineWidth = 1.4;
          ctx.strokeStyle = '#cbd5e1';
          ctx.stroke();
        }

        // 12 Habitat & Cargo Box Modules
        const numModules = 12;
        const modWidth = shipR * 0.38;
        const modHeight = shipR * 0.22;

        for (let m = 0; m < numModules; m++) {
          const angle = (m * Math.PI * 2) / numModules;
          const mx = Math.cos(angle) * shipR;
          const my = Math.sin(angle) * shipR;

          ctx.save();
          ctx.translate(mx, my);
          ctx.rotate(angle + Math.PI / 2);

          // Box module
          ctx.beginPath();
          ctx.rect(-modWidth * 0.5, -modHeight * 0.5, modWidth, modHeight);
          if (m % 3 === 0) {
            ctx.fillStyle = this.isDark ? '#f8fafc' : '#334155'; // Habitat
          } else if (m % 3 === 1) {
            ctx.fillStyle = this.isDark ? '#cbd5e1' : '#475569'; // Lab
          } else {
            ctx.fillStyle = this.isDark ? '#94a3b8' : '#64748b'; // Engine/Cargo
          }
          ctx.fill();
          ctx.lineWidth = 0.8;
          ctx.strokeStyle = '#0f172a';
          ctx.stroke();

          // Accretion disk golden rim lighting on the black hole side
          ctx.beginPath();
          ctx.moveTo(-modWidth * 0.5, modHeight * 0.5);
          ctx.lineTo(modWidth * 0.5, modHeight * 0.5);
          ctx.lineWidth = 1.0;
          ctx.strokeStyle = 'rgba(255, 200, 80, 0.85)';
          ctx.stroke();

          // Cabin window dot
          if (m % 2 === 0) {
            ctx.beginPath();
            ctx.arc(0, 0, 0.9, 0, Math.PI * 2);
            ctx.fillStyle = '#fde047';
            ctx.fill();
          }

          ctx.restore();
        }

        // Active Ion Thruster Flame Glow
        ctx.beginPath();
        ctx.arc(0, shipR * 1.15, 3.2 * e.thrusterPulse, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.95)';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();
      }
    }

    // Start Engine when DOM is ready
    function initGargantua() {
      new GargantuaRenderer();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initGargantua);
    } else {
      initGargantua();
    }
  })();
