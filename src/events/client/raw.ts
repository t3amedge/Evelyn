import type { ChannelDeletePacket, VoicePacket, VoiceServer, VoiceState } from "lavalink-client";
import { inject, injectable } from "tsyringe";
import { Discord, On } from "discordx";
import { Evelyn } from "@Evelyn";

@Discord()
@injectable()
export class RawEvent {
  constructor(@inject(Evelyn) private readonly client: Evelyn) {}

  // @ts-ignore
  @On({ event: 'raw' })
  async raw([payload]: [VoicePacket | VoiceServer | VoiceState | ChannelDeletePacket]): Promise<void> {
    //console.log('Raw event called!')
    await this.client.LLManager.sendRawData(payload);
    //console.log('LL payload sent!')
  }
}
