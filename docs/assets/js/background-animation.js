(function () {
  function prefersReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function createSymbols(container) {
    const labels = [
      "∫ f(x) dx",
      "Σ",
      "∇·u = 0",
      "ẋ = Ax + Bu",
      "PID",
      "ROS2",
      "AI",
      "λ",
      "π",
      "f(t)",
      "θ",
      "r(t) → y(t)",
    ];

    const count = Math.min(
      10,
      Math.max(6, Math.round(window.innerWidth / 180)),
    );
    for (let i = 0; i < count; i += 1) {
      const symbol = document.createElement("span");
      symbol.className = "bg-symbol";
      symbol.textContent = labels[i % labels.length];
      symbol.style.left = `${6 + Math.random() * 84}%`;
      symbol.style.top = `${8 + Math.random() * 78}%`;
      symbol.style.animationDuration = `${16 + Math.random() * 16}s`;
      symbol.style.animationDelay = `${-Math.random() * 18}s`;
      symbol.style.opacity = `${0.25 + Math.random() * 0.55}`;
      container.appendChild(symbol);
    }
  }

  function initBackground() {
    if (document.querySelector(".site-bg")) return;

    const wrapper = document.createElement("div");
    wrapper.className = "site-bg";
    wrapper.setAttribute("aria-hidden", "true");

    const canvas = document.createElement("canvas");
    canvas.className = "bg-canvas";
    const symbols = document.createElement("div");
    symbols.className = "bg-symbols";

    wrapper.appendChild(canvas);
    wrapper.appendChild(symbols);
    document.body.prepend(wrapper);

    createSymbols(symbols);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    let width = 0;
    let height = 0;
    let time = 0;

    const reducedMotion = prefersReducedMotion();
    const nodeCount = () =>
      Math.min(26, Math.max(12, Math.round(window.innerWidth / 85)));
    let nodes = [];

    function rebuildNodes() {
      nodes = Array.from({ length: nodeCount() }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: 1.1 + Math.random() * 1.8,
      }));
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rebuildNodes();
    }

    function drawNodeGraph() {
      const maxDist = Math.min(170, width * 0.16);
      ctx.lineWidth = 1;

      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.16;
            ctx.strokeStyle = `rgba(14, 75, 80, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach((node) => {
        ctx.fillStyle = "rgba(14, 75, 80, 0.26)";
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function drawChart(x, y, w, h, phase, color) {
      ctx.save();
      ctx.translate(x, y);
      ctx.strokeStyle = "rgba(23, 35, 35, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, 0);
      ctx.lineTo(w, 0);
      ctx.stroke();

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let i = 0; i <= w; i += 4) {
        const t = i / w;
        const yy =
          h * 0.56 -
          Math.sin(t * 6.4 + phase) * h * 0.2 -
          Math.cos(t * 2.2 + phase * 0.6) * h * 0.08;
        if (i === 0) ctx.moveTo(i, yy);
        else ctx.lineTo(i, yy);
      }
      ctx.stroke();

      for (let i = 0; i <= 4; i += 1) {
        const px = (w / 4) * i;
        const py =
          h * 0.56 -
          Math.sin((px / w) * 6.4 + phase) * h * 0.2 -
          Math.cos((px / w) * 2.2 + phase * 0.6) * h * 0.08;
        ctx.fillStyle = color.replace("0.24", "0.34").replace("0.22", "0.34");
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawOrbit(cx, cy, radius, phase) {
      ctx.save();
      ctx.strokeStyle = "rgba(184, 138, 68, 0.14)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.54, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(14, 75, 80, 0.12)";
      ctx.beginPath();
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.stroke();

      const a1 = phase;
      const a2 = -phase * 0.72;
      const x1 = cx + Math.cos(a1) * radius;
      const y1 = cy + Math.sin(a1) * radius;
      const x2 = cx + Math.cos(a2) * radius * 0.54;
      const y2 = cy + Math.sin(a2) * radius * 0.54;

      ctx.fillStyle = "rgba(184, 138, 68, 0.28)";
      ctx.beginPath();
      ctx.arc(x1, y1, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(14, 75, 80, 0.26)";
      ctx.beginPath();
      ctx.arc(x2, y2, 3.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function step() {
      ctx.clearRect(0, 0, width, height);
      time += reducedMotion ? 0.0012 : 0.0032;

      if (!reducedMotion) {
        nodes.forEach((node) => {
          node.x += node.vx;
          node.y += node.vy;
          if (node.x < -20 || node.x > width + 20) node.vx *= -1;
          if (node.y < -20 || node.y > height + 20) node.vy *= -1;
        });
      }

      drawNodeGraph();
      drawChart(
        width * 0.7,
        height * 0.18,
        Math.min(170, width * 0.18),
        56,
        time * 2.6,
        "rgba(14, 75, 80, 0.22)",
      );
      drawChart(
        width * 0.12,
        height * 0.72,
        Math.min(180, width * 0.2),
        62,
        time * 2.1 + 1.6,
        "rgba(184, 138, 68, 0.24)",
      );
      drawOrbit(
        width * 0.83,
        height * 0.76,
        Math.min(72, width * 0.08),
        time * 2.4 + 0.4,
      );
      drawOrbit(
        width * 0.22,
        height * 0.2,
        Math.min(52, width * 0.06),
        time * 2.0 + 1.2,
      );

      requestAnimationFrame(step);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    requestAnimationFrame(step);
  }

  document.addEventListener("DOMContentLoaded", initBackground);
})();
