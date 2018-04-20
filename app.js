// Import the http library
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser')
var crypto = require('crypto');
var cookieParser = require('cookie-parser');
var Promise = require('bluebird');
const bcrypt = require('bcrypt');
var models = require('./models');

// Create new express server
var app = express();
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({   // to support URL-encoded bodies
  extended: true
}));
app.use(cookieParser())

app.get('/login', function(request, response) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html');
    response.setHeader('Cache-Control', 'public, max-age=1800');
    response.sendFile(__dirname + '/login.html');
})

app.get('/playlists', function(request, response) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html');
    response.setHeader('Cache-Control', 'public, max-age=1800');

    var id = request.cookies.sessionKey;
    if (id) {
        response.location('/playlists');
        response.sendFile(__dirname + '/playlist.html');
    } else {
        response.location('/login');
        response.redirect('/login');
    }
});

app.get('/library', function(request, response) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html');
    response.setHeader('Cache-Control', 'public, max-age=1800');
    
    var id = request.cookies.sessionKey;
    if (id) {
        response.location('/library');
        response.sendFile(__dirname + '/playlist.html');
    } else {
        response.location('/login');
        response.redirect('/login');
    }
});

app.get('/search', function(request, response) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html');
    response.setHeader('Cache-Control', 'public, max-age=1800');
    
    var id = request.cookies.sessionKey;
    if (id) {
        response.location('/search');
        response.sendFile(__dirname + '/playlist.html');
    } else {
        response.location('/login');
        response.redirect('/login');
    }
});

app.get('/playlist.css', function(request, response) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/css');
    response.setHeader('Cache-Control', 'public, max-age=1800');
    response.sendFile(__dirname + '/playlist.css');
});

app.get('/login.css', function(request, response) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/css');
    response.setHeader('Cache-Control', 'public, max-age=1800');
    response.sendFile(__dirname + '/login.css');
});

app.get('/music-data.js', function(request, response) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/javascript');
    response.setHeader('Cache-Control', 'public, max-age=1800');
    response.sendFile(__dirname + '/music-data.js');
});

app.get('/api/songs', function(request, response) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json');

    models.Songs.findAll({
        attributes: ['id', 'album', 'title', 'artist', 'duration']
    }).then(function(songs) {
        response.end(JSON.stringify(songs.map(function(song) {
            return song.get({plain: true})
        })));
    })
});

app.get('/api/playlists', function(request, response) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json');

    var id = request.cookies.sessionKey;
    var arrayID = [];
    var arrayPlaylist = [];

    var playlistIDs = function() {      
        return new Promise(function(resolve, reject) {

            models.Session.findOne({
                where: {
                    sessionKey: id
                },
                include: [models.User]
            }).then(function(session) {
                var user = session.User;

                models.User.findOne({
                    where: {
                        username: user.username,
                        password: user.password
                    },
                    include: [models.Playlist]
                }).then(function(playlists) {
                    var userPlaylist = playlists.Playlists;

                    userPlaylist.forEach(function(playlist) {
                        var id = playlist.get({plain: true}).id;
                        arrayID.push(playlist.id);
                    });

                    Promise.all(arrayID).then(resolve);
                });
            });
        });
    };

    playlistIDs().then(function() {
        var allPlaylist = function() {
            return new Promise(function(resolve, reject) {
                arrayID.forEach(function(id) {
                    models.Playlist.findOne({
                        where: {
                            id: id
                        },
                        attributes: ['id', 'name'],
                        include: [models.Songs]
                    }).then(function(playlist) {
                        arrayPlaylist.push(playlist);

                        if (arrayPlaylist.length === arrayID.length) {
                            Promise.all(arrayPlaylist).then(resolve);
                        }
                    });       
                });               
            });
        };

        allPlaylist().then(function() {
            response.end(JSON.stringify(arrayPlaylist.map(function(playlist) {
                return playlist.get({plain: true});
            })));
        });
    });
});

app.get('/api/users', function(request, response) {
    models.User.findAll({
        attributes: ['id', 'username']
    }).then(function(allUsers) {
        var usersPromises = allUsers.map(function(users) {
            return users.get({plain: true});
        });
        
        Promise.all(usersPromises).then(function(userResolutions) {
            var usersData = [];
            userResolutions.forEach(function(user) {
                usersData.push(user);
            });
            response.end(JSON.stringify({'users': usersData}));
        });
    });
});

