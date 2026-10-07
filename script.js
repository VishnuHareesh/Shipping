// Scroll-activated truck loop: the truck drives only while the user is scrolling,
// eases to a stop when scrolling stops, and wraps around the screen.
// Scrolling down drives it right; scrolling up drives it back left.

const SPEED = 600;        // px per second while scrolling — lower = slower truck
const EASE = 10;          // how quickly it speeds up / slows down (higher = snappier)
const IDLE_MS = 180;      // scrolling counts as stopped after this long without input

const hero = document.querySelector(".hero");
const truck = document.querySelector(".truck");

// Loop points, measured from the real screen width (like Figma's 9:162 loop, but not tied to 1408px):
// leave fully past the right edge, then re-enter from fully off-screen left.
let exitX, entryX, cycle, minVisibleX, maxVisibleX;
function measure() {
  const left = truck.offsetLeft;
  const width = truck.offsetWidth;
  const screen = hero.clientWidth;
  exitX = screen - left;          // truck's left edge has passed the right edge
  entryX = -(left + width);       // truck's right edge sits at the left edge
  cycle = exitX - entryX;
  minVisibleX = -left;            // fully visible range
  maxVisibleX = screen - left - width;
}
measure();
window.addEventListener("resize", measure);

// True when part of the truck is out of view (and the screen is wide enough to show it all)
function offScreen() {
  return minVisibleX <= maxVisibleX && (x < minVisibleX || x > maxVisibleX);
}

let x = 0;                // current offset from the truck's Figma position
let velocity = 0;
let direction = 1;
let lastInput = -Infinity;
let lastFrame = 0;
let running = false;

function onInput(dir) {
  if (dir === 0) return;
  direction = dir > 0 ? 1 : -1;
  lastInput = performance.now();
  if (!running) {
    running = true;
    lastFrame = lastInput;
    requestAnimationFrame(frame);
  }
}

function frame(now) {
  const dt = Math.min((now - lastFrame) / 1000, 0.05);
  lastFrame = now;

  const scrolling = now - lastInput < IDLE_MS;
  // Keep driving after scrolling stops until the truck is fully back on screen
  const driving = scrolling || offScreen();
  const target = driving ? direction * SPEED : 0;
  velocity += (target - velocity) * Math.min(1, dt * EASE);

  x += velocity * dt;
  if (x > exitX) x -= cycle;
  if (x < entryX) x += cycle;
  truck.style.transform = `translateX(${x}px)`;

  if (driving || Math.abs(velocity) > 0.5) {
    requestAnimationFrame(frame);
  } else {
    velocity = 0;
    running = false;
  }
}

// Wheel / trackpad (fires even when the page has nothing left to scroll)
window.addEventListener("wheel", (e) => onInput(Math.sign(e.deltaY)), { passive: true });

// Touch: finger moving up = scrolling down
let touchY = null;
window.addEventListener("touchstart", (e) => { touchY = e.touches[0].clientY; }, { passive: true });
window.addEventListener("touchmove", (e) => {
  const y = e.touches[0].clientY;
  if (touchY !== null) onInput(Math.sign(touchY - y));
  touchY = y;
}, { passive: true });

// Keyboard scrolling
const KEY_DIRECTIONS = { ArrowDown: 1, PageDown: 1, " ": 1, End: 1, ArrowUp: -1, PageUp: -1, Home: -1 };
window.addEventListener("keydown", (e) => {
  if (e.key in KEY_DIRECTIONS) onInput(KEY_DIRECTIONS[e.key]);
});

// Page scroll (scrollbar drags, or once content is added below the hero)
let lastScrollY = window.scrollY;
window.addEventListener("scroll", () => {
  onInput(Math.sign(window.scrollY - lastScrollY));
  lastScrollY = window.scrollY;
}, { passive: true });
