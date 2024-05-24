import type {
  MessageContextMenuCommandInteraction,
  UserContextMenuCommandInteraction,
} from "discord.js";
import { ApplicationCommandType } from "discord.js";
import { ContextMenu, Discord } from "discordx";

@Discord()
export class Example {
  @ContextMenu({
    name: "message context",
    type: ApplicationCommandType.Message,
  })
  async messageHandler(
    interaction: MessageContextMenuCommandInteraction,
  ): Promise<void> {
    await interaction.reply("I am user context handler");
  }

  @ContextMenu({ name: "user context", type: ApplicationCommandType.User })
  async userHandler(
    interaction: UserContextMenuCommandInteraction,
  ): Promise<void> {
    await interaction.reply("I am user context handler");
  }
}
