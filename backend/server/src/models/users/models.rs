use crate::db;
use crate::errors::error_handler::ServerError;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct User {
    pub id: i32,
    pub username: String,
    pub email: String,
    pub u_password: String,
    pub is_admin: bool,
}

#[derive(Serialize, Deserialize)]
pub struct UserNoPassword {
    pub id: i32,
    pub username: String,
    pub email: String,
    pub is_admin: bool,
}

#[derive(Serialize, Deserialize)]
pub struct NewUser {
    pub username: String,
    pub email: String,
    pub u_password: String,
    pub is_admin: bool,
}

impl User {
    pub fn create(user: &NewUser) -> Result<Self, ServerError> {
        let result = db::connection()?.query(
            "SELECT * from create_user($1, $2, $3, $4)",
            &[
                &user.username,
                &user.email,
                &user.u_password,
                &user.is_admin,
            ],
        )?;

        for row in result {
            return Ok(User {
                id: row.get(0),
                username: user.username.clone(),
                email: user.email.clone(),
                u_password: user.u_password.clone(),
                is_admin: user.is_admin,
            });
        }

        Err(ServerError {
            error_message: "".to_string(),
            error_status_code: 500,
        })
    }

    pub fn get_user_by_email(email: &str) -> Result<Self, ServerError> {
        let result = db::connection()?.query("SELECT * from get_user_by_email($1)", &[&email])?;

        for row in result {
            return Ok(User {
                id: row.get(0),
                username: row.get(1),
                email: row.get(2),
                u_password: row.get(3),
                is_admin: row.get(4),
            });
        }

        Err(ServerError {
            error_message: "User not found".to_string(),
            error_status_code: 404,
        })
    }

    pub fn get_user_by_username(username: &str) -> Result<Self, ServerError> {
        let result =
            db::connection()?.query("SELECT * from get_user_by_username($1)", &[&username])?;

        for row in result {
            return Ok(User {
                id: row.get(0),
                username: row.get(1),
                email: row.get(2),
                u_password: row.get(3),
                is_admin: row.get(4),
            });
        }

        Err(ServerError {
            error_message: "User not found".to_string(),
            error_status_code: 404,
        })
    }

    pub fn get_user_without_password(&self) -> UserNoPassword {
        UserNoPassword {
            id: self.id.clone(),
            username: self.username.clone(),
            email: self.email.clone(),
            is_admin: self.is_admin.clone(),
        }
    }
}
