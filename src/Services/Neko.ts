import { EmbedBuilder, ChatInputCommandInteraction, User } from 'discord.js';
import { EvieEmbed } from '@/Utils/EvieEmbed';
import superagent from 'superagent';
import { singleton } from 'tsyringe';

@singleton()
/** A wrapper for the NekoBot API. */
export class NekoAPI {
	private apiURL: string;
	private embed: EmbedBuilder;
	private interaction: ChatInputCommandInteraction;
	private otherEmbed: EmbedBuilder;
	private user1: User;
	private user2: User;
	private target1: User;
	private target2: User;
	private text: string;

	/** Creates a new instance of the NekoAPI class. */
	constructor(interaction: ChatInputCommandInteraction) {
		this.apiURL = 'https://nekobot.xyz/api/imagegen';
		/** Base embed used to reduce repeated code. */
		this.embed = EvieEmbed()
			.setFooter({
				text: 'This image was brought to you by the NekoBot API.',
			});
		/** Base embed used for other purposes. */
		this.otherEmbed = EvieEmbed();
		/** The interaction object used for replying and fetching usernames. */
		this.interaction = interaction;

		this.user1 = null;
		this.user2 = null;
	}

	/** A reusable function that fetches stuff from the API based on the provided query. */
	private async fetch(query: string) {
		try {
			const { body } = await superagent.get(`${this.apiURL}${query}`);
			return body.message as string;
		}
		catch {
			return this.interaction.editReply({
				embeds: [this.otherEmbed.setDescription('🔹 | There was an error while fetching the image from the API.')],
			});
		}
	}

	/** Checks for a target user to display in the embed whenever a person needs to be mentioned. */
	private validateUser(user: User) {
		if (!user) {
			return this.interaction.editReply({
				embeds: [this.otherEmbed.setDescription('🔹 | You must provide a user.')],
			});
		}
	}

	/** Checks for a text string before displaying in the embed whenever a person needs to be mentioned. */
	checkText(text: string) {
		this.text = text;

		if (!text) {
			return this.interaction.editReply({
				embeds: [this.otherEmbed.setDescription('🔹 | You forgot to provide some text.')],
			});
		}
	}

	/** Fetches the avatars of users. */
	fetchAvatars(user1: User, user2: User) {
		if (this.checkTarget(user1, user2)) return;

		this.user1 = user1;
		this.user2 = user2;

		const avatarFetch = (user1 || user2).avatarURL();
		return avatarFetch;
	}

	/** Fetches the usernames of users. */
	fetchUsername(user1: User, user2: User) {
		if (this.checkTarget(user1, user2)) return;

		this.user1 = user1;
		this.user2 = user2;

		const fetchName = (user1 || user2).username;
		return fetchName;
	}

	/** Fetches the image and replies with it in an embed. */
	public async fetchandSend(
		type: ImageTypes,
		user1?: User,
		user2?: User,
		params?: string,
	) {
		if (user1 && user2) this.checkTarget(user1, user2);

		const image = await this.fetch(`?type=${type}&${params}`) as string;
		return this.interaction.editReply({ embeds: [this.embed.setImage(image)] });
	}

	/** Fetches the awooified image from the API and replies with an embed of it. */
	public async awooify(user: User) {
		if (user) this.validateUser(user);

		const image = await this.fetch(`/awooify?url=${user.avatarURL()}`) as string;
		return this.interaction.editReply({ embeds: [this.embed.setImage(image)] });
	}

	/** Fetches the baguette image from the API and replies with an embed of it. */
	public async baguette(user: User) {
		if (user) this.validateUser(user);

		const image = await this.fetch(`/baguette?url=${user.avatarURL()}`) as string;
		return this.interaction.editReply({ embeds: [this.embed.setImage(image)] });
	}

	/** Fetches the blurpified image from the API and replies with an embed of it. */
	blurpify(user1: User, user2: User) {
		return this.fetchandSend(
			'blurpify',
			user1,
			user2,
			`url=${this.fetchAvatars(user1, user2)}`,
		);
	}

	/** Fetches the captcha image from the API and replies with an embed of it. */
	captcha(user1: User, user2: User) {
		return this.fetchandSend(
			'captcha',
			user1,
			user2,
			`url=${this.fetchAvatars(user1, user2)}&username=${this.fetchUsername(
				user1,
				user2,
			)}`,
		);
	}

	/** Fetches the change my mind image from the API and replies with an embed of it. */
	changemymind(text: string) {
		if (this.checkText(text)) return;
		return this.fetchandSend('changemymind', null, null, `text=${text}`);
	}

	/** Fetches the deepfried image from the API and replies with an embed of it. */
	deepfry(user1: User, user2: User) {
		return this.fetchandSend(
			'deepfry',
			user1,
			user2,
			`url=${this.fetchAvatars(user1, user2)}`,
		);
	}

	/** Fetches the kanna image from the API and replies with an embed of it. */
	kannagen(text: string) {
		if (this.checkText(text)) return;
		return this.fetchandSend('kannagen', null, null, `text=${text}`);
	}

	/** Fetches the PH image from the API and replies with an embed of it. */
	phcomment(user1: User, user2: User, text: string) {
		if (this.checkText(text)) return;

		return this.fetchandSend(
			'phcomment',
			user1,
			user2,
			`username=${this.fetchUsername(user1, user2)}&image=${this.fetchAvatars(
				user1,
				user2,
			)}&text=${text}`,
		);
	}

	/** Fetches the threats image from the API and replies with an embed of it. */
	threats(user1: User, user2: User) {
		return this.fetchandSend(
			'threats',
			user1,
			user2,
			`url=${this.fetchAvatars(user1, user2)}`,
		);
	}

	/** Fetches the trash image from the API and replies with an embed of it. */
	trash(user1: User, user2: User) {
		return this.fetchandSend(
			'threats',
			user1,
			user2,
			`image=${this.fetchAvatars(user1, user2)}`,
		);
	}

	/** Fetches the trump tweet image from the API and replies with an embed of it. */
	trumptweet(text: string) {
		if (this.checkText(text)) return;
		return this.fetchandSend('trumptweet', null, null, `text=${text}`);
	}

	/** Fetches the tweet image from the API and replies with an embed of it. */
	tweet(user1: User, user2: User, text: string) {
		if (this.checkText(text)) return;

		return this.fetchandSend(
			'tweet',
			user1,
			user2,
			`username=${this.fetchUsername(user1, user2)}&text=${text}`,
		);
	}
}

type ImageTypes = 
	'awooify' |
