var fs = require('fs');
const bcrypt = require('bcrypt');
var models = require('./models');

models.sequelize.sync({force: true}).then(function() {

    fs.readFile('./songs.json', function(err, data) {
        var song_data = JSON.parse(data);
        var songs = song_data['songs'];

        songs.forEach(function(song) {
            models.Songs.create({
                title: song.title,
                album: song.album,
                artist: song.artist,
                duration: song.duration,
            });
        });
    });

    fs.readFile('./playlists.json', function(err, data) {
        var playlist_data = JSON.parse(data);
        var playlists = playlist_data['playlists'];

        playlists.forEach(function(playlist) {
            models.Playlist.create({
                name: playlist.name
            }).then(function(inst) {
                for (i = 0; i < playlist.songs.length; i++) {
                    playlist.songs[i] += 1;
                }
                inst.setSongs(playlist.songs);
            });
        });
    });

    fs.readFile('./users.json', function(err, data) {
        var user_data = JSON.parse(data);
        var users = user_data['users'];

        users.forEach(function(user) {
            bcrypt.hash(user.password, 10, function(err, hash) {
                models.User.create({
                    username: user.username,
                    password: hash
                }).then(function(inst) {
                    inst.setPlaylists(user.playlists);
                });
            });
        });
    });
});
