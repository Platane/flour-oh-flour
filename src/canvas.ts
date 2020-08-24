const canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.position = "fixed";
canvas.style.top = "0";
canvas.style.left = "0";

const ctx = canvas.getContext("2d")!;

ctx.fillStyle = "orange";
ctx.fillRect(10, 10, 10, 10);

document.body.appendChild(canvas);
