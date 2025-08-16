document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initGlobe();
    initMap();
    initGauges();
    loadPollutionData();
});
    // Add Eco Lens button handler
    document.getElementById('scan-ar').addEventListener('click', () => {
        window.location.href = 'ar.html'; // Matches existing AR page link
    
});

function initGlobe() {
    const globeContainer = document.getElementById('earth-globe');
    if (!globeContainer) return;

    // Clear previous renderer if exists
    while (globeContainer.firstChild) {
        globeContainer.removeChild(globeContainer.firstChild);
    }

    const globe = new ThreeGlobe()
        .globeImageUrl('assets/earth_texture.jpg')
        .showAtmosphere(true)
        .atmosphereColor(0x87ceeb) // Light blue atmosphere
        .atmosphereAltitude(0.25);

    // Add more data points
const pollutionData = [
    { lat: 40.71, lng: -74.01, value: 85 },   // NYC
    { lat: 34.05, lng: -118.24, value: 120 }, // LA
    { lat: 51.51, lng: -0.13, value: 65 },    // London
    { lat: 35.68, lng: 139.77, value: 45 },   // Tokyo
    { lat: 28.61, lng: 77.21, value: 150 },   // Delhi
    { lat: 55.75, lng: 37.62, value: 90 },    // Moscow
    { lat: -33.87, lng: 151.21, value: 40 },  // Sydney
    { lat: -23.55, lng: -46.63, value: 110 }, // São Paulo
    { lat: 19.43, lng: -99.13, value: 130 },  // Mexico City
    { lat: 39.90, lng: 116.40, value: 180 },  // Beijing
    { lat: 48.85, lng: 2.35, value: 70 },     // Paris
    { lat: 1.35, lng: 103.82, value: 60 },    // Singapore
    { lat: 41.90, lng: 12.50, value: 55 },    // Rome
    { lat: 37.77, lng: -122.42, value: 95 },  // San Francisco
    { lat: 52.52, lng: 13.40, value: 80 }     // Berlin
];
    
    // Add arcs between cities for visual effect
const arcsData = pollutionData.map((city, i, arr) => {
    if (i === 0) return null;
    return {
        startLat: arr[i - 1].lat,
        startLng: arr[i - 1].lng,
        endLat: city.lat,
        endLng: city.lng,
        color: ['#00ffea', '#ff00ea', '#ffea00'][i % 3]
    };
}).filter(Boolean);

globe
    .pointsData(pollutionData)
    .pointAltitude(0.15)
    .pointRadius(0.5)
    .pointColor(d => d.value > 100 ? '#ff0000' : '#ffcc00')
    .arcsData(arcsData)
    .arcColor('color')
    .arcAltitude(0.3)
    .arcStroke(2)
    .arcDashLength(0.4)
    .arcDashGap(0.1)
    .arcDashInitialGap(() => Math.random())
    .arcDashAnimateTime(2000);

    const scene = new THREE.Scene();
    scene.background = null; // Transparent background
    
    // Add stars background
    const stars = new THREE.BufferGeometry();
    const starVertices = [];
    for (let i = 0; i < 1000; i++) {
        starVertices.push(
            THREE.MathUtils.randFloatSpread(2000),
            THREE.MathUtils.randFloatSpread(2000),
            THREE.MathUtils.randFloatSpread(2000)
        );
    }
    stars.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1 });
    const starField = new THREE.Points(stars, starMaterial);
    scene.add(starField);
    
    scene.add(globe);
    scene.add(new THREE.AmbientLight(0x333333));
    scene.add(new THREE.DirectionalLight(0xffffff, 0.8));

    const camera = new THREE.PerspectiveCamera(75, globeContainer.clientWidth / globeContainer.clientHeight, 0.1, 1000);
    camera.position.z = 350;

    const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true
    });
    renderer.setSize(globeContainer.clientWidth, globeContainer.clientHeight);
    globeContainer.appendChild(renderer.domElement);

    function animate() {
        requestAnimationFrame(animate);
        globe.rotation.y += 0.002;
        renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = globeContainer.clientWidth / globeContainer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(globeContainer.clientWidth, globeContainer.clientHeight);
    });
}

