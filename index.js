/* global $ */ // Make Cloud9 happy about jquery junk.

var API_URL = 'https://api.instagram.com/v1/tags/search';
var QUERY_HISTORY = null;
var NEXT_PAGE_TOKEN = null;
var PREV_PAGE_TOKEN = null;
var RESULT_HTML_TEMPLATE = (
  '<div class="result">' +
    '<img class="js-thumbnail"><br>' +
    '<div class="result-info">' +
    	'<h2><a class="js-result-title" href="" target="_blank"></a></h2>' +
    	'<p class="result-channel-date">By <a class="js-channel" href="" target="_blank"></a> on <span class="js-date"></span></p>' +
    	'<span class="js-description"></span>' +
    '</div>' +
  '</div>'
);

function getDataFromApi(searchTerm, callback, page) {
  var query = {
    q: searchTerm,
    access_token: '5574247135.de4dc3c.19d7fe308e5145c4b2a9d83c233c3242',
    // token_type: 'bearer',
    scope: 'public_content'
  }
  QUERY_HISTORY = searchTerm;
  $.getJSON(API_URL, query, callback);
}

function renderResult(result) {
  var template = $(RESULT_HTML_TEMPLATE);
  template.find(".js-result-title").text(result.title).attr("href", result.url);
  template.find(".js-channel").text(result.primary_artist.name).attr("href", result.primary_artist.url);
  template.find(".js-description").text(result.full_title);
  template.find(".js-thumbnail").attr("src", result.header_image_thumbnail_url);
  return template;
}

function displayData(data) {
	console.log('API RESPONSE: \n');
	console.dir(data);
	var results = data.response.hits.map(function(item, index) {
				return renderResult(item.result);
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
	
}

function watchButtons() {
	$('.login-button').click(function(){
		window.location.href = "https://api.instagram.com/oauth/authorize/?client_id=de4dc3c2635a47d7baa749ec8c1ccaa1&redirect_uri=https://sloanstewart.io/instlanta/search.html&response_type=token&scope=public_content";
	});

	$('.js-search-form').submit(function(event) {
		event.preventDefault();
		var queryTarget = $(event.currentTarget).find('.js-query');
		var query = queryTarget.val();
		// clear out the input
		queryTarget.val("");
		// clear out search results
		$('.js-search-results').empty();
		getDataFromApi(query, displayData);
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