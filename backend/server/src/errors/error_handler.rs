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

impl From<r2d2_postgres::postgres::Error> for ServerError {
    fn from(error: r2d2_postgres::postgres::Error) -> ServerError {
        ServerError::new(500, error.to_string())
    }
}

impl From<git2::Error> for ServerError {
    fn from(error: git2::Error) -> ServerError {
        ServerError::new(500, error.message().to_string())
    }
}

impl From<std::io::Error> for ServerError {
    fn from(error: std::io::Error) -> ServerError {
        match error.raw_os_error() {
            Some(error) => ServerError::new(500, error.to_string()),
            None => ServerError::new(500, "Ошибка вывода ошибки".to_string())
        }
    }
}
