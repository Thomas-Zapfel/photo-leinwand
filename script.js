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
            image.onload = () => {
                // Berechne die Position, um das Bild zu zentrieren unter Berücksichtigung der Skalierung
                posX = (canvas.width - image.width * scale) / 2; // Horizontal zentrieren
                posY = (canvas.height - image.height * scale) / 2; // Vertikal zentrieren

                draw(); // Bild und Canvas neu zeichnen
            };
        };
        reader.readAsDataURL(file);
    }
});

// Zoom- und Drag-Funktionalität
canvas.addEventListener("wheel", (e) => {
    e.preventDefault();

    // Zoom-Faktor anpassen
    scale += e.deltaY * -0.001;

    // Begrenzung des Zoom-Bereichs (Minimal: 10%, Maximal: 300%)
    scale = Math.min(Math.max(0.1, scale), 3);

    // Berechne die neue Position, um das Bild zentriert zu halten
    posX = (canvas.width - image.width * scale) / 2;
    posY = (canvas.height - image.height * scale) / 2;

    draw(); // Bild neu zeichnen
    console.log(Aktueller Zoom-Faktor: ${Math.round(scale * 100)}%);
});

// Drag-Funktionalität (Verschieben des Bildes)
canvas.addEventListener("mousedown", (e) => {
    startX = e.offsetX - posX;
    startY = e.offsetY - posY;
    dragging = true;
});

canvas.addEventListener("mousemove", (e) => {
    if (dragging) {
        posX = e.offsetX - startX;
        posY = e.offsetY - startY;
        draw(); // Bild neu zeichnen
    }
});

canvas.addEventListener("mouseup", () => {
    dragging = false;
});

// Funktion zum Zeichnen des Bildes
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Achteck-Clip definieren, falls das Achteck ausgewählt wurde
    if (shape === "octagon") {
        ctx.beginPath();
        const offset = 30; // Anpassung für die Form
        const width = canvas.width;
        const height = canvas.height;

        // Achteck definieren (Ecken abgerundet)
        ctx.moveTo(width * 0.25 + offset, 0);
        ctx.lineTo(width * 0.75 - offset, 0);
        ctx.lineTo(width, height * 0.25 + offset);
        ctx.lineTo(width, height * 0.75 - offset);
        ctx.lineTo(width * 0.75 - offset, height);
        ctx.lineTo(width * 0.25 + offset, height);
        ctx.lineTo(0, height * 0.75 - offset);
        ctx.lineTo(0, height * 0.25 + offset);
        ctx.closePath();
        ctx.clip(); // Clip im Achteck
    }

    // Berechne Position und Skalierung basierend auf dem aktuellen Zoom und Bildgröße
    ctx.translate(posX, posY);
    ctx.scale(scale, scale);

    // Bild zeichnen
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

// Bild senden mit adaptiver Qualitätsreduktion und Logging
sendButton.addEventListener("click", () => {
    if (!image.src) {
        alert("Bitte lade ein Bild hoch, bevor du es sendest.");
        return;
    }

    if (!validateForm()) {
        return; // Abbrechen, wenn die Validierung fehlschlägt
    }

    // Startqualität für das Bild
    let quality = 1.0; // 100%
    const minQuality = 0.1; // Minimale Qualität (10%)
    let attempts = 0; // Zähler für die Anzahl der Versuche

    function sendImage() {
        attempts++;
        const dataUrl = canvas.toDataURL("image/jpeg", quality);

        console.log(Versuch #${attempts}: Qualität = ${Math.round(quality * 100)}%);

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
                    console.log(Erfolg bei Versuch #${attempts} mit Qualität ${Math.round(quality * 100)}%.);
                    alert("Bild erfolgreich gesendet!");
                } else {
                    throw new Error(HTTP-Fehler: ${response.status});
                }
            })
            .catch(error => {
                console.error(Fehler beim Senden (Versuch #${attempts}):, error);

                if (quality > minQuality) {
                    // Qualität reduzieren und erneut versuchen
                    quality -= 0.1;
                    quality = Math.max(quality, minQuality); // Sicherstellen, dass Qualität nicht unter minQuality fällt
                    sendImage(); // Erneuter Versuch
                } else {
                    alert("Fehler beim Senden des Bildes. Bitte überprüfe die Konfiguration.");
                    console.error("Maximale Versuche erreicht. Abbruch.");
                }
            });
    }

    sendImage(); // Erste Übertragung starten
});

// Reset-Button-Funktionalität
const resetButton = document.getElementById("reset-button");
resetButton.addEventListener("click", () => {
    // Bild zurücksetzen
    scale = 1;
    posX = 0;
    posY = 0;
    shape = "octagon"; // Standardform zurücksetzen
    shapeInputs[0].checked = true; // Achteck auswählen
    upload.value = ""; // Dateiupload zurücksetzen
    image.src = ""; // Bild entfernen
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Canvas leeren

    // Formularfelder zurücksetzen
    firstNameInput.value = "";
    lastNameInput.value = "";
    emailInput.value = "";
    phoneInput.value = "";

    console.log("Reset durchgeführt.");
});
document.body.appendChild(resetButton);
