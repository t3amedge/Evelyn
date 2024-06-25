import { ApplicationCommandOptionType, AttachmentBuilder, ButtonInteraction, ChatInputCommandInteraction, EmbedBuilder, GuildMember } from 'discord.js';
import { Discord, Slash, SlashGroup, SlashOption, SlashChoice, ButtonComponent, Guard } from 'discordx';
import { isInsideVoiceChannel, isPlaying, volumeControl, playerExists, hasQueue } from '@Guards';
import { BaseEmbed, ButtonEmbed, ErrorEmbed } from 'src/utils/embeds';
import { ExtendedPlayer } from 'src/utils/extendedManager';
import { formatTime } from 'src/utils/formatTime';
import { inject, injectable } from 'tsyringe';
import { EQList, Track } from 'lavalink-client';
import { Dynamic } from 'musicard';
import { Evelyn } from '@Evelyn';
import { Pagination, PaginationType } from '@discordx/pagination';

@Discord()
@SlashGroup({
	description: 'A complete music system.',
	name: 'music',
	dmPermission: false,
})
@SlashGroup('music')
@injectable()
export class Music {
	private player: ExtendedPlayer | undefined;

	constructor(@inject(Evelyn) private readonly client: Evelyn) {}

	@Slash({
		name: 'play',
		description: 'Plays a song.',
	})
	@Guard(
		isInsideVoiceChannel
	)
	async play(
		@SlashOption({
			name: 'query',
			description: 'Provide the name of the song or URL.',
			required: true,
			type: ApplicationCommandOptionType.String,
		})
			query: string,
			interaction: ChatInputCommandInteraction,
	) {
		const { guild, channelId, user, member } = interaction;
		const embed = BaseEmbed();

		this.player = this.client.LLManager.createPlayer({
			guildId: guild?.id as string,
			voiceChannelId: (member as GuildMember).voice.channelId as string,
			textChannelId: channelId,
			selfDeaf: true,
			selfMute: false,
		});

		const res = await this.player.search({ query }, member?.user);

		await interaction.deferReply();

		switch (res.loadType) {
		case 'playlist':
			await this.player.connect();
			for (const track of res.tracks) this.player.queue.add(track);

			if (
				!this.player.playing &&
					!this.player.paused &&
					this.player.queue.tracks.length === res.tracks.length
			)
				this.player.play();

			return interaction.editReply({
				embeds: [
					embed
						.setAuthor({
							name: 'Playlist added to the queue',
							iconURL: user.displayAvatarURL(),
						})
						.setDescription(`**[${res.playlist?.title}](${query})**`)
						.addFields(
							{
								name: 'Added',
								value: `\`${res.playlist?.duration}\` tracks`,
								inline: true,
							},
							{
								name: 'Queued by',
								value: `${member}`,
								inline: true,
							},
						),
				],
			});

		case 'search':
		case 'track':
			await this.player.connect();
			await this.player.queue.add(res.tracks[0]);

			if(!this.player.playing) await this.player.play(this.player.connected ? { paused: false } : undefined);

			await interaction.editReply({
				embeds: [
					embed
						.setAuthor({
							name: 'Added to the queue',
							iconURL: user.displayAvatarURL(),
						})
						.setDescription(
							`**[${res.tracks[0].info.title}](${res.tracks[0].info.uri}) by ${res.tracks[0].info.author}** `,
						)
						.setThumbnail(res.tracks[0].info.artworkUrl as string)
						.addFields({
							name: 'Queued by',
							value: `${member}`,
							inline: true,
						}),
				],
			});

			if (this.player.queue.tracks.length > 1)
				embed.addFields({
					name: 'Position in queue',
					value: `${this.player.queue.tracks.length - 1}`,
					inline: true,
				});
			return interaction.editReply({ embeds: [embed] });

		case 'empty':
		case 'error':
			if (this.player) await this.player?.destroy();

			return interaction.editReply({
				embeds: [embed.setDescription('🔹 | No matches found.')],
			});

		default:
			break;
		}
	}

