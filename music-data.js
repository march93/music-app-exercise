window.MUSIC_DATA = {
    "playlists": [],
    "songs": []
};

var songsLoaded = false;
var playlistsLoaded = false;

// Run application
var runApp = function() {
    if (songsLoaded == true && playlistsLoaded == true) {
        $("body").show();
    } else {
        $("body").hide();
    }
}
//runApp();

// Get songs via AJAX
var songAjax = function() {
    $.ajax({
        method: 'GET',
        contentType: 'application/json',
        url: '/api/songs',
        dataType: 'json',
        cache: true,
        success: function (data){
        	//console.log(data);
            var songArray = data;
            window.MUSIC_DATA['songs'] = songArray;
            songsLoaded = true;
            getSongs();
            runApp();
        }
    });
}

//Get playlists via AJAX
var playlistAjax = function() {
    $.ajax({
        method: 'GET',
        contentType: 'application/json',
        url: '/api/playlists',
        dataType: 'json',
        cache: true,
        success: function (data){
        	//console.log(data);
            var playlistArray = data;
            window.MUSIC_DATA['playlists'] = playlistArray;
            playlistsLoaded = true;
            getPlaylists();
            runApp();
        }
    });
}

songAjax();
playlistAjax();

// SORT FUNCTION
var sortFunc = function(attr) {
	return function(a,b) {
		if (a[attr].substring(0,4).toUpperCase() == "THE ") {
			if (b[attr].substring(0,4).toUpperCase() == "THE ") {
				if (a[attr].substring(4).toUpperCase() > b[attr].substring(4).toUpperCase()) {
					return 1;
				} else if (a[attr].substring(4).toUpperCase() < b[attr].substring(4).toUpperCase()) {
					return -1;
				} else {
					return 0;
				}
			} else {
				if (a[attr].substring(4).toUpperCase() > b[attr].toUpperCase()) {
					return 1;
				} else if (a[attr].substring(4).toUpperCase() < b[attr].toUpperCase()) {
					return -1;
				} else {
					return 0;
				}
			}
		} else {
			if (b[attr].substring(0,4).toUpperCase() == "THE ") {
				if (a[attr].toUpperCase() > b[attr].substring(4).toUpperCase()) {
					return 1;
				} else if (a[attr].toUpperCase() < b[attr].substring(4).toUpperCase()) {
					return -1;
				} else {
					return 0;
				}
			} else {
				if (a[attr].toUpperCase() > b[attr].toUpperCase()) {
					return 1;
				} else if (a[attr].toUpperCase() < b[attr].toUpperCase()) {
					return -1;
				} else {
					return 0;
				}
			}
		}
	};
}

// SORT BY ARTIST BY DEFAULT
window.MUSIC_DATA.songs.sort(sortFunc("artist"));

// GENERATE ALL SONGS DYNAMICALLY
var songsGenerate = document.getElementById("songs-click");
var generateSongs = '';

var getSongs = function() {
    generateSongs = '';
	for (i = 0; i < window.MUSIC_DATA.songs.length; i++) {
		songTitle = window.MUSIC_DATA.songs[i].title;
		songArtist = window.MUSIC_DATA.songs[i].artist;
        songID = window.MUSIC_DATA.songs[i].id;
		generateSongs += '<div class="playlists-category-songs" onclick="songActions(event, ' + songID + ')"><span class="glyphicon glyphicon-picture playlists-songs-icon" aria-hidden="true"></span><div class="playlists-song-info"><span class="playlists-song-title">' + songTitle + '</span><span class="playlists-song-artist">' + songArtist + '</span></div><div class="all-songs-play"><span class="glyphicon glyphicon-play all-songs-list song-play" aria-hidden="true"></span><span class="glyphicon glyphicon-plus-sign all-songs-list song-add" aria-hidden="true"></span></div></div></div>';
    }
	songsGenerate.innerHTML = generateSongs;
}

// GENERATE PLAYLISTS DYNAMICALLY
var playlistGenerate = document.getElementById("playlist-click");
var playlistModal = document.getElementsByClassName("modal-body")[0];
var playlistModalTitle = $('.modal-title');

var getPlaylists = function() {
	for (i = 0; i < window.MUSIC_DATA.playlists.length; i++) {
		playlistName = window.MUSIC_DATA.playlists[i].name;
        playlistID = window.MUSIC_DATA.playlists[i].id
		playlistGenerate.innerHTML += '<div class="playlists-category" onclick="playlistSongs(event, ' + playlistID + ')"><span class="glyphicon glyphicon-picture playlists-category-icon" aria-hidden="true"></span><div class="playlists-category-title">' + playlistName + '</div><span class="glyphicon glyphicon-chevron-right playlists-category-right" aria-hidden="true"></span></div>';
	}
}

