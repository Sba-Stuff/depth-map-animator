"use strict";

function main() {
  const canvas = document.getElementById("canvas");
  const gl = canvas.getContext("webgl");
  if (!gl) return;

  let originalImage = { width: 1, height: 1 };

  const originalTexture = twgl.createTexture(gl, {
    src: "uploads/demo.jpg",
    crossOrigin: "",
  }, (err, texture, source) => {
    originalImage = source;
  });

  const mapTexture = twgl.createTexture(gl, {
    src: "uploads/demo-depth.png",
    crossOrigin: "",
  });

  const programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]);
  const bufferInfo = twgl.primitives.createXYQuadBufferInfo(gl);

  const mouse = [0, 0];
  const nMouse = [0, 0];

  let animationType = null;
  let animationTime = 0;
  let animationTimer = null;

  const intensitySlider = document.getElementById("intensitySlider");
  const speedSlider = document.getElementById("speedSlider");
  const intensityToggle = document.getElementById("enableIntensity");

  // Animation selector
  window.startAnimation = function (type) {
    animationType = type;
    animationTime = 0;

    if (type === "random") {
      const types = [
        "upDown", "leftRight", "round", "perspectiveRound",
        "zoomCenterIn", "zoomCenterOut",
        "zoomTopLeft", "zoomTopRight",
        "zoomBottomLeft", "zoomBottomRight",
        "sway", "drift", "spiral", "pulseZoom", "jitter", "orbit", "waveform"
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

  // Toggle control panel with H
  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "h") {
      const panel = document.getElementById("controlsPanel");
      panel.classList.toggle("hidden");
    }
  });

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
    const isIntensityEnabled = intensityToggle.checked;

    const intensityMod = 1 + Math.sin(animationTime * 0.7) * 0.5;
    const speedMod = 1 + Math.cos(animationTime * 0.5) * 0.3;
    const finalIntensity = isIntensityEnabled ? userIntensity * intensityMod : 1;
    const finalSpeed = userSpeed * speedMod;

    let targetX = 0;
    let targetY = 0;

    switch (animationType) {
      case "upDown":
        targetY = Math.sin(animationTime * 2 * finalSpeed) * 0.02 * finalIntensity;
        break;
      case "leftRight":
        targetX = Math.sin(animationTime * 2 * finalSpeed) * 0.02 * finalIntensity;
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

      // New Presets
      case "sway":
        targetX = Math.sin(animationTime * finalSpeed) * 0.015 * finalIntensity;
        targetY = 0.005 * Math.sin(animationTime * 0.5 * finalSpeed) * finalIntensity;
        break;
      case "drift":
        targetX = Math.sin(animationTime * 1.3) * 0.01 * finalIntensity + Math.cos(animationTime * 0.7) * 0.008;
        targetY = Math.sin(animationTime * 0.9) * 0.01 * finalIntensity;
        break;
      case "spiral":
        const spiral = Math.sin(animationTime * finalSpeed) * 0.02 * finalIntensity;
        targetX = Math.cos(animationTime * finalSpeed) * spiral;
        targetY = Math.sin(animationTime * finalSpeed) * spiral;
        break;
      case "pulseZoom":
        const pulse = Math.sin(animationTime * 2 * finalSpeed) * 0.015 * finalIntensity;
        targetX = pulse;
        targetY = pulse;
        break;
      case "jitter":
        targetX = (Math.random() - 0.5) * 0.02 * finalIntensity;
        targetY = (Math.random() - 0.5) * 0.02 * finalIntensity;
        break;
      case "orbit":
        targetX = Math.cos(animationTime * finalSpeed) * 0.03 * finalIntensity;
        targetY = Math.sin(animationTime * finalSpeed * 0.5) * 0.015 * finalIntensity;
        break;
      case "waveform":
        targetX = Math.sin(animationTime * 2.5 * finalSpeed) * 0.02 * finalIntensity;
        targetY = Math.abs(Math.sin(animationTime * finalSpeed)) * 0.01 * finalIntensity;
        break;
    }

    const noiseX = (Math.random() - 0.5) * 0.001 * finalIntensity;
    const noiseY = (Math.random() - 0.5) * 0.001 * finalIntensity;

    mouse[0] = targetX + noiseX;
    mouse[1] = targetY + noiseY;

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

  let recorder;
  let recordedChunks = [];

  // Start recording
  document.getElementById("startRecording").addEventListener("click", () => {
    const originalWidth = 500;  // Image width
    const originalHeight = 500; // Image height

    // Save original canvas size
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;

    // Resize canvas to match image before starting stream
    canvas.width = originalWidth;
    canvas.height = originalHeight;

    // Wait for one frame to ensure canvas redraws
    requestAnimationFrame(() => {
      const stream = canvas.captureStream(30);
      recorder = new MediaRecorder(stream, { mimeType: "video/webm" });

      recordedChunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
      };

      recorder.onstop = () => {
        // Restore canvas size
        canvas.width = oldWidth;
        canvas.height = oldHeight;

        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "parallax-recording.webm";
        a.click();
      };

      recorder.start();
      console.log("Recording started");
    });
  });

  // Stop recording
  document.getElementById("stopRecording").addEventListener("click", () => {
    if (recorder) {
      recorder.stop();
      console.log("Recording stopped");
    }
  });
}

main();
