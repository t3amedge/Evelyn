import { singleton } from 'tsyringe';
import superagent from 'superagent';

@singleton()
/** A wrapper for the Kitsu.io API. */
export class Kitsu {
	/** The URL of the API. */
	private readonly apiURL: string = 'https://kitsu.io/api/edge';

	/** Fetches the genres of the provided anime / manga. */
	private async fetchGenres(id: string, queryType: QueryType) {
		const res = await superagent.get(`${this.apiURL}/${queryType}/${id}/genres`);
		const genreData = res.body as KitsuGenresData;

		return genreData.data.length === 0
			? 'N/A'
			: genreData.data.map((genre) => genre.attributes.name).join(', ');
	}

	/** Searches the provided query on the provided endpoint. */
	private async fetchQuery(query: string, queryType: QueryType) {
		const res = await superagent.get(`${this.apiURL}/${queryType}?filter[text]=${query}`) as { body: KitsuRawResponse };
		
		return {
			id: res.body.data[0].id,
			data: res.body.data[0].attributes,
		}
	}

	/** Capitalizes the first letter of the first two statuses and replaces 'current' with Currently Airing. */
	private replacer(query: string) {
		return query
			.replace('finished', 'Finished')
			.replace('ongoing', 'Ongoing')
			.replace('current', 'Currently Airing');
	}

	/** Builds a unixed version of the date provided by the Kitsu API. */
	private buildDate(query: number) {
		return Math.floor(new Date(query).getTime() / 1000);
	}

	/** Retrieves the information for the provided anime. */
	public async fetchAnime(query: string) {
		const { data, id } = await this.fetchQuery(query, 'anime');
		const fetchedGenres = await this.fetchGenres(id, 'anime');
		const newStatus = this.replacer(data?.status);

		const animeInfo: KitsuAnimeData = {
			description: data?.description,
			synopsis: data?.synopsis,
			titles: {
				en_us: data?.titles?.en_us ?? data?.titles?.en_jp,
				ja_jp: data?.titles?.ja_jp,
			},
			genres: fetchedGenres,
			status: newStatus,
			averageRating: data?.averageRating,
			startDate: this.buildDate(data.startDate),
			endDate: this.buildDate(data.endDate),
			ageRating: data?.ageRating ?? 'RP (Rating Pending)',
			ageRatingGuide: data?.ageRatingGuide,
			nsfw: data?.nsfw,
			posterImage: data?.posterImage?.original,
			coverImage: data?.coverImage?.original,
			episodeCount: data?.episodeCount,
		};

		return animeInfo;
	}

	/** Retrieves the information for the provided manga. */
	public async fetchManga(manga: string) {
		const { data, id } = await this.fetchQuery(manga, 'manga');
		const fetchedGenres = await this.fetchGenres(id, 'manga');
		const newStatus = this.replacer(data?.status);

		const mangaInfo: KitsuMangaData = {
			description: data?.description,
			synopsis: data?.synopsis,
			titles: {
				en_us: data?.titles?.en_us ?? data?.titles?.en_jp,
				ja_jp: data?.titles?.ja_jp,
			},
			genres: fetchedGenres,
			status: newStatus,
			averageRating: data?.averageRating,
			startDate: this.buildDate(data.startDate),
			endDate: this.buildDate(data.endDate),
			ageRating: data?.ageRating ?? 'RP (Rating Pending)',
			ageRatingGuide: data?.ageRatingGuide,
			posterImage: data?.posterImage?.original,
			coverImage: data?.coverImage?.original,
			chapterCount: data?.chapterCount,
			volumeCount: data?.volumeCount,
		};

		return mangaInfo;
	}
}

/** The query's type. */
type QueryType = 'anime' | 'manga';

/** The raw response coming from the API (contains data applicable to both animes & mangas). */
type KitsuRawResponse = {
	data: Array<{
		id: string;
		attributes: {
			/** The description of the anime. Usually the same as the synopsis. */
			description: string;
			/** The synopsis of the anime. */
			synopsis: string;
			/** The titles of the anime. Can be English or Japanese. */
			titles: {
				/** The english title of the anime. */
				en_us: string;
				/** The japanese title of the anime. */
				ja_jp: string;
				/** The translated japanese title of the anime. */
				en_jp: string;
			};
			/** The genres the anime is under. */
			genres?: string;
			/** The status of the anime. Can be finished, ongoing or current.*/
			status: string;
			/** The average rating of the anime. */
			averageRating: string;
			/** The date when the anime started airing in a unix format. */
			startDate: number;
			/** The date when the anime ended in a unix format.*/
			endDate: number;
			/** The age rating of the anime. */
			ageRating: string;
			/** The rating guide of the anime. */
			ageRatingGuide: string;
			/** A boolean indicating if the anime is NSFW or not. */
			nsfw: boolean;
			/** The poster image of the anime. Can be tiny, large, small, medium or original size. */
			posterImage: {
				tiny: string;
				large: string;
				small: string;
				medium: string;
				original: string;
			};
			/** The cover image of the anime. Can be tiny, large, small, medium or original size. */
			coverImage: {
				tiny: string;
				large: string;
				small: string;
				original: string;
			};
			/** The number of episodes the anime has. */
			episodeCount: number;
			/** The amount of chapters. (applies to mangas) */
			chapterCount: number;
			/** The amount of volumes. (applies to mangas) */
			volumeCount: number;
		};
	}>
};

/** The base response built by the functions (contains common data). */
type BaseResponseData = {
	/** The description of the anime. Usually the same as the synopsis. */
	description: string;
	/** The synopsis of the anime. */
	synopsis: string;
	/** The titles of the anime. Can be English or Japanese. */
	titles: {
		/** The english title of the anime. */
		en_us: string;
		/** The japanese title of the anime. */
		ja_jp: string;
	};
	/** The genres the anime is under. */
	genres?: string;
	/** The status of the anime. Can be finished, ongoing or current.*/
	status: string;
	/** The average rating of the anime. */
	averageRating: string;
	/** The date when the anime started airing in a unix format. */
	startDate: number;
	/** The date when the anime ended in a unix format.*/
	endDate: number;
	/** The age rating of the anime. */
	ageRating: string;
	/** The rating guide of the anime. */
	ageRatingGuide: string;
	/** The poster image of the anime.*/
	posterImage: string;
	/** The cover image of the anime. */
	coverImage: string;

}

/** The data sent back to the command by the fetchAnime function, contains additional anime specific data. */
type KitsuAnimeData = BaseResponseData & {
	/** A boolean indicating if the anime is NSFW or not. */
	nsfw: boolean;
	/** The number of episodes the anime has. */
	episodeCount: number;
}

/** The data sent back to the command by the fetchManga function, contains additional manga specific data. */
type KitsuMangaData = BaseResponseData & {
	/** The amount of chapters the manga has. */
	chapterCount: number;
	/** The amount of volumes the manga has. */
	volumeCount: number;
}

/** The data regarding genres, applicable to both animes and mangas. */
type KitsuGenresData = {
	data: Array<{
		attributes: {
			name: string;
		};
	}>;
};

