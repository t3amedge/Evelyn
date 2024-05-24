/** This class contains a couple utilities used by Evelyn across systems. */
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	ChatInputCommandInteraction,
} from 'discord.js';

/** Combines all embeds into one that can be switched between. */
export async function embedPages(embeds: EmbedBuilder[], interaction: ChatInputCommandInteraction) {
	const pages = {};
	const getRow = (id: string) => {
		return new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setLabel('◀')
				.setCustomId('prev_embed')
				.setStyle(ButtonStyle.Primary)
				.setDisabled(pages[id] === 0),
			new ButtonBuilder()
				.setLabel('▶')
				.setCustomId('next_embed')
				.setStyle(ButtonStyle.Primary)
				.setDisabled(pages[id] === embeds.length - 1),
		);
	};

	const id = interaction.user.id;
	pages[id] = pages[id] ?? 0;
	const Pagemax = embeds.length;

	const embed = embeds[pages[id]];

	embeds[pages[id]].setFooter({
		text: `Page ${pages[id] + 1} from ${Pagemax}`,
	});

	const replyEmbed = await interaction.editReply({
		embeds: [embed],
		components: [getRow(id)],
	});

	const filter = (i) => i.user.id === interaction.user.id;
	const time = 1000 * 60 * 5;

	const collector = replyEmbed.createMessageComponentCollector({
		filter,
		time,
	});

	collector.on('collect', async (b) => {
		if (!b) return;
		if (b.customId !== 'prev_embed' && b.customId !== 'next_embed') return;

		b.deferUpdate();

		if (b.customId === 'prev_embed' && pages[id] > 0) {
			--pages[id];
		}
		else if (b.customId === 'next_embed' && pages[id] < embeds.length - 1) {
			++pages[id];
		}

		embeds[pages[id]].setFooter({
			text: `Page ${pages[id] + 1} of ${Pagemax}`,
		});

		await this.interaction.editReply({
			embeds: [embeds[pages[id]]],
			components: [getRow(id)],
		});
	});
}

/** Converts a number into a unix timestamp. */
export function bakeUnixTimestamp(num: number): number {
	const timestamp = Math.floor(num / 1000);
	return timestamp;
}

/** Converts time from ms to a readable format. */
export function formatTime(duration: number): string {
	const ms = duration % 1000;
	duration = (duration - ms) / 1000;
	const secs = duration % 60;
	duration = (duration - secs) / 60;
	const mins = duration % 60;
	const hrs = (duration - mins) / 60;

	const formattedParts: string[] = [];
	if (hrs > 0) formattedParts.push(`${hrs}h`);
	if (mins > 0) formattedParts.push(`${mins}m`);
	if (secs > 0) formattedParts.push(`${secs}s`);
	return formattedParts.join('');
}