function initMap() {
    const map = L.map('pollution-map').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    // Example marker
    L.circle([40.71, -74.01], { color: 'yellow', radius: 50000 }).addTo(map)
        .bindPopup('New York AQI: 85');
    L.circle([34.05, -118.24], { color: 'orange', radius: 50000 }).addTo(map)
        .bindPopup('Los Angeles AQI: 120');
    L. circle([51.51, -0.13], { color: 'yellow', radius: 50000 }).addTo(map)
        .bindPopup('London AQI: 65');
    L.circle([35.68, 139.77], { color: 'green', radius: 50000 }).addTo(map)
        .bindPopup('Tokyo AQI: 45');
    L.circle([28.61, 77.21], { color: 'red', radius: 50000 }).addTo(map)
        .bindPopup('Delhi AQI: 150');
    L.circle([55.75, 37.62], { color: 'yellow', radius: 50000 }).addTo(map)
        .bindPopup('Moscow AQI: 90');
    L.circle([-33.87, 151.21], { color: 'green', radius: 50000 }).addTo(map)
        .bindPopup('Sydney AQI: 40');
    L.circle([-23.55, -46.63], { color: 'orange', radius: 50000 }).addTo(map)
        .bindPopup('São Paulo AQI: 110');
    L.circle([19.43, -99.13], { color: 'orange', radius: 50000 }).addTo(map)
        .bindPopup('Mexico City AQI: 130');
    L.circle([39.90, 116.40], { color: 'red', radius: 50000 }).addTo(map)
        .bindPopup('Beijing AQI: 180');
    L.circle([48.85, 2.35], { color: 'yellow', radius: 50000 }).addTo(map)
        .bindPopup('Paris AQI: 70');
    L.circle([1.35, 103.82], { color: 'yellow', radius: 50000 }).addTo(map)
        .bindPopup('Singapore AQI: 60');
    L.circle([41.90, 12.50], { color: 'lightcoral', radius: 50000 }).addTo(map)
        .bindPopup('Rome AQI: 55');
    L.circle([37.77, -122.42], { color: 'yellow', radius: 50000 }).addTo(map)
        .bindPopup('San Francisco AQI: 95');
    L.circle([52.52, 13.40], { color: 'yellow', radius: 50000 }).addTo(map)
        .bindPopup('Berlin AQI: 80');
    L.circle([-26.2041, 28.0473], { color: 'orange', radius: 50000 }).addTo(map) // Johannesburg
    .bindPopup('Johannesburg AQI: 102 (Moderate)');
    L.circle([-33.9249, 18.4241], { color: 'green', radius: 50000 }).addTo(map) // Cape Town
    .bindPopup('Cape Town AQI: 65 (Moderate)');
    L.circle([-29.8587, 31.0218], { color: 'yellow', radius: 50000 }).addTo(map) // Durban
    .bindPopup('Durban AQI: 95 (Moderate)');
    L.circle([30.0444, 31.2357], { color: 'red', radius: 50000 }).addTo(map) // Cairo, Egypt
    .bindPopup('Cairo AQI: 156 (Unhealthy)');
L.circle([-1.2921, 36.8219], { color: 'yellow', radius: 50000 }).addTo(map) // Nairobi, Kenya
    .bindPopup('Nairobi AQI: 89 (Moderate)');
L.circle([6.5244, 3.3792], { color: 'orange', radius: 50000 }).addTo(map) // Lagos, Nigeria
    .bindPopup('Lagos AQI: 142 (Unhealthy)');
L.circle([-4.0435, 39.6682], { color: 'yellow', radius: 50000 }).addTo(map) // Mombasa, Kenya
    .bindPopup('Mombasa AQI: 97 (Moderate)');
L.circle([-33.4534, -70.6603], { color: 'yellow', radius: 50000 }).addTo(map) // Santiago, Chile (bonus)
    .bindPopup('Santiago AQI: 78 (Moderate)');
L.circle([-15.3875, 28.3228], { color: 'orange', radius: 50000 }).addTo(map) // Lusaka, Zambia
    .bindPopup('Lusaka AQI: 105 (Unhealthy for Sensitive Groups)');
L.circle([-6.7924, 39.2083], { color: 'orange', radius: 50000 }).addTo(map) // Dar es Salaam, Tanzania
    .bindPopup('Dar es Salaam AQI: 112 (Unhealthy for Sensitive Groups)');

}

