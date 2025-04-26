"use strict";

function main() {
  const canvas = document.getElementById("canvas");
  const gl = canvas.getContext("webgl");
  if (!gl) return;

  let originalImage = { width: 1, height: 1 };

  const originalTexture = twgl.createTexture(gl, {
    src: "kohsar.jpg",
    crossOrigin: "",
  }, (err, texture, source) => {
    originalImage = source;
  });

  const mapTexture = twgl.createTexture(gl, {
    src: "kohsar-depth.png",
    crossOrigin: "",
  });

  const programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]);
  const bufferInfo = twgl.primitives.createXYQuadBufferInfo(gl);

  const mouse = [0, 0];
  const nMouse = [0, 0];

  let animationType = null;
  let animationTime = 0;
  let animationTimer = null;

  // UI Elements
  const intensitySlider = document.getElementById("intensitySlider");
  const speedSlider = document.getElementById("speedSlider");

  // Animation selector
  window.startAnimation = function (type) {
    animationType = type;
    animationTime = 0;

    if (type === "random") {
      const types = [
        "upDown", "leftRight", "round", "perspectiveRound",
        "zoomCenterIn", "zoomCenterOut",
        "zoomTopLeft", "zoomTopRight",
        "zoomBottomLeft", "zoomBottomRight"
      ];

      clearInterval(animationTimer);
      animationTimer = setInterval(() => {
        animationType = types[Math.floor(Math.random() * types.length)];
        animationTime = 0;
      }, 3000);
    } else {
      clearInterval(animationTimer);
    }
  };

  requestAnimationFrame(render);

  function render() {
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

    const canvasAspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const imageAspect = originalImage.width / originalImage.height;
    const mat = m3.scaling(imageAspect / canvasAspect, -1);

    const userIntensity = parseFloat(intensitySlider.value);
    const userSpeed = parseFloat(speedSlider.value);

    // Dynamic modulation
    const intensityMod = 1 + Math.sin(animationTime * 0.7) * 0.5;
    const speedMod = 1 + Math.cos(animationTime * 0.5) * 0.3;
    const finalIntensity = userIntensity * intensityMod;
    const finalSpeed = userSpeed * speedMod;

    let targetX = 0;
    let targetY = 0;

    switch (animationType) {
      case "upDown":
        targetX = 0;
        targetY = Math.sin(animationTime * 2 * finalSpeed) * 0.02 * finalIntensity;
        break;
      case "leftRight":
        targetX = Math.sin(animationTime * 2 * finalSpeed) * 0.02 * finalIntensity;
        targetY = 0;
        break;
      case "round":
        targetX = Math.cos(animationTime * finalSpeed) * 0.02 * finalIntensity;
        targetY = Math.sin(animationTime * finalSpeed) * 0.02 * finalIntensity;
        break;
      case "perspectiveRound":
        targetX = Math.sin(animationTime * 2 * finalSpeed) * 0.04 * finalIntensity;
        targetY = Math.cos(animationTime * 2 * finalSpeed) * 0.04 * finalIntensity;
        break;
      case "zoomCenterIn":
        targetX = 0;
        targetY = 0;
        break;
      case "zoomCenterOut":
        targetX = Math.sin(animationTime * 2 * finalSpeed) * 0.01 * finalIntensity;
        targetY = Math.cos(animationTime * 2 * finalSpeed) * 0.01 * finalIntensity;
        break;
      case "zoomTopLeft":
        targetX = -0.02 + Math.sin(animationTime * 2 * finalSpeed) * 0.002 * finalIntensity;
        targetY =  0.02 + Math.cos(animationTime * 2 * finalSpeed) * 0.002 * finalIntensity;
        break;
      case "zoomTopRight":
        targetX =  0.02 + Math.sin(animationTime * 2 * finalSpeed) * 0.002 * finalIntensity;
        targetY =  0.02 + Math.cos(animationTime * 2 * finalSpeed) * 0.002 * finalIntensity;
        break;
      case "zoomBottomLeft":
        targetX = -0.02 + Math.sin(animationTime * 2 * finalSpeed) * 0.002 * finalIntensity;
        targetY = -0.02 + Math.cos(animationTime * 2 * finalSpeed) * 0.002 * finalIntensity;
        break;
      case "zoomBottomRight":
        targetX =  0.02 + Math.sin(animationTime * 2 * finalSpeed) * 0.002 * finalIntensity;
        targetY = -0.02 + Math.cos(animationTime * 2 * finalSpeed) * 0.002 * finalIntensity;
        break;
    }

    // Blend with subtle noise for natural feel
    const noiseX = (Math.random() - 0.5) * 0.001 * finalIntensity;
    const noiseY = (Math.random() - 0.5) * 0.001 * finalIntensity;

    mouse[0] = targetX + noiseX;
    mouse[1] = targetY + noiseY;

    // Smooth motion (blending)
    nMouse[0] += (mouse[0] - nMouse[0]) * 0.05;
    nMouse[1] += (mouse[1] - nMouse[1]) * 0.05;

    twgl.setUniforms(programInfo, {
      u_matrix: mat,
      u_originalImage: originalTexture,
      u_mapImage: mapTexture,
      u_mouse: nMouse,
    });

    twgl.drawBufferInfo(gl, bufferInfo);

    animationTime += 0.016;
    requestAnimationFrame(render);
  }
}

main();
