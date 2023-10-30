/*
  Warnings:

  - A unique constraint covering the columns `[name,path,isFolder]` on the table `Item` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- DropIndex
ALTER TABLE [dbo].[Item] DROP CONSTRAINT [Item_name_path_key];

-- CreateIndex
ALTER TABLE [dbo].[Item] ADD CONSTRAINT [Item_name_path_isFolder_key] UNIQUE NONCLUSTERED ([name], [path], [isFolder]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
