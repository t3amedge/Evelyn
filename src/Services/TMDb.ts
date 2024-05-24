/**
 * A wrapper for the TMDB API.
 * Also contains integration with JustWatch to provide information regarding where the movie is able to streamed / rented from.
 */

import { TMDBMovie, TMDBShow } from '@/Interfaces/Interfaces.js';
import { singleton } from 'tsyringe';
import superagent from 'superagent';
import { config } from '@Config';

@singleton()
export class TMDb {
	/** The URL of the TMDB API. */
	private readonly apiURL: string = 'https://api.themoviedb.org/3';

	/** Retrieves the image from the endpoint provided. */
	public async fetchMovie(query: string) {
		/** This will fetch the base movie from the search endpoint. */
		const searchedMovie = await superagent
			.get(
				`${this.apiURL}/search/movie?query=${encodeURIComponent(
					query,
				)}&include_adult=false&page=1`,
			)
			.set('Authorization', `Bearer ${config.APIs.tmdbAPIKey}`);

		/** This fetches the actual info that's used using the ID from the previous one. */
		const actualMovie = await superagent
			.get(`${this.apiURL}/movie/${searchedMovie.body.results[0].id}`)
			.set('Authorization', `Bearer ${config.APIs.tmdbAPIKey}`);

		/** This fetches the streaming services the movie is able to be streamed on. */
		const getSS = await superagent
			.get(
				`${this.apiURL}/movie/${searchedMovie.body.results[0].id}/watch/providers`,
			)
			.set('Authorization', `Bearer ${config.APIs.tmdbAPIKey}`);

		const streamingServices = getSS.body.results.US.buy
			.map((service: { provider_name: string }) => service.provider_name)
			.join(', ');

		const movie = actualMovie.body;
		const genres = movie.genres
			.map((genre: { name: string }) => genre.name)
			.join(', ');

		const releaseDate = new Date(movie.release_date);
		const releaseDateUnixed = Math.floor(releaseDate.getTime() / 1000);

		const prodCompanies = movie.production_companies
			.map((company: { name: string }) => company.name)
			.join(', ');

		const movieInfo: TMDBMovie = {
			title: movie.title,
			genres,
			imdb_id: movie.imdb_id,
			overview: movie.overview,
			popularity: movie.popularity,
			poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
			productionCompanies: prodCompanies,
			streamingServices,
			releaseDateUnix: releaseDateUnixed,
			status: movie.status,
			tagline: movie.tagline,
		};

		return movieInfo;
	}

	/** Retrieves the image from the endpoint provided. */
	public async fetchTVSeries(query: string) {
		/** This will fetch the base movie from the search endpoint. */
		const searchedSeries = await superagent
			.get(
				`${this.apiURL}/search/tv?query=${encodeURIComponent(
					query,
				)}&include_adult=false&page=1`,
			)
			.set('Authorization', `Bearer ${config.APIs.tmdbAPIKey}`);

		/** This fetches the actual info that's used using the ID from the previous one. */
		const actualShow = await superagent
			.get(`${this.apiURL}/tv/${searchedSeries.body.results[0].id}`)
			.set('Authorization', `Bearer ${config.APIs.tmdbAPIKey}`);

		/** This fetches the streaming services the movie is able to be streamed on. */
		const getSS = await superagent
			.get(
				`${this.apiURL}/tv/${searchedSeries.body.results[0].id}/watch/providers`,
			)
			.set('Authorization', `Bearer ${config.APIs.tmdbAPIKey}`);

		const streamingServices = getSS.body.results.US.buy
			.map((service: { provider_name: string }) => service.provider_name)
			.join(', ');

		const show = actualShow.body;
		const genres = show.genres
			.map((genre: { name: string }) => genre.name)
			.join(', ');

		const firstAired = new Date(show.first_air_date);
		const firstAiredUnixed = Math.floor(firstAired.getTime() / 1000);

		const lastAired = new Date(show.last_air_date);
		const lastAiredUnixed = Math.floor(lastAired.getTime() / 1000);

		const prodCompanies = show.production_companies
			.map((company: { name: string }) => company.name)
			.join(', ');

		const createdBy = show.created_by
			.map((creator: { name: string }) => creator.name)
			.join(', ');

		const showInfo: TMDBShow = {
			title: show.name,
			createdBy,
			genres,
			overview: show.overview,
			popularity: show.popularity,
			poster: `https://image.tmdb.org/t/p/w500${show.poster_path}`,
			seasons: show.number_of_seasons,
			productionCompanies: prodCompanies,
			streamingServices,
			firstAiredUnixed,
			lastAiredUnixed,
			status: show.status,
			tagline: show.tagline,
		};

		return showInfo;
	}
}
