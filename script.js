(function () {
    try {
        emailjs.init("hIRsZkp8LV1lJyjLg"); // Benutzer-ID aus EmailJS-Dashboard
        console.log("EmailJS wurde erfolgreich initialisiert.");
    } catch (error) {
        console.error("Fehler bei der Initialisierung von EmailJS:", error);
    }
})();

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const upload = document.getElementById("upload");
const sendButton = document.getElementById("send-button");
const shapeInputs = document.querySelectorAll('input[name="shape"]');
let image = new Image();
let scale = 1;
let posX = 0, posY = 0;
let dragging = false;
let startX, startY;
let shape = "octagon"; // Standard: Achteck

// Formularelemente
const firstNameInput = document.getElementById("first-name");
const lastNameInput = document.getElementById("last-name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");

// Shape-Auswahl (Rechteck oder Achteck)
shapeInputs.forEach(input => {
    input.addEventListener("change", (e) => {
        shape = e.target.value;
        draw(); // Canvas neu zeichnen
    });
});

// Hochladen eines Bildes
upload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            image.src = event.target.result;
            image.onload = () => draw(); // Bild laden und zeichnen
        };
        reader.readAsDataURL(file);
    }
});

// Zoom- und Drag-Funktionalität
canvas.addEventListener("mousedown", (e) => {
    dragging = true;
    startX = e.offsetX - posX;
    startY = e.offsetY - posY;
});

canvas.addEventListener("mousemove", (e) => {
    if (dragging) {
        posX = e.offsetX - startX;
        posY = e.offsetY - startY;
        draw();
    }
});

canvas.addEventListener("mouseup", () => dragging = false);
canvas.addEventListener("mouseleave", () => dragging = false);

canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    scale += e.deltaY * -0.001;
    scale = Math.min(Math.max(0.5, scale), 3); // Limit Zoom
    draw();
});

// Funktion zum Zeichnen des Bildes
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    if (shape === "octagon") {
        // Achteck-Clip definieren
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
        ctx.clip(); // Clip im Achteck
    }

    // Bild zeichnen
    ctx.translate(posX, posY);
    ctx.scale(scale, scale);
    if (image) {
        ctx.drawImage(image, 0, 0);
    }

    ctx.restore();

    // Rahmen für Rechteck
    if (shape === "rectangle") {
        ctx.strokeStyle = "#ccc";
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }
}

// Validierung der Formulareingaben
function validateForm() {
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{8,}$/;

    if (!email && !phone) {
        alert("Bitte entweder eine gültige E-Mail-Adresse oder Telefonnummer eingeben.");
        return false;
    }

    if (email && !emailRegex.test(email)) {
        alert("Bitte eine gültige E-Mail-Adresse eingeben.");
        return false;
    }

    if (phone && !phoneRegex.test(phone)) {
        alert("Bitte eine gültige Telefonnummer eingeben.");
        return false;
    }

    return true;
}

// Bild senden
sendButton.addEventListener("click", () => {
    if (!image.src) {
        alert("Bitte lade ein Bild hoch, bevor du es sendest.");
        return;
    }

    if (!validateForm()) {
        return; // Abbrechen, wenn die Validierung fehlschlägt
    }

    const dataUrl = canvas.toDataURL("image/jpeg", 0.7); // Reduziert die Qualität des Bildes

    fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            service_id: "service_photoLeinwand",
            template_id: "template_photoLeinwand",
            user_id: "hIRsZkp8LV1lJyjLg",
            template_params: {
                first_name: firstNameInput.value.trim() || "", // Optional
                last_name: lastNameInput.value.trim() || "", // Optional
                email: emailInput.value.trim(),
                phone: phoneInput.value.trim(),
                attachment: dataUrl,
            },
        }),
    })
        .then(response => {
            if (response.ok) {
                alert("Bild erfolgreich gesendet!");
            } else {
                throw new Error(HTTP-Fehler: ${response.status});
            }
        })
        .catch(error => {
            console.error("Fehler beim Senden der E-Mail:", error);
            alert("Fehler beim Senden des Bildes. Bitte überprüfe die Konfiguration.");
        });
});
