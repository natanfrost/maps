var apiMap, apiAutocomplete, activeMarkers;

var APIController = (function() {

    var Address = function(description, lat, lng) {
        this.description = description;
        this.lat = lat;
        this.lng = lng;
    }
    //-30.0472079, -51.2191031
    var starterLocation = new Address("PORTO ALEGRE", 32.6944298, 129.4202433);

    function callBack() {
        console.log("CU");
    }

    return {
        initMap: function() {            
            apiMap = new google.maps.Map(document.getElementById('map'), {
                center: {
                    lat: starterLocation.lat,
                    lng: starterLocation.lng
                },
                zoom: 12,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            }); 
            
            var input = document.getElementById('pac-input');
            
            apiAutocomplete = new google.maps.places.Autocomplete(input);
            apiAutocomplete.bindTo('bounds', apiMap);
    
            apiAutocomplete.addListener('place_changed', callBack);            
        },
        moveCenterTo: function(lat, lng){
            var center = new google.maps.LatLng(lat, lng);
            apiMap.panTo(center);            
        },
        addMarker: function(address) {
            var marker = new google.maps.Marker({
                position: {
                    lat: address.lat,
                    lng: address.lng
                },
                map: apiMap
            });
        }
    };

})();

var UIController = (function() {
    var DOMStrings = {
        pacInput: 'pac-input',
        googleMap: 'map',
        whereFind: '#where-find'
    };
    
    return {
        getDOMStrings: function() {
            return DOMStrings;
        },
        addListItem: function(item) {
            var html, element;            
            html = '<a href="#" class="list-group-item list-group-item-action">%element%</a>';
            html = html.replace('%element%', item.address);
            document.querySelector(DOMStrings.whereFind).insertAdjacentHTML('beforeend', html);
        },        
        clearListItems: function() {
            document.querySelector(DOMStrings.whereFind).innerHTML = '';
        }
    }

})();

var Controller = (function(UIctrl, APIctrl) {

    function getUserLocation() {
        navigator.geolocation.getCurrentPosition(success, error);
    }

    function success(pos) {
        APIctrl.moveCenterTo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    }

    function error(err) {
        console.log("location not available...");
    }
    
    return {
        init: function() {
            console.log("app started...");
            getUserLocation();
        }
    }

})(UIController, APIController);

Controller.init();