var gmarkers = [];
var locations = {};

function init() {
    loadJSON(function (response) {
        // Parse JSON string into object
        locations = JSON.parse(response);
    });
}

function locateAddresses(city) {
    document.querySelector(".onde_achar").innerHTML = '';
    var foundAddresses = [];
    for (let index = 0; index < locations.length; index++) {
        const element = locations[index];        
        if (element.cidade === city.toUpperCase()) {
            for (let index2 = 0; index2 < element.enderecos.length; index2++) {
                foundAddresses.push(element.enderecos[index2]);
                var html = '<a href="#" class="list-group-item list-group-item-action">%element%</a>';
                html = html.replace("%element%", element.enderecos[index2].endereco);
                document.querySelector(".onde_achar").insertAdjacentHTML('beforeend', html);
            }
            
        }
    }
    return foundAddresses;
}

function loadJSON(callback) {

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'locations.json', true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

function removeMarkers(){
    for(i=0; i<gmarkers.length; i++){
        gmarkers[i].setMap(null);
    }
}

// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">
function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: -30.0472079,
            lng: -51.2191031
        },
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    var card = document.getElementById('pac-card');
    var input = document.getElementById('pac-input');

    //map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);

    var autocomplete = new google.maps.places.Autocomplete(input);

    // Bind the map's bounds (viewport) property to the autocomplete object,
    // so that the autocomplete requests use the current map bounds for the
    // bounds option in the request.
    autocomplete.bindTo('bounds', map);
/*
    var infowindow = new google.maps.InfoWindow();
    var infowindowContent = document.getElementById('infowindow-content');
    infowindow.setContent(infowindowContent);
    var marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29)
    });
*/
    autocomplete.addListener('place_changed', function () {
        //infowindow.close();
        //marker.setVisible(false);
        removeMarkers();
        var place = autocomplete.getPlace();
        
        if (!place.geometry) {
            // User entered the name of a Place that was not suggested and
            // pressed the Enter key, or the Place Details request failed.
            window.alert("Selecione o endereço desejado abaixo.");
            return;
        }

        // get the selected city addresses
        var x = locateAddresses(place.name);

        var infowindow = new google.maps.InfoWindow();

        var marker, i;
        for (i = 0; i < x.length; i++) {
            

            var Address = function(lat, long){
                this.lat = lat;
                this.long = long;
            };    
            var endereco = x[i].endereco;

            fetch("https://maps.googleapis.com/maps/api/geocode/json?address="+ endereco +"&key=AIzaSyCmaRQlYZVBXcdtveM8UvXHMVddBWX-vuU")
            .then(result => result.json())
            .then(function(data){
                address = new Address(data.results[0].geometry.location.lat, data.results[0].geometry.location.lng)
                console.log(address);

                marker = new google.maps.Marker({
                    position: data.results[0].geometry.location,
                    map: map
                });
                if(i === 0){
                    map.panTo(data.results[0].geometry.location);
                }
                gmarkers.push(marker);
                marker.setVisible(true);
                google.maps.event.addListener(marker, 'click', (function (marker, i) {
                    return function () {
                        infowindow.setContent("test");
                        infowindow.open(map, marker);
                    }
                })(marker, i));
            });            
        }
/*
        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17); // Why 17? Because it looks good.
        }
        marker.setPosition(place.geometry.location);
        marker.setVisible(true);

        var address = '';
        if (place.address_components) {
            address = [
                (place.address_components[0] && place.address_components[0].short_name || ''),
                (place.address_components[1] && place.address_components[1].short_name || ''),
                (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
        }

        infowindowContent.children['place-icon'].src = place.icon;
        infowindowContent.children['place-name'].textContent = place.name;
        infowindowContent.children['place-address'].textContent = address;
        infowindow.open(map, marker);
        */
    });
    
}

init();