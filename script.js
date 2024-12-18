// script.js
(function () {
    try {
        emailjs.init("hIRsZkp8LV1lJyjLg");
        console.log("EmailJS initialisiert.");
    } catch (error) {
        console.error("Fehler bei der Initialisierung von EmailJS:", error);
    }
})();

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const upload = document.getElementById("upload");
const sendButton = document.getElementById("send-button");
const shapeInputs = document.querySelectorAll('input[name="shape"]');
const loadingIndicator = document.getElementById("loading-indicator");

let image = new Image();
let scale = 1, posX = 0, posY = 0, dragging = false, startX, startY;
let shape = "octagon";

// Event: Form-Validierung und Bild senden
sendButton.addEventListener("click", async () => {
    if (!image.src) {
        alert("Bitte lade ein Bild hoch.");
        return;
    }
    if (!validateForm()) return;

    loadingIndicator.style.display = "block";
    try {
        await sendImage();
        alert("Bild erfolgreich gesendet!");
    } catch (error) {
        console.error(error);
        alert("Fehler beim Senden.");
    } finally {
        loadingIndicator.style.display = "none";
    }
});

// Event: Bild hochladen
upload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        image.src = event.target.result;
        image.onload = draw;
    };
    reader.readAsDataURL(file);
});

// Form-Validierung
function validateForm() {
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{8,}$/;

    if (!email && !phone) {
        alert("Bitte E-Mail oder Telefonnummer angeben.");
        return false;
    }
    if (email && !emailRegex.test(email)) {
        alert("Ungültige E-Mail-Adresse.");
        return false;
    }
    if (phone && !phoneRegex.test(phone)) {
        alert("Ungültige Telefonnummer.");
        return false;
    }
    return true;
}

// Bild senden
async function sendImage() {
    const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            service_id: "service_photoLeinwand",
            template_id: "template_photoLeinwand",
            user_id: "hIRsZkp8LV1lJyjLg",
            template_params: {
                first_name: document.getElementById("first-name").value.trim(),
                last_name: document.getElementById("last-name").value.trim(),
                email: document.getElementById("email").value.trim(),
                phone: document.getElementById("phone").value.trim(),
                attachment: dataUrl,
            },
        }),
    });

    if (!response.ok) throw new Error(`HTTP-Fehler: ${response.status}`);
}

// Canvas-Zeichnung
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    if (shape === "octagon") {
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.25, 0);
        ctx.lineTo(canvas.width * 0.75, 0);
        ctx.lineTo(canvas.width, canvas.height * 0.25);
        ctx.lineTo(canvas.width, canvas.height * 0.75);
        ctx.lineTo(canvas.width * 0.75, canvas.height);
        ctx.lineTo(canvas.width * 0.25, canvas.height);
        ctx.lineTo(0, canvas.height * 0.75);
        ctx.lineTo(0, canvas.height * 0.25);
        ctx.closePath();
        ctx.clip();
    }
    ctx.translate(posX, posY);
    ctx.scale(scale, scale);
    ctx.drawImage(image, 0, 0);
    ctx.restore();
}
