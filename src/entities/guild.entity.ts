import { Entity, ObjectId, PrimaryKey, Property, SerializedPrimaryKey } from '@mikro-orm/mongodb';

@Entity()
export class Guilds {
    @PrimaryKey({ type: ObjectId })
    _id!: ObjectId;

    @SerializedPrimaryKey({ type: String })
    id!: string; // won't be saved in the database

    @Property({ type: String })
    guildId!: string;

    @Property({ type: Object })
    blacklist!: {
        isBlacklisted: Boolean;
        reason: String;
        time: Number;
    }

    @Property({ type: Object })
    confessions!: {
        enabled: Boolean;
        channel: String;
        webhookId: String;
    };

    @Property({ type: Object })
    logs!: {
        enabled: Boolean;
        channel: String;
        webhookId: String;
    };
}