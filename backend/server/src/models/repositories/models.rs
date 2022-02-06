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
    pub is_private: bool,
    pub user_id: i32,
    pub title: String,
    pub rubric_id: Option<i32>,
    pub map_id: Option<i32>,
}

#[derive(Serialize, Deserialize)]
pub struct NewRepository {
    pub is_private: bool,
    pub title: String,
    pub rubric_id: Option<i32>,
    pub map_id: Option<i32>,
}

#[derive(Serialize, Deserialize)]
pub struct RepositoryName {
    pub title: String,
}

#[derive(Serialize, Deserialize)]
pub struct RepositoryNameCheck {
    pub is_free: bool,
}

#[derive(Serialize, Deserialize)]
pub struct RepositoriesFilter {
    pub is_r: bool,
    pub is_rw: bool,
    pub is_rwa: bool,
    pub title: String,
    pub by_user: i32,
}

#[derive(Serialize, Deserialize)]
pub struct OkResponse {
    pub response: String
}

#[derive(Serialize, Deserialize)]
pub struct NewPermition {
    pub for_user: i32,
    pub is_r: bool,
    pub is_rw: bool,
    pub is_rwa: bool,
    pub repository_id: i32,
}

#[derive(Serialize, Deserialize)]
pub struct NewPermitions {
    pub permitions: Vec<NewPermition>,
}

impl Repository {
    pub fn create(
        repository: &NewRepository,
        user: AuthUserInfo,
    ) -> Result<Self, ServerError> {
        let mut git_manager = GitManager::new();

        let author = Signature::now(&user.username, &user.email)?;

        git_manager.init_repository(&repository.title, &author)?;

        println!("{}", git_manager.get_path());

        let result = db::connection()?.query(
            "SELECT * from create_repository($1, $2, $3, $4)",
            &[
                &git_manager.get_path(),
                &repository.title,
                &repository.is_private,
                &user.user_id,
            ],
        )?;

        for row in result {
            return Ok(Repository {
                id: row.get(0),
                path_to_repository: row.get(1),
                is_private: row.get(2),
                user_id: row.get(3),
                title: row.get(4),
                rubric_id: None,
                map_id: row.get(6),
            });
        }

        Err(ServerError {
            error_message: "Error Repository::create".to_string(),
            error_status_code: 500,
        })
    }

    pub fn check_is_repository_name_free(repository_name: String, user: AuthUserInfo) -> Result<RepositoryNameCheck, ServerError> {
        let author = Signature::now(&user.username, &user.email)?;

        let paths = GitManager::get_repository_path(&repository_name, &author)?;

        let result = db::connection()?.query(
            "SELECT * from check_is_repository_name_free($1)",
            &[&paths.1],
        )?;

        for _ in result {
            return Ok(RepositoryNameCheck{ is_free: false });
        }

        return Ok(RepositoryNameCheck{ is_free: true });
    }

    pub fn get_repositories_by_filter(filters: &RepositoriesFilter, user: &AuthUserInfo) -> Result<Vec<Self>, ServerError> {
        let result = db::connection()?.query(
            "SELECT * from get_repositories_by_filter($1, $2, $3, $4, $5, $6)",
            &[
                &user.user_id,
                &filters.by_user,
                &filters.title,
                &filters.is_r,
                &filters.is_rw,
                &filters.is_rwa
            ],
        )?;

        let mut repositories: Vec<Self> = vec![];

        for row in result {
            repositories.push(Repository {
                id: row.get(0),
                path_to_repository: row.get(1),
                is_private: row.get(2),
                user_id: row.get(3),
                title: row.get(4),
                rubric_id: row.get(5),
                map_id: row.get(6)
            });
        }

        return Ok(repositories);
    }

    pub fn change_permitions(by_user: &AuthUserInfo, new_permitions: NewPermitions) -> Result<OkResponse, ServerError> {
        for permition in new_permitions.permitions {
            let result = db::connection()?.query(
                "SELECT * from check_is_user_can_rwa_to_repository($1, $2)",
                &[
                    &permition.repository_id,
                    &by_user.user_id,
                ],
            )?;

            if result.len() == 0 {
                return Err(ServerError {
                    error_message: "Не достаточно прав для изменения прав доступа на репозиторий".to_string(),
                    error_status_code: 403,
                });
            }

            db::connection()?.query(
                "SELECT * from change_repository_permitions($1, $2, $3, $4, $5)",
                &[
                    &permition.repository_id,
                    &permition.for_user,
                    &permition.is_r,
                    &permition.is_rw,
                    &permition.is_rwa,
                ],
            )?;
        }

        return Ok(OkResponse{
            response: "ok".to_string()
        });
    }
}
