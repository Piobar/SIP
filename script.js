var map;


var center = new google.maps.LatLng(54.3654997,18.6438682);

var geocoder = new google.maps.Geocoder();
var infowindow = new google.maps.InfoWindow();

var directionsService = new google.maps.DirectionsService();
var directionsDisplay = new google.maps.DirectionsRenderer();

function init() {

    var mapOptions = {
        zoom: 13,
        center: center,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directions_panel'));

// Detect user location
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {

            var userLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);

            geocoder.geocode( { 'latLng': userLocation }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    document.getElementById('start').value = results[0].formatted_address;
                }
            });

        }, function() {
            alert('Geolocation is supported, but it failed');
        });
    }

    makeRequest('get_locations.php', function(data) {

        var data = JSON.parse(data.responseText);
        var selectBox = document.getElementById('destination');

        for (var i = 0; i < data.length; i++) {
            displayLocation(data[i]);
            addOption(selectBox, data[i]['name'], data[i]['address']);
        }
    });
}

function displayLocation(location) {

    var content =   '<div class="infoWindow"><strong>'  + location.name + '</strong>'
        + '<br/><strong> Adres: </strong>'     + location.address
        + '<br/><strong> Kuchnia '             + location.cuisine + '</strong>'
        + '<br/><strong> Opis: </strong>'      + location.description
        + '<br/><strong> Godziny otwarcia: : </strong>'     + location.openingHours
        + '<br/><strong> Ceny: </strong>'     + location.price                            + '</div>';

    if (parseInt(location.lat) == 0) {
        geocoder.geocode( { 'address': location.address }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {

                var marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location,
                    title: location.name
                });

                google.maps.event.addListener(marker, 'click', function() {
                    infowindow.setContent(content);
                    infowindow.open(map,marker);
                });

                // Save geocoding result to the Database
                var url =   'set_coords.php?id=' + location.id
                + '&amp;lat=' + results[0].geometry.location.lat()
                + '&amp;lon=' + results[0].geometry.location.lng();

                makeRequest(url, function(data) {
                if (data.responseText == 'OK') {
                // Success
                }
                });
            }
        });
    } else {

        var position = new google.maps.LatLng(parseFloat(location.lat), parseFloat(location.lon));
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: location.name
        });

        google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent(content);
            infowindow.open(map,marker);
        });
    }
}

function addOption(selectBox, text, value) {
    var option = document.createElement("OPTION");
    option.text = text;
    option.value = value;
    selectBox.options.add(option);
}

function calculateRoute() {

    var start = document.getElementById('start').value;
    var destination = document.getElementById('destination').value;

    if (start == '') {
        start = center;
    }

    var request = {
        origin: start,
        destination: destination,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    };
    directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
        }
    });
}

function makeRequest(url, callback) {
    var request;
    if (window.XMLHttpRequest) {
        request = new XMLHttpRequest(); // IE7+, Firefox, Chrome, Opera, Safari
    } else {
        request = new ActiveXObject("Microsoft.XMLHTTP"); // IE6, IE5
    }
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            callback(request);
        }
    }
    request.open("GET", url, true);
    request.send();
}