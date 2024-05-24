import {
	GuildMemberRoleManager,
	ButtonInteraction,
	ActionRowBuilder,
	ButtonBuilder,
	EmbedBuilder,
	GuildMember,
	TextChannel,
	ChannelType,
	ButtonStyle,
} from 'discord.js';
import { ButtonComponent, Discord } from 'discordx';
import { createTranscript, ExportReturnType } from 'discord-html-transcripts';
import { Tickets as ticketData, Guilds as setupData } from '@Schemas';

@Discord()
export class Tickets {
	@ButtonComponent({
		id: 'closeTicket',
	})
	async closeTicket(interaction: ButtonInteraction) {
		const { guild, member, channel } = interaction;
		const gTicketData = await setupData.findOne({ id: guild.id });
		const embed = new EmbedBuilder().setColor('Blurple').setTimestamp();

		const definedMember = member as GuildMember;
		const memberRoles = member.roles as GuildMemberRoleManager;

		if (
			!memberRoles.cache.find(
				(r) => r.id === gTicketData.tickets?.assistantRole,
			)
		)
			return interaction.reply({
				embeds: [
					embed.setDescription(
						'🔹 | Only the support team can use these buttons.',
					),
				],
				ephemeral: true,
			});

		const ticketsData = await ticketData.findOne({
			id: guild.id,
			ticketId: channel.id,
		});

		if (ticketsData?.closed === true)
			return interaction.reply({
				embeds: [embed.setDescription('🔹 | This ticket is already closed.')],
				ephemeral: true,
			});

		await ticketData?.findOneAndUpdate(
			{
				ticketId: channel.id,
			},
			{
				closed: true,
				closer: definedMember.id,
			},
		);

		const attachment = await createTranscript(channel, {
			limit: -1,
			returnType: ExportReturnType.Attachment,
			filename: `Ticket - ${ticketsData?.creatorId}.html`,
		});

		const closedTime = Math.floor(new Date().getTime() / 1000);

		const fetchedChannel = guild.channels.cache.get(
			gTicketData?.tickets?.transcriptChannel,
		) as TextChannel;
		const message = await fetchedChannel.send({
			embeds: [
				embed.setTitle('Ticket Closed').addFields(
					{
						name: 'Opened by',
						value: `<@!${ticketsData?.creatorId}>`,
					},
					{
						name: 'Closed',
						value: `<t:${closedTime}:R>`,
					},
				),
			],
			files: [attachment],
		});

		interaction.reply({
			embeds: [
				embed.setDescription(
					`🔹 | The transcript of this ticket has been saved [here](${message.url}).`,
				),
			],
			ephemeral: true,
		});
		setTimeout(() => {
			channel.delete();
		}, 10 * 1000);
	}

	@ButtonComponent({
		id: 'createTicket',
	})
	async createTicket(interaction: ButtonInteraction) {
		const { guild, member, user, channel } = interaction;
		const definedChannel = channel as TextChannel;
		const data = await setupData.findOne({ id: guild.id });
		const embed = new EmbedBuilder().setColor('Blurple').setTimestamp();

		if (!data) return;

		const ticketsData = await ticketData.findOne({
			creatorId: user.id,
		});

		if (ticketsData?.creatorId && !ticketsData?.closed)
			return interaction.reply({
				embeds: [embed.setDescription('🔹 | You already have a ticket open.')],
				ephemeral: true,
			});

		const thread = await definedChannel.threads.create({
			name: `${user.username}-ticket`,
			type: ChannelType.PrivateThread,
			reason: 'User has requested a ticket.',
		});

		await ticketData.create({
			id: guild.id,
			ticketId: thread.id,
			closed: false,
			closer: null,
			creatorId: user.id,
		});

		thread.setRateLimitPerUser(2);

		const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId('closeTicket')
				.setLabel('Close')
				.setStyle(ButtonStyle.Danger)
				.setEmoji('⛔'),
			new ButtonBuilder()
				.setCustomId('claimTicket')
				.setLabel('Claim')
				.setStyle(ButtonStyle.Danger)
				.setEmoji('🛄'),
		);

		thread.send({
			content: `<@${user.id}>, your ticket lives here.`,
			embeds: [
				embed
					.setAuthor({
						name: `${guild.name} | Your Ticket`,
						iconURL: guild.iconURL(),
					})
					.setDescription(
						'Hiya! Please wait patiently while a staff member is coming to assist you with your issue. In the meantime, describe your issue as detailed as possible.',
					),
			],
			components: [buttons],
		});

		await interaction.reply({
			content: `${member}, your ticket has been created: ${channel}`,
			ephemeral: true,
		});
	}
}
