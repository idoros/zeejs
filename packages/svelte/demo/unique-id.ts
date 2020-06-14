let idCount = 0;
export function getUniqueId() {
    idCount++;
    return `u` + idCount.toString(36);
}
