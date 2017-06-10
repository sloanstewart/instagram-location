/* global $ */ // Make Cloud9 happy about jquery junk.

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

function getDataFromApi(query, lat, lng, callback) {
  var query = {
    q: query,
    lat: lat,
    lng: lng,
    distance: 5000,
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
		// clear out the input
		queryTarget.val("");
		// clear out search results
		$('.js-search-results').empty();
		getDataFromApi(query, lat, lng, displayData);
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
function distUpdate(val) {
	var km = 1.60934;
	document.querySelector('#js-dst-val').value = Math.round(val / km);
}

$(document).click(function(event){
	// console.log(event.target);
	if(!$(event.target).closest('.lightbox').length) {
		if($('.ytplayer').is(":visible")) {
			$('.ytplayer').attr("src", "");
        	$('.lightbox').fadeOut();
    	}
    }
        event.stopPropagation(); // Tried to get away without using this to no avail!
});