var getPlaylistsModal = function() {
    for (i = 0; i < window.MUSIC_DATA.playlists.length; i++) {
        playlistName = window.MUSIC_DATA.playlists[i].name;
        playlistID = window.MUSIC_DATA.playlists[i].id
        playlistModal.innerHTML += '<p onclick="playlistModalAdd(' + playlistID + ')">' + playlistName + '</p>';
    }
}

/*

	***** NAV SECTION *****

*/

// SET VARIABLES
var libraryTab = document.getElementsByClassName("nav-tabs-a")[0];
var playlistsTab = document.getElementsByClassName("nav-tabs-a")[1];
var searchTab = document.getElementsByClassName("nav-tabs-a")[2];
var songsSection = document.getElementsByClassName("all-songs")[0];
var playlistsSection = document.getElementsByClassName("playlists")[0];
var searchSection = document.getElementsByClassName("search-page")[0];
var modal = document.querySelector("#myModal");
var closeButton = document.querySelector(".close");
var songSet = document.querySelector(".playlist-songs");
var playlistHeading = document.querySelector(".playlist-songs-heading");
var playlistSongList = document.querySelector("#playlist-song-click");
var searchSection = document.querySelector(".search-page");
var curPlaylistID; 

// SET DEFAULT TAB WHEN OPENING TO BE LIBRARY
libraryTab.className = "nav-tabs-a active";

// CLICKING LIBRARY TAB
var libraryTabClick = function() {
    stateObj = { foo: "library" };
	libraryTab.className = "nav-tabs-a active";
	playlistsTab.className = "nav-tabs-a";
	searchTab.className = "nav-tabs-a";
	songsSection.className = "all-songs";
	playlistsSection.className = "hidden";
	searchSection.className = "hidden";
	songSet.className = "hidden";
	searchSection.className = "hidden";
    history.replaceState(stateObj, "library", "/library");
};
libraryTab.addEventListener('click', libraryTabClick, false);

// CLICKING PLAYLISTS TAB
var playlistsTabClick = function() {
    stateObj = { foo: "playlist" }; 
	libraryTab.className = "nav-tabs-a";
	playlistsTab.className = "nav-tabs-a active";
	searchTab.className = "nav-tabs-a";
	songsSection.className = "hidden";
	playlistsSection.className = "playlists";
	searchSection.className = "hidden";
	myModal.className = "modal fade";
	songSet.className = "hidden";
	searchSection.className = "hidden";
    history.replaceState(stateObj, "playlists", "/playlists");
};
playlistsTab.addEventListener('click', playlistsTabClick, false);

// CLICKING SEARCH TAB
var searchTabClick = function() {
    stateObj = { foo: "search" };
	libraryTab.className = "nav-tabs-a";
	playlistsTab.className = "nav-tabs-a";
	searchTab.className = "nav-tabs-a active";
	songsSection.className = "hidden";
	playlistsSection.className = "hidden";
	searchSection.className = "search-page";
	songSet.className = "hidden";
	myModal.className = "modal fade";
	searchSection.className = "search-page";
    history.replaceState(stateObj, "search", "/search");
};
searchTab.addEventListener('click', searchTabClick, false);

if (window.location.href.indexOf('/playlists') > -1) {
    playlistsTabClick();
} else if (window.location.href.indexOf('/library') > -1) {
    libraryTabClick();
} else if (window.location.href.indexOf('/search') > -1) {
    searchTabClick();
}

/*

	***** LIBRARY SECTION *****

*/

// SORT BY ARTIST
var artistSort = document.querySelector("#artist-sort");
artistSort.className = "btn all-songs-sort-pressed";

var sortByArtist = function() {
	artistSort.className = "btn all-songs-sort-pressed";
	titleSort.className = "btn";

	window.MUSIC_DATA.songs.sort(sortFunc("artist"));
	songsGenerate.innerHTML = '';
	getSongs();
}
artistSort.addEventListener("click", sortByArtist, false);

// SORT BY TITLE
var titleSort = document.querySelector("#title-sort");

