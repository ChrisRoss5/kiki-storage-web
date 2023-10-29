import { Prisma, PrismaClient } from "@prisma/client";
import express from "express";
import cors from "cors";

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/getItems", async (req, res) => {
  const result = await prisma.item.findMany({
    where: {
      path: req.query.path as string,
    },
  });
  res.json(result);
});

app.post("/createItems", async (req, res) => {
  const result = await prisma.item.createMany({ data: req.body });
  res.json(result);
});

app.put(`/renameItem`, async (req, res) => {
  const { isFolder, path, oldName, newName } = req.body;
  let count = 0;
  console.log("BODY: ", { isFolder, path, oldName, newName });

  if (isFolder) {
    const _path = path ? path + "/" : "";
    const oldPathFullLength = `${_path}${oldName}`.length;
    const newPathFull = `${_path}${newName}`;
    const oldPathFull = `${_path}${oldName}`;
    const q = `
        UPDATE Item SET
          path = STUFF(path, 1, ${oldPathFullLength}, \'${newPathFull}\')
          WHERE path LIKE \'${_path}${oldName}%\'`
    console.log(q);
    count += await prisma.$executeRaw`
        UPDATE Item SET
          path = STUFF(path, 1, ${oldPathFullLength}, \'${newPathFull}\')
          WHERE path LIKE \'${oldPathFull}%\'`;
  }
  count += +!!(await prisma.item.update({
    where: {
      name_path: { name: oldName, path },
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
        name_path: { name, path },
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
