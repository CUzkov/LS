use crate::db;
use crate::errors::error_handler::ServerError;
use crate::models::schema::repositories;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "repositories"]
pub struct NewRepository {
    pub user_id: i32,
    pub path_to_repository: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub enum Roles {
    Admin,
    User,
}

#[derive(Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "repositories"]
pub struct Repository {
    pub id: i32,
    pub user_id: i32,
    pub path_to_repository: String,
}

impl Repository {
	
}
