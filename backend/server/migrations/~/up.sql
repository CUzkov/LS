create table Users (
	id 			serial primary key,
	
	username 	varchar(200) not null unique,
	email		varchar(200) not null unique,
	u_password	varchar(200) not null,
	u_role		varchar(10) not null
);

create table Repositories (
	id 						serial primary key,
	user_id					integer,
	foreign key (user_id) references Users (id) ON DELETE CASCADE,

	path_to_repository		text not null
);

insert into Users (username, email, u_password, u_role)
values ('cuzkov', 'users@gmail.com', 'awdawd', 'admin');
