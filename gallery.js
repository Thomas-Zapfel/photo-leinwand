// Ordner, in dem die Bilder gespeichert sind
const imageFolder = './images';

// Bilddateinamen (kann erweitert werden, falls der Ordner nicht dynamisch durch API geladen werden kann)
const images = [
    'image1.jpg',
    'image2.jpg',
    'image3.jpg',
    'image4.jpg',
];

// Galerie-Container abrufen
const gallery = document.getElementById('gallery');

// Bilder zur Galerie hinzufügen
images.forEach(image => {
    // Bootstrap Card für jedes Bild erstellen
    const col = document.createElement('div');
    col.className = 'col-md-4';

    const card = document.createElement('div');
    card.className = 'card shadow-sm';

    const img = document.createElement('img');
    img.src = `${imageFolder}/${image}`;
    img.alt = `Bild: ${image}`;
    img.className = 'card-img-top';

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    const cardText = document.createElement('p');
    cardText.className = 'card-text text-center';
    cardText.textContent = image;

    // Elemente zusammenfügen
    cardBody.appendChild(cardText);
    card.appendChild(img);
    card.appendChild(cardBody);
    col.appendChild(card);

    // Zur Galerie hinzufügen
    gallery.appendChild(col);
});