var sortByTitle = function() {
	titleSort.className = "btn all-songs-sort-pressed";
	artistSort.className = "btn";

	window.MUSIC_DATA.songs.sort(sortFunc("title"));
	songsGenerate.innerHTML = '';
	getSongs();
}
titleSort.addEventListener("click", sortByTitle, false);

// ADD SONG TO PLAYLIST
var addSongID;

var songActions = function(e, index){
	addSongID = index;

	if (e.target.className == "glyphicon glyphicon-plus-sign all-songs-list song-add") {
        playlistModal.innerHTML = '';
        playlistModalTitle[0].innerHTML = "Choose Playlist";
        getPlaylistsModal();

		// Show Modal
		myModal.className = "modal-visible fade";
	}
}

// ADD SONG TO PLAYLIST
var playlistModalAdd = function(index) {
    playlistGenerate.innerHTML = '';
    playlistModal.innerHTML = '';
    myModal.className = "modal fade";
    var addSongToPlaylist = { song: addSongID };

    $.ajax({
        method: 'POST',
        contentType: 'application/json',
        url: '/api/playlists/' + index,
        data: JSON.stringify(addSongToPlaylist),
        cache: true,
        success: function (data){
            playlistGenerate.innerHTML = '';
            playlistAjax();
            $(".playlist-form").hide();
        },
        error: function(errMsg) {
            console.log(errMsg);
        }
    });
};

closeButton.addEventListener("click", function() {
	myModal.className = "modal fade";
}, false);

/*

	***** PLAYLISTS SECTION *****

*/

// DISPLAY MODAL WITH ALL USERS
var displayUserModal = function() {
    playlistModal.innerHTML = '';
    playlistModalTitle[0]. innerHTML = 'Choose User';
    var displayUsers = '';

    $.ajax({
        method: 'GET',
        contentType: 'application/json',
		url: '/api/users/',
        dataType: 'json',
		cache: true,
		success: function(data) {
            for (i = 0; i < data.users.length; i++) {
                displayUsers += '<p onclick="userPlaylistAdd(' + data.users[i].id + ')">' + data.users[i].username + '</p>';
            }
            playlistModal.innerHTML = displayUsers;

		},
		error: function(errMsg) {
			console.log(errMsg);
		}
    });

    playlistModal.innerHTML = displayUsers;

    // Show Modal
    myModal.className = "modal-visible fade";
};

// ADD USER TO PLAYLIST
var userPlaylistAdd = function(id) {
    $.ajax({
        method: 'POST',
        contentType: 'application/json',
        url: '/api/playlists/' + curPlaylistID + '/users',
        data: JSON.stringify({'user': id}),
        cache: true,
        success: function(data) {

        },
        error: function(errMsg) {
            console.log(errMsg);
        }
    });

    // Close Modal
    myModal.className = "modal fade";
}

// GET LIST OF SONGS BELONGING TO A PLAYLIST
var playlistSongs = function(e, playlistID) {
	if (e != null) {
		var parentID = e.currentTarget.parentNode.id;
	}

	var playlistSongsGenerate = '';
    var playlistIndex;
    curPlaylistID = playlistID;

    for (i = 0; i < window.MUSIC_DATA.playlists.length; i++) {
        if (window.MUSIC_DATA.playlists[i].id == playlistID) {
            playlistIndex = i;
        }
    }

	if (parentID == "search-playlist") {
		libraryTab.className = "nav-tabs-a";
		playlistsTab.className = "nav-tabs-a active";
		searchTab.className = "nav-tabs-a";
		searchSection.className = "hidden";
	}

	playlistSongList.innerHTML = '';

	playlistHeading.innerHTML = window.MUSIC_DATA.playlists[playlistIndex].name;

	for (i = 0; i < window.MUSIC_DATA.playlists[playlistIndex].Songs.length; i++) {
		songID = window.MUSIC_DATA.playlists[playlistIndex].Songs[i].id;

		for (j = 0; j < window.MUSIC_DATA['songs'].length; j++) {
			if (window.MUSIC_DATA.songs[j].id == songID) {
				songTitle = window.MUSIC_DATA.songs[j].title;
				songArtist = window.MUSIC_DATA.songs[j].artist;
				playlistSongsGenerate += '<div class="playlists-category-songs" onclick="songActions(event, ' + songID + ')"><span class="glyphicon glyphicon-picture playlists-songs-icon" aria-hidden="true"></span><div class="playlists-song-info"><span class="playlists-song-title">' + songTitle + '</span><span class="playlists-song-artist">' + songArtist + '</span></div><div class="all-songs-play"><span class="glyphicon glyphicon-play all-songs-list song-play" aria-hidden="true"></span><span class="glyphicon glyphicon-plus-sign all-songs-list song-add" aria-hidden="true"></span><span onclick="songDelete(' + playlistID + ', ' + songID + ')" class="glyphicon glyphicon-remove-sign all-songs-list" aria-hidden="true"></span></div></div></div>';
			}
		}
	}

	playlistSongList.innerHTML = playlistSongsGenerate;
	songSet.className = "playlist-songs";
	playlistsSection.className = "playlists hidden";
};

