import {
	type ChatInputCommandInteraction,
	ApplicationCommandOptionType,
	type GuildMember,
} from 'discord.js';
import { Discord, Slash, SlashOption, SlashChoice, Guard } from 'discordx';
import { RateLimit, TIME_UNIT } from '@discordx/utilities';
import { WaifuDataResponse, WaifuAPI } from 'src/services/waifu';
import { inject, injectable } from 'tsyringe';
import { BaseEmbed, ErrorEmbed } from 'src/utils/embeds';

// TODO: New endpoints were added so they need to be added here as well, good enough for now though.

@Discord()
@injectable()
export class Actions {
	constructor(@inject(WaifuAPI) private readonly wAPI: WaifuAPI) {}

	@Slash({
		name: 'actions',
		description: 'Express your emotions to someone with actions!',
	})
	@Guard(
		RateLimit(TIME_UNIT.seconds, 30, {
			message: 'This command is currently in cooldown mode, please wait 30 seconds before re-running it.',
		}),
	)
	async actions(
		@SlashChoice({ name: '🔹 | Bite', value: 'bite' })
		@SlashChoice({ name: '🔹 | Blush', value: 'blush' })
		@SlashChoice({ name: '🔹 | Bonk', value: 'bonk' })
		@SlashChoice({ name: '🔹 | Bully', value: 'bully' })
		@SlashChoice({ name: '🔹 | Cringe', value: 'cringe' })
		@SlashChoice({ name: '🔹 | Cry', value: 'cry' })
		@SlashChoice({ name: '🔹 | Cuddle', value: 'cuddle' })
		@SlashChoice({ name: '🔹 | Handhold', value: 'handhold' })
		@SlashChoice({ name: '🔹 | Highfive', value: 'highfive' })
		@SlashChoice({ name: '🔹 | Hug', value: 'hug' })
		@SlashChoice({ name: '🔹 | Kiss', value: 'kiss' })
		@SlashChoice({ name: '🔹 | Pat', value: 'pat' })
		@SlashChoice({ name: '🔹 | Poke', value: 'poke' })
		@SlashChoice({ name: '🔹 | Wave', value: 'wave' })
		@SlashOption({
			name: 'action',
			description: 'Select an action.',
			required: true,
			type: ApplicationCommandOptionType.String,
		})
		@SlashOption({
			name: 'target',
			description: 'Provide a target.',
			required: false,
			type: ApplicationCommandOptionType.User,
		})
			action: string,
			target: GuildMember,
			interaction: ChatInputCommandInteraction,
	) {
		await interaction.deferReply();
		let wData: WaifuDataResponse;

		switch (action) {
		case 'bite':
			if (target && this.validateUser(interaction, target)) return;
			wData = await this.wAPI.bite();
			return await this.sendResponse(interaction, wData, target);
		case 'blush':
			wData = await this.wAPI.blush();
			return await this.sendResponse(interaction, wData);
		case 'bonk':
			if (target && this.validateUser(interaction, target)) return;
			wData = await this.wAPI.bonk();
			return await this.sendResponse(interaction, wData, target);
		case 'bully':
			if (target && this.validateUser(interaction, target)) return;
			wData = await this.wAPI.bully();
			return await this.sendResponse(interaction, wData, target);
		case 'cringe':
			wData = await this.wAPI.cringe();
			return await this.sendResponse(interaction, wData);
		case 'cry':
			wData = await this.wAPI.cry();
			return await this.sendResponse(interaction, wData);
		case 'cuddle':
			if (target && this.validateUser(interaction, target)) return;
			wData = await this.wAPI.cuddle();
			return await this.sendResponse(interaction, wData, target);
		case 'handhold':
			if (target && this.validateUser(interaction, target)) return;
			wData = await this.wAPI.handhold();
			return await this.sendResponse(interaction, wData, target)
		case 'highfive':
			if (target && this.validateUser(interaction, target)) return;
			wData = await this.wAPI.highfive();
			return await this.sendResponse(interaction, wData, target)
		case 'hug':
			if (target && this.validateUser(interaction, target)) return;
			wData = await this.wAPI.hug();
			return await this.sendResponse(interaction, wData, target)
		case 'kiss':
			if (target && this.validateUser(interaction, target)) return;
			wData = await this.wAPI.kiss();
			return await this.sendResponse(interaction, wData, target)
		case 'pat':
			if (target && this.validateUser(interaction, target)) return;
			wData = await this.wAPI.pat();
			return await this.sendResponse(interaction, wData, target)
		case 'poke':
			if (target && this.validateUser(interaction, target)) return;
			wData = await this.wAPI.poke();
			return await this.sendResponse(interaction, wData, target)
		case 'slap':
			if (target && this.validateUser(interaction, target)) return;
			wData = await this.wAPI.slap();
			return await this.sendResponse(interaction, wData, target)
		case 'wave':
			if (target && this.validateUser(interaction, target)) return;
			wData = await this.wAPI.wave();
			return await this.sendResponse(interaction, wData, target)
		default:
			break;
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
	
	/** Fetches the image and replies with it in an embed. */
	public async sendResponse(interaction: ChatInputCommandInteraction, data: WaifuDataResponse, target?: GuildMember) {
		const { user } = interaction;
		const username = user.username;
		const avatar = user.displayAvatarURL();

		const name = target
			? `${username} ${data.actionText} ${target.user.username}`
			: `${username} ${data.actionText}`;
		const iconURL = avatar;

		return interaction.editReply({
			embeds: [BaseEmbed().setAuthor({ name, iconURL }).setImage(data.imageURL)],
		});
	}
}
