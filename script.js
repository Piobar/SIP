let map;

const initCoordinates = {lang: 54.3654997, long: 18.6438682}
const center = new google.maps.LatLng(initCoordinates.lang, initCoordinates.long);

let geocoder = new google.maps.Geocoder();
let infowindow = new google.maps.InfoWindow();

let directionsService = new google.maps.DirectionsService();
let directionsDisplay = new google.maps.DirectionsRenderer();

function init() {
    const mapOptions = {
        zoom: 13,
        center: center,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directions_panel'));

    detectUserLocation();
    addLocations();
}


function detectUserLocation() {
    if(!navigator.geolocation) {
        alert('Geolocation not supported');
    }
    navigator.geolocation.getCurrentPosition((position) =>{
        const userLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
        geocoder.geocode( { 'latLng': userLocation }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK) {
                document.getElementById('start').value = results[0].formatted_address;
            }
        });

    }, () => {
        alert('Geolocation is supported, but it failed');
    });
}


function addLocations() {
    getLocations('get_locations.php', (locations) => {
        locations = JSON.parse(locations.responseText);
        const selectBox = document.getElementById('destination');
        locations.forEach((location) => {
            displayLocation(location);
            addOption(selectBox, location.name, location.address);
        })
    });
}

function displayLocation(location) {
    const content = '<div class="infoWindow"><strong>'  + location.name + '</strong>'
        + '<br/><strong> Adres: </strong>'     + location.address
        + '<br/><strong> Kuchnia '             + location.cuisine + '</strong>'
        + '<br/><strong> Opis: </strong>'      + location.description
        + '<br/><strong> Godziny otwarcia: : </strong>'     + location.openingHours
        + '<br/><strong> Ceny: </strong>'     + location.price                            + '</div>';
    const position = new google.maps.LatLng(parseFloat(location.lat), parseFloat(location.lon));
    const marker = new google.maps.Marker({
        map: map,
        position: position,
        title: location.name
    });

    google.maps.event.addListener(marker, 'click', () => {
        infowindow.setContent(content);
        infowindow.open(map,marker);
    });

}

function addOption(selectBox, text, value) {
    const option = document.createElement("OPTION");
    option.text = text;
    option.value = value;
    selectBox.options.add(option);
}

function calculateRoute() {
    let start = document.getElementById('start').value;
    let destination = document.getElementById('destination').value;
    if (!start) {
        start = center;
    }
    const payload = {
        origin: start,
        destination: destination,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    };
    directionsService.route(payload, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
        } else {
            alert('Przykro mi, nie udalo sie wyznaczyc trasy')
        }
    });
}

function getLocations(url, callback) {
    const request = new XMLHttpRequest();
    request.onreadystatechange = () => {
        const doneRequestState = 4
        if (request.readyState === doneRequestState && request.status === 200) {
            callback(request);
        }
    }
    request.open("GET", url, true);
    request.send();
}