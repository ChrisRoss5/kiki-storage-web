import prisma from "./prisma";

export function updatePaths(oldPathWithName: string, newPathWithName: string) {
  const oldPathWithNameLength = oldPathWithName.length;
  const like = `${oldPathWithName}%`;

  // This IS secure!
  // https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#executeraw
  return prisma.$executeRaw`
      UPDATE Item SET
        path = STUFF(path, 1, ${oldPathWithNameLength}, ${newPathWithName})
        WHERE path LIKE ${like}`;
}

export function updateDateModified(path: string) {
  if (!path) return Promise.resolve();
  const name = path.split("/").pop()!;
  path = path.slice(0, -name.length - 1);
  return prisma.item.update({
    where: {
      name_type_path_isFolder: {
        name,
        type: "",
        path,
        isFolder: true,
      },
    },
    data: { dateModified: new Date().toISOString() },
  });
}
