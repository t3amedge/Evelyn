import { model, Schema } from 'mongoose';

interface RRInterface {
	/** The name of the panel. */
	panelName: string;
	/** The ID of the server. */
	id: string;
	/** The array of roles. */
	roleArray: {
		/** The ID of the role. */
		roleId: string;
		/** The name of the role. */
		name: string;
		/** The description of the role. */
		description: string;
		/** The chosen emoji for the role. */
		emoji: string;
	}[];
}

export const RolesDB = model<RRInterface>(
	'Roles',
	new Schema({
		panelName: String,
		id: String,
		roleArray: Array,
	}),
);
