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

/* select * from Item

delete from Item

truncate table Item

UPDATE Item SET
          path = STUFF(path, 1, 1, 'a0')
          WHERE path LIKE 'a%'

select STUFF(path, 1, 1, 'a0') from Item WHERE path LIKE 'a%' */