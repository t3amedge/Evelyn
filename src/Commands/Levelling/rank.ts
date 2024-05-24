import { ApplicationCommandOptionType, ChatInputCommandInteraction, AttachmentBuilder, GuildMember } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { inject, injectable } from 'tsyringe';
import { profileImage } from 'discord-arts';
import { Levels } from '@/Services/Levels';

@Discord()
@injectable()
export class Rank {
	// eslint-disable-next-line no-empty-function
	constructor(@inject(Levels) private readonly levels: Levels) {}

	@Slash({
		name: 'rank',
		description: 'Displays the rank of a user.',
	})
	async rank(
		@SlashOption({
			name: 'target',
			description: 'Provide a user.',
			type: ApplicationCommandOptionType.User,
			required: false,
		})
			target: GuildMember,
			interaction: ChatInputCommandInteraction,
	) {
		const { guildId, member } = interaction;
		if (target?.partial) await target?.fetch();

		const userId = target?.user?.id || member.user.id;
		const xpUser = await this.levels.getUser(userId, guildId);

		if (!xpUser) return interaction.reply({ content: '🔹 | This user hasn\'t gained any XP yet.', ephemeral: true });

		const requiredLevel = this.levels.calculateNextLevel(parseInt(xpUser.level.toString()) + 1);

		const rankCard = await profileImage(userId, {
			rankData: {
				currentXp: xpUser.totalXP,
				requiredXp: requiredLevel,
				level: xpUser.level,
				barColor: '5865F2',
			},
		});

		const attachment = new AttachmentBuilder(rankCard, { name: 'card.png' });

		return interaction.reply({
			files: [attachment],
		});
	}
}
