

    var currentYear = moment().format('YYYY');
    console.log(currentYear);
    for (i = 1895; i <= currentYear; i++) {
        $('#movie-year').append('<option>' + i + '</option>');
    }


function loadSavedMusic() {
    var storedSearches = localStorage.getItem('savedSearches');
    var savedSongs = localStorage.getItem('savedSongs');
    if (storedSearches) {
        $('#no-saved-searches').attr('style','display: none');
        $('#searched-songs').append(storedSearches);
    }
    if (savedSongs) {
        $('#no-saved-songs').attr('style','display: none');
        $('#saved-songs').append(savedSongs);
    }
}


function movieSearch() {

$('#soundtrack').empty();    

var movie = $('#searchBar').val();
var movieYear = $('select').val();

if (movieYear == 'Select Year (optional)') {

    

    var movieSearchURL = "https://imdb-api.com/en/API/SearchMovie/k_dd9jqywu/" + encodeURIComponent(movie);

} else {
    var movieSearchURL = "https://imdb-api.com/en/API/SearchMovie/k_dd9jqywu/" + encodeURIComponent(movie) + '%20' + movieYear;

};
    
console.log(movieSearchURL);
    $.ajax({
        url: movieSearchURL,
        method: 'GET'
    }).then(function(response) {
    console.log(response);
    if (response.results.length === 0) {
        $('#movie-content').append('<div class="columns"><div class="column"><div class="notification"><div class="notification"><p>No results could be found.</p></div></div></div>');
    } else {
    var movieInfo = {
        title: response.results[0].title,
        poster: response.results[0].image,
        id: response.results[0].id
  
    }
    var imdbFullActorSearchURL = "https://imdb-api.com/en/API/Title/k_dd9jqywu/" + movieInfo.id + "/FullActor,FullCast";


    $.ajax({
        url: imdbFullActorSearchURL,
        method: "GET"
    }).then(function(response){
        console.log(response);
        var castAndCrewInfo = {
            stars: response.stars,
            director: response.directors,
            composer: response.fullCast.others[1].items[0].name,
            year: response.year
        }
        $('#movie-content').attr('style','display: initial;');
        $('#movie-poster').attr('src', movieInfo.poster);
        $('#movie-title').text(movieInfo.title);
        $('#release-year').text(castAndCrewInfo.year);
        $('#composer').text(castAndCrewInfo.composer);
        $('#starring').text(castAndCrewInfo.stars);
        $('#director').text(castAndCrewInfo.director);
    

//Need to remove special characters from the title returned from imdb to prevent issues with the itunes search

var movieTitleWithoutColon = movieInfo.title.replace(/:/g,"");
var movieTitleWithoutHyphen = movieTitleWithoutColon.replace(/-/g,"");
var movieTitleEncoded = encodeURIComponent(movieTitleWithoutHyphen);
var movieTitleWithPlus = movieTitleEncoded.replace(/%20/g,"+");
console.log(movieTitleEncoded);
console.log(movieTitleWithPlus);
var soundtrackURL = 'https://itunes.apple.com/search?term=' + movieTitleWithPlus + '+soundtrack&entity=album';
 
console.log(soundtrackURL);

$.ajax({ //third ajax call returns any albums related to the movie along with soundtrack info
    url: soundtrackURL,
    jsonp: "callback",
    dataType: "jsonp"
}).then(function(response){
    console.log(response);
    if (response.resultCount == 0) {
        console.log("No results found");
        $('#soundtrack').append('<div class="notification is-dark"><p class="is-size-4">No soundtrack could be found.</p></div>');
    } else {
    for (i = 0; i < response.resultCount; i++) {
        console.log(response.results[i]);
        var genre = response.results[i].primaryGenreName;
        var albumRelease = response.results[i].releaseDate;
        var albumYear = albumRelease.substr(0,4);
        console.log(albumYear);
        if (albumYear == castAndCrewInfo.year) {
            var soundtrackInfo = {
            albumName: response.results[i].collectionName,
            albumID: response.results[i].collectionId,
            albumURL: response.results[i].collectionViewUrl,
            };
            i = response.resultCount;
            console.log(soundtrackInfo);
            var tracklistURL = 'https://itunes.apple.com/lookup?id=' + soundtrackInfo.albumID + '&entity=song'
            $.ajax({
                url: tracklistURL,
                jsonp: "callback",
                dataType: "jsonp"
            }).then(function(response){
                $('#soundtrack').append('<div class="notification is-dark"><h3 class="has-text-weight-bold is-size-4">Soundtrack Title:</h3><p class="is-size-4">' + soundtrackInfo.albumName + '</p></div><div class="notification is-dark"><div class="content"><p><b>Tracklist</b> | Click the link to access Apple Music</p><ol type="1" id="tracklist"></ol></div></div>')
                for (i = 1; i < response.results[0].trackCount; i++) {
                    var track = {
                        trackNumber: response.results[i].trackNumber,
                        trackName: response.results[i].trackName,
                        trackURL: response.results[i].trackViewUrl,
                        trackArtist: response.results[i].artistName
                    };
                    console.log(track);

                    $('#tracklist').append('<li><p><a href="' + track.trackURL + '" target="_blank">' + track.trackName + '</a>     <button class="button is-small track" data-trackurl="' + track.trackURL + '" data-trackname="' + track.trackName + '" data-artist="' + track.trackArtist + '">Save</button></p></li>');
                }
                $('#no-saved-searches').attr('style','display: none');
                $('#searched-songs').append('<a href="' + soundtrackInfo.albumURL + '" class="navbar-item" target="_blank">' + movieInfo.title + '</a>');

                var savedSearches = $('#searched-songs').html();
                localStorage.setItem('savedSearches', savedSearches);
            });


        } 

    }
}



});


    });



    }

});

}

//Event listener to load saved searches and songs

$(document).ready(function() {
    loadSavedMusic();
});


//Event listener to start the search

$('#searchBtn').on('click', function(event) {
    event.preventDefault();
    movieSearch();
});

//Event listener to save individual songs

$(document).on('click', '.track', function() {
    $('#no-saved-songs').attr('style', 'display: none');
    var saveTitle = $(this).attr('data-trackname');
    var saveURL = $(this).attr('data-trackurl');
    $('#saved-songs').append('<a href="' + saveURL + '" class="navbar-item" target="_blank">' + saveTitle + '</a>');
    console.log(saveTitle);
    console.log(saveURL);
    
    
    var savedSongs = $('#saved-songs').html();
    localStorage.setItem('savedSongs', savedSongs);
});
