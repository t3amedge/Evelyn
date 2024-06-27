/** Converts time from ms to a readable format. */
export function formatTime(duration: number): string {
	const ms = duration % 1000;
	duration = (duration - ms) / 1000;
	const secs = duration % 60;
	duration = (duration - secs) / 60;
	const mins = duration % 60;
	const hrs = (duration - mins) / 60;

	const formattedParts: string[] = [];
	if (hrs > 0) formattedParts.push(`${hrs}h`);
	if (mins > 0) formattedParts.push(`${mins}m`);
	if (secs > 0) formattedParts.push(`${secs}s`);
	return formattedParts.join('');
}
