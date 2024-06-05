export function makeTimestamp(num: number | undefined) {
    if (!num) return null;
    return Math.floor(num / 1000);
}