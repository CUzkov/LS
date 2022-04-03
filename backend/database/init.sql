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
	id 							serial primary key,
	rubric_id					integer REFERENCES rubrics (id) ON DELETE CASCADE,
	map_id						integer REFERENCES maps (id) ON DELETE CASCADE,
	user_id						integer REFERENCES users (id) ON DELETE CASCADE,

	path_to_repository			text not null,
	path_to_draft_repository 	text,
	is_private					boolean not null,
	title 						text not null unique
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
values ('cuzkov', 'users@gmail.com', 'Gurkina12', true),
('cuzkov1', 'users1@gmail.com', 'Gurkina12', false),
('cuzkov2', 'users2@gmail.com', 'Gurkina12', false),
('cuzkov3', 'users3@gmail.com', 'Gurkina12', false),
('cuzkov4', 'users4@gmail.com', 'Gurkina12', false);

insert into repositories (user_id, path_to_repository, title, is_private)
values (1, 'users@gmail.com', 'Gurkina12', false),
(1, 'users1@gmail.com', 'Gurkina123', false),
(1, 'users2@gmail.com', 'Gurkina1234', false),
(2, 'users3@gmail.com', 'Gurkina12456', false),
(2, 'users4@gmail.com', 'Gurkina123456', false);

insert into maps (user_id, title)
values (1, 'Gurkina12'),
(1, 'Gurkina123'),
(1, 'Gurkina1234'),
(2, 'Gurkina12456'),
(2, 'Gurkina123456');

insert into users_repositories_relationship (user_id, repository_id, relationship)
values (1, 1, B'111'),
(1, 2, B'111'),
(1, 3, B'111'),
(2, 4, B'111'),
(2, 5, B'111');

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
-- Получение пользователя по id
-----------------------------------------------------------------------
create function get_user_by_id(
	id_v integer
) returns table(id integer, username text, email text, u_password text, is_admin boolean) as
$BODY$
	declare
	--------------------
	begin
		return query 
			select users.id, users.username, users.email, users.u_password, users.is_admin from users
			where users.id=id_v
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
	is_private_v boolean,
	user_id_v integer
) returns table(
	id integer,
	path_to_repository text,
	is_private boolean,
	user_id integer,
	title text,
	rubric_id integer,
	map_id integer
) as
$BODY$
	declare
		repository_id_v integer;
	begin
		insert into repositories (path_to_repository, title, is_private, user_id)
		values (path_to_repository_v, title_v, is_private_v, user_id_v)
		returning repositories.id into repository_id_v;

		insert into users_repositories_relationship (user_id, repository_id, relationship)
		values (user_id_v, repository_id_v, B'111');

		return query 
			select
				repositories.id,
				repositories.path_to_repository,
				repositories.is_private,
				repositories.user_id,
				repositories.title,
				repositories.rubric_id,
				repositories.map_id
			from repositories
			where repositories.id=repository_id_v limit 1;
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- Проверка на существование репозитория по пути к нему
-----------------------------------------------------------------------
create function check_is_repository_name_free(
	repository_title_v text,
	user_id_V integer
) returns table(id integer) as
$BODY$
	declare
	--------------------
	begin
		return query 
			select repositories.id from repositories
			where repositories.title=repository_title_v and repositories.user_id=user_id_V;
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- Создание массива битовых маскок из флагов (для фильтрации)
-----------------------------------------------------------------------
create function get_array_of_bit_mask_by_flags(
	is_can_rw_v boolean,
	is_can_rwa_v boolean
) returns bit(3)[3] as
$BODY$
	declare
	--------------------
	begin
		if is_can_rwa_v then
			return array[B'111', B'111', B'111'];
		end if;

		if is_can_rw_v then
			return array[B'110', B'111', B'111'];
		end if;

		return array[B'100', B'110', B'111'];
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- Создание битовой маски из флагов
-----------------------------------------------------------------------
create function get_bit_mask_by_flags(
	is_can_r_v boolean,
	is_can_rw_v boolean,
	is_can_rwa_v boolean
) returns bit(3) as
$BODY$
	declare
	--------------------
	begin
		if is_can_rwa_v then
			return B'111';
		end if;

		if is_can_rw_v then
			return B'110';
		end if;

		if is_can_r_v then
			return B'100';
		end if;

		return B'000';
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- Выборка репозиториев по фильрам
-----------------------------------------------------------------------
create function get_repositories_by_filter(
	user_id_v integer,
	by_user_v integer,
	title_v text,
	is_can_rw_v boolean,
	is_can_rwa_v boolean
) returns table(
	id integer,
	path_to_repository text,
	is_private boolean,
	user_id integer,
	title text,
	rubric_id integer,
	map_id integer
) as
$BODY$
	declare
		relationships_v bit(3)[3];
	begin
		relationships_v = get_array_of_bit_mask_by_flags(is_can_rw_v, is_can_rwa_v);

		return query
			select
				repositories.id,
				repositories.path_to_repository,
				repositories.is_private,
				repositories.user_id,
				repositories.title,
				repositories.rubric_id,
				repositories.map_id
			from repositories
			inner join users_repositories_relationship
			on repositories.id = users_repositories_relationship.repository_id and users_repositories_relationship.user_id = user_id_v
			where
				(by_user_v = -1 or repositories.user_id = by_user_v) and
				(title_v = '' or repositories.title like title_v) and
				(
					users_repositories_relationship.relationship = relationships_v[1] or
					users_repositories_relationship.relationship = relationships_v[2] or
					users_repositories_relationship.relationship = relationships_v[3]
				);
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- Получение репозитория по id
-----------------------------------------------------------------------
create function get_repository_by_id(
	user_id_v integer,
	id_v integer
) returns table(
	id integer,
	path_to_repository text,
	is_private boolean,
	user_id integer,
	title text,
	rubric_id integer,
	map_id integer,
	path_to_draft_repository text
) as
$BODY$
	declare
		relationships_v bit(3)[3];
	begin
		relationships_v = get_array_of_bit_mask_by_flags(true, true);

		return query 
			select	
				repositories.id,
				repositories.path_to_repository,
				repositories.is_private,
				repositories.user_id,
				repositories.title,
				repositories.rubric_id,
				repositories.map_id,
				repositories.path_to_draft_repository
			from repositories
			inner join users_repositories_relationship
			on repositories.id = users_repositories_relationship.repository_id and users_repositories_relationship.user_id = user_id_v
			where
				repositories.id=id_v and
				(
					users_repositories_relationship.relationship = relationships_v[1] or
					users_repositories_relationship.relationship = relationships_v[2] or
					users_repositories_relationship.relationship = relationships_v[3]
				)
			limit 1;
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- Выборка карт по фильрам
-----------------------------------------------------------------------
create function get_maps_by_filter(
	user_id_v integer,
	by_user_v integer,
	title_v text,
	is_can_rw_v boolean,
	is_can_rwa_v boolean
) returns table(
	id integer,
	user_id integer,
	title text
) as
$BODY$
	declare
		relationships_v bit(3)[3];
	begin
		relationships_v = get_array_of_bit_mask_by_flags(is_can_rw_v, is_can_rwa_v);

		return query
			select
				maps.id,
				maps.user_id,
				maps.title
			from maps
			inner join users_maps_relationship
			on map.id = users_maps_relationship.repository_id and users_maps_relationship.user_id = user_id_v
			where
				(by_user_v = -1 or repositories.user_id = by_user_v) and
				(title_v = '' or repositories.title like title_v) and
				(
					users_maps_relationship.relationship = relationships_v[1] or
					users_maps_relationship.relationship = relationships_v[2] or
					users_maps_relationship.relationship = relationships_v[3]
				);
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- Может ли пользователь изменять доступ к репозиторию (есть ли rwa доступ)
-----------------------------------------------------------------------
create function check_is_user_can_rwa_to_repository(
	repository_id_v integer,
	user_id_v integer
) returns table(id integer) as
$BODY$
	declare
	--------------------
	begin
		return query 
			select users_repositories_relationship.id from users_repositories_relationship
			where
				users_repositories_relationship.repository_id = repository_id_v and
				users_repositories_relationship.relationship = B'111' and
				users_repositories_relationship.user_id = user_id_v;
	end;
