use lazy_static::lazy_static;
use redis::{Commands, Connection};

use std::sync::Mutex;

use crate::errors::error_handler::ServerError;

lazy_static! {
    static ref CONNECTION: Mutex<Connection> = Mutex::new(
        {
            let client = redis::Client::open("redis://127.0.0.1/").unwrap();
            client.get_connection()
        }
        .unwrap()
    );
}

pub fn set(key: &str, value: &str) -> Result<(), ServerError> {
    let _: () = CONNECTION.lock().unwrap().set(key, value)?;
    Result::Ok(())
}

pub fn get(key: &str) -> Result<String, ServerError> {
    let result: String = (&CONNECTION).lock().unwrap().get(key)?;

    Result::Ok(result)
}

pub fn del(key: &str) -> Result<(), ServerError> {
    let _: () = (&CONNECTION).lock().unwrap().del(key)?;
    Result::Ok(())
}
