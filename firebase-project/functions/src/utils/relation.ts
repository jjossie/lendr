
export function getRelationId(currentUserId: string, otherUserId: string) {
    // Sort the two user IDs alphabetically to ensure that the relation is unique.
    const sortedUserIds = [currentUserId, otherUserId].sort();
    return `${sortedUserIds[0]}-${sortedUserIds[1]}`;
  }
  