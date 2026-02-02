/* =========================
   RÉFÉRENCES DOM
========================= */
const player = document.getElementById("player");
const doors = document.querySelectorAll(".door");
const controlsHint = document.getElementById("controls-hint");

/* =========================
   POSITION & PHYSIQUE
========================= */
let x = 100;
let y = window.innerHeight * 0.6;

let vx = 0;
let vy = 0;

const speed = 0.6;
const maxSpeed = 5;
const gravity = 0.5;
const jumpPower = 12;
const maxFallSpeed = 15;

const leftKey  = keys["q"] || keys["arrowleft"];
const rightKey = keys["d"] || keys["arrowright"];
const jumpKey  = keys["z"] || keys[" "] || keys["arrowup"];
const fallKey  = keys["s"] || keys["arrowdown"];

let onGround = false;
let jumpPressed = false;
let controlsVisible = true;

/* =========================
   INPUTS
========================= */
const keys = {};

document.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;

  if (controlsHint && controlsVisible) {
    controlsHint.style.opacity = "0";
    controlsHint.style.transition = "opacity 0.4s ease";
    controlsVisible = false;
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

/* =========================
   GAME LOOP
========================= */
function update() {
  console.log(keys);
  /* --- Déplacement horizontal --- */
  if (leftKey) vx -= speed;
  if (rightKey) vx += speed;

  /* Limite vitesse */
  vx = Math.max(-maxSpeed, Math.min(maxSpeed, vx));

  /* Friction (différente sol / air) */
  vx *= onGround ? 0.8 : 0.98;

  /* --- Saut --- */
  if (jumpKey && onGround && !jumpPressed) {
     vy = -jumpPower;
     onGround = false;
     jumpPressed = true;
   }

  if (!jumpKey) {
     jumpPressed = false;
   }
   
   if (fallKey && !onGround) {
     vy += gravity * 2.5;
   }

  /* --- Gravité --- */
  vy += gravity;

   /* --- Fast-fall (flèche bas) --- */
   if (fallkey && !onGround) {
     vy += gravity * 2.5;
     vy = Math.min(vy, maxFallSpeed);
   }

  /* --- Application des vitesses --- */
  x += vx;
  y += vy;

  /* --- Sol --- */
  const ground = window.innerHeight * 0.7;
  if (y >= ground) {
    y = ground;
    vy = 0;
    onGround = true;
  }

  /* --- Squash & stretch --- */
  if (!onGround) {
    player.style.transform = "scale(1.05, 0.95)";
  } else {
    player.style.transform = "scale(1, 1)";
  }

  /* --- Position DOM --- */
  player.style.left = x + "px";
  player.style.top = y + "px";

  if (controlsHint && controlsVisible) {
     controlsHint.style.left = (x + player.offsetWidth / 2) + "px";
     controlsHint.style.top = (y - 10) + "px";
   }
   
  /* --- Collisions portes --- */
  doors.forEach((door) => {
    if (isColliding(player, door)) {
      openDoor(door);
    }
  });

  requestAnimationFrame(update);
}

/* =========================
   COLLISIONS
========================= */
function isColliding(a, b) {
  const r1 = a.getBoundingClientRect();
  const r2 = b.getBoundingClientRect();

  return !(
    r1.top > r2.bottom ||
    r1.bottom < r2.top ||
    r1.left > r2.right ||
    r1.right < r2.left
  );
}

/* =========================
   PORTES
========================= */
let doorOpened = false;

function openDoor(door) {
  if (doorOpened) return;

  doorOpened = true;
  alert("Ouverture : " + door.dataset.section);
}

/* =========================
   LANCEMENT
========================= */
update();
