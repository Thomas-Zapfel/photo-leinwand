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
let image = new Image();
let scale = 1;
let posX = 0, posY = 0;
let dragging = false;
let startX, startY;
let shape = 'octagon'; // Standard: Achteck

// Formularelemente
const firstNameInput = document.getElementById('first-name');
const lastNameInput = document.getElementById('last-name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');

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
                draw(); // Canvas neu zeichnen
            };
        };
        reader.readAsDataURL(file);
    } else {
        console.warn("Kein Bild hochgeladen.");
    }
});

// Funktion zum Zeichnen des Bildes
function draw() {
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
    ctx.translate(posX, posY);
    ctx.scale(scale, scale);
    if (image) {
        ctx.drawImage(image, 0, 0);
    }

    ctx.restore();
}

// Validierung der Formulareingaben
function validateForm() {
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{8,}$/;

    if (!firstName || !lastName) {
        alert("Bitte Vorname und Nachname eingeben.");
        return false;
    }

    if (!email && !phone) {
        alert("Bitte entweder eine E-Mail-Adresse oder Telefonnummer eingeben.");
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
sendButton.addEventListener('click', () => {
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
                to_email: "zapfel92@gmail.com",
                first_name: firstNameInput.value.trim(),
                last_name: lastNameInput.value.trim(),
                email: emailInput.value.trim(),
                phone: phoneInput.value.trim(),
                attachment: dataUrl,
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
