import type { GuildMember } from 'discord.js';
import { singleton } from 'tsyringe';
import superagent from 'superagent';

@singleton()
/** A wrapper for the NekoBot API. */
export class NekoAPI {
	/** The base URL of the API. */
	private apiURL: string = 'https://nekobot.xyz/api/imagegen';

	/** A reusable function that fetches stuff from the API based on the provided query. */
	private async fetch(type: ImageTypes, params?: string): Promise<string> {
		// needs to be done as the nekobot api returns a 500 if it's a webp.
		const newParams = params?.replace('.webp', '.png');
		const { body } = await superagent.get(`${this.apiURL}?type=${type}&${newParams}`);
		return body.message;
	}

	/** Fetches the awooified image from the API and responds back with the image URL. */
	public async awooify(member: GuildMember): Promise<string> {
		return await this.fetch('awooify', `url=${member.user.avatarURL()}`);
	}

	/** Fetches the baguette image from the API and responds back with the image URL. */
	public async baguette(member: GuildMember): Promise<string> {
		return await this.fetch('baguette', `url=${member.user.avatarURL()}`);
	}

	/** Fetches the blurpified image from the API and responds back with the image URL. */
	public async blurpify(member: GuildMember) {
		return await this.fetch('blurpify', `url=${member.user.avatarURL()}`);
	}

	/** Fetches the captcha image from the API and responds back with the image URL. */
	public async captcha(member: GuildMember) {
		return await this.fetch('captcha', `url=${member.user.avatarURL()}&username=${member.user.username}`);
	}

	/** Fetches the change my mind image from the API and responds back with the image URL. */
	public async changemymind(text: string) {
		return await this.fetch('changemymind', `text=${text}`);
	}

	/** Fetches the deepfried image from the API and responds back with the image URL. */
	public async deepfry(member: GuildMember) {
		return await this.fetch('deepfry', `url=${member.user.avatarURL()}`);
	}

	/** Fetches the kanna image from the API and responds back with the image URL. */
	public async kannagen(text: string) {
		return await this.fetch('kannagen', `text=${text}`);
	}

	/** Fetches the PH image from the API and responds back with the image URL. */
	public async phcomment(member: GuildMember, text: string) {
		return await this.fetch('phcomment', `image=${member.user.avatarURL()}&username=${member.user.username}&text=${text}`);
	}

	/** Fetches the threats image from the API and responds back with the image URL.. */
	public async threats(member: GuildMember) {
		return await this.fetch('threats', `url=${member.user.avatarURL()}`);
	}

	/** Fetches the trash image from the API and responds back with the image URL.. */
	public async trash(member: GuildMember) {
		return await this.fetch('trash', `url=${member.user.avatarURL()}`);
	}

	/** Fetches the trump tweet image from the API and responds back with the image URL.. */
	public async trumptweet(text: string) {
		return this.fetch('trumptweet', `text=${text}`);
	}

	/** Fetches the tweet image from the API and responds back with the image URL.. */
	public async tweet(member: GuildMember, text: string) {
		return this.fetch('tweet', `username=${member.user.username}&text=${text}`);
	}
}

type ImageTypes =
	'awooify' |
	'baguette' |
	'blurpify' |
	'captcha' |
	'changemymind' |
	'deepfry' |
	'kannagen' |
	'phcomment' |
	'threats' |
	'trash' |
	'trumptweet' |
	'tweet'
