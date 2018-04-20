module.exports = function(sequelize, DataType) {
	var Playlist = sequelize.define('Playlist', {
		name: {
			type: DataType.STRING,
			field: 'name'
		}
	}, {
		classMethods: {
			associate: function(models) {
				Playlist.belongsToMany(models.Songs, {
					through: 'songs_playlists',
					foreignKey: 'playlist_id'
				});
                Playlist.belongsToMany(models.User, {
                    through: 'users_playlists',
                    foreignKey: 'playlist_id'
                });
			}
		}
	});

	return Playlist;
};