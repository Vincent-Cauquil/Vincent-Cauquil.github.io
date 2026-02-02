const player = document.getElementById("player");

let x = 50;
let y = window.innerHeight * 0.6;
const speed = 5;

document.addEventListener("keydown", (e) => {
  switch (e.key.toLowerCase()) {
    case "z":
      y -= speed;
      break;
    case "s":
      y += speed;
      break;
    case "q":
      x -= speed;
      break;
    case "d":
      x += speed;
      break;
  }

  player.style.left = x + "px";
  player.style.top = y + "px";
});