	@Slash({
		name: 'volume',
		description: 'Alters the volume of the player.',
	})
	@Guard(
		isInsideVoiceChannel,
		isPlaying,
		volumeControl,
		playerExists,
	)
	async volume(
		@SlashOption({
			name: 'percent',
			description: 'The new volume value.',
			required: true,
			type: ApplicationCommandOptionType.Number,
		})
			percent: number,
			interaction: ChatInputCommandInteraction,
	) {
		this.player?.setVolume(percent);

		return interaction.reply({
			embeds: [BaseEmbed().setDescription(`Volume has been set to **${this.player?.volume}%**.`)],
		});
	}

	@Slash({
		name: 'seek',
		description: 'Skip to a specific time in the song.',
	})
	@Guard(
		isInsideVoiceChannel,
		isPlaying,
		playerExists,
	)
	async seek(
		@SlashOption({
			name: 'time',
			description: 'Provide the timestamp.',
			required: true,
			type: ApplicationCommandOptionType.Integer,
		})
			time: number,
			interaction: ChatInputCommandInteraction,
	) {
		const duration = Number(time) * 1000;
		const trackDuration = this.player?.queue.current?.info.duration as number;

		if (duration > trackDuration || duration < 0)
			return interaction.reply({
				embeds: [ErrorEmbed().setDescription('The provided timestamp exceeds the song\'s duration.')],
				ephemeral: true,
			});

		await this.player?.seek(duration);

		return interaction.reply({
			embeds: [BaseEmbed().setDescription(`Seeked to ${formatTime(duration)}.`)],
		});
	}

	@Slash({
		name: 'repeat',
		description: 'Repeat the current song or queue.',
	})
	@Guard(
		isInsideVoiceChannel,
		isPlaying,
		playerExists,
	)
	async repeat(
		@SlashChoice({ name: 'Queue', value: 'queue' })
		@SlashChoice({ name: 'Track', value: 'track' })
		@SlashChoice({ name: 'Off', value: 'off' })
		@SlashOption({
			name: 'type',
			description: 'Select the loop type.',
			required: true,
			type: ApplicationCommandOptionType.String,
		})
			type: string,
			interaction: ChatInputCommandInteraction,
	) {
		switch (type) {
		case 'queue':
			await this.player?.setRepeatMode('queue');

			return interaction.reply({
				embeds: [BaseEmbed().setDescription('Repeat mode is now on. (Queue)')],
			});
		case 'track':
			await this.player?.setRepeatMode('track');

			return interaction.reply({
				embeds: [BaseEmbed().setDescription('Repeat mode is now on. (Song)')],
			});
		case 'off':
			await this.player?.setRepeatMode('off');

			return interaction.reply({
				embeds: [BaseEmbed().setDescription('Repeat mode is now off.')],
			});
		default:
			break;
		}
	}

	@Slash({
		name: 'skip',
		description: 'Skips the currently playing song.',
	})
	@Guard(
		isInsideVoiceChannel,
		isPlaying,
		playerExists,
		hasQueue,
	)
	async skip(interaction: ChatInputCommandInteraction) {
		await this.player?.skip();

		return interaction.reply({
			embeds: [BaseEmbed().setDescription('Song skipped.')],
		});
	}

	@Slash({
		name: 'pause',
		description: 'Pauses the currently playing song.',
	})
	@Guard(
		isInsideVoiceChannel,
		isPlaying,
	)
	async pause(interaction: ChatInputCommandInteraction) {
		await this.player?.pause();

		return interaction.reply({
			embeds: [BaseEmbed().setDescription('Player paused.')],
		});
	}

	@Slash({
		name: 'resume',
		description: 'Resumes the currently playing song.',
	})
	@Guard(isInsideVoiceChannel)
	async resume(interaction: ChatInputCommandInteraction) {
		await this.player?.resume();

		return interaction.reply({
			embeds: [BaseEmbed().setDescription('Player resumed.')],
		});
	}

	@Slash({
		name: 'stop',
		description: 'Stops the currently playing songs and disconnects the bot.',
	})
	@Guard(isInsideVoiceChannel)
	async stop(interaction: ChatInputCommandInteraction) {
		await this.player?.destroy();

		return interaction.reply({
			embeds: [BaseEmbed().setDescription('Disconnected.')],
		});
	}

