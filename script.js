(function () {
    try {
        emailjs.init("hIRsZkp8LV1lJyjLg"); // Benutzer-ID aus EmailJS-Dashboard
        console.log("EmailJS wurde erfolgreich initialisiert.");
    } catch (error) {
        console.error("Fehler bei der Initialisierung von EmailJS:", error);
    }
})();

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const upload = document.getElementById('upload');
const sendButton = document.getElementById('send-button');
const contactInfoInput = document.getElementById('contact-info');
let image = new Image();
let scale = 1;
let posX = 0, posY = 0;
let dragging = false;
let startX, startY;
let shape = 'octagon'; // Standard: Achteck

// Buttons für die Auswahl der Form
document.getElementById('rectangle-btn').addEventListener('click', () => {
    if (image.src) {
        shape = 'rectangle'; // Rechteck
        console.log("Rechteckige Form ausgewählt.");
        draw(); // Canvas neu zeichnen
    } else {
        alert("Bitte lade zuerst ein Bild hoch!");
    }
});

document.getElementById('octagon-btn').addEventListener('click', () => {
    if (image.src) {
        shape = 'octagon'; // Achteck
        console.log("Achteckige Form ausgewählt.");
        draw(); // Canvas neu zeichnen
    } else {
        alert("Bitte lade zuerst ein Bild hoch!");
    }
});

// Hochladen eines Bildes
upload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        console.log("Bild hochgeladen:", file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
            image.src = event.target.result;
            console.log("Bild erfolgreich geladen.");
            image.onload = () => {
                console.log("Bild vollständig geladen. Start des Zeichnens.");
                draw(); // Canvas neu zeichnen, wenn das Bild geladen ist
            };
        };
        reader.readAsDataURL(file);
    } else {
        console.warn("Kein Bild hochgeladen.");
    }
});

// Canvas Event-Listener für Drag & Drop
canvas.addEventListener('mousedown', (e) => {
    dragging = true;
    startX = e.offsetX - posX;
    startY = e.offsetY - posY;
});

canvas.addEventListener('mousemove', (e) => {
    if (dragging) {
        posX = e.offsetX - startX;
        posY = e.offsetY - startY;
        draw();
    }
});

canvas.addEventListener('mouseup', () => dragging = false);
canvas.addEventListener('mouseleave', () => dragging = false);

// Zoom
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    scale += e.deltaY * -0.001;
    scale = Math.min(Math.max(0.5, scale), 3); // Limit Zoom
    console.log("Zoom-Level:", scale);
    draw();
});

// Funktion zum Zeichnen des Bildes
function draw() {
    console.log("Zeichne Bild mit Position:", { posX, posY, scale });
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    if (shape === 'octagon') {
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
    ctx.save();
    ctx.translate(posX, posY);
    ctx.scale(scale, scale);
    if (image) {
        ctx.drawImage(image, 0, 0);
    }
    ctx.restore();

    ctx.restore();
}

// Funktion zur Validierung von E-Mail und Telefonnummer
function isValidContactInfo(contactInfo) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // E-Mail-Format
    const phoneRegex = /^\d{8,}$/; // Mindestens 8 Ziffern, nur Zahlen

    return emailRegex.test(contactInfo) || phoneRegex.test(contactInfo);
}

// Bild senden
sendButton.addEventListener('click', () => {
    if (!image.src) {
        alert("Bitte lade ein Bild hoch, bevor du es sendest.");
        return;
    }

    const contactInfo = contactInfoInput.value.trim();
    if (!isValidContactInfo(contactInfo)) {
        alert("Bitte gib eine gültige E-Mail-Adresse oder Telefonnummer ein.");
        return;
    }

    const dataUrl = canvas.toDataURL("image/jpeg", 0.7); // Reduziert die Qualität des Bildes
    console.log("Canvas-Daten (Base64):", dataUrl.slice(0, 50) + "..."); // Ausgabe eines Teils der Daten

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
                to_email: "zapfel92@gmail.com", // Ziel-E-Mail
                from_contact: contactInfo,      // Kontaktinfo des Benutzers
                attachment: dataUrl,           // Bilddaten
            },
        }),
    })
    .then(response => {
        if (response.ok) {
            console.log("E-Mail erfolgreich gesendet.");
            alert("Bild erfolgreich gesendet!");
        } else {
            throw new Error(`HTTP-Fehler: ${response.status}`);
        }
    })
    .catch(error => {
        console.error("Fehler beim Senden der E-Mail:", error);
        alert("Fehler beim Senden des Bildes. Bitte überprüfe die Konfiguration.");
    });
});
