import type { Track } from "lavalink-client";
import { Dynamic } from 'musicard';
import { Evelyn } from "@Evelyn";

import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonStyle,
	TextChannel,
	User
} from 'discord.js';
import { BaseEmbed } from "src/utils/embeds";
import { ExtendedPlayer } from "src/utils/extendedManager";

const {
    Primary,
	Secondary,
	Link,
} = ButtonStyle;

export default class TrackStartEvent {
    public name: string = 'trackStart';
    public isLLManagerEvent: boolean = false;
    
    async execute(player: ExtendedPlayer, track: Track, _payload: unknown, client: Evelyn) {
		const spotifyLikeButtonMenuPrimary = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId('previous').setEmoji('⏮️').setLabel('Previous').setStyle(Primary),
			new ButtonBuilder().setCustomId('resumepause').setEmoji('⏯️').setLabel('Pause / Unpause').setStyle(Primary),
			new ButtonBuilder().setCustomId('next').setEmoji('⏭️').setLabel('Next').setStyle(Primary),
		)

		const spotifyLikeButtonMenuSecondary = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId('volup').setEmoji('🔊').setLabel('Vol+').setStyle(Secondary),
			new ButtonBuilder().setCustomId('stop').setEmoji('🛑').setLabel('Stop').setStyle(Secondary),
			new ButtonBuilder().setCustomId('voldown').setEmoji('🔉').setLabel('Vol-').setStyle(Secondary),
		)

		const spotifyLikeButtonMenuThirdly = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder().setCustomId('shuffle').setEmoji('🔀').setLabel('Shuffle').setStyle(Secondary),
			new ButtonBuilder().setCustomId('repeat').setEmoji('🔁').setLabel('Repeat').setStyle(Secondary),
			new ButtonBuilder().setEmoji('📩').setLabel('Get Link').setStyle(Link).setURL(track.info.uri),
		)
		
		const card = await Dynamic({
			thumbnailImage: track.info.artworkUrl as string,
			name: track.info.title,
			author: track.info.author,
			progress: player.currentTrackPosition,
			backgroundImage: 'https://i.postimg.cc/g2h27BVg/blurry-gradient-haikei-1.png',
			imageDarkness: 15,
		});

		const attachment = new AttachmentBuilder(card, { name: 'card.png' });

		const embed = BaseEmbed()
			.setTitle('Currently Playing')
			.setImage('attachment://card.png')
			.setFooter({ text: `Enqueued by ${(track.requester as User).displayName}`, iconURL: (track.requester as User).displayAvatarURL() })
		const channel = await client.channels.fetch(player.textChannelId as string) as TextChannel;

		await channel
			.send({ embeds: [embed], files: [attachment], components: [spotifyLikeButtonMenuPrimary, spotifyLikeButtonMenuSecondary, spotifyLikeButtonMenuThirdly] })
			.then((message) => player.setNowPlayingMessage(message));
    }
}