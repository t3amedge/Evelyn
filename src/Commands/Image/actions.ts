import {
	ChatInputCommandInteraction,
	ApplicationCommandOptionType,
	GuildMember,
} from 'discord.js';
import { Discord, Slash, SlashOption, SlashChoice, Guard } from 'discordx';
import { RateLimit, TIME_UNIT } from '@discordx/utilities';
import { WaifuEngine } from '@/Utils/APIs/waifuAPI.js';

@Discord()
export class Actions {
	@Slash({
		description: 'Express your emotions to someone with actions!',
		name: 'actions',
	})
	@Guard(
		RateLimit(TIME_UNIT.seconds, 30, {
			message: '🔹 | Please wait 30 seconds before re-running this command.',
		}),
	)
	async actions(
		@SlashChoice({ name: '🔹 | Bite', value: 'bite' })
		@SlashChoice({ name: '🔹 | Blush', value: 'blush' })
		@SlashChoice({ name: '🔹 | Bonk', value: 'bonk' })
		@SlashChoice({ name: '🔹 | Bully', value: 'bully' })
		@SlashChoice({ name: '🔹 | Cringe', value: 'cringe' })
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
		const waifuAPI = new WaifuEngine(interaction);
		await interaction.deferReply();

		switch (action) {
		case 'bite':
			return waifuAPI.bite(target);

		case 'blush':
			return waifuAPI.blush();

		case 'bonk':
			return waifuAPI.bonk(target);

		case 'bully':
			return waifuAPI.bully(target);

		case 'cringe':
			return waifuAPI.cringe();

		case 'cry':
			return waifuAPI.cry();

		case 'cuddle':
			return waifuAPI.cuddle(target);

		case 'handhold':
			return waifuAPI.handhold(target);

		case 'highfive':
			return waifuAPI.highfive(target);

		case 'hug':
			return waifuAPI.hug(target);

		case 'kiss':
			return waifuAPI.kiss(target);

		case 'pat':
			return waifuAPI.pat(target);

		case 'poke':
			return waifuAPI.poke(target);

		case 'slap':
			return waifuAPI.slap(target);

		case 'wave':
			return waifuAPI.wave(target);

		default:
			break;
		}
	}
}