	@Slash({
		name: 'lyrics',
		description: 'Shows you the lyrics of the currently playing song.',
	})
	@Guard(
		isInsideVoiceChannel,
		isPlaying,
		playerExists
	)
	async lyrics(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();

		const track = this.player?.queue.current;
		const res = await this.player?.getLyrics(`${track?.info.author} - ${track?.info.title}`);

		if (!res) return interaction.editReply({
			embeds: [
				ErrorEmbed()
					.setDescription('Couldn\'t find the lyrics for the specified track.')
			]
		})

		return interaction.editReply({
			embeds: [
				BaseEmbed()
					.setAuthor({
						name: `Lyrics for ${track?.info.title}`,
						url: res.url,
					})
					.setDescription(res.lyrics as string)
			],
		});
	}

	@Slash({
		name: 'shuffle',
		description: 'Shuffles the queue.',
	})
	@Guard(
		isInsideVoiceChannel,
		hasQueue,
		playerExists,
	)
	async shuffle(interaction: ChatInputCommandInteraction) {
		await this.player?.queue.shuffle();

		return interaction.reply({
			embeds: [BaseEmbed().setDescription('Queue shuffled.')],
		});
	}

	@Slash({
		name: 'nowplaying',
		description: 'Shows you the currently playing song.',
	})
	@Guard(
		isInsideVoiceChannel,
		isPlaying,
		playerExists,
	)
	async nowplaying(interaction: ChatInputCommandInteraction) {
		const track = this.player?.queue.current;

		const card = await Dynamic({
			thumbnailImage: track?.info.artworkUrl as string,
			name: track?.info.title,
			author: track?.info.author,
			progress: this.player?.currentTrackPosition,
			backgroundImage: 'https://i.postimg.cc/g2h27BVg/blurry-gradient-haikei-1.png',
			imageDarkness: 15,
		});
			
		const attachment = new AttachmentBuilder(card, { name: 'card.png' });

		return interaction.reply({
			embeds: [
				BaseEmbed()
					.setAuthor({
						name: 'Now Playing',
						iconURL: interaction.user.displayAvatarURL(),
					})
					.setImage('attachment://card.png'),
			],
			files: [attachment],
		});
	}

	@Slash({
		name: 'queue',
		description: 'Shows you the queue.',
	})
	@Guard(
		isInsideVoiceChannel,
		isPlaying,
		hasQueue,
		playerExists,
	)
	async queue(interaction: ChatInputCommandInteraction) {
		const { guild } = interaction;
		await interaction.deferReply();

	    const tracks = this.player?.queue.tracks;
    	const currentTrack = this.player?.queue.current;
    	const trackCount = tracks?.length ?? 0;

		const songArray: string[] = new Array(trackCount);
		for (let i = 0; i < trackCount; i++) {
			const track = tracks?.[i];
			songArray[i] = `${i + 1}. **[${track?.info.title}](${track?.info.uri})** by ${track?.info.author} - [${track?.requester}] - ${formatTime(Number(track?.info.duration))}`;
		}

		const embeds: EmbedBuilder[] = [];
		for (let i = 0; i < trackCount; i += 10) {
			const embed = BaseEmbed();

			embed
				.setTitle(`Current queue for ${guild?.name}`)
				.setDescription(`
					⤵ **(currently playing song)**
					**[${currentTrack?.info.title}](${currentTrack?.info.uri})** by ${currentTrack?.info.author} - [${currentTrack?.requester}] - ${formatTime(Number(currentTrack?.info.duration))}
					⤴ **(currently playing song)**

					**Next up:**
					${songArray.slice(i, i + 10).join('\n')}
					`);
			embeds.push(embed);
		}

		const pages = embeds.map(embed => ({ embeds: [embed] }));
		return await new Pagination(interaction, pages, {
			type: PaginationType.Button,
		}).send();
	}

