use crate::db;
use crate::errors::error_handler::ServerError;
use crate::models::schema::users;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "users"]
pub struct NewUser {
    pub username: String,
    pub email: String,
    pub u_password: String,
    pub u_role: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub enum Roles {
    Admin,
    User,
}

#[derive(Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "users"]
pub struct User {
    pub id: i32,
    pub username: String,
    pub email: String,
    pub u_password: String,
    u_role: String,
}

impl User {
    pub fn create(user: &NewUser) -> Result<Self, ServerError> {
        let conn = db::connection()?;
        let user = diesel::insert_into(users::table)
            .values(user)
            .get_result(&conn)?;
        Ok(user)
    }

    pub fn find_all() -> Result<Vec<Self>, ServerError> {
        let conn = db::connection()?;
        let users = users::table.load::<User>(&conn)?;
        Ok(users)
    }

    pub fn get_user_by_email(email: &str) -> Result<Self, ServerError> {
        let conn = db::connection()?;
        let user = users::table.filter(users::email.eq(email)).first(&conn)?;
        Ok(user)
    }

    pub fn get_user_by_username(username: &str) -> Result<Self, ServerError> {
        let conn = db::connection()?;
        let user = users::table
            .filter(users::username.eq(username))
            .first(&conn)?;
        Ok(user)
    }

    pub fn set_user_role(&mut self, role: Roles) -> () {
        match role {
            Roles::Admin => {
                self.u_role = "admin".to_string();
            }
            Roles::User => {
                self.u_role = "user".to_string();
            }
        };
    }

    pub fn get_user_role(&self) -> Roles {
        match self.u_role.as_str() {
            "admin" => Roles::Admin,
            "user" => Roles::User,
            _ => Roles::User,
        }
    }
}
