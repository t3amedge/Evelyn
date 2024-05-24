/* eslint-disable no-mixed-spaces-and-tabs */
import { ArgsOf, Discord, Guard, On } from 'discordx';
import { EvieEmbed } from '@/Utils/EvieEmbed.js';
import { send } from '@Helpers/loggerUtils.js';
import { HasLogsEnabled } from '@Guards';
import { Evelyn } from '@Evelyn';

@Discord()
export class VoiceStateUpdate {
	@On({ event: 'voiceStateUpdate' })
	@Guard(HasLogsEnabled)
	async messageUpdate(states: ArgsOf<'voiceStateUpdate'>, client: Evelyn) {
		const oldState = states[0];
		const newState = states[1];

		const embed = EvieEmbed()
			.setAuthor({
				name: newState.member.user.displayName,
				iconURL: newState.member.user.avatarURL(),
			})
			.setTitle('Voice State Updated');

		if (newState.channelId === null)
			return await send({
				guild: newState.guild.id,
				client,
				embed:
                    embed
                    	.setDescription(`${oldState.member.displayName} has left voice channel <#${oldState.channelId}>.`),
			});

		if (!oldState.channelId) return await send({
			guild: newState.guild.id,
			client,
			embed:
                embed
                	.setDescription(`${newState.member.displayName} has joined a channel.`)
                	.addFields(
                	    {
                		    name: '🔹 | ID',
                		    value: `> <#${newState.channelId}>`,
                	    },
                	),
		});

		if (newState.channelId !== oldState.channelId)
			return await send({
				guild: newState.guild.id,
				client,
				embed:
                    embed.addFields(
                    	{
                    		name: '🔹 | Old Voice Channel',
                    		value: `> <#${oldState.channelId}>`,
                    	},
                    	{
                    		name: '🔹 | New Voice Channel',
                    		value: `> <#${newState.channelId}>`,
                    	},
                    ),
			});


	}
}

