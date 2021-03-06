create table users (
	id 						serial primary key,
	username 				text not null unique,
	email					text not null unique,
	u_password				text not null,
	is_admin				boolean not null
);

CREATE TYPE groupType AS ENUM ('map', 'rubric');

create table groups (
	id 						serial primary key,
	user_id					integer not null REFERENCES users (id) ON DELETE CASCADE,
	title					text not null,
	is_private				boolean not null,
	group_type				groupType
);

create table repositories (
	id 							serial primary key,
	user_id						integer REFERENCES users (id) ON DELETE CASCADE,
	path_to_repository			text not null unique,
	path_to_draft_repository 	text,
	is_private					boolean not null,
	title 						text not null,

	unique (user_id, title)
);

create table users_repositories_relationship (
	id 						serial primary key,
	user_id					integer not null REFERENCES users (id) ON DELETE CASCADE,
	repository_id			integer not null REFERENCES repositories (id) ON DELETE CASCADE,
	relationship			bit(3) not null,
	
	UNIQUE (user_id, repository_id)
);

create table users_groups_relationship (
	id 						serial primary key,
	user_id					integer not null REFERENCES users (id) ON DELETE CASCADE,
	group_id				integer not null REFERENCES groups (id) ON DELETE CASCADE,
	relationship			bit(3) not null,
	
	UNIQUE (user_id, group_id)
);

create table group_to_group_links (
	id 						serial primary key,
	parent_id				integer null REFERENCES groups (id) ON DELETE CASCADE,
	child_id				integer not null REFERENCES groups (id) ON DELETE CASCADE
);

create table group_to_repository_links (
	id 						serial primary key,
	group_id				integer not null REFERENCES groups (id) ON DELETE CASCADE,
	repository_id			integer not null REFERENCES repositories (id) ON DELETE CASCADE
);

insert into users (username, email, u_password, is_admin)
values ('cuzkov', 'users@gmail.com', 'Gurkina12', true),
('cuzkov1', 'users1@gmail.com', 'Gurkina12', false),
('cuzkov2', 'users2@gmail.com', 'Gurkina12', false),
('cuzkov3', 'users3@gmail.com', 'Gurkina12', false),
('cuzkov4', 'users4@gmail.com', 'Gurkina12', false);