	@Slash({
		name: 'filters',
		description: 'Applies an audio filter.',
	})
	@Guard(
		isInsideVoiceChannel,
		isPlaying,
		playerExists,
	)
	async filters(
		@SlashChoice({ name: '8D', value: '8d' })
		@SlashChoice({ name: 'Bass Boost (Low)', value: 'bassboost_low' })
		@SlashChoice({ name: 'Bass Boost (Mid)', value: 'bassboost_mid' })
		@SlashChoice({ name: 'Bass Boost (High)', value: 'bassboost_high' })
		@SlashChoice({ name: 'Electronic', value: 'electronic' })
		@SlashChoice({ name: 'Karaoke', value: 'karaoke' })
		@SlashChoice({ name: 'Nightcore', value: 'nightcore' })
		@SlashChoice({ name: 'Low Pass', value: 'lowpass' })
		@SlashChoice({ name: 'Pop', value: 'pop' })
		@SlashChoice({ name: 'Rock', value: 'rock' })
		@SlashChoice({ name: 'Vaporwave', value: 'vaporwave' })
		@SlashChoice({ name: 'Reset', value: 'reset' })
		@SlashOption({
			name: 'option',
			description: 'Select the filter you would like to be applied.',
			required: true,
			type: ApplicationCommandOptionType.String,
		})
			option: string,
			interaction: ChatInputCommandInteraction,
	) {
		const embed = BaseEmbed()
			.setTitle('🎧 Filter applied!')
			.setDescription(
				'The filter you requested will be applied. It may take a few seconds for it to propagate.',
			);

		switch (option) {
		case '8d':
			await this.player?.filterManager.toggleRotation(0.2);
			return interaction.reply({ embeds: [embed] });
		case 'bassboost_low':
			await this.player?.filterManager.setEQ(EQList.BassboostLow);
			return interaction.reply({ embeds: [embed] });
		case 'bassboost_mid':
			await this.player?.filterManager.setEQ(EQList.BassboostMedium);
			return interaction.reply({ embeds: [embed] });
		case 'bassboost_high':
			await this.player?.filterManager.setEQ(EQList.BassboostHigh);
			return interaction.reply({ embeds: [embed] });
		case 'electronic':
			await this.player?.filterManager.setEQ(EQList.Electronic);
			return interaction.reply({ embeds: [embed] });
		case 'karaoke':
			await this.player?.filterManager.toggleKaraoke();
			return interaction.reply({ embeds: [embed] });
		case 'nightcore':
			await this.player?.filterManager.toggleNightcore();
			return interaction.reply({ embeds: [embed] });
		case 'pop':
			await this.player?.filterManager.setEQ(EQList.Pop);
			return interaction.reply({ embeds: [embed] });
		case 'rock':
			await this.player?.filterManager.setEQ(EQList.Rock);
			return interaction.reply({ embeds: [embed] });
		case 'vaporwave':
			await this.player?.filterManager.toggleVaporwave();
			return interaction.reply({ embeds: [embed] });
		case 'reset':
			await this.player?.filterManager.clearEQ();
			return interaction.reply({ embeds: [embed] });
		default:
			break;
		}
	}

	@Slash({
		name: 'join',
		description: 'Pairs the bot to your channel.',
	})
	@Guard(isInsideVoiceChannel)
	async join(interaction: ChatInputCommandInteraction) {
		const { guild, channelId, member } = interaction;

		if (!this.player) {
			this.player = this.client.LLManager.createPlayer({
				guildId: guild?.id as string,
				voiceChannelId: (member as GuildMember).voice.channelId as string,
				textChannelId: channelId,
				selfDeaf: true,
				selfMute: false,
			});

			await this.player.connect();
		}

		await this.player.connect();

		return interaction.reply({
			embeds: [BaseEmbed().setDescription(`Paired to ${(member as GuildMember)?.voice.channel}.`)],
		});
	}

	@Slash({
		name: 'previous',
		description: 'Plays the previous track.',
	})
	@Guard(isInsideVoiceChannel, playerExists)
	async previous(interaction: ChatInputCommandInteraction) {
		if (!this.player?.queue?.previous || this.player?.queue?.previous.length === 0)
			return interaction.reply({
				embeds: [ErrorEmbed().setDescription('Couldn\'t find the previous track.')],
				ephemeral: true,
			});

		await this.player.queue.add(this.player.queue.previous);

		return interaction.reply({
			embeds: [BaseEmbed().setDescription('Enqueued the previous track.')],
		});
	}