$BODY$
	language 'plpgsql' volatile;


-----------------------------------------------------------------------
-- Изменение прав доступа для репозитория
-----------------------------------------------------------------------
create function change_repository_permitions(
	repository_id_v integer,
	user_id_v integer,
	is_can_r_v boolean,
	is_can_rw_v boolean,
	is_can_rwa_v boolean
) returns table(id integer) as
$BODY$
	declare
		users_repositories_relationship_row_id integer;
		bit_mask bit(3);
	begin
		bit_mask = get_bit_mask_by_flags(is_can_r_v, is_can_rw_v, is_can_rwa_v);

		select users_repositories_relationship.id into users_repositories_relationship_row_id from users_repositories_relationship
		where
			users_repositories_relationship.user_id = user_id_v and
			users_repositories_relationship.repository_id = repository_id_v
		limit 1;

		if users_repositories_relationship_row_id is null then
			insert into users_repositories_relationship (user_id, repository_id, relationship)
			values (user_id_v, repository_id_v, bit_mask);
		else
			update users_repositories_relationship set relationship = bit_mask
			where users_repositories_relationship.id = users_repositories_relationship_row_id;
		end if;

		return query
			select users_repositories_relationship.id from users_repositories_relationship
			where users_repositories_relationship.id = users_repositories_relationship_row_id;
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- Установка path_to_draft_repository для начала редактирования репозитория
-----------------------------------------------------------------------
create function set_repository_path_to_draft(
	id_v integer,
	path_to_draft_repository_v text
) returns table(
	id integer,
	path_to_repository text,
	is_private boolean,
	user_id integer,
	title text,
	rubric_id integer,
	map_id integer,
	path_to_draft_repository text
) as
$BODY$
	declare

	begin
		update repositories set path_to_draft_repository = path_to_draft_repository_v
		where repositories.id = id_v;

		return query 
			select
				repositories.id,
				repositories.path_to_repository,
				repositories.is_private,
				repositories.user_id,
				repositories.title,
				repositories.rubric_id,
				repositories.map_id,
				repositories.path_to_draft_repository
			from repositories
			where repositories.id=id_v limit 1;
	end;
$BODY$
	language 'plpgsql' volatile;
