import { Evelyn } from "@Evelyn";

import { type ChatInputCommandInteraction } from "discord.js";
import { Discord, Slash, Guild, IGuild } from 'discordx';
import { config } from "../../config";

import { BaseEmbed } from "src/utils/embeds";
import { inject, injectable } from "tsyringe";
import { cpus, platform } from "os";

import { makeTimestamp } from "src/utils/makeTimestamp";

@Discord()
@injectable()
@Guild(config.developmentGuild as IGuild)
export class StatusCommand {
  constructor(@inject(Evelyn) private readonly client: Evelyn) {}

  @Slash({ 
    name: 'status',
    description: "Shows the bot's status." 
  })
  async status(interaction: ChatInputCommandInteraction) {
    const { ws, user, guilds, readyTimestamp } = this.client;

	const model = cpus()[0].model;
	const cores = cpus().length;
	const systemPlatform = platform()
		.replace('win32', 'Windows')
		.replace('linux', 'Linux');
	const createdTime = makeTimestamp(user?.createdTimestamp);
    const readyTSMP = makeTimestamp(readyTimestamp as number);
    const dbStatus = await this.client.orm.checkConnection();
    
    return interaction.reply({
        embeds: [
            BaseEmbed()
                .setTitle(`${user?.username} | Status`)
                .addFields(
                    {
                        name: 'General',
                        value: `
                            > **Name** ${user?.username}
                            > **WebSocket Ping** ${ws.ping}ms
                            > **Database Status** ${String(dbStatus.ok).replace('true', 'Connected')}
                            > **Uptime** <t:${readyTSMP}:R>
                        `
                    },
                    {
                        name: 'Application Info',
                        value: `
                            > **Connected to** ${guilds.cache.size} servers (may vary)
                            > **Active since** <t:${createdTime}:R>
                        `
                    },
                    {
                        name: 'Server Info',
                        value: `
                            > **OS** ${systemPlatform}
                            > **CPU** ${model} with ${cores} cores
                        `
                    },
                )
        ],
        ephemeral: true,
    });
  }
}