-----------------------------------------------------------------------
-- ???????????????? ???????????? ????????????????????????
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
-- ?????????????????? ???????????????????????? ???? email
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
-- ?????????????????? ???????????????????????? ???? username
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
-- ?????????????????? ???????????????????????? ???? id
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
-- ???????????????? ???????????? ??????????????????????
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
	path_to_draft_repository text
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
				repositories.path_to_draft_repository
			from repositories
			where repositories.id=repository_id_v limit 1;
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- ???????????????? ???? ?????????????????????????? ?????????????????????? ???? ???????? ?? ????????
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
-- ???????????????? ?????????????? ?????????????? ???????????? ???? ???????????? (?????? ????????????????????)
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
-- ???????????????? ?????????????? ?????????? ???? ????????????
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
-- ?????????????? ???????????????????????? ???? ??????????????
-----------------------------------------------------------------------
create function get_repositories_by_filter(
	user_id_v integer,
	by_user_v integer,
	title_v text,
	is_can_rw_v boolean,
	is_can_rwa_v boolean,
	page_v integer,
	quantity_v integer,
	exclude_repository_ids_v integer[]
) returns table(
	id integer,
	path_to_repository text,
	is_private boolean,
	user_id integer,
	title text,
	path_to_draft_repository text,
	repositories_count bigint,
	access bit(3),
	username text
) as
$BODY$
	declare
		relationships_v bit(3)[3];
		repositories_count bigint;
	begin
		relationships_v = get_array_of_bit_mask_by_flags(is_can_rw_v, is_can_rwa_v);

		repositories_count := (
			select count(*) from repositories
			left join users_repositories_relationship
			on repositories.id = users_repositories_relationship.repository_id and users_repositories_relationship.user_id = user_id_v
			where
				(by_user_v = -1 or repositories.user_id = by_user_v) and
				(title_v = '' or repositories.title like title_v) and
				(
					(
						repositories.is_private = true and
						(
							users_repositories_relationship.relationship = relationships_v[1] or
							users_repositories_relationship.relationship = relationships_v[2] or
							users_repositories_relationship.relationship = relationships_v[3]
						)
					) or repositories.is_private = false
				) and
				repositories.id != all (exclude_repository_ids_v)
		);

		return query
			select
				repositories.id,
				repositories.path_to_repository,
				repositories.is_private,
				repositories.user_id,
				repositories.title,
				repositories.path_to_draft_repository,
				repositories_count,
				users_repositories_relationship.relationship as access,
				users.username
			from repositories
			left join users_repositories_relationship
			on repositories.id = users_repositories_relationship.repository_id and users_repositories_relationship.user_id = user_id_v
			join users on repositories.user_id = users.id
			where
				(by_user_v = -1 or repositories.user_id = by_user_v) and
				(title_v = '' or repositories.title like title_v) and
				(
					(
						repositories.is_private = true and
						(
							users_repositories_relationship.relationship = relationships_v[1] or
							users_repositories_relationship.relationship = relationships_v[2] or
							users_repositories_relationship.relationship = relationships_v[3]
						)
					) or repositories.is_private = false
				) and
				repositories.id != all (exclude_repository_ids_v)
			limit quantity_v offset quantity_v * (page_v - 1) ;
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- ?????????????????? ?????????????????????? ???? id
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
	path_to_draft_repository text,
	access bit(3),
	username text
) as
$BODY$
	declare
		relationships_v bit(3)[3];
	begin
		relationships_v = get_array_of_bit_mask_by_flags(false, false);

		return query 
			select	
				repositories.id,
				repositories.path_to_repository,
				repositories.is_private,
				repositories.user_id,
				repositories.title,
				repositories.path_to_draft_repository,
				users_repositories_relationship.relationship as access,
				users.username
			from repositories
			left join users_repositories_relationship
			on repositories.id = users_repositories_relationship.repository_id and users_repositories_relationship.user_id = user_id_v
			join users on users.id = repositories.user_id
			where
				repositories.id=id_v and
				(
					(
						repositories.is_private = true and
						(
							users_repositories_relationship.relationship = relationships_v[1] or
							users_repositories_relationship.relationship = relationships_v[2] or
							users_repositories_relationship.relationship = relationships_v[3]
						)
					) or repositories.is_private = false
				)
			limit 1;
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- ?????????????? ?????????? ???? ??????????????
-----------------------------------------------------------------------
create function get_groups_by_filter(
	user_id_v integer,
	by_user_v integer,
	title_v text,
	group_type_v groupType,
	is_can_rw_v boolean,
	is_can_rwa_v boolean,
	page_v integer,
	quantity_v integer,
	exclude_group_ids_v integer[]
) returns table(
	id integer,
	user_id integer,
	title text,
	group_type groupType,
	rows_count bigint,
	access bit(3),
	is_private boolean,
	username text
) as
$BODY$
	declare
		relationships_v bit(3)[3];
		rows_count_v bigint;
	begin
		relationships_v = get_array_of_bit_mask_by_flags(is_can_rw_v, is_can_rwa_v);

		rows_count_v := (
			select count(*) from groups
			left join users_groups_relationship
			on groups.id = users_groups_relationship.group_id and users_groups_relationship.user_id = user_id_v
			where
				(by_user_v = -1 or groups.user_id = by_user_v) and
				(title_v = '' or groups.title like title_v) and
				(group_type_v = null or groups.group_type = group_type_v) and
				(
					(
						groups.is_private = true and
						(
							users_groups_relationship.relationship = relationships_v[1] or
							users_groups_relationship.relationship = relationships_v[2] or
							users_groups_relationship.relationship = relationships_v[3]
						)
					) or groups.is_private = false
				) and
				groups.id != all (exclude_group_ids_v)
		);

		return query
			select
				groups.id,
				groups.user_id,
				groups.title,
				groups.group_type,
				rows_count_v as rows_count,
				users_groups_relationship.relationship as access,
				groups.is_private,
				users.username
			from groups
			left join users_groups_relationship
			on groups.id = users_groups_relationship.group_id and users_groups_relationship.user_id = user_id_v
			join users on users.id = groups.user_id
			where
				(by_user_v = -1 or groups.user_id = by_user_v) and
				(title_v = '' or groups.title like title_v) and
				(group_type_v = null or groups.group_type = group_type_v) and
				(
					(
						groups.is_private = true and
						(
							users_groups_relationship.relationship = relationships_v[1] or
							users_groups_relationship.relationship = relationships_v[2] or
							users_groups_relationship.relationship = relationships_v[3]
						)
					) or groups.is_private = false
				) and
				groups.id != all (exclude_group_ids_v)
			limit quantity_v offset quantity_v * (page_v - 1);
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- ?????????? ???? ???????????????????????? ???????????????? ???????????? ?? ?????????????????????? (???????? ???? rwa ????????????)
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
-- ?????????????????? path_to_draft_repository ?????? ???????????? ???????????????????????????? ??????????????????????
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
				repositories.path_to_draft_repository
			from repositories
			where repositories.id=id_v limit 1;
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- ???????????????? ?????????????????????? ?????????? ????????????
-----------------------------------------------------------------------
create function check_is_group_name_free(
	group_title_v text,
	user_id_v integer,
	group_type_v groupType
) returns table(id integer) as
$BODY$
	declare
	--------------------
	begin
		return query 
			select groups.id from groups
			where groups.title=group_title_v and groups.user_id=user_id_v and groups.group_type = group_type_v;
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- ???????????????? ?????????? ????????????
-----------------------------------------------------------------------
create function create_group(
	title_v text,
	groupr_type_v groupType,
	user_id_v integer,
	is_private_v boolean
) returns table(
	id integer,
	user_id integer,
	title text,
	group_type groupType
) as
$BODY$
	declare
		group_id_v integer;
	begin
		insert into groups (title, group_type, user_id, is_private)
		values (title_v, groupr_type_v, user_id_v, is_private_v)
		returning groups.id into group_id_v;

		insert into users_groups_relationship (user_id, group_id, relationship)
		values (user_id_v, group_id_v, B'111');

		return query 
			select
				groups.id,
				groups.user_id,
				groups.title,
				groups.group_type
			from groups
			where groups.id=group_id_v limit 1;
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- ?????????????????? ???????????? ????????????
-----------------------------------------------------------------------
create function get_full_group_by_id(
	user_id_v integer,
	group_id_v integer
) returns table(
	id integer, 
	title text,
	is_base boolean,
	group_type groupType,
	user_id integer,
	access bit(3),
	is_private boolean,
	username text
) as
$BODY$
	declare
		relationships_v bit(3)[3];
	begin
		relationships_v = get_array_of_bit_mask_by_flags(false, false);

		return query (
			select distinct
				groups.id,
				groups.title,
				groups.id = group_id_v as is_base,
				groups.group_type,
				groups.user_id,
				users_groups_relationship.relationship as access,
				groups.is_private,
				users.username
			from groups
			left join group_to_group_links on group_to_group_links.parent_id = group_id_v
			left join users_groups_relationship on users_groups_relationship.group_id = groups.id and users_groups_relationship.user_id = user_id_v
			join users on users.id = groups.user_id
			where groups.id = group_to_group_links.child_id or (
				groups.id = group_id_v and (
					(
						groups.is_private = true and
						(
							users_groups_relationship.relationship = relationships_v[1] or
							users_groups_relationship.relationship = relationships_v[2] or
							users_groups_relationship.relationship = relationships_v[3]
						)
					) or groups.is_private = false
				)
			)
		);
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- ?????????????????? ???????????????????????? ?????????????????????? ?? ????????????
-----------------------------------------------------------------------
create function get_repositories_by_group_id(
	user_id_v integer,
	group_ids_v integer
) returns table(
	id integer,
	title text,
	user_id integer,
	access bit(3),
	is_private boolean,
	username text
) as
$BODY$
	declare
		relationships_v bit(3)[3];
	begin
		relationships_v = get_array_of_bit_mask_by_flags(true, true);

		return query (
			select
				repositories.id,
				repositories.title,
				repositories.user_id,
				users_repositories_relationship.relationship as access,
				repositories.is_private,
				users.username
			from repositories
			join group_to_repository_links on repositories.id = group_to_repository_links.repository_id
			left join users_repositories_relationship on repositories.id = users_repositories_relationship.repository_id and users_repositories_relationship.user_id = user_id_v
			join users on users.id = repositories.user_id
			where group_to_repository_links.group_id = group_ids_v
		);
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- ???????????????????? ???????????? ?? ????????????
-----------------------------------------------------------------------
create function add_group_to_group(
	parent_id_v integer,
	child_id_v integer
) returns integer as
$BODY$
	declare
		new_link_id_v integer;
	begin
		insert into group_to_group_links (parent_id, child_id)
		values (parent_id_v, child_id_v)
		returning group_to_group_links.id into new_link_id_v;

		return new_link_id_v;
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- ????????????????, ?????????? ???? ???????????????????????? ???????????????? ???????????? ?? ???????????? (@FIXME ?????????????????? ???????????????? ?? ?????? js)
-----------------------------------------------------------------------
create function check_is_user_can_add_group_to_group(
	user_id_v integer,
	parent_group_id_v integer,
	child_group_id_v integer
) returns boolean as
$BODY$
	declare
		is_can_rw_parent_group_v boolean;
		is_can_r_child_group_v boolean;
		parent_relationships_v bit(3)[3];
		child_relationships_v bit(3)[3];
	begin
		parent_relationships_v = get_array_of_bit_mask_by_flags(true, false);
		child_relationships_v = get_array_of_bit_mask_by_flags(false, false);

		is_can_rw_parent_group_v := (
			select groups.id from groups
			join users_groups_relationship
			on groups.id = users_groups_relationship.group_id and users_groups_relationship.user_id = user_id_v
			where (
				users_groups_relationship.group_id = parent_group_id_v and
				(
					users_groups_relationship.relationship = parent_relationships_v[1] or
					users_groups_relationship.relationship = parent_relationships_v[2] or
					users_groups_relationship.relationship = parent_relationships_v[3]
				)
			)
		)::boolean;

		is_can_r_child_group_v := (
			select groups.id from groups
			left join users_groups_relationship
			on groups.id = users_groups_relationship.group_id and users_groups_relationship.user_id = user_id_v
			where (
				groups.id = child_group_id_v and
				(
					groups.is_private = true and (
						users_groups_relationship.relationship = child_relationships_v[1] or
						users_groups_relationship.relationship = child_relationships_v[2] or
						users_groups_relationship.relationship = child_relationships_v[3]
					) or
					groups.is_private = false
				)
			)
		)::boolean;

		return (
			is_can_rw_parent_group_v and
			is_can_r_child_group_v
		);
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- ???????????????????? ?????????????????????? ?? ????????????
-----------------------------------------------------------------------
create function add_repository_to_group(
	repository_id_v integer,
	group_id_v integer
) returns integer as
$BODY$
	declare
		new_link_id_v integer;
	begin
		insert into group_to_repository_links (group_id, repository_id)
		values (group_id_v, repository_id_v)
		returning group_to_repository_links.id into new_link_id_v;

		return new_link_id_v;
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- ????????????????, ?????????? ???? ???????????????????????? ???????????????? ?????????????????????? ?? ???????????? (@FIXME ?????????????????? ???????????????? ?? ?????? js)
-----------------------------------------------------------------------
create function check_is_user_can_add_repository_to_group(
	user_id_v integer,
	repository_id_v integer,
	group_id_v integer
) returns boolean as
$BODY$
	declare
		is_can_rw_group_v boolean;
		is_can_r_repository_v boolean;
		group_relationships_v bit(3)[3];
		repository_relationships_v bit(3)[3];
	begin
		group_relationships_v = get_array_of_bit_mask_by_flags(true, false);
		repository_relationships_v = get_array_of_bit_mask_by_flags(false, false);

		is_can_rw_group_v := (
			select groups.id from groups
			join users_groups_relationship
			on groups.id = users_groups_relationship.group_id and users_groups_relationship.user_id = user_id_v
			where (
				users_groups_relationship.group_id = group_id_v and
				(
					users_groups_relationship.relationship = group_relationships_v[1] or
					users_groups_relationship.relationship = group_relationships_v[2] or
					users_groups_relationship.relationship = group_relationships_v[3]
				)
			)
		)::boolean;

		is_can_r_repository_v := (
			select repositories.id from repositories
			left join users_repositories_relationship
			on repositories.id = users_repositories_relationship.repository_id and users_repositories_relationship.user_id = user_id_v
			where (
				repositories.id = repository_id_v and
				(
					repositories.is_private = true and (
						users_repositories_relationship.relationship = repository_relationships_v[1] or
						users_repositories_relationship.relationship = repository_relationships_v[2] or
						users_repositories_relationship.relationship = repository_relationships_v[3]
					) or repositories.is_private = false
				)
			)
		)::boolean;

		return (
			is_can_rw_group_v and
			is_can_r_repository_v
		);
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- ?????????????????? ?????????????????????? (????????????????, ???????????????? ?? ????)
-----------------------------------------------------------------------
create function change_repository(
	repository_id_v integer,
	new_title_v text,
	new_private_v boolean
) returns boolean as
$BODY$
	declare
	----------------
	begin
		update repositories
		set title = new_title_v, is_private = new_private_v
		where repositories.id = repository_id_v;

		return true;
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- ?????????????????? ???????? ??????????????????????????, ?????????????? ?????????? ???????????? ?? ?????????????????????? @FIXME ???????????????????????? ???? rw ?? rwa ?? ???????????? ????????????
-----------------------------------------------------------------------
create function get_users_with_repository_rw_rwa_access(
	repository_id_v integer
) returns table(
	access bit(3),
	id integer,
	username text,
	is_admin boolean,
	email text
) as
$BODY$
	declare
	----------------
	begin
		return query (
			select
				users_repositories_relationship.relationship as access,
				users.id,
				users.username,
				users.is_admin,
				users.email
			from users_repositories_relationship
			join users on users.id = users_repositories_relationship.user_id
			where users_repositories_relationship.repository_id = repository_id_v
		);
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- ?????????????????? ???????? ?????????????? ?????? ??????????????????????
-----------------------------------------------------------------------
create function change_repository_access(
	repository_id_v integer,
	user_ids_v integer[],
	access bit(3)
) returns boolean as
$BODY$
	declare
	current_user_id integer;
	begin
		foreach current_user_id in array user_ids_v
		loop
			if access = B'000' then
				delete from users_repositories_relationship
				where users_repositories_relationship.user_id = current_user_id and users_repositories_relationship.repository_id = repository_id_v;
			else
				insert into users_repositories_relationship (user_id, repository_id, relationship)
				values (current_user_id, repository_id_v, access)
				on conflict (repository_id, user_id)
				do update set
				repository_id=repository_id_v,
				user_id=current_user_id,
				relationship=access;
			end if;
		end loop;
		
		return true;
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- ?????????????????? ?????????????????????????? ???? ????????????????
-----------------------------------------------------------------------
create function get_users_by_filters(
	username_v text,
	page_v integer,
	quantity_v integer,
	exclude_user_ids_v integer[]
) returns table(
	id integer,
	username text,
	is_admin boolean,
	email text,
	users_count bigint
) as
$BODY$
	declare
		users_count bigint;
	begin
		users_count := (
			select count(*) from users
			where
			(username_v = '' or users.username like username_v) and
			users.id != all (exclude_user_ids_v)
		);

		return query
			select
				users.id,
				users.username,
				users.is_admin,
				users.email,
				users_count
			from users
			where
			(username_v = '' or users.username like username_v) and
			users.id != all (exclude_user_ids_v)
			limit quantity_v offset quantity_v * (page_v - 1) ;
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- ?????????????????? ???????????? (????????????????, ???????????????? ?? ????)
-----------------------------------------------------------------------
create function change_group(
	group_id_v integer,
	new_title_v text,
	new_private_v boolean
) returns boolean as
$BODY$
	declare
	----------------
	begin
		update groups
		set title = new_title_v, is_private = new_private_v
		where groups.id = group_id_v;

		return true;
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- ?????????????????? ???????? ??????????????????????????, ?????????????? ?????????? ???????????? ?? ??????????
-----------------------------------------------------------------------
create function get_users_with_group_access(
	group_id_v integer
) returns table(
	access bit(3),
	id integer,
	username text,
	is_admin boolean,
	email text
) as
$BODY$
	declare
	----------------
	begin
		return query (
			select
				users_groups_relationship.relationship as access,
				users.id,
				users.username,
				users.is_admin,
				users.email
			from users_groups_relationship
			join users on users.id = users_groups_relationship.user_id
			where users_groups_relationship.group_id = group_id_v
		);
	end;
$BODY$
	language 'plpgsql' volatile;

-----------------------------------------------------------------------
-- ?????????????????? ???????? ?????????????? ?????? ??????????????????????
-----------------------------------------------------------------------
create function change_group_access(
	group_id_v integer,
	user_ids_v integer[],
	access bit(3)
) returns boolean as
$BODY$
	declare
	current_user_id integer;
	begin
		foreach current_user_id in array user_ids_v
		loop
			if access = B'000' then
				delete from users_groups_relationship
				where users_groups_relationship.user_id = current_user_id and users_groups_relationship.group_id = group_id_v;
			else
				insert into users_groups_relationship (user_id, group_id, relationship)
				values (current_user_id, group_id_v, access)
				on conflict (group_id, user_id)
				do update set
				group_id=group_id_v,
				user_id=current_user_id,
				relationship=access;
			end if;
		end loop;
		
		return true;
	end;
$BODY$
	language 'plpgsql' volatile;
