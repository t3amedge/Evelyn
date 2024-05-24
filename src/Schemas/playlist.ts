import { model, Schema } from 'mongoose';

interface PlaylistData {
	/** The title of the track. */
	title: string;
	/** The URL of the track. */
	uri: string;
	/** The author of the track. */
	author: string;
	/** The duration of the track. */
	duration: number;
}

interface Playlists {
	/** The name of the playlist. */
	playlistName: string;
	/** The array of songs. */
	playlistData: Array<PlaylistData>;
	/** The creator of the playlist. */
	createdBy: string;
	/** The ID of the user who created the playlist. */
	userID: string;
	/** When the playlist was created. */
	created: number;
}

export const PlaylistDB = model<Playlists>(
	'Playlists',
	new Schema({
		playlistName: String,
		playlistData: Array,
		createdBy: String,
		userID: String,
		created: Number,
	}),
);
