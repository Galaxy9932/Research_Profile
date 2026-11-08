// Approximate Schwarzschild ray bending and a differentially rotating disk.
// This decorative renderer uses the original portfolio's accretion shader.
(() => {
  const canvas = document.querySelector('#blackhole-canvas');
  const control = document.querySelector('#motion-toggle');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
  if (!gl) return;

  const fragment = `precision highp float;

uniform vec2  iResolution;
uniform float iTime;
uniform vec3  camPos;
uniform vec3  camRight;
uniform vec3  camUp;
uniform vec3  camForward;
uniform float camFov;
uniform float uRs;
uniform float uDiskInner;
uniform float uDiskOuter;
uniform float uDiskRotSpeed;
uniform float uDiskSpin;
uniform float uExposure;
uniform float uAxisTilt;


const int   MAX_STEPS = 140;
const float PI = 3.14159265359;

// ---- hash / noise -------------------------------------------------------
float hash13(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise3(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash13(i + vec3(0.0,0.0,0.0)), hash13(i + vec3(1.0,0.0,0.0)), f.x),
        mix(hash13(i + vec3(0.0,1.0,0.0)), hash13(i + vec3(1.0,1.0,0.0)), f.x), f.y),
    mix(mix(hash13(i + vec3(0.0,0.0,1.0)), hash13(i + vec3(1.0,0.0,1.0)), f.x),
        mix(hash13(i + vec3(0.0,1.0,1.0)), hash13(i + vec3(1.0,1.0,1.0)), f.x), f.y),
    f.z);
}

float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise3(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

vec3 nebula(vec3 dir) {
  float n = fbm(dir * 2.2 + 5.0);
  float mask = smoothstep(0.66, 0.92, n);
  vec3 deepBlue = vec3(0.02, 0.03, 0.07);
  vec3 cyan     = vec3(0.02, 0.08, 0.09);
  float colorMix = hash13(floor(dir * 3.0 + 100.0));
  vec3 tint = mix(deepBlue, cyan, colorMix);
  return tint * mask * 0.35;
}

vec3 sampleCloud(vec3 dir, vec3 cdir, vec3 col, float size, float seed) {
  float ang = acos(clamp(dot(dir, cdir), -1.0, 1.0));
  float shape = fbm(dir * 3.5 + seed);
  float falloff = exp(-(ang * ang) / (size * size));
  return col * falloff * (0.35 + 0.9 * shape) * 0.5;
}

vec3 nebulaClouds(vec3 dir) {
  vec3 col = vec3(0.0);
  col += sampleCloud(dir, normalize(vec3(-0.72,  0.48,  0.30)), vec3(0.55, 0.20, 0.06), 0.42, 0.0);
  col += sampleCloud(dir, normalize(vec3( 0.58, -0.52, -0.42)), vec3(0.42, 0.12, 0.05), 0.32, 17.0);
  col += sampleCloud(dir, normalize(vec3(-0.15, -0.68,  0.58)), vec3(0.06, 0.08, 0.16), 0.42, 34.0);
  col += sampleCloud(dir, normalize(vec3( 0.35,  0.62, -0.55)), vec3(0.34, 0.10, 0.44), 0.20, 51.0);
  return col;
}

vec3 starfield(vec3 dir) {
  vec3 col = vec3(0.0);
  vec3 p = dir * 260.0;
  vec3 ip = floor(p);
  vec3 fp = fract(p);
  float d = hash13(ip);

  if (d > 0.9994) {
    float warm = step(0.5, hash13(ip + 9.9));
    vec3 tint = mix(vec3(0.6, 0.8, 1.4), vec3(1.35, 0.9, 0.55), warm);
    float dist = length(fp - 0.5);
    float star = (1.0 - smoothstep(0.0, 0.42, dist));
    col += tint * star * 5.5;
  } else if (d > 0.9935) {
    float brightness = hash13(ip + 7.7);
    vec3 starColor = mix(vec3(0.8, 0.85, 1.0), vec3(1.0, 0.9, 0.75), hash13(ip + 3.3));
    float dist = length(fp - 0.5);
    float star = (1.0 - smoothstep(0.0, 0.35, dist)) * brightness;
    col += starColor * star * 3.2;
  }

  col += nebula(dir);
  return col;
}

float fbmFlow(vec3 p, float stretch) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    vec3 q = vec3(p.x / stretch, p.y, p.z);
    v += a * noise3(q);
    p *= 2.3;
    a *= 0.55;
  }
  return v;
}

vec3 diskRamp(float t) {
  vec3 white     = vec3(1.0, 1.0, 1.0)      * 2.8;
  vec3 paleGold  = vec3(1.0, 0.85, 0.65)    * 2.0;
  vec3 redOrange = vec3(0.95, 0.30, 0.06)   * 1.35;
  vec3 deepRed   = vec3(0.55, 0.09, 0.02)   * 0.95;
  vec3 ember     = vec3(0.12, 0.02, 0.0)    * 0.55;

  vec3 c = mix(white, paleGold, smoothstep(0.0, 0.06, t));
  c = mix(c, redOrange, smoothstep(0.04, 0.24, t));
  c = mix(c, deepRed, smoothstep(0.22, 0.65, t));
  c = mix(c, ember, smoothstep(0.55, 1.0, t));
  c = mix(c, vec3(0.0), smoothstep(0.95, 1.2, t));
  return c;
}

vec3 diskColor(vec3 p, vec3 rayDir, float innerR, float outerR, float time) {
  float r = length(p.xz);
  float phi = atan(p.z, p.x);

  float t = max((r - innerR) / (outerR - innerR), 0.0);
  float omega = 1.15 / pow(r / innerR, 1.5);
  float windTime = 12.0 + time;
  float swirl = phi - omega * windTime * uDiskRotSpeed * uDiskSpin;

  vec2 flowXY = vec2(cos(swirl), sin(swirl)) * r;
  vec3 flowP = vec3(flowXY.x * 0.22, flowXY.y * 0.22, r * 0.035 - time * 0.05);
  float n = fbmFlow(flowP, 2.6);
  n = clamp(n, 0.0, 1.0);

  float lanes = noise3(vec3(flowXY.x * 0.5, flowXY.y * 0.5, time * 0.08));
  float dust = smoothstep(0.2, 0.8, lanes);

  vec3 baseColor = diskRamp(t + (n - 0.5) * 0.07);

  float edgeNoise = fbm(vec3(cos(phi) * 2.4, sin(phi) * 2.4, time * 0.025));
  float outerEdge = 0.88 + edgeNoise * 0.4;
  float density = smoothstep(0.0, 0.045, t) * (1.0 - smoothstep(0.55, outerEdge, t));
  density *= (0.65 + 0.45 * n) * mix(0.7, 1.0, dust);

  vec3 tangent = normalize(vec3(-p.z, 0.0, p.x)) * uDiskSpin;
  float vOrb = clamp(sqrt(uRs / (2.0 * r)), 0.0, 0.95);

  float mu = dot(tangent, -rayDir);
  float dopplerFactor = 1.0 / max(0.15, (1.0 - vOrb * mu));
  float beaming = pow(dopplerFactor, 1.8);

  vec3 col = baseColor * density * beaming;
  col.b *= clamp(dopplerFactor, 0.5, 1.8);
  col.r *= clamp(2.0 - dopplerFactor, 0.4, 1.5);

  col = col / (1.0 + 0.6 * col);
  return max(col, 0.0);
}

vec3 acesFilm(vec3 x) {
  const float a = 2.51;
  const float b = 0.03;
  const float c = 2.43;
  const float d = 0.59;
  const float e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

vec3 rotateX(vec3 v, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec3(v.x, v.y * c - v.z * s, v.y * s + v.z * c);
}

vec3 traceRay(vec3 ro, vec3 rd) {
  vec3 pos = rotateX(ro, -uAxisTilt);
  vec3 dir = rotateX(rd, -uAxisTilt);
  vec3 h = cross(pos, dir);
  float h2 = dot(h, h);

  float escapeR = uRs * 140.0;
  bool hitHorizon = false;

  float lensR = uDiskOuter * 0.5;
  float photonR = uRs * 1.5;
  float ringWidth = uRs * 0.055;
  vec3 ringGlowCol = vec3(2.0, 1.9, 1.7);
  float minR = escapeR;

  vec3 accumColor = vec3(0.0);
  float accumAlpha = 0.0;

  for (int i = 0; i < MAX_STEPS; i++) {
    float r = length(pos);
    minR = min(minR, r);
    if (r < uRs * 1.02) { hitHorizon = true; break; }
    if (r > escapeR || accumAlpha > 0.995) { break; }

    float dt = clamp(r * 0.12, 0.015, 1.4);

    float atten = 1.0 / (1.0 + pow(r / lensR, 8.0));
    vec3 accel = -1.5 * uRs * h2 * pos / pow(r, 5.0) * atten;
    vec3 newDir = normalize(dir + accel * dt);
    vec3 newPos = pos + newDir * dt;

    if (sign(pos.y) != sign(newPos.y)) {
      float tc = pos.y / (pos.y - newPos.y);
      vec3 hitP = mix(pos, newPos, tc);
      float rHit = length(hitP.xz);

      if (rHit > uDiskInner && rHit < uDiskOuter * 1.3) {
        vec3 dcol = diskColor(hitP, newDir, uDiskInner, uDiskOuter, iTime);
        float a = clamp(max(max(dcol.r, dcol.g), dcol.b) * 0.75, 0.0, 1.0);
        accumColor += (1.0 - accumAlpha) * dcol;
        accumAlpha += (1.0 - accumAlpha) * a;
      }
    }

    pos = newPos;
    dir = newDir;
  }

  vec3 bg = hitHorizon ? vec3(0.0) : (starfield(dir) + nebulaClouds(dir));
  float ringDistance = (minR - photonR) / ringWidth;
  float ringGlow = exp(-ringDistance * ringDistance);
  vec3 ring = ringGlowCol * ringGlow * 2.8;
  return accumColor + (1.0 - accumAlpha) * (bg + ring);
}

void main() {
  vec2 uv = (gl_FragCoord.xy / iResolution.xy - 0.5) * 2.0;
  uv.x *= iResolution.x / iResolution.y;

  float tanFov = tan(camFov * 0.5);
  vec3 rayDir = normalize(camForward + uv.x * tanFov * camRight + uv.y * tanFov * camUp);

  vec3 col = traceRay(camPos, rayDir);

  col = acesFilm(col * uExposure);
  col = pow(col, vec3(1.0 / 2.2));

  gl_FragColor = vec4(col, 1.0);
}`;

  const vertex = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;
  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
    gl.deleteShader(shader);
    return null;
  }

  const vs = compile(gl.VERTEX_SHADER, vertex);
  const fs = compile(gl.FRAGMENT_SHADER, fragment);
  if (!vs || !fs) return;
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

  gl.useProgram(program);
  const position = gl.getAttribLocation(program, 'position');
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uniform = name => gl.getUniformLocation(program, name);
  const resolution = uniform('iResolution');
  const time = uniform('iTime');
  const tilt = 0.16;
  gl.uniform3f(uniform('camPos'), 0, 20 * Math.sin(tilt), 20 * Math.cos(tilt));
  gl.uniform3f(uniform('camForward'), 0, -Math.sin(tilt), -Math.cos(tilt));
  gl.uniform3f(uniform('camRight'), 1, 0, 0);
  gl.uniform3f(uniform('camUp'), 0, Math.cos(tilt), -Math.sin(tilt));
  const values = {
    camFov: Math.PI / 3,
    uRs: 1,
    uDiskInner: 3,
    uDiskOuter: 17,
    uDiskRotSpeed: 0.65,
    uDiskSpin: 1,
    uExposure: 1.1,
    uAxisTilt: -0.08,
  };
  for (const [name, value] of Object.entries(values)) gl.uniform1f(uniform(name), value);

  let frame = 0;
  let elapsed = 0;
  let lastTime = 0;
  let visible = true;
  let paused = motion.matches;
  let lost = false;

  function draw() {
    gl.uniform1f(time, elapsed);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function resize() {
    if (lost) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    const scale = Math.min(0.85, 620 / width, 400 / height);
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(resolution, canvas.width, canvas.height);
    draw();
  }

  function tick(now) {
    if (now - lastTime >= 32) {
      elapsed += Math.min((now - lastTime) / 1000, 0.08);
      lastTime = now;
      draw();
    }
    frame = requestAnimationFrame(tick);
  }

  function updateAnimation() {
    cancelAnimationFrame(frame);
    control.textContent = paused ? 'Play animation' : 'Pause animation';
    if (!lost && !paused && visible && !document.hidden) {
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }

  resize();
  control.hidden = false;
  control.addEventListener('click', () => {
    paused = !paused;
    updateAnimation();
  });
  motion.addEventListener('change', event => {
    paused = event.matches;
    updateAnimation();
  });
  document.addEventListener('visibilitychange', updateAnimation);
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    updateAnimation();
  }).observe(canvas);
  canvas.addEventListener('webglcontextlost', () => {
    lost = true;
    canvas.hidden = true;
    control.hidden = true;
    updateAnimation();
  });
  updateAnimation();
})();
