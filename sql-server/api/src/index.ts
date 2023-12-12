import { Prisma } from "@prisma/client";
import cors from "cors";
import express from "express";
import prisma from "./prisma";
import * as utils from "./utils";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/searchItems", async (req, res) => {
  const query = req.query.query as string;
  const minSize = parseInt(req.query.minSize as string);
  const maxSize = parseInt(req.query.maxSize as string);
  const type = req.query.type as string;
  const types = type.split(",").map((t) => t.trim());
  const result = await prisma.item.findMany({
    where: {
      name: { startsWith: query },
      ...(minSize || maxSize
        ? {
            size: {
              ...(minSize ? { gte: minSize } : {}),
              ...(maxSize ? { lte: maxSize } : {}),
            },
          }
        : {}),
      ...(type
        ? {
            isFolder: type == "Folders",
            ...(/Files|Folders/.test(type) ? { type: { in: types } } : {}),
          }
        : {}),
    },
  });
  res.json(result);
});

app.get("/getItems", async (req, res) => {
  const result = await prisma.item.findMany({
    where: { path: req.query.path as string },
  });
  res.json(result);
});

app.post("/createItems", async (req, res) => {
  const items = req.body as Item[];
  if (!items.length) return;
  const createdItems = await prisma.$transaction(
    items.map((item) => prisma.item.create({ data: item }))
  );
  await utils.updateDateModified(items[0].path); // Todo: fix;
  res.json(createdItems);
});

app.put("/moveItems", async (req, res) => {
  const items = req.body.items as ItemWithId[];
  if (!items.length) return;
  const itemIds = items.map((i) => i.id);
  const oldPath = items[0].path;
  const newPath = req.body.newPath as string;
  let count = 0;
  for (const { name } of items.filter((i) => i.isFolder)) {
    const oldPathWithName = `${oldPath ? oldPath + "/" : ""}${name}`;
    const newPathWithName = `${newPath ? newPath + "/" : ""}${name}`;
    count += await utils.updatePaths(oldPathWithName, newPathWithName);
  }
  count += (
    await prisma.item.updateMany({
      where: { id: { in: itemIds } },
      data: { path: newPath },
    })
  ).count;
  await utils.updateDateModified(newPath); // Todo: fix;
  res.json({ count } satisfies Prisma.BatchPayload);
});

app.put(`/renameItem`, async (req, res) => {
  const { id, name: oldName, path, isFolder } = req.body.item as ItemWithId;
  const newName = req.body.newName as string;
  let count = 0;
  if (isFolder) {
    const _path = path ? path + "/" : "";
    const newPathWithName = `${_path}${newName}`;
    const oldPathWithName = `${_path}${oldName}`;
    count += await utils.updatePaths(oldPathWithName, newPathWithName);
  }
  count += +!!(await prisma.item.update({
    where: { id },
    data: { name: newName },
  }));
  await utils.updateDateModified(path); // Todo: fix;
  res.json({ count } satisfies Prisma.BatchPayload);
});

app.delete(`/deleteItems`, async (req, res) => {
  const items = req.body as ItemWithId[];
  if (!items.length) return;
  let count = 0;
  for (const { id, isFolder, path, name } of items) {
    if (isFolder) {
      const _path = path ? path + "/" : "";
      count += (
        await prisma.item.deleteMany({
          where: {
            path: { startsWith: `${_path}${name}` },
          },
        })
      ).count;
    }
    count += +!!(await prisma.item.delete({
      where: { id },
    }));
  }
  await utils.updateDateModified(items[0].path); // Todo: fix;
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
