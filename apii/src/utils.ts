import prisma from "./prisma";

export function updatePaths(oldPathWithName: string, newPathWithName: string) {
  const oldPathWithNameLength = oldPathWithName.length;
  const like = `${oldPathWithName}%`;
  return prisma.$executeRaw`
      UPDATE Item SET
        path = STUFF(path, 1, ${oldPathWithNameLength}, ${newPathWithName})
        WHERE path LIKE ${like}`;
}
