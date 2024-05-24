import type {
  ButtonInteraction,
  CommandInteraction,
  GuildMember,
  MessageActionRowComponentBuilder,
  User,
} from "discord.js";
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { ButtonComponent, Discord, Slash, SlashOption } from "discordx";

@Discord()
export class Example {
  @Slash({ description: "hello", name: "hello-btn" })
  async hello(
    @SlashOption({
      description: "user",
      name: "user",
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    user: User | GuildMember | undefined,
    interaction: CommandInteraction,
  ): Promise<void> {
    await interaction.deferReply();

    const helloBtn = new ButtonBuilder()
      .setLabel("Hello")
      .setEmoji("👋")
      .setStyle(ButtonStyle.Primary)
      .setCustomId("hello-btn");

    const row =
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        helloBtn,
      );

    await interaction.editReply({
      components: [row],
      content: `${user?.toString()}, Say hello to bot`,
    });
  }

  @ButtonComponent({ id: "hello-btn" })
  async helloBtn(interaction: ButtonInteraction): Promise<void> {
    await interaction.reply(`👋 ${interaction.member?.toString()}`);
  }
}
