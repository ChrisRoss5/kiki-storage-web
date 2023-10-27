use master

begin try
  alter database DropboxClone set single_user with rollback immediate
  drop database DropboxClone
end try
begin catch end catch

create database DropboxClone
go
use DropboxClone
go

select * from Item

delete from Item

TRUNCATE TABLE Item