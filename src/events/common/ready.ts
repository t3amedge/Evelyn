import type { ArgsOf, Client } from "discordx";
import { Discord, Once } from "discordx";
import { Evelyn } from "../../main.js";

@Discord()
export class ReadyEvent {
  @Once({ event: 'ready' })
  async ready([client]: [Evelyn]): Promise<void> {
    console.info(`Signed in as ${client.user?.tag}.`)
  }
}
