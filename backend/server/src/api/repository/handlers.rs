/** Repositories handlers */
use rocket::serde::json::{json, Json};

use crate::api::typings::{AuthUserInfo, Response};
use crate::api::utils::{get_response, get_response_with_data, Responses};
use crate::models::repositories::models::{Repository, NewRepository, RepositoryName, RepositoriesFilter, NewPermitions};

#[post("/user/create/repository", data = "<new_repository>")]
pub fn create_repository(new_repository: Json<NewRepository>, user: AuthUserInfo) -> Response {
	match Repository::create(&new_repository, user) {
		Ok(repository) => get_response_with_data(Responses::Created, json!(repository)),
		Err(e) => match e.error_status_code {
			409 => get_response(Responses::Conflict),
			_ => get_response(Responses::ServerError),
		},
	}
}

#[post("/user/repository/free", data = "<repository_name>")]
pub fn check_is_repository_name_free(repository_name: Json<RepositoryName>, user: AuthUserInfo) -> Response {
	match Repository::check_is_repository_name_free(repository_name.title.clone(), user) {
		Ok(response) => get_response_with_data(Responses::Ok, json!(response)),
		Err(e) => match e.error_status_code {
			404 => get_response(Responses::BadRequest),
			_ => {
				println!("{}", e);
				get_response(Responses::ServerError)
			}
		},
	}
}

#[get("/repository/filter", data = "<filters>")]
pub fn get_repositories_by_filter(filters: Json<RepositoriesFilter>, user: AuthUserInfo) -> Response {
	match Repository::get_repositories_by_filter(&filters, &user) {
		Ok(repositories) => get_response_with_data(Responses::Ok, json!(repositories)),
		Err(e) => match e.error_status_code {
			404 => get_response(Responses::BadRequest),
			_ => {
				println!("{}", e);
				get_response(Responses::ServerError)
			}
		},
	}
}

#[post("/repository/change/permitions", data = "<permitions>")]
pub fn change_repository_permitions(permitions: Json<NewPermitions>, user: AuthUserInfo) -> Response {
	match Repository::change_permitions(&user, permitions.into_inner()) {
		Ok(response) => get_response_with_data(Responses::Ok, json!(response)),
		Err(e) => match e.error_status_code {
			404 => get_response(Responses::BadRequest),
			403 => get_response(Responses::Forbidden),
			_ => {
				println!("{}", e);
				get_response(Responses::ServerError)
			}
		},
	}
}
