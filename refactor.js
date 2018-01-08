var apiMap, apiAutocomplete, activeMarkers;

var UIController = (function () {
    var DOMStrings = {
        pacInput: 'pac-input',
        googleMap: 'map',
        whereFind: '.where-find'
    };

    return {
        getDOMStrings: function () {
            return DOMStrings;
        },
        addListItem: function (item) {
            var html, element;
            html = '<a href="#" class="list-group-item list-group-item-action">%element%</a></br>';
            html = html.replace('%element%', item);
            document.querySelector(DOMStrings.whereFind).insertAdjacentHTML('beforeend', html);
        },
        clearListItems: function () {
            document.querySelector(DOMStrings.whereFind).innerHTML = '';
        }
    }

})();

var APIController = (function (UICtrl) {
    var SEARCH_URL, KEY, locations, DOMStrings;

    SEARCH_URL = "https://maps.googleapis.com/maps/api/geocode/json?address=%address%&key=";
    KEY = "AIzaSyCmaRQlYZVBXcdtveM8UvXHMVddBWX-vuU";

    DOMStrings = UICtrl.getDOMStrings();

    var Address = function (description, lat, lng) {
        this.description = description;
        this.lat = lat;
        this.lng = lng;
    }

    var starterLocation = new Address("PORTO ALEGRE", -30.0472079, -51.2191031);

    function getUserLocation() {
        navigator.geolocation.getCurrentPosition(success, error);
    }

    function success(pos) {
        APIctrl.moveCenterTo({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
        });
    }

    function error(err) {
        console.log("location not available...");
    }

    function searchLocation() {
        var addresses, place, city, URL;
        
        place = apiAutocomplete.getPlace();
        if (!place.geometry) {
            console.log("address not selected...");
            return;
        }
        clearMarkers();

        city = locateAddresses(place.name.toUpperCase());

        if (city.length > 0) {

            city[0].addresses.forEach(element => {
                URL = SEARCH_URL.replace("%address%", element.address);
                URL += KEY;
                fetch(URL)
                .then(result => result.json())
                .then(function (data) {
                    // 1: get the addresses coordinates 
                    address = new Address(element.address, data.results[0].geometry.location.lat, data.results[0].geometry.location.lng)
                    console.log(address);
                    addMarker(address);
                }); 
            });

        } else {
            console.log("no nearby places...");
        }        
    }

    function centerLocations() {
        var markerBounds = new google.maps.LatLngBounds();
        
        if (activeMarkers) {
            activeMarkers.forEach(marker => {
                var point = new google.maps.LatLng(marker.position.lat(), marker.position.lng());
                markerBounds.extend(point);
            });

            apiMap.fitBounds(markerBounds);
        }        
    }

    function clearMarkers() {
        UICtrl.clearListItems();
        if (activeMarkers) {    
            activeMarkers.forEach(marker => {
                marker.setMap(null);
            });        
            activeMarkers = [];
        }
    }

    function addMarker(address) {            
        if (!activeMarkers) {
            activeMarkers = []
        }

        var marker = new google.maps.Marker({
            position: {
                lat: address.lat,
                lng: address.lng
            },
            map: apiMap
        });       

        // push to array markers
        activeMarkers.push(marker); 
        // add item to UI
        UICtrl.addListItem(address.description);
        // update map center
        centerLocations();
    }

    function locateAddresses(city) {
        return locations.locations.filter(obj => obj.city === city);
    }

    function loadLocations() {
        fetch('locations.json')
        .then(result => result.json())
        .then(function (data) {
            locations = data;
        });
    }

    return {
        initMap: function () {
            // initialize map
            apiMap = new google.maps.Map(document.getElementById(DOMStrings.googleMap), {
                center: {
                    lat: starterLocation.lat,
                    lng: starterLocation.lng
                },
                zoom: 12,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });

            // initialize auto-complete
            var input = document.getElementById(DOMStrings.pacInput);
            apiAutocomplete = new google.maps.places.Autocomplete(input);
            apiAutocomplete.bindTo('bounds', apiMap);
            // bind event on place changed
            apiAutocomplete.addListener('place_changed', searchLocation);            
        },
        init: function() {
            console.log("app starded...");
            loadLocations(); // load pre defined locations
        }           
    };

})(UIController);

APIController.init();