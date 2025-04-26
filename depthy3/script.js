"use strict";

function main() {
  const canvas = document.getElementById("canvas");
  const gl = canvas.getContext("webgl");
  if (!gl) return;

  let originalImage = { width: 1, height: 1 };

  const originalTexture = twgl.createTexture(
    gl,
    {
      src: "kohsar.jpg",
      crossOrigin: "",
    },
    (err, texture, source) => {
      originalImage = source;
    }
  );

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

  // Start animation by name
  window.startAnimation = function (type) {
    animationType = type;
    animationTime = 0;

    if (type === "random") {
      const types = [
        "upDown",
        "leftRight",
        "round",
        "perspectiveRound",
        "zoomCenterIn",
        "zoomCenterOut",
        "zoomTopLeft",
        "zoomTopRight",
        "zoomBottomLeft",
        "zoomBottomRight",
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

  // Rendering loop
  requestAnimationFrame(render);

  function render(time) {
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

    const canvasAspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const imageAspect = originalImage.width / originalImage.height;
    const mat = m3.scaling(imageAspect / canvasAspect, -1);

    // Animate based on selected type
    if (animationType) {
      animationTime += 0.016;

      switch (animationType) {
        case "upDown":
          mouse[0] = 0;
          mouse[1] = Math.sin(animationTime * 2) * 0.02;
          break;
        case "leftRight":
          mouse[0] = Math.sin(animationTime * 2) * 0.02;
          mouse[1] = 0;
          break;
        case "round":
          mouse[0] = Math.cos(animationTime) * 0.02;
          mouse[1] = Math.sin(animationTime) * 0.02;
          break;
        case "perspectiveRound":
          mouse[0] = Math.sin(animationTime * 2) * 0.04;
          mouse[1] = Math.cos(animationTime * 2) * 0.04;
          break;
        case "zoomCenterIn":
          mouse[0] = 0;
          mouse[1] = 0;
          break;
        case "zoomCenterOut":
          mouse[0] = Math.sin(animationTime * 2) * 0.01;
          mouse[1] = Math.cos(animationTime * 2) * 0.01;
          break;
        case "zoomTopLeft":
          mouse[0] = -0.02 + Math.sin(animationTime * 2) * 0.002;
          mouse[1] = 0.02 + Math.cos(animationTime * 2) * 0.002;
          break;
        case "zoomTopRight":
          mouse[0] = 0.02 + Math.sin(animationTime * 2) * 0.002;
          mouse[1] = 0.02 + Math.cos(animationTime * 2) * 0.002;
          break;
        case "zoomBottomLeft":
          mouse[0] = -0.02 + Math.sin(animationTime * 2) * 0.002;
          mouse[1] = -0.02 + Math.cos(animationTime * 2) * 0.002;
          break;
        case "zoomBottomRight":
          mouse[0] = 0.02 + Math.sin(animationTime * 2) * 0.002;
          mouse[1] = -0.02 + Math.cos(animationTime * 2) * 0.002;
          break;
      }
    }

    // Smooth transition
    nMouse[0] += (mouse[0] - nMouse[0]) * 0.05;
    nMouse[1] += (mouse[1] - nMouse[1]) * 0.05;

    twgl.setUniforms(programInfo, {
      u_matrix: mat,
      u_originalImage: originalTexture,
      u_mapImage: mapTexture,
      u_mouse: nMouse,
    });

    twgl.drawBufferInfo(gl, bufferInfo);
    requestAnimationFrame(render);
  }
}

main();
