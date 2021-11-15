use crate::db;
use git2::Signature;
use serde::{Deserialize, Serialize};

use crate::api::typings::AuthUserInfo;
use crate::errors::error_handler::ServerError;
use crate::git_manager::git_manager::GitManager;

#[derive(Serialize, Deserialize)]
pub struct Repository {
    pub id: i32,
    pub path_to_repository: String,
    pub is_privite: bool,
    pub user_id: i32,
    pub title: String,
    pub rubric_id: Option<i32>,
    pub map_id: Option<i32>,
}

#[derive(Serialize, Deserialize)]
pub struct NewRepository {
    pub is_privite: bool,
    pub title: String,
    pub rubric_id: Option<i32>,
    pub map_id: Option<i32>,
}

impl Repository {
    pub fn create_for_map(
        repository: &NewRepository,
        user: AuthUserInfo,
    ) -> Result<Self, ServerError> {
        let mut git_manager = GitManager::new();

        let author = Signature::now(&user.username, &user.email)?;

        git_manager.init_repository(&("/".to_string() + &repository.title), &author)?;

        match repository.map_id {
            Some(map_id) => {
                let result = db::connection()?.query(
                    "SELECT * from create_repository($1, $2)",
                    &[
                        &git_manager.get_path(),
                        &repository.title,
                        &repository.is_privite,
                        &map_id,
                        &user.user_id,
                        &true,
                    ],
                )?;

                for row in result {
                    return Ok(Repository {
                        id: row.get(0),
                        path_to_repository: row.get(1),
                        is_privite: row.get(2),
                        user_id: row.get(3),
                        title: row.get(4),
                        rubric_id: None,
                        map_id: row.get(6),
                    });
                }
            }
            None => {
                return Err(ServerError {
                    error_message: "".to_string(),
                    error_status_code: 500,
                })
            }
        }

        Err(ServerError {
            error_message: "".to_string(),
            error_status_code: 500,
        })
    }

    // pub fn create_for_rubric(repository: NewRepository, user: AuthUserInfo) -> Result<Self, ServerError> {
    //     let git_manager = GitManager::new();

    //     let author = Signature::now(&user.username, &user.email)?;

    //     git_manager.init_repository(
    //         &(user.user_id.to_string() + "/" + &repository.title),
    //         &author,
    //     );

    //     let result = db::connection()?.query(
    //         "SELECT create_repository($1, $2)",
    //         &[&git_manager.get_path(), &repository.title, &repository.is_privite, &repository.],
    //     )?;

    //     // for row in result {
    //     //     return Ok(Repository {
    //     //         id: row.get(0),
    //     //         user_id: map.user_id,
    //     //         title: map.title,
    //     //     });
    //     // }

    //     Err(ServerError {
    //         error_message: "".to_string(),
    //         error_status_code: 500,
    //     })
    // }
}