	@Slash({
		name: 'getposition',
		description: 'debug: gets the position of the player',
	})
	@Guard(isInsideVoiceChannel, playerExists)
	async getposition(interaction: ChatInputCommandInteraction) {
		return interaction.reply({ content: `Current player position: ${this.player?.lastPosition} (from LL), ${this.player?.position} (client-side), ${Number(this.player?.position) / 1000} (calculated, to seconds from LL), ${Math.floor((Number(this.player?.position) / Number(this.player?.queue.current?.info.duration)) * 100)}, calculated with player position divided by track duration (both from LL)`})
	}

	/**
	 * The components below handle the logic
	 * for the buttons when the 'trackStart' event gets emitted.
	 */
	@ButtonComponent({ id: 'previous' })
	@Guard(
		isInsideVoiceChannel,
		hasQueue,
		playerExists,
	)
	async previousButton(interaction: ButtonInteraction) {
		const { user } = interaction;
		if (!this.player?.queue?.previous || this.player?.queue?.previous.length === 0)
			return interaction.reply({
				embeds: [ErrorEmbed().setDescription('Couldn\'t find the previous track.')],
				ephemeral: true,
			});

		await this.player.play({
			clientTrack: this.player.queue.previous[0],
		});

		return interaction.reply({
			embeds: [ButtonEmbed(user).setDescription('Enqueued the previous track.')],
		});
	}

	@ButtonComponent({ id: 'resumepause' })
	@Guard(isInsideVoiceChannel, playerExists)
	async pauseButton(interaction: ButtonInteraction) {
		const { user } = interaction;

		this.player?.paused ? this.player.resume() : this.player?.pause();
		const description = this.player?.paused ? 'Player resumed.' : 'Player paused.';

		return interaction.reply({
			embeds: [ButtonEmbed(user).setDescription(description)],
		});
	}

	@ButtonComponent({ id: 'next' })
	@Guard(
		isInsideVoiceChannel,
		hasQueue,
		playerExists,
	)
	async nextButton(interaction: ButtonInteraction) {
		const { user } = interaction;
		await this.player?.skip();

		return interaction.reply({
			embeds: [ButtonEmbed(user).setDescription('Track skipped.')],
		});
	}

	@ButtonComponent({ id: 'voldown' })
	@Guard(
		isInsideVoiceChannel,
		isPlaying,
		volumeControl,
	)
	async volDownButton(interaction: ButtonInteraction) {
		const { user } = interaction;
		await this.player?.setVolume(Number(this.player?.volume) - 10);

		return interaction.reply({
			embeds: [ButtonEmbed(user).setDescription(`Volume has been set to **${this.player?.volume}%**.`)],
		});
	}

	@ButtonComponent({ id: 'stop' })
	@Guard(isInsideVoiceChannel)
	async stopButton(interaction: ButtonInteraction) {
		const { user } = interaction;
		await this.player?.destroy();

		return interaction.reply({
			embeds: [ButtonEmbed(user).setDescription('Disconnected.')],
		});
	}

	@ButtonComponent({ id: 'volup' })
	@Guard(
		isInsideVoiceChannel,
		isPlaying,
		volumeControl,
	)
	async volUpButton(interaction: ButtonInteraction) {
		const { user } = interaction;
		await this.player?.setVolume(Number(this.player?.volume) + 10);

		return interaction.reply({
			embeds: [ButtonEmbed(user).setDescription(`Volume has been set to **${this.player?.volume}%**.`)],
		});
	}

	@ButtonComponent({ id: 'shuffle' })
	@Guard(
		isInsideVoiceChannel,
		hasQueue,
		playerExists,
	)
	async shuffleButton(interaction: ButtonInteraction) {
		const { user } = interaction;
		await this.player?.queue.shuffle();

		return interaction.reply({
			embeds: [ButtonEmbed(user).setDescription('🔹 | Queue shuffled.')],
		});
	}

	@ButtonComponent({ id: 'repeat' })
	@Guard(
		isInsideVoiceChannel,
		isPlaying,
		playerExists,
	)
	async repeatButton(interaction: ButtonInteraction) {
		// TODO: Implement.

		return interaction.reply({
			content: 'Currently unimplemented. Coming soon.',
			ephemeral: true,
		});
	}	
}
