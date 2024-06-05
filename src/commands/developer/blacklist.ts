import { Evelyn } from "@Evelyn";
import type { EntityManager } from "@mikro-orm/mongodb";
import { type ChatInputCommandInteraction, type User, ApplicationCommandOptionType, Snowflake } from "discord.js";
import { Discord, Slash, SlashOption, SlashGroup, Guild, IGuild } from 'discordx';
import { config } from "../../config";
import { Blacklist } from "src/entities/blacklist.entity";
import { BaseEmbed, ErrorEmbed } from "src/utils/embeds";
import { inject, injectable } from "tsyringe";

import { Guilds as GuildEntity } from "src/entities/guild.entity";

@Discord()
@Guild(config.developmentGuild as IGuild)
@injectable()
@SlashGroup({ description: "The blacklisting system.", name: "blacklist" })
@SlashGroup({ description: "Blacklist a user from the bot.", name: "user", root: "blacklist" })
@SlashGroup({ description: "Blacklist a guild from the bot.", name: "guild", root: "blacklist" })
export class BlacklistCommand {
  private orm: EntityManager;
  
  constructor(@inject(Evelyn) private readonly client: Evelyn) {
    this.orm = this.client.orm.em.fork();
  }

  @Slash({ 
    name: 'add',
    description: "Blacklists a user from the bot." 
  })
  @SlashGroup("user", "blacklist")
  async user_add(
    @SlashOption({
      description: "The user you want to blacklist.",
      name: "user",
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    user: User,
    @SlashOption({
      description: "The reason the user is being blacklisted for.",
      name: "reason",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    reason: string,
    interaction: ChatInputCommandInteraction,
  ) {
    if (user.partial) await user.fetch();

    const existingData = await this.orm.findOne(Blacklist, {
        userId: user.id
    });

    if (existingData) return interaction.reply({
        embeds: [ErrorEmbed().setDescription('This user is already blacklisted.')],
        ephemeral: true,
    });

    const data = this.orm.create(Blacklist, {
        userId: user.id, reason, time: Math.floor(new Date().getTime() / 1000),
    });

    await this.orm.persistAndFlush(data);

    return interaction.reply({
        embeds: [
            BaseEmbed()
                .setTitle('Blacklist Successful')
                .setDescription('This user has been successfully blacklisted.')
                .addFields(
                    {
                        name: 'User',
                        value: `> ${user}`,
                        inline: true,
                    },
                    { 
                        name: 'Reason',
                        value: `> ${reason}`,
                        inline: true,
                    },
                    {
                        name: 'Blacklisted on',
                        value: `> t:<${data.time}:R>`,
                        inline: true,
                    }
                )
        ],
        ephemeral: true,
    });
  }

  @Slash({ 
    name: 'remove',
    description: "Removes a user from the bot's blacklist." 
  })
  @SlashGroup("user", "blacklist")
  async user_remove(
    @SlashOption({
      description: "The user you want to remove from the blacklist.",
      name: "user",
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    user: User,
    interaction: ChatInputCommandInteraction,
  ) {
    if (user.partial) await user.fetch();

    const data = await this.orm.findOne(Blacklist, {
        userId: user.id
    });

    if (!data) return interaction.reply({
        embeds: [ErrorEmbed().setDescription('This user isn\'t blacklisted.')],
        ephemeral: true,
    });

    await this.orm.removeAndFlush(data);

    return interaction.reply({
        embeds: [
            BaseEmbed()
                .setDescription('This user has been successfully removed from the blacklist.')
        ],
        ephemeral: true,
    });
  }

  @Slash({ 
    name: 'add',
    description: "Blacklists a guild from the bot." 
  })
  @SlashGroup("guild", "blacklist")
  async guild_add(
    @SlashOption({
      description: "The ID of the guild you want to blacklist.",
      name: "guild",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    guild: Snowflake,
    @SlashOption({
      description: "The reason the guild is being blacklisted for.",
      name: "reason",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    reason: string,
    interaction: ChatInputCommandInteraction,
  ) {
    const existingData = await this.orm.findOne(GuildEntity, {
        guildId: guild,
    });

    if (existingData?.blacklist.isBlacklisted) return interaction.reply({
        embeds: [ErrorEmbed().setDescription('This guild is already blacklisted.')],
        ephemeral: true,
    });

    await this.orm.nativeUpdate(GuildEntity,
      {
        guildId: guild
      },
      {
        blacklist: {
          isBlacklisted: true,
          reason,
          time: Math.floor(new Date().getTime() / 1000),
        },
      }
    );

    return interaction.reply({
        embeds: [
            BaseEmbed()
                .setTitle('Blacklist Successful')
                .setDescription('This guild has been successfully blacklisted.')
                .addFields(
                    {
                        name: 'Guild',
                        value: `> ${guild}`,
                        inline: true,
                    },
                    { 
                        name: 'Reason',
                        value: `> ${reason}`,
                        inline: true,
                    },
                    {
                        name: 'Blacklisted on',
                        value: `> <t:${Math.floor(new Date().getTime() / 1000)}:R>`,
                        inline: true,
                    }
                )
        ],
        ephemeral: true,
    });
  }

  @Slash({ 
    name: 'remove',
    description: "Removes a guild from the bot's blacklist." 
  })
  @SlashGroup("guild", "blacklist")
  async remove(
    @SlashOption({
      description: "The ID of the guild you want to remove from the blacklist.",
      name: "guild",
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    guild: string,
    interaction: ChatInputCommandInteraction,
  ) {
    const data = await this.orm.findOne(GuildEntity, {
      guildId: guild,
    });

    if (!data?.blacklist.isBlacklisted) return interaction.reply({
        embeds: [ErrorEmbed().setDescription('This guild isn\'t blacklisted.')],
        ephemeral: true,
    });


    await this.orm.nativeUpdate(GuildEntity,
      {
        guildId: guild
      },
      {
        blacklist: {
          isBlacklisted: false,
        },
      }
    );

    return interaction.reply({
        embeds: [
            BaseEmbed()
                .setDescription('This user has been successfully removed from the blacklist.')
        ],
        ephemeral: true,
    });
  }
}
