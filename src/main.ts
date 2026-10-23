import "@fontsource/lilita-one";
import { App } from "./app";
import { HEIGHT, WIDTH } from "./config";
import { Menu } from "./menu";

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.error(`Nie udało się załadować ${src}`);
      resolve(null);
    };
    img.src = src;
  });
}

async function start(): Promise<void> {
  const canvas = document.getElementById("game") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Brak obsługi Canvas 2D");

  const resize = () => {
    const scale = 0.85 * Math.min(window.innerWidth / WIDTH, window.innerHeight / HEIGHT);
    const cssW = Math.floor(WIDTH * scale);
    const cssH = Math.floor(HEIGHT * scale);
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(canvas.width / WIDTH, 0, 0, canvas.height / HEIGHT, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  const coin = await loadImage("resources/coin.png");
  try {
    await document.fonts.load('20px "Lilita One"');
  } catch {}

  const app = new App(new Menu(), { coinTexture: coin });

  canvas.addEventListener("pointerdown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const y = ((e.clientY - rect.top) / rect.height) * HEIGHT;
    app.handleMouseDown(x, y);
  });

  window.addEventListener("keydown", (e) => {
    if (e.repeat) return;
    if (e.code === "Space") e.preventDefault();
    app.handleKeyDown(e.code);
  });

  let last = performance.now();
  const loop = (now: number) => {
    const dt = (now - last) / 1000;
    last = now;
    app.frame(dt, ctx);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

void start();
