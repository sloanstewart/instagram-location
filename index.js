/* global $ */ // Make Cloud9 happy about jquery junk.

// GOOGLE MAP MAGIC!
// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.
var map;
var marker = null;
var radius = null;
function initMap() {
    
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
        if (radius != null){
            radius.setMap(null);
        }
        radius = new google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 0,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            map: map,
            center: location,
            radius: Number($('.js-radius').val())
         });
         console.log(radius.radius);
    }
}
// NOW LEAVING GOOGLE MAP MAGIC!

var API_URL = 'https://api.instagram.com/v1/media/search';
var QUERY_HISTORY = null;
var NEXT_PAGE_TOKEN = null;
var PREV_PAGE_TOKEN = null;
var RESULT_HTML_TEMPLATE = (
  '<div class="result">' +
  	'<div class="js-user-info">' +
  		'<a class="js-profile-picture" href="" target="_blank"></a><a class="js-username" href="" target="_blank"></a>' +
    '</div>' +
    '<div class="js-image" href="" target="_blank"></div>' +
    '<div class="result-info">' +
    	'<span class="js-description"></span>' +
    	'<p class="result-date"><span class="js-date"></span></p>' +
    '</div>' +
  '</div>'
);

function getDataFromApi(query, lat, lng, rad, callback) {
  var query = {
    q: query,
    lat: lat,
    lng: lng,
    distance: rad,
    access_token: '5574247135.de4dc3c.19d7fe308e5145c4b2a9d83c233c3242',
    scope: 'public_content'
  };
  // $.getJSON(API_URL, query, callback);
  $.ajax({
	  dataType: "jsonp", //must do this for the Instagram API to work via client side
	  url: API_URL,
	  data: query,
	  success: callback
	});
	QUERY_HISTORY = query;
}

function renderResult(result) {
  var template = $(RESULT_HTML_TEMPLATE);
  var date = new Date(parseInt(result.created_time, 10)*1000);
  template.find(".js-profile-picture").html('<img class="profile-thumbnail" src='+result.user.profile_picture+'>').attr("href", 'https://www.instagram.com/'+result.user.username);
  template.find(".js-username").text(result.user.username).attr("href", 'https://www.instagram.com/'+result.user.username);
	template.find(".js-date").text((date.getMonth()+1)+"/"+date.getDate()+"/"+date.getFullYear());
	if (result.type === 'video'){
		template.find(".js-image").html("<video controls loop class=video width=100% type=video/mp4 poster='"+result.images.standard_resolution.url+"' src='"+result.videos.standard_resolution.url+"'></video>");
	}
	else {
		template.find(".js-image").html('<a href="'+result.link+'" target="_blank"><img src="'+result.images.standard_resolution.url+'"></a>');
	}
  if (result.caption != null){
  	template.find(".js-description").text(result.caption.text);
  }
  return template;
}

function displayData(data) {
	if (data.data.length !== 0){
		console.log('API RESPONSE: \n');
		console.dir(data);
		var results = data.data.map(function(item, index) {
				return renderResult(item);
		});
		$('.js-search-results').append(results);
		// store page tokens to be used with buttons
		NEXT_PAGE_TOKEN = data.nextPageToken;
		PREV_PAGE_TOKEN = data.prevPageToken;
		// if the tokens are stored, enable the buttons
		if(NEXT_PAGE_TOKEN){$('.js-nextpage').prop('disabled', false);}
		if(PREV_PAGE_TOKEN !== (null || undefined))
			{$('.js-prevpage').prop('disabled', false);}
		else{$('.js-prevpage').prop('disabled', true);}
		$('.video').click(function(){this.paused?this.play():this.pause();});
	}
	else {
		console.error('No good data found!');
	}
	
}

function watchButtons() {
	$('.login-button').click(function(){
		window.location.href = "https://api.instagram.com/oauth/authorize/?client_id=de4dc3c2635a47d7baa749ec8c1ccaa1&redirect_uri=https://sloanstewart.io/instlanta/search.html&response_type=token&scope=public_content";
	});

function scrollToResults(){
		$('html, body').animate({
		scrollTop: $('.js-search-results').offset().top
		},1000);
}

	$('.js-search-form').submit(function(event) {
		event.preventDefault();
		var queryTarget = $(event.currentTarget).find('.js-query');
		var query = queryTarget.val();
		var lat = $(event.currentTarget).find('.js-lat').val();
		var lng = $(event.currentTarget).find('.js-lng').val();
		var rad = $(event.currentTarget).find('.js-radius').val();
		// clear out the input
		queryTarget.val("");
		// clear out search results
		$('.js-search-results').empty();
		getDataFromApi(query, lat, lng, rad, displayData);
		scrollToResults();
	});
  	$('.js-nextpage').unbind().click(function(){
		console.log('[More Results]');
		getDataFromApi(QUERY_HISTORY, displayData, NEXT_PAGE_TOKEN);
	});
 	$('.js-prevpage').unbind().click(function(){
		console.log('[Previous Results]');
		getDataFromApi(QUERY_HISTORY, displayData, PREV_PAGE_TOKEN);
		PREV_PAGE_TOKEN = null;
	});
}

$(watchButtons);
function radiusUpdate(val) { // Displays radius value as miles
	var miles = Math.round(val * 0.000621371); // one mile in meters
	$('#js-radius-val').val(miles);
	radius.setRadius(Number(val));
}