function initGauges() {
    // AQI Gauge
    const aqiGaugeDiv = document.getElementById('aqi-gauge');
    aqiGaugeDiv.innerHTML = '';
    const aqiCanvas = document.createElement('canvas');
    aqiCanvas.width = 200;
    aqiCanvas.height = 120;
    aqiGaugeDiv.appendChild(aqiCanvas);
    window.aqiGauge = new Gauge(aqiCanvas).setOptions({
        angle: 0,
        lineWidth: 0.3,
        radiusScale: 1,
        pointer: { length: 0.6, strokeWidth: 0.035, color: '#000' },
        colorStart: '#4caf50',
        colorStop: '#f44336',
        strokeColor: '#e0e0e0',
        generateGradient: true,
        highDpiSupport: true
    });
    window.aqiGauge.maxValue = 300;
    window.aqiGauge.setMinValue(0);
    window.aqiGauge.animationSpeed = 32;
    window.aqiGauge.set(85);

    // Water Gauge
    const waterGaugeDiv = document.getElementById('water-gauge');
    waterGaugeDiv.innerHTML = '';
    const waterCanvas = document.createElement('canvas');
    waterCanvas.width = 200;
    waterCanvas.height = 120;
    waterGaugeDiv.appendChild(waterCanvas);
    window.waterGauge = new Gauge(waterCanvas).setOptions({
        angle: 0,
        lineWidth: 0.3,
        radiusScale: 1,
        pointer: { length: 0.6, strokeWidth: 0.035, color: '#000' },
        colorStart: '#2196f3',
        colorStop: '#00bcd4',
        strokeColor: '#e0e0e0',
        generateGradient: true,
        highDpiSupport: true
    });
    window.waterGauge.maxValue = 100;
    window.waterGauge.setMinValue(0);
    window.waterGauge.animationSpeed = 32;
    window.waterGauge.set(72);
}
async function loadPollutionData() {
  try {
    const res = await fetch("https://eco-guardian.onrender.com/api/predictions", {
      method: "POST"
    });
    if (!res.ok) throw new Error("Failed to fetch data from backend");
    const data = await res.json();
    updateDashboard(data);
  } catch (err) {
    console.error("Error fetching predictions:", err);

    // Fallback to demo data if backend fails
    const demoData = {
      aqi: [62, 65, 68, 64, 63],
      water: "Good quality - 6.8pH (Low contaminant levels)",
      chart: [62, 65, 68, 64, 63]
    };
    updateDashboard(demoData);
  }
}

function updateDashboard(data) {
  // Update AQI display
  document.getElementById('aqi-prediction').textContent = 
    Array.isArray(data.aqi) ? data.aqi[0] : data.aqi;
  
  // Update water quality display
  document.getElementById('water-prediction').textContent = data.water;
  
  // Update gauges
  if (window.aqiGauge && typeof data.chart?.[0] === 'number') {
    window.aqiGauge.set(data.chart[0]);
  }
  
  // Update chart
  if (data.chart) {
    updateChart(data.chart);
  }
}

