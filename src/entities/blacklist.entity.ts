import { Entity, ObjectId, PrimaryKey, Property, SerializedPrimaryKey } from '@mikro-orm/mongodb';

@Entity()
export class Blacklist {
    @PrimaryKey({ type: ObjectId })
    _id!: ObjectId;

    @SerializedPrimaryKey({ type: String })
    id!: string; // won't be saved in the database

    @Property({ type: String })
    userId!: string;

    @Property({ type: String })
    reason!: string;

    @Property({ type: Number })
    time!: number;
}