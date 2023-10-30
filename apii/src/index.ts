import { Prisma } from "@prisma/client";
import cors from "cors";
import express from "express";
import prisma from "./prisma";
import { updatePaths } from "./utils";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/getItems", async (req, res) => {
  const result = await prisma.item.findMany({
    where: { path: req.query.path as string },
  });
  res.json(result);
});

app.post("/createItems", async (req, res) => {
  const items = req.body as Item[];
  const createdItems = await prisma.$transaction(
    items.map((item) => prisma.item.create({ data: item }))
  );
  console.log(items);
  console.log(createdItems);
  res.json(createdItems);
});

app.put("/moveItems", async (req, res) => {
  let count = 0;
  const items = req.body.items as ItemWithId[];
  const itemIds = items.map((i) => i.id);
  const oldPath = items[0].path;
  const newPath = req.body.newPath as string;
  const _oldPath = oldPath ? oldPath + "/" : "";
  const _newPath = newPath ? newPath + "/" : "";
  for (const { isFolder, name } of items) {
    if (!isFolder) continue;
    const oldPathWithName = `${_oldPath}${name}`;
    const newPathWithName = `${_newPath}${name}`;
    count += await updatePaths(oldPathWithName, newPathWithName);
  }
  count += (
    await prisma.item.updateMany({
      where: { id: { in: itemIds } },
      data: { path: newPath },
    })
  ).count;
  res.json({ count } satisfies Prisma.BatchPayload);
});

app.put(`/renameItem`, async (req, res) => {
  const { isFolder, path, oldName, newName } = req.body;
  let count = 0;
  if (isFolder) {
    const _path = path ? path + "/" : "";
    const newPathWithName = `${_path}${newName}`;
    const oldPathWithName = `${_path}${oldName}`;
    const oldPathWithNameLength = oldPathWithName.length;
    const like = `${oldPathWithName}%`;
    count += await prisma.$executeRaw`
        UPDATE Item SET
          path = STUFF(path, 1, ${oldPathWithNameLength}, ${newPathWithName})
          WHERE path LIKE ${like}`;
  }
  count += +!!(await prisma.item.update({
    where: {
      name_path_isFolder: { name: oldName, path, isFolder },
    },
    data: { name: newName },
  }));
  res.json({ count } satisfies Prisma.BatchPayload);
});

app.delete(`/deleteItems`, async (req, res) => {
  let count = 0;
  for (const { isFolder, path, name } of req.body) {
    if (isFolder) {
      count += (
        await prisma.item.deleteMany({
          where: {
            path: { startsWith: `${path}/${name}` },
          },
        })
      ).count;
    }
    count += +!!(await prisma.item.delete({
      where: {
        name_path_isFolder: { name, path, isFolder },
      },
    }));
  }
  res.json({ count } satisfies Prisma.BatchPayload);
});

const server = app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000
⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`)
);

// https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields#working-with-bigint
// @ts-ignore
BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};
