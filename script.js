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
const paymentInputs = document.querySelectorAll('input[name="payment-method"]');
const paypalButtonContainer = document.getElementById("paypal-button-container");

let image = new Image();
let scale = 1;
let posX = 0, posY = 0;
let shape = "octagon"; // Standardform

// Bild hochladen
upload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            image.src = event.target.result;
            image.onload = draw;
        };
        reader.readAsDataURL(file);
    }
});

// Canvas zeichnen
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    if (shape === "octagon") {
        ctx.beginPath();
        ctx.moveTo(100, 0);
        ctx.lineTo(300, 0);
        ctx.lineTo(400, 100);
        ctx.lineTo(400, 300);
        ctx.lineTo(300, 400);
        ctx.lineTo(100, 400);
        ctx.lineTo(0, 300);
        ctx.lineTo(0, 100);
        ctx.closePath();
        ctx.clip();
    }
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    ctx.restore();
}

// Stripe Zahlungsfunktion
async function handleStripePayment(dataUrl) {
    const stripe = Stripe("DEIN_STRIPE_PUBLIC_KEY");
    const response = await fetch("/create-payment-intent", { method: "POST" });
    const { clientSecret } = await response.json();

    const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
            card: {
                number: "4242424242424242",
                exp_month: 12,
                exp_year: 2025,
                cvc: "123",
            },
        },
    });

    if (result.error) {
        alert(`Stripe Fehler: ${result.error.message}`);
    } else if (result.paymentIntent.status === "succeeded") {
        alert("Zahlung erfolgreich über Stripe abgeschlossen.");
        sendImage(dataUrl); // Bild senden
    }
}

// PayPal Zahlungsfunktion
function handlePayPalPayment(dataUrl) {
    paypal.Buttons({
        createOrder: () => {
            return fetch("/create-paypal-order", { method: "POST" }).then(res => res.json()).then(order => order.id);
        },
        onApprove: (data) => {
            return fetch(`/capture-paypal-order/${data.orderID}`, { method: "POST" }).then(() => {
                alert("Zahlung erfolgreich über PayPal abgeschlossen.");
                sendImage(dataUrl); // Bild senden
            });
        },
        onError: (err) => {
            alert(`PayPal Fehler: ${err.message}`);
        },
    }).render("#paypal-button-container");
}

// Bild senden Funktion
function sendImage(dataUrl) {
    fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            service_id: "service_photoLeinwand",
            template_id: "template_photoLeinwand",
            user_id: "hIRsZkp8LV1lJyjLg",
            template_params: {
                first_name: document.getElementById("first-name").value,
                last_name: document.getElementById("last-name").value,
                email: document.getElementById("email").value,
                phone: document.getElementById("phone").value,
                attachment: dataUrl,
            },
        }),
    })
        .then((res) => res.ok ? alert("Bild erfolgreich gesendet!") : alert("Fehler beim Senden des Bildes"))
        .catch((err) => console.error("Fehler:", err));
}

// Zahlung und Bild senden
sendButton.addEventListener("click", () => {
    const selectedPayment = document.querySelector('input[name="payment-method"]:checked').value;
    const dataUrl = canvas.toDataURL("image/jpeg");

    if (selectedPayment === "stripe") {
        handleStripePayment(dataUrl);
    } else if (selectedPayment === "paypal") {
        handlePayPalPayment(dataUrl);
        paypalButtonContainer.style.display = "block"; // Zeige PayPal Button
    }
});
