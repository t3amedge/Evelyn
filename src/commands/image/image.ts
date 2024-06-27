import { type ChatInputCommandInteraction, ApplicationCommandOptionType, type GuildMember } from 'discord.js';
import { Discord, Slash, SlashOption, SlashChoice, Guard } from 'discordx';
import { RateLimit, TIME_UNIT } from '@discordx/utilities';
import { BaseEmbed, ErrorEmbed } from 'src/utils/embeds';
import { inject, injectable } from 'tsyringe';
import { NekoAPI } from 'src/services/neko';

@Discord()
@injectable()
export class ImageCommand {
	constructor(@inject(NekoAPI) private readonly nekoAPI: NekoAPI) {}

	@Slash({
		name: 'image',
		description: 'Generate various images.',
	})
	@Guard(
		RateLimit(TIME_UNIT.seconds, 30, {
			message: 'This command is currently in cooldown mode, please wait 30 seconds before re-running it.',
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
			user1: GuildMember,
			user2: GuildMember,
			text: string,
			interaction: ChatInputCommandInteraction,
	) {
		await interaction.deferReply();

		let providedUser: GuildMember;
		if (user1 !== undefined) providedUser = user1;
		else providedUser = user2;

		let image: string;
		try {
			switch (type) {
			case 'awooify':
				if (this.validateUser(interaction, providedUser)) return;
				image = await this.nekoAPI.awooify(providedUser);
				return this.sendResponse(interaction, image);

			case 'baguette':
				if (this.validateUser(interaction, providedUser)) return;
				image = await this.nekoAPI.baguette(providedUser);
				return this.sendResponse(interaction, image);

			case 'blurpify':
				if (this.validateUser(interaction, providedUser)) return;
				image = await this.nekoAPI.blurpify(providedUser);
				return this.sendResponse(interaction, image);

			case 'captcha':
				if (this.validateUser(interaction, providedUser)) return;
				image = await this.nekoAPI.captcha(providedUser);
				return this.sendResponse(interaction, image);

			case 'changemymind':
				if (this.validateText(interaction, text)) return;
				image = await this.nekoAPI.changemymind(text);
				return this.sendResponse(interaction, image);

			case 'deepfry':
				if (this.validateUser(interaction, providedUser)) return;
				image = await this.nekoAPI.deepfry(providedUser);
				return this.sendResponse(interaction, image);

			case 'kannagen':
				if (this.validateText(interaction, text)) return;
				image = await this.nekoAPI.kannagen(text);
				return this.sendResponse(interaction, image);

			case 'phcomment':
				if (this.validateUser(interaction, providedUser) && this.validateText(interaction, text)) return;
				image = await this.nekoAPI.phcomment(providedUser, text);
				return this.sendResponse(interaction, image);

			case 'threats':
				if (this.validateUser(interaction, providedUser)) return;
				image = await this.nekoAPI.threats(providedUser);
				return this.sendResponse(interaction, image);

			case 'trash':
				if (this.validateUser(interaction, providedUser)) return;
				image = await this.nekoAPI.trash(providedUser);
				return this.sendResponse(interaction, image);

			case 'trumptweet':
				if (this.validateText(interaction, text)) return;
				image = await this.nekoAPI.trumptweet(text);
				return this.sendResponse(interaction, image);

			case 'tweet':
				if (this.validateUser(interaction, providedUser) && this.validateText(interaction, text)) return;
				image = await this.nekoAPI.tweet(providedUser, text);
				return this.sendResponse(interaction, image);

			default:
				break;
			}
		}
		catch (_err) {
			return interaction.editReply({
				embeds: [ErrorEmbed().setDescription('There was an error while fetching the image from the API.')],
			});
		}
	}

	/** Checks for a target user to display in the embed whenever a person needs to be mentioned. */
	private validateUser(interaction: ChatInputCommandInteraction, user: GuildMember) {
		if (!user && !interaction.replied) {
			return interaction.editReply({
				embeds: [ErrorEmbed().setDescription('You must provide a user.')],
			});
		}
	}

	/** Checks for a text string before displaying in the embed whenever a person needs to be mentioned. */
	private validateText(interaction: ChatInputCommandInteraction, text: string) {
		if (!text && !interaction.replied) {
			return interaction.editReply({
				embeds: [ErrorEmbed().setDescription('You forgot to provide some text.')],
			});
		}
	}

	/** Fetches the image and replies with it in an embed. */
	public async sendResponse(interaction: ChatInputCommandInteraction, image: string) {
		const embed = BaseEmbed()
			.setFooter({
				text: 'This image was brought to you by the NekoBot API.',
			});

		return interaction.editReply({ embeds: [embed.setImage(image)] });
	}
}
