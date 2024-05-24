import { singleton } from 'tsyringe';
import { Evelyn } from '@Evelyn';
import cryptr from 'cryptr';

/** The Secure Storage module of Evelyn that keeps your shit safe. */
@singleton()
export class SecureStorage {
	/**
	 * Encrypts the provided value.
	 * @public
	 * @param value The value that will be encrypted.
	 * @param client The Evelyn object.
	 * @returns {string}
	 */
	public encrypt(value: string, client: Evelyn): string {
		const keepMyDataSecure = new cryptr(client.config.decryptionKey, {
			pbkdf2Iterations: 15000,
			saltLength: 15,
		});

		return keepMyDataSecure.encrypt(value);
	}

	/**
	 * Decrypts the provided value.
	 * @public
	 * @param encryptedValue The value that will be decrypted.
	 * @param client The Evelyn object.
	 * @returns {string}
	 */
	public decrypt(encryptedValue: string, client: Evelyn): string {
		if (!encryptedValue) return;

		const keepMyDataSecure = new cryptr(client.config.decryptionKey, {
			pbkdf2Iterations: 15000,
			saltLength: 15,
		});

		return keepMyDataSecure.decrypt(encryptedValue);
	}
}
