import {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	TextChannel,
	AttachmentBuilder,
	User,
} from 'discord.js';
import { Player, AutomataTrack } from '@shadowrunners/automata';
import { formatTime } from '@/Utils/Helpers/messageHelpers.js';
import { Evelyn } from '@/Evelyn.js';
import { musicCard } from 'musicard';

const { Primary } = ButtonStyle;

export default class TrackStart {
	name = 'trackStart';

	async execute(player: Player, track: AutomataTrack, client: Evelyn) {
		const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId('pause').setLabel('⏯️').setStyle(Primary),
			new ButtonBuilder().setCustomId('skip').setLabel('⏭️').setStyle(Primary),
			new ButtonBuilder().setCustomId('volup').setLabel('🔊').setStyle(Primary),
			new ButtonBuilder()
				.setCustomId('voldown')
				.setLabel('🔉')
				.setStyle(Primary),
			new ButtonBuilder()
				.setCustomId('shuffle')
				.setLabel('🔀')
				.setStyle(Primary),
		);

		const card = new musicCard()
			.setName(track.title)
			.setAuthor(track.author)
			.setColor('auto')
			.setTheme('dynamic')
			.setBrightness(50)
			.setThumbnail(track.artworkUrl)
			.setProgress(10)
			.setStartTime('0m0s')
			.setEndTime(formatTime(track.length));

		const imgBuffer = await card.build();
		const attachment = new AttachmentBuilder(imgBuffer, { name: 'card.png' });

		const nowPlaying = new EmbedBuilder()
			.setColor('Blurple')
			.setImage('attachment://card.png')
			.setFooter({ text: `Queued by ${(track.requester as User).displayName }`, iconURL: (track.requester as User).avatarURL() })
			.setTimestamp();

		const channel = client.channels.cache.get(
			player.textChannel,
		) as TextChannel;

		await channel
			.send({ embeds: [nowPlaying], components: [buttonRow], files: [attachment] })
			.then((message) => player.setNowPlayingMessage(message));
	}
}
