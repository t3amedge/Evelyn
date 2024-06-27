import { singleton } from 'tsyringe';
import superagent from 'superagent';

@singleton()
/** A wrapper for the waifu.pics API. */
export class WaifuAPI {
	/** The base URL of the API. */
	private apiURL: string = 'https://api.waifu.pics/sfw/';

	/** Retrieves the image from the endpoint provided. */
	private async fetchImage(endpoint: string): Promise<string> {
		const res = await superagent.get(`${this.apiURL}${endpoint}`);
		return res.body.url;
	}

	/** Fetches the image and returns the image + appropriate text. */
	private async reply(action: string, text: string): Promise<WaifuDataResponse> {
		const image = await this.fetchImage(action);
		
		return {
			imageURL: image,
			actionText: text,
		}
	}

	/** Fetches a biting image from the API. */
	public bite() {
		return this.reply('bite', 'bites');
	}

	/** Fetches blushing image from the API. */
	public blush() {
		return this.reply('blush', 'blushes');
	}

	/** Fetches bonk image from the API. */
	public bonk() {
		return this.reply('bonk', 'bonks');
	}

	/** Fetches bully image from the API. */
	public bully() {
		return this.reply('bully', 'bullies');
	}

	/** Fetches cringe image from the API. */
	public cringe() {
		return this.reply('cringe', 'thinks that\'s pretty cringe');
	}

	/** Fetches crying image from the API. */
	public cry() {
		return this.reply('cry', 'is crying... :c');
	}

	/** Fetches cuddling imags from the API. */
	public cuddle() {
		return this.reply('cuddle', 'cuddles');
	}

	/** Fetches handholding image from the API. */
	public handhold() {
		return this.reply('handhold', 'is holding hands with');
	}

	/** Fetches highfive image from the API. */
	public highfive() {
		return this.reply('highfive', 'highfives');
	}

	/** Fetches hugging image from the API. */
	public hug() {
		return this.reply('hug', 'hugs');
	}

	/** Fetches kissing image from the API. */
	public kiss() {
		return this.reply('kiss', 'kisses');
	}

	/** Fetches patting image from the API. */
	public pat() {
		return this.reply('pat', 'pats');
	}

	/** Fetches poking image from the API. */
	public poke() {
		return this.reply('poke', 'pokes');
	}

	/** Fetches slapping image from the API. */
	public slap() {
		return this.reply('slap', 'slaps');
	}

	/** Fetches waving image from the API. */
	public wave() {
		return this.reply('waves', 'is waving at');
	}
}

export type WaifuDataResponse = {
	/** The URL of the image retrieved from the API. */
	imageURL: string;
	/** The action that the user made. */
	actionText: string;
}