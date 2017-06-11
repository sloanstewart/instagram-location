
// GOOGLE MAP MAGIC!

// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.
var map, infoWindow;
function initMap() {
    var marker = null;
    var distRadius = null;
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 33.7700000, lng: -84.3500000}, // Should be close to the center of the universe, er...Atlanta.
      zoom: 10
    });
    infoWindow = new google.maps.InfoWindow;
   
   // This event listener calls addMarker() when the map is clicked.
    google.maps.event.addListener(map, 'click', function(event) {
      addMarker(event.latLng);
      addRadius(event.latLng);
    });
    
    // Deletes previous marker and adds new marker to the map.
    function addMarker(location) {
        if (marker != null){
            marker.setMap(null);
        }
        marker = new google.maps.Marker({
            position: location,
            map: map,
            title: 'dat marker tho'
        });
        marker.setMap(map);
        // Get position of marker and round the lat & lng to numbers that work with Instagram API.
        var lat = parseFloat(Math.round(marker.getPosition().lat() * 100) / 100).toFixed(7);
        var lng = parseFloat(Math.round(marker.getPosition().lng() * 100) / 100).toFixed(7);
        console.log('Marker set at '+lat+','+lng);
        $('.js-lat').val(lat);
        $('.js-lng').val(lng);
    }
    
    function addRadius(location){
        console.info();
        if (distRadius != null){
            distRadius.setMap(null);
        }
        distRadius = new google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 0,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            map: map,
            center: location,
            radius: Number($('.js-dst').val())
         });
    }
}

// NOW LEAVING GOOGLE MAP MAGIC!