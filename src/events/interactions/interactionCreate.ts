import { ArgsOf, Discord, Guard, On } from "discordx";
import { Evelyn } from "@Evelyn";
import { isBlacklisted } from "src/guards/isBlacklisted";

@Discord()
export class InteractionEvent {
    @On({ event: 'interactionCreate' })
    @Guard(isBlacklisted)
    async onInteraction(
        [interaction]: ArgsOf<'interactionCreate'>,
        client: Evelyn,
    ) {
        try {
            await client.executeInteraction(interaction);
        } catch (err) {
            // TODO: Implement Sentry here.
            console.log(err);
        }
    }
}