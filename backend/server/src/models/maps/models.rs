use crate::db;
use crate::errors::error_handler::ServerError;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Map {
    pub id: i32,
    pub user_id: i32,
    pub title: String,
}

#[derive(Serialize, Deserialize)]
pub struct NewMap {
    pub user_id: i32,
    pub title: String,
}

impl Map {
    pub fn create(map: NewMap) -> Result<Self, ServerError> {
        let result = db::connection()?.query(
            "SELECT * from create_map($1, $2)",
            &[&map.user_id, &map.title],
        )?;

        for row in result {
            return Ok(Map {
                id: row.get(0),
                user_id: map.user_id,
                title: map.title,
            });
        }

        Err(ServerError {
            error_message: "".to_string(),
            error_status_code: 500,
        })
    }

    pub fn get_by_user_id(id: i32) -> Result<Vec<Self>, ServerError> {
        println!("awdawdawd");
        let result = db::connection()?.query("SELECT * from get_by_user_id($1)", &[&id])?;

        println!("awdawdawd");

        let mut maps: Vec<Self> = vec![];

        for row in result {
            maps.push(Map {
                id: row.get(0),
                user_id: row.get(1),
                title: row.get(2),
            });
        }

        println!("awdawdawd");

        Ok(maps)
    }
}