// DELETE SONG FROM PLAYLIST
var songDelete = function(playlistIndex, songID) {
	var sendDeleteData = { song: songID };
	$.ajax({
		method: 'DELETE',
		contentType: 'application/json',
		url: '/playlists/' + playlistIndex,
		data: JSON.stringify(sendDeleteData),
		cache: true,
		success: function(data) {
			playlistGenerate.innerHTML = '';
            playlistAjax();
            playlistSongs(null, playlistIndex);
		},
		error: function(errMsg) {
			console.log(errMsg);
		}
	});
};

$(".playlist-btn-add").click(function() {
    $(".playlist-form").show();
});

$(".playlist-form-submit").click(function() {
    if ($(".playlist-form-text").val() == '') {
        alert("Please enter a non-empty playlist name!");
    } else {
        stateObj = { foo: "api/playlist" };
        history.replaceState(stateObj, "api/playlists", "/api/playlists");
        var sendPlaylistData = { name: $(".playlist-form-text").val() };

        $.ajax({
            method: 'POST',
            contentType: 'application/json',
            url: '/api/playlists',
            data: JSON.stringify(sendPlaylistData),
            cache: true,
            success: function (data){
                window.MUSIC_DATA['playlists'].push(JSON.parse(data));
                playlistGenerate.innerHTML = '';
                playlistModal.innerHTML = '';
                playlistAjax();
                $(".playlist-form").hide();
            },
            error: function(errMsg) {
                console.log(errMsg);
            }
        });
    }
});

$(".playlist-close-form").click(function() {
    $(".playlist-form").hide();
})

/*

	***** SEARCH SECTION *****

*/

var searchBar = document.querySelector(".search-input");
var filterPlaylists = document.getElementById("search-playlist");
var filterSongs = document.getElementById("search-songs");

// Filter through
var searchFilter = function () {
	filterPlaylists.innerHTML = '';
	filterSongs.innerHTML = '';
	var input = searchBar.value.toUpperCase();
	var searchGenerate = '';

	if (input == '') {
		filterPlaylists.innerHTML = '';
		filterSongs.innerHTML = '';
	} else {
		for (i = 0; i < window.MUSIC_DATA.playlists.length; i++) {
			if (window.MUSIC_DATA.playlists[i].name.toUpperCase().includes(input)) {
				playlistName = window.MUSIC_DATA.playlists[i].name;
				searchGenerate += '<div class="playlists-category" onclick="playlistSongs(event, ' + i + ')"><span class="glyphicon glyphicon-picture playlists-category-icon" aria-hidden="true"></span><div class="playlists-category-title">' + playlistName + '</div><span class="glyphicon glyphicon-chevron-right playlists-category-right" aria-hidden="true"></span></div>';	
			}
		}
		for (i = 0; i < window.MUSIC_DATA.songs.length; i++) {
			songTitle = window.MUSIC_DATA.songs[i].title;
			songArtist = window.MUSIC_DATA.songs[i].artist;
			songID = window.MUSIC_DATA.songs[i].id;
			if (songTitle.toUpperCase().includes(input) || songArtist.toUpperCase().includes(input)) {
				searchGenerate += '<div class="playlists-category-songs" onclick="songActions(event, ' + songID + ')"><span class="glyphicon glyphicon-picture playlists-songs-icon" aria-hidden="true"></span><div class="playlists-song-info"><span class="playlists-song-title">' + songTitle + '</span><span class="playlists-song-artist">' + songArtist + '</span></div><div class="all-songs-play"><span class="glyphicon glyphicon-play all-songs-list song-play" aria-hidden="true"></span><span class="glyphicon glyphicon-plus-sign all-songs-list song-add" aria-hidden="true"></span></div></div></div>';
			}
		}
	}
	filterPlaylists.innerHTML = searchGenerate;
}
searchBar.addEventListener("keyup", searchFilter);
