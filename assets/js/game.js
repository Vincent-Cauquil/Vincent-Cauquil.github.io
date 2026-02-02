const player = document.getElementById("player");
const doors = document.querySelectorAll(".door");

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

setInterval(() => {
  doors.forEach(door => {
    if (isColliding(player, door)) {
      alert("Ouverture : " + door.dataset.section);
    }
  });
}, 100);