document.getElementById('carbon-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    showLoading();
    
    const transport = document.getElementById('transport').value;
    const diet = document.getElementById('diet').value;
    const resultDiv = document.getElementById('carbon-result');
    const suggestionsDiv = document.getElementById('ai-suggestions');

    // Simple calculation for demo
    let footprint = 0;
    if (transport === 'car') footprint += 12;
    else if (transport === 'electric') footprint += 4;
    else if (transport === 'public') footprint += 3;
    else footprint += 0;

    if (diet === 'meat-heavy') footprint += 10;
    else if (diet === 'balanced') footprint += 7;
    else if (diet === 'vegetarian') footprint += 4;
    else footprint += 2;

    resultDiv.innerHTML = `
        <h5>Your Estimated Daily Carbon Footprint</h5>
        <div class="footprint-value">${footprint} kg CO₂</div>
    `;

    // Fetch AI suggestions
    try {
        const res = await fetch('/api/suggestions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transport, diet })
        });
        
        if (!res.ok) throw new Error('API request failed');
        
        const data = await res.json();
        if (data.suggestions) {
            suggestionsDiv.innerHTML = `
                <h5>AI Suggestions</h5>
                <ul>${data.suggestions.map(s => `<li>${s}</li>`).join('')}</ul>
            `;
        } else {
            suggestionsDiv.textContent = "No suggestions available.";
        }
    } catch (err) {
        console.error('Failed to fetch suggestions:', err);
        suggestionsDiv.textContent = "Could not load suggestions. Please try again later.";
    }
});

function updateChart(chartData) {
    const ctx = document.getElementById('prediction-canvas').getContext('2d');
    if (window.predictionChart) {
        window.predictionChart.data.datasets[0].data = chartData;
        window.predictionChart.update();
        return;
    }
    window.predictionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
            datasets: [{
                label: 'AQI Forecast',
                data: chartData,
                backgroundColor: 'rgba(46,125,50,0.2)',
                borderColor: 'rgba(46,125,50,1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function showLoading() {
  const aqiDisplay = document.getElementById('aqi-display');
  if (aqiDisplay) {
    aqiDisplay.innerHTML = '<div class="loader"></div>';
  }
}
// Enhanced Product Database with consistent CO₂ formatting
const productDatabase = {
  bottle: {
    name: "Plastic Water Bottle",
    recyclability: "75% (Only 30% actually recycled)",
    co2: "82g CO₂ per bottle",  // Added CO₂ for consistency
    alternatives: [
      "Use a reusable bottle (saves 167 bottles/year)",
      "Choose aluminum cans (60% lower impact)",
      "Recycle properly - rinse and remove labels"
    ]
  },
  // ... (keep other products the same with CO₂ formatting) ...
};

function showDemoResult(productType) {
  const product = productDatabase[productType];
  
  // Update results display
  document.getElementById('result-title').textContent = product.name;
  document.getElementById('recyclability').textContent = `Recyclability: ${product.recyclability}`;
  document.getElementById('carbon-impact').textContent = `CO₂ Impact: ${product.co2}`;
  
  // Update alternatives list
  const alternativesList = document.getElementById('alternative-list');
  alternativesList.innerHTML = product.alternatives
    .map(alt => `<li>${alt}</li>`)
    .join('');
  
  // Show results with both animation and smooth scrolling
  document.getElementById('ar-results').style.display = 'block';
  
  // Trigger scanning animation
  const scanner = document.querySelector('.scanning-animation');
  scanner.style.animation = 'none';
  setTimeout(() => {
    scanner.style.animation = 'scan 2s linear';
    document.getElementById('ar-results').scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    });
  }, 10);
}

// Viewport Stabilization (keep this exactly as is)
function stabilizeViewport() {
  document.addEventListener('dblclick', (e) => e.preventDefault(), { 
    passive: false 
  });
  
  setTimeout(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if(viewport) {
      viewport.content = "width=device-width, initial-scale=1.0, " + 
                         "maximum-scale=1.0, user-scalable=no, " +
                         "shrink-to-fit=no";
    }
    if(/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      document.body.style.zoom = "1";
    }
  }, 500);
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('ar-results').style.display = 'none';
  stabilizeViewport();
});