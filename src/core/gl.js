/**
 * Il minimo indispensabile di WebGL: un quad a schermo intero e uno
 * shader.
 *
 * Tutta la parte 3D del sito è questa. Portarsi dietro una libreria
 * di scenegrafi per disegnare due triangoli costava seicento kilobyte
 * di JavaScript prima che comparisse il primo fotogramma — su una
 * pagina il cui argomento è la precisione, era la cosa meno difendibile
 * del progetto.
 */

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

function compile(gl, type, src, nome) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    throw new Error(`shader ${nome}: ${gl.getShaderInfoLog(s)}`);
  }
  return s;
}

/** Carica un'immagine come texture. Ritorna null se non arriva. */
export function loadTexture(gl, url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      // Niente mipmap e niente ripetizione: si campiona sempre dentro
      // l'immagine, e il bordo deve restare fermo quando la camera
      // arretra oltre l'inquadratura.
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      resolve({ tex: t, width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export function createTextureFromCanvas(gl, canvas) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return { tex: t, width: canvas.width, height: canvas.height };
}

/**
 * Costruisce il contesto, compila il programma e restituisce un
 * `draw(valori)` che imposta le uniform per nome e disegna.
 */
export function createQuad(canvas, fragmentShader) {
  const gl = canvas.getContext("webgl2", {
    antialias: false,
    alpha: false,
    depth: false,
    stencil: false,
    powerPreference: "high-performance",
  });
  if (!gl) return null;

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT, "vertex"));
  gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, fragmentShader, "fragment"));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error(`programma: ${gl.getProgramInfoLog(prog)}`);
  }
  gl.useProgram(prog);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]), // un triangolo che copre lo schermo
    gl.STATIC_DRAW
  );
  const loc = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const posizioni = new Map();
  const posizione = (nome) => {
    if (!posizioni.has(nome)) {
      posizioni.set(nome, gl.getUniformLocation(prog, nome));
    }
    return posizioni.get(nome);
  };

  let unitaTexture = 0;

  function draw(valori) {
    gl.useProgram(prog);
    gl.bindVertexArray(vao);
    unitaTexture = 0;

    for (const [nome, v] of Object.entries(valori)) {
      const p = posizione(nome);
      if (p === null) continue;

      if (v && v.tex) {
        gl.activeTexture(gl.TEXTURE0 + unitaTexture);
        gl.bindTexture(gl.TEXTURE_2D, v.tex);
        gl.uniform1i(p, unitaTexture);
        unitaTexture++;
      } else if (typeof v === "number") {
        gl.uniform1f(p, v);
      } else if (Array.isArray(v)) {
        if (v.length === 2) gl.uniform2f(p, v[0], v[1]);
        else if (v.length === 3) gl.uniform3f(p, v[0], v[1], v[2]);
      }
    }

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function resize(w, h, dpr) {
    const W = Math.round(w * dpr);
    const H = Math.round(h * dpr);
    if (canvas.width === W && canvas.height === H) return [W, H];
    canvas.width = W;
    canvas.height = H;
    gl.viewport(0, 0, W, H);
    return [W, H];
  }

  function destroy() {
    gl.deleteProgram(prog);
    gl.deleteBuffer(buf);
    gl.deleteVertexArray(vao);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }

  return { gl, draw, resize, destroy };
}
