import { ArgsOf, Discord, On } from "discordx";
import { Evelyn } from "@Evelyn";

@Discord()
export class InteractionEvent {
    @On({ event: 'interactionCreate' })
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