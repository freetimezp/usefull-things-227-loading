// ───────── Sparks Background ─────────
const body = document.body;
for (let i = 0; i < 40; i++) {
    const spark = document.createElement("span");
    spark.classList.add("spark");
    spark.style.left = `${Math.random() * 100}vw`;
    spark.style.top = `${Math.random() * 100}vh`;
    spark.style.animationDelay = `${Math.random() * 3}s`;
    spark.style.animationDuration = `${2 + Math.random() * 3}s`;
    spark.style.background = `radial-gradient(circle, ${Math.random() > 0.5 ? "#00f5ff" : "#ff00f7"}, transparent)`;
    body.appendChild(spark);
}

// ───────── Audio Setup ─────────
const audio = document.getElementById("cyberAudio");
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const context = new AudioCtx();
const src = context.createMediaElementSource(audio);
const analyser = context.createAnalyser();

src.connect(analyser);
analyser.connect(context.destination);
analyser.fftSize = 256;

const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
const letters = document.querySelectorAll("ul li");

let active = false;
let avgEnergy = 0;

function pulse() {
    if (!active) return;
    requestAnimationFrame(pulse);
    analyser.getByteFrequencyData(dataArray);
    avgEnergy = dataArray.reduce((a, b) => a + b, 0) / bufferLength / 255;

    letters.forEach((li, i) => {
        const intensity = Math.sin(avgEnergy * Math.PI * (i + 1)) * 1.2 + 1;
        li.style.filter = `brightness(${1 + intensity * 0.5}) drop-shadow(0 0 ${10 + intensity * 40}px rgba(0,255,255,${
            0.5 + intensity / 2
        }))`;
        li.style.transform = `scale(${1 + intensity * 0.1}) rotateX(${10 + intensity * 15}deg)`;
    });
}

// ───────── Floating Toggle Button ─────────
const toggleBtn = document.createElement("button");
toggleBtn.classList.add("floating-stop");
toggleBtn.textContent = "Play Audio";
document.body.appendChild(toggleBtn);

// ───────── Flying Motion + Beat Trail ─────────
let x = Math.random() * 90;
let y = Math.random() * 90;
let dx = (Math.random() - 0.5) * 0.6;
let dy = (Math.random() - 0.5) * 0.6;

function flyButton() {
    x += dx;
    y += dy;
    if (x < 5 || x > 95) dx *= -1;
    if (y < 5 || y > 95) dy *= -1;

    toggleBtn.style.left = `${x}vw`;
    toggleBtn.style.top = `${y}vh`;

    // Create beat-reactive trail
    const energy = Math.max(avgEnergy, 0.05);
    const trail = document.createElement("div");
    trail.classList.add("trail");
    const color = energy > 0.3 ? (Math.random() > 0.5 ? "#00f5ff" : "#ff00f7") : "rgba(255,255,255,0.3)";
    trail.style.background = color;
    trail.style.left = `${x + 1}vw`;
    trail.style.top = `${y + 1}vh`;
    trail.style.width = `${8 + energy * 20}px`;
    trail.style.height = `${8 + energy * 20}px`;
    trail.style.filter = `blur(${6 + energy * 20}px) brightness(${1 + energy})`;
    document.body.appendChild(trail);
    setTimeout(() => trail.remove(), 700 + energy * 600);

    requestAnimationFrame(flyButton);
}
flyButton();

// ───────── Play / Stop Toggle ─────────
function toggleAudio() {
    if (!active) {
        if (context.state === "suspended") context.resume();
        audio.play();
        active = true;
        toggleBtn.textContent = "Stop Audio";
        toggleBtn.classList.remove("stopped");
        pulse();
    } else {
        audio.pause();
        context.suspend();
        active = false;
        toggleBtn.textContent = "Play Audio";
        toggleBtn.classList.add("stopped");
    }
}

toggleBtn.addEventListener("click", toggleAudio);
