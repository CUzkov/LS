use diesel::result::Error as DieselError;
use serde::Deserialize;
use std::fmt;

#[derive(Debug, Deserialize)]
pub struct ServerError {
    pub error_status_code: u16,
    pub error_message: String,
}

impl ServerError {
    pub fn new(error_status_code: u16, error_message: String) -> ServerError {
        ServerError {
            error_status_code,
            error_message,
        }
    }
}

impl fmt::Display for ServerError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        f.write_str(self.error_message.as_str())
    }
}

impl From<DieselError> for ServerError {
    fn from(error: DieselError) -> ServerError {
        match error {
            DieselError::DatabaseError(_, err) => ServerError::new(409, err.message().to_string()),
            DieselError::NotFound => {
                ServerError::new(404, "The employee record not found".to_string())
            }
            err => ServerError::new(500, format!("Unknown Diesel error: {}", err)),
        }
    }
}

impl From<redis::RedisError> for ServerError {
    fn from(error: redis::RedisError) -> ServerError {
        ServerError::new(500, error.category().to_string())
    }
}

impl From<rocket::serde::json::serde_json::Error> for ServerError {
    fn from(error: rocket::serde::json::serde_json::Error) -> ServerError {
        ServerError::new(500, error.line().to_string())
    }
}