app.post('/api/playlists/:id/users', function(request, response) {
    var userID = request.body.user;
    var playlistID = request.params['id'];

    models.User.findOne({
        where: {
            id: userID
        },
        include: [models.Playlist]
    }).then(function(user) {
        user.addPlaylist(playlistID);
    });
});

app.post('/login', function(request, response) {
    var username = request.body['username'];
    var password = request.body['password'];
    var generateKey = function() {
        var sha = crypto.createHash('sha256');
        sha.update(Math.random().toString());
        return sha.digest('hex');
    };
    
    models.User.findOne({
        attributes: ['id', 'username', 'password'],
        include: [models.Playlist],
        where: {
            username: username,
        }
    })
    .then(function(user) {
        if (user == null) {
            response.statusCode = 401;
            response.end("Invalid login credentials.");
        } else {
            bcrypt.compare(password, user.password, function(err, res) {
                if(res) {
                    // Passwords match
                    
                    var key = generateKey();

                    models.Session.create({
                        sessionKey: key
                    })
                    .then(function(session) {
                        session.setUser(user.id);
                        response.statusCode = 301;
                        response.location('/playlists');
                        response.set('Set-Cookie', 'sessionKey=' + key);
                        response.redirect('/playlists');
                    });
                } else {
                    // Passwords don't match

                    response.statusCode = 401;
                    response.end("Invalid login credentials.");
                }
            });      
        }
    });
});

app.post('/api/playlists', function(request, response) {
    response.statusCode = 200;

    models.Playlist.create({
        name: request.body.name
    })
    .then(function(playlist) {
        var sendBack = { id: playlist.id, name: playlist.name };
        response.end(JSON.stringify(sendBack));
    });
});

app.post('/api/playlists/:id/', function(request, response) {
    var id = request.cookies.sessionKey;

    // Determine if user has permission to the playlist
    models.Session.findOne({
        where: {
            sessionKey: id
        },
        attributes: ['sessionUser'],
        include: [models.User]
    }).then(function(session) {
        var user = session.User.username;
        var pass = session.User.password;

        models.User.findOne({
            where: {
                username: user,
                password: pass
            },
            include: [models.Playlist]
        }).then(function(theUser) {
            var playlists = theUser.Playlists;

            Promise.all(playlists).then(function(playlistsResolution) {
                playlistsResolution.forEach(function(playlist) {
                    if (playlist.get({plain:true}).id == request.params['id']) {
                        response.statusCode = 200;
                        response.end("Authorized");

                        // Search for playlist matching the id
                        models.Playlist.findOne({
                            attributes: ['id', 'name'],
                            include: [models.Songs],
                            where: {
                                id: request.params['id']
                            }
                        })
                        .then(function(playlist) {
                            playlist.addSongs(request.body.song);
                            response.end("Success - song added to playlist");
                        });
                    }
                });
                response.statusCode = 403;
                response.end("Unauthorized");
            });
        });
    });
});

app.delete('/playlists/:id/', function(request, response) {
    var id = request.cookies.sessionKey;

    // Determine if user has permission to the playlist
    models.Session.findOne({
        where: {
            sessionKey: id
        },
        attributes: ['sessionUser'],
        include: [models.User]
    }).then(function(session) {
        var user = session.User.username;
        var pass = session.User.password;

        models.User.findOne({
            where: {
                username: user,
                password: pass
            },
            include: [models.Playlist]
        }).then(function(theUser) {
            var playlists = theUser.Playlists;

            Promise.all(playlists).then(function(playlistsResolution) {
                playlistsResolution.forEach(function(playlist) {
                    if (playlist.get({plain:true}).id == request.params['id']) {
                        response.statusCode = 200;
                        response.end("Authorized");

                        // Search for playlist matching the id
                        models.Playlist.findOne({
                            attributes: ['id', 'name'],
                            include: [models.Songs],
                            where: {
                                id: request.params['id']
                            }
                        })
                        .then(function(playlist) {
                            playlist.removeSongs(request.body.song);
                            response.end("Success - song deleted");
                        });
                    }
                });
                response.statusCode = 403;
                response.end("Unauthorized");
            });
        });
    });
});

app.get('/', function(request, response) {
    response.statusCode = 301;

    var id = request.cookies.sessionKey;
    if (id) {
        response.location('/playlists');
        response.redirect('/playlists');
    } else {
        response.location('/login');
        response.redirect('/login');
    }
});

// Start the server on port 3000
app.listen(3000, function() {
    console.log('Amazing music app server listening on port 3000!')
});
