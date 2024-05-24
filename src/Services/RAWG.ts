/**
 * This class contains our own custom version of a wrapper for the RAWG.io API.
 */
import { RAWGInterface, BotConfig } from '@/Interfaces/Interfaces.js';
import { config } from '@Config';
import superagent from 'superagent';
import { singleton } from 'tsyringe';

@singleton()
export class RAWG {
	/** The URL of the API. */
	private apiURL: string = 'https://api.rawg.io/api/games';
	/** The config object. */
	private config: BotConfig = config;

	/** Retrieves a game using the provided query. */
	public async fetchGame(gameName: string): Promise<RAWGInterface> {
		try {
			// Replace % and whatever encodeURIComponent() introduces instead of small spaces to '-' for proper slugs.
			const game = encodeURIComponent(gameName.toLowerCase()).replace(
				/%[0-9A-Fa-f]{2}/g,
				'-',
			);

			const res = await superagent.get(`${this.apiURL}/${game}?key=${this.config.APIs.rawgKey}`);
			const gameData = res.body;

			const mappedPlatforms = gameData?.platforms
				?.map(({ platform }: Platform) => platform.name)
				.join(', ');

			const mappedGenres = gameData?.genres
				?.map((genre: Genres) => genre.name)
				.join(', ');

			const mappedDevelopers = gameData?.developers
				?.map((developer: Developers) => developer.name)
				.join(', ');

			const mappedPublishers = gameData?.publishers
				?.map((publisher: Developers) => publisher.name)
				.join(', ');

			const unixDate = new Date(gameData?.released).getTime() / 1000;

			const rawgURI = `https://rawg.io/games/${game}`;

			const gameInfo: RAWGInterface = {
				name: gameData?.name,
				description: gameData?.description_raw,
				uri: rawgURI,
				developers: mappedDevelopers,
				publishers: mappedPublishers,
				platforms: mappedPlatforms,
				metacriticRating: gameData?.metacritic,
				releaseDate: unixDate,
				genres: mappedGenres,
				background_image: gameData?.background_image,
			};

			return gameInfo;
		}
		catch (_err) {
			throw new Error('There was an error while fetching the information from the API.');
		}
	}
}

interface Platform {
	platform: {
		id: number;
		name: string;
		slug: string;
	};
}

interface Genres {
	id: number;
	name: string;
	slug: string;
}

interface Developers {
	id: number;
	name: string;
	slug: string;
	games_count: number;
	image_background: string;
}
