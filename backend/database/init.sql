create table users (
	id 						serial primary key,
	username 				text not null unique,
	email					text not null unique,
	u_password				text not null,
	is_admin				boolean not null
);

create table rubrics (
	id 						serial primary key,
	title					text not null,
	parent_id 				integer not null REFERENCES rubrics (id) ON DELETE CASCADE
);

create table maps (
	id 						serial primary key,
	user_id					integer not null REFERENCES users (id) ON DELETE CASCADE,
	title					text not null
);

create table repositories (
	id 						serial primary key,
	rubric_id				integer REFERENCES rubrics (id) ON DELETE CASCADE,
	map_id					integer REFERENCES maps (id) ON DELETE CASCADE,
	user_id					integer REFERENCES users (id) ON DELETE CASCADE,

	path_to_repository		text not null,
	is_privite				boolean not null,
	title 					text not null unique
);

create table users_repositories_relationship (
	id 						serial primary key,
	user_id					integer not null REFERENCES users (id) ON DELETE CASCADE,
	repository_id			integer not null REFERENCES repositories (id) ON DELETE CASCADE,
	relationship			bit(3) not null,
	
	UNIQUE (user_id, repository_id)
);

create table users_rubrics_relationship (
	id 						serial primary key,
	user_id					integer not null REFERENCES users (id) ON DELETE CASCADE,
	rubrics_id				integer not null REFERENCES rubrics (id) ON DELETE CASCADE,
	relationship			bit(3) not null,
	
	UNIQUE (user_id, rubrics_id)
);

create table users_maps_relationship (
	id 						serial primary key,
	user_id					integer not null REFERENCES users (id) ON DELETE CASCADE,
	map_id					integer not null REFERENCES maps (id) ON DELETE CASCADE,
	relationship			bit(3) not null,
	
	UNIQUE (user_id, map_id)
);

create table groups (
	id 						serial primary key,
	title					text not null,
	parent_id 				integer not null REFERENCES groups (id) ON DELETE CASCADE
);

create table usesrs_groups (
	id 						serial primary key,
	user_id					integer not null REFERENCES users (id) ON DELETE CASCADE,
	group_id				integer not null REFERENCES groups (id) ON DELETE CASCADE
);

create table map_to_map_links (
	id 						serial primary key,
	parent_id				integer not null REFERENCES maps (id) ON DELETE CASCADE,
	child_id				integer not null REFERENCES maps (id) ON DELETE CASCADE,
	is_child				boolean,
	link_name				text not null
);

create table map_to_rubric_links (
	id 						serial primary key,
	map_id					integer not null REFERENCES maps (id) ON DELETE CASCADE,
	rubric_id				integer not null REFERENCES rubrics (id) ON DELETE CASCADE,
	link_name				text not null
);

create table map_to_repository_links (
	id 						serial primary key,
	map_id					integer not null REFERENCES maps (id) ON DELETE CASCADE,
	repository_id			integer not null REFERENCES repositories (id) ON DELETE CASCADE,
	link_name				text not null
);

insert into users (username, email, u_password, is_admin)
values ('cuzkov', 'users@gmail.com', 'Gurkina12', true);

-----------------------------------------------------------------------
-- Создание нового пользователя
-----------------------------------------------------------------------
create function create_user(
	username_v text,
	email_v text,
	u_password_v text,
	is_admin_v boolean
) returns table(id integer) as
$BODY$
	declare
	--------------------
	begin
		insert into users (username, email, u_password, is_admin)
		values (username_v, email_v, u_password_v, is_admin_v);

		return query 
			select users.id from users where username=username_v limit 1;
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- Получение пользователя по email
-----------------------------------------------------------------------
create function get_user_by_email(
	email_v text
) returns table(id integer, username text, email text, u_password text, is_admin boolean) as
$BODY$
	declare
	--------------------
	begin
		return query 
			select users.id, users.username, users.email, users.u_password, users.is_admin from users
			where users.email = email_v
			limit 1;
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- Получение пользователя по username
-----------------------------------------------------------------------
create function get_user_by_username(
	username_v text
) returns table(id integer, username text, email text, u_password text, is_admin boolean) as
$BODY$
	declare
	--------------------
	begin
		return query 
			select users.id, users.username, users.email, users.u_password, users.is_admin from users
			where users.username=username_v
			limit 1;
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- Создание новой карты знаний
-----------------------------------------------------------------------
create function create_map(
	user_id_v integer,
	title_v text
) returns integer as
$BODY$
	declare
		map_id_v integer;
	begin
		insert into maps (user_id, title)
		values (user_id_v, title_v)
		returning id into map_id_v;
		
		insert into users_maps_relationship (user_id, map_id, relationship)
		values (user_id_v, map_id_v, B'111');

		return map_id_v;
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- Создание нового репозитория
-----------------------------------------------------------------------
create function create_repository(
	path_to_repository_v text,
	title_v text,
	is_privite_v boolean,
	entity_id_v integer,
	user_id_v integer,
	is_map boolean
) returns table(
	id integer,
	path_to_repository text,
	is_privite boolean,
	user_id integer,
	title text,
	rubric_id integer,
	map_id integer
) as
$BODY$
	declare
		repository_id_v integer;
	begin
		if is_map then
			insert into repositories (path_to_repository, title, is_privite, user_id, map_id)
			values (path_to_repository_v, title_v, is_privite_v, user_id_v, entity_id_v)
			returning id into repository_id_v;
		else
			insert into repositories (path_to_repository, is_privite, title, user_id, rubric_id)
			values (path_to_repository_v, title_v, is_privite_v, user_id_v, entity_id_v)
			returning id into repository_id_v;
		end if;

		return query 
			select
				repositories.id,
				repositories.path_to_repository_v,
				repositories.is_privite,
				repositories.user_id,
				repositories.title,
				repositories.rubric_id,
				repositories.map_id
			from repositories
			where title=title_v limit 1;
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- Получение пользователя по username
-----------------------------------------------------------------------
create function get_by_user_id(
	user_id_v integer
) returns table(id integer, user_id integer, title text) as
$BODY$
	declare
	--------------------
	begin
		return query 
			select maps.id, maps.user_id, maps.title from maps
			where maps.user_id=user_id_v;
	end;
$BODY$
	language 'plpgsql' volatile;