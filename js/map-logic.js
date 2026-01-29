// Map Logic for GeoAccess
// Uses Leaflet.js and PapaParse

document.addEventListener('DOMContentLoaded', () => {
    
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT4z6uYBc3K5jsgJjmVvAMRI0wi442FfRJwQXx9hhVjZpeDj0Fi_khDT8wjbN8Z0J9LhuwQM6vzIagN/pub?output=csv'; 

    const jogjaCenter = [-7.8256, 110.4595]; 
    const initialZoom = 9.5; 
    // ---------------------
    const map = L.map('map').setView(jogjaCenter, initialZoom);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    var slopeLayer = L.tileLayer('tiles/{z}/{x}/{y}.png', {
        minZoom: 8,   // Match the min zoom you set in QGIS
        maxZoom: 15,  // Match the max zoom you set in QGIS
        opacity: 1, // Adjust transparency so you can see the map underneath
        tms: false,   // Try setting to true if the tiles appear in the wrong place/upside down
        attribution: 'Slope Data Export'
    }).addTo(map);

    // 2. Fetch Data in the background
    function getColor(className) {
        switch (className) {
            case '0 (Non Bambu)': return '#3b82f6'; 
            case '1 (Bambu)': return '#10b981'; 
            default:  return '#6366f1'; 
        }
    }

    Papa.parse(csvUrl, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            console.log("Data loaded for Yogyakarta area...");
            
            results.data.forEach((row) => {
                const lat = Number(row.lat);
                const lng = Number(row.long);
                const ID = String(row.ID);

                if (!isNaN(lat) && !isNaN(lng)) {
                    // Construct Popup
                    const markerColor = getColor(row.class);

                    const popupContent = `
                        <div style="min-width: 160px;">
                            <strong>ID:</strong> ${row.ID || 'No ID'}<br>
                            <strong>Class:</strong> ${row.class || 'No Class'}<br>
                            <img src="${row.photo}" class="popup-img" alt="Photo" 
                                style="width:100%; margin-top:5px; border-radius:4px;">
                        </div>
                    `;

                    L.circleMarker([lat, lng], {
                        radius: 8,
                        fillColor: markerColor,
                        color: "#ffffff", // White border
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.9
                    })
                    .bindPopup(popupContent)
                    .addTo(map);
                }
            });

            console.log("All points placed. View remains at Yogyakarta.");
        }
    });

    const legend = L.control({position: 'topright'});

    legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'legend');
        
        // Header for the legend
        div.innerHTML = '<h4>Legenda</h4>'
        ;
        
        // Define your classes and colors
        const items = [
            { label: 'Bambu', color: '#10b981' },    // Emerald Green
            { label: 'Non-Bambu', color: '#3b82f6' } // Bright Blue
        ];

        // Loop through items and add them to the legend
        items.forEach(item => {
            div.innerHTML += `
                <div>
                    <i style="background: ${item.color}"></i>
                    <span>${item.label}</span>
                </div>
            `;
        });

        return div;
    };

    legend.addTo(map);

    var overlayMaps = {
        "Slope": slopeLayer
    };

    // Add the control to the map
    L.control.layers(null, overlayMaps, {
        collapsed: false // Set to true if you want the menu to stay closed by default
    }).addTo(map);
});
