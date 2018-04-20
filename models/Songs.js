module.exports = function(sequelize, DataType) {
    var Songs = sequelize.define('Songs', {
        album: {
            type: DataType.STRING,
            field: 'album'
        },
        title: {
            type: DataType.STRING,
            field: 'title'
        },
        artist: {
            type: DataType.STRING,
            field: 'artist'
        },
        duration: {
            type: DataType.INTEGER,
            field: 'duration'
        }
    }, {
        classMethods: {
            associate: function(models) {
                Songs.belongsToMany(models.Playlist, {
                    through: 'songs_playlists',
                    foreignKey: 'song_id'
                });
            }
        }
    });

    return Songs;
};
