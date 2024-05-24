import type { CommandInteraction } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";

@Discord()
export class Example {
  @Slash({ description: "choose" })
  async choose(
    @SlashChoice("Human", "Astronaut", "Dev")
    @SlashOption({
      description: "What are you?",
      name: "what",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    what: string,
    interaction: CommandInteraction,
  ): Promise<void> {
    await interaction.reply(what);
  }

  @Slash({ description: "choose1" })
  async choose1(
    @SlashChoice({ name: "are you okay?", value: "okay" })
    @SlashChoice({ name: "are you good?", value: "good" })
    @SlashOption({
      description: "what1",
      name: "what1",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    what: string,
    interaction: CommandInteraction,
  ): Promise<void> {
    await interaction.reply(what);
  }
}
