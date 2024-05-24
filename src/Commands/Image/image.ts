import {
	ChatInputCommandInteraction,
	ApplicationCommandOptionType,
	User,
} from 'discord.js';
import { Discord, Slash, SlashOption, SlashChoice, Guard } from 'discordx';
import { RateLimit, TIME_UNIT } from '@discordx/utilities';
import { NekoAPI } from '@/Utils/APIs/nekoAPI.js';

@Discord()
export class Image {
	@Slash({
		description: 'Generate various images.',
		name: 'image',
	})
	@Guard(
		RateLimit(TIME_UNIT.seconds, 30, {
			message: '🔹 | Please wait 30 seconds before re-running this command.',
		}),
	)
	async image(
		@SlashChoice({ name: '🔹 | Awooify', value: 'awooify' })
		@SlashChoice({ name: '🔹 | Baguette', value: 'baguette' })
		@SlashChoice({ name: '🔹 | Blurpify', value: 'blurpify' })
		@SlashChoice({ name: '🔹 | Captcha', value: 'captcha' })
		@SlashChoice({ name: '🔹 | Change My Mind', value: 'changemymind' })
		@SlashChoice({ name: '🔹 | Deepfry', value: 'deepfry' })
		@SlashChoice({ name: '🔹 | Kanna', value: 'kannagen' })
		@SlashChoice({ name: '🔹 | PH Comment', value: 'phcomment' })
		@SlashChoice({ name: '🔹 | Threats', value: 'threats' })
		@SlashChoice({ name: '🔹 | Trash', value: 'trash' })
		@SlashChoice({ name: '🔹 | Trump Tweet', value: 'trumptweet' })
		@SlashChoice({ name: '🔹 | Tweet', value: 'tweet' })
		@SlashOption({
			name: 'type',
			description: 'Select the type of filter you would like to use.',
			required: true,
			type: ApplicationCommandOptionType.String,
		})
		@SlashOption({
			name: 'user1',
			description: 'Provide a target.',
			required: false,
			type: ApplicationCommandOptionType.User,
		})
		@SlashOption({
			name: 'user2',
			description: 'Provide a target.',
			required: false,
			type: ApplicationCommandOptionType.User,
		})
		@SlashOption({
			name: 'text',
			description: 'Provide the text that will be shown in the image.',
			required: false,
			type: ApplicationCommandOptionType.String,
		})
			type: string,
			user1: User,
			user2: User,
			text: string,
			interaction: ChatInputCommandInteraction,
	) {
		const API = new NekoAPI(interaction);
		await interaction.deferReply();

		switch (type) {
		case 'awooify':
			return API.awooify(user1, user2);

		case 'baguette':
			return API.baguette(user1, user2);

		case 'blurpify':
			return API.blurpify(user1, user2);

		case 'captcha':
			return API.captcha(user1, user2);

		case 'changemymind':
			return API.changemymind(text);

		case 'deepfry':
			return API.deepfry(user1, user2);

		case 'kannagen':
			return API.kannagen(text);

		case 'phcomment':
			return API.phcomment(user1, user2, text);

		case 'threats':
			return API.threats(user1, user2);

		case 'trash':
			return API.trash(user1, user2);

		case 'trumptweet':
			return API.trumptweet(text);

		case 'tweet':
			return API.tweet(user1, user2, text);

		default:
			break;
		}
	}
}
