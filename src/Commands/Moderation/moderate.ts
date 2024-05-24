import {
	ApplicationCommandOptionType,
	EmbedBuilder,
	GuildMember,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ModalSubmitInteraction,
} from 'discord.js';
import type {
	ExtendedButtonInteraction,
	ExtendedChatInteraction,
} from '../../Interfaces/Interfaces.js';
import {
	ButtonComponent,
	Discord,
	ModalComponent,
	Slash,
	SlashOption,
} from 'discordx';
import { Evelyn } from '../../Evelyn.js';
import { bakeUnixTimestamp } from '../../Utils/Helpers/messageHelpers.js';
import ms from 'ms';

const { User, String } = ApplicationCommandOptionType;
const { Short } = TextInputStyle;
const { Danger } = ButtonStyle;

@Discord()
export class Moderate {
	private embed: EmbedBuilder;
	private target: GuildMember;
	private reason: string;

	@Slash({
		name: 'moderate',
		description: 'Moderate a user.',
		defaultMemberPermissions: ['BanMembers', 'KickMembers', 'ModerateMembers'],
	})
	moderate(
		@SlashOption({
			name: 'target',
			description: 'Provide a target.',
			type: User,
			required: true,
		})
		@SlashOption({
			name: 'reason',
			description: 'Provide a reason.',
			type: String,
			required: false,
		})
			target: GuildMember,
			reason: string,
			interaction: ExtendedChatInteraction,
			client: Evelyn,
	) {
		const { guild, member } = interaction;
		this.embed = new EmbedBuilder().setColor('Blurple').setTimestamp();

		if (target.roles.highest.position >= member.roles.highest.position)
			return interaction.reply({
				embeds: [
					this.embed.setDescription(
						'🔹 | You can\'t moderate someone with a role higher than yours.',
					),
				],
				ephemeral: true,
			});

		if (
			target.roles.highest.position >= guild.members.me.roles.highest.position
		)
			return interaction.reply({
				embeds: [
					this.embed.setDescription(
						'🔹 | I can\'t moderate someone with a role higher than mine.',
					),
				],
				ephemeral: true,
			});

		const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId('ban_member')
				.setLabel('Ban')
				.setEmoji('🔨')
				.setStyle(Danger),
			new ButtonBuilder()
				.setCustomId('kick_member')
				.setLabel('Kick')
				.setEmoji('🦵')
				.setStyle(Danger),
			new ButtonBuilder()
				.setCustomId('timeout_member')
				.setLabel('Timeout')
				.setEmoji('🤫')
				.setStyle(Danger),
		);

		this.target = target;
		this.reason = reason;

		return interaction.reply({
			embeds: [
				this.embed
					.setTitle(`${client.user.username} | Moderation`)
					.setDescription('Choose an option.'),
			],
			components: [actionRow],
			ephemeral: true,
		});
	}

	@ButtonComponent({
		id: 'kick_member',
	})
	@ButtonComponent({
		id: 'ban_member',
	})
	async kickXban(interaction: ExtendedButtonInteraction) {
		const { guild, customId } = interaction;
		this.embed = new EmbedBuilder().setColor('Blurple').setTimestamp();

		this.target
			.send({
				embeds: [
					this.embed.setDescription(
						`You have been ${
							customId === 'kick_member' ? 'kicked' : 'banned'
						} from ${guild.name} for ${this.reason ?? 'no reason specified.'}`,
					),
				],
			})
			.catch(() => {
				// Empty so DeepSource doesn't flag this as an issue.
			});

		if (customId === 'kick_member')
			await this.target.kick(this.reason ?? 'No reason specified.');
		else
			await this.target.ban({
				reason: this.reason ?? 'No reason specified.',
			});

		return interaction.reply({
			embeds: [
				this.embed.setDescription(
					`${this.target} has been ${
						customId === 'kick_member' ? 'kicked' : 'banned'
					} for ${this.reason ?? 'No reason specified.'}`,
				),
			],
			ephemeral: true,
		});
	}

	@ButtonComponent({
		id: 'timeout_member',
	})
	async timeout_member(interaction: ExtendedButtonInteraction) {
		const modal = new ModalBuilder()
			.setCustomId('timeoutModal')
			.setTitle('How long do you want to timeout this user?')
			.setComponents(
				new ActionRowBuilder<TextInputBuilder>().setComponents(
					new TextInputBuilder()
						.setCustomId('timeout_time')
						.setLabel('Timeout Length')
						.setStyle(Short)
						.setRequired(true)
						.setMinLength(1),
				),
			);
		await interaction.showModal(modal);
	}

	@ModalComponent({
		id: 'timeoutModal',
	})
	async timeoutModal(interaction: ModalSubmitInteraction) {
		const { fields } = interaction;
		const time = ms(fields.getTextInputValue('timeout_time'));
		this.embed = new EmbedBuilder().setColor('Blurple').setTimestamp();

		if (isNaN(time))
			return interaction.reply({
				embeds: [
					this.embed.setDescription(
						'🔹 | The time you have provided is invalid. Use a valid number string like (5m, 1h, 2h30m) next time.',
					),
				],
				ephemeral: true,
			});

		await this.target.timeout(time, this.reason);

		return interaction.reply({
			embeds: [
				this.embed
					.setDescription(
						`${
							this.target
						} has been timed out for ${bakeUnixTimestamp(time)}.`,
					)
					.addFields({
						name: 'Reason',
						value: `> ${this.reason ?? 'No reason specified.'}`,
					}),
			],
			ephemeral: true,
		});
	}
}
