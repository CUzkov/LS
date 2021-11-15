/** User handlers */
use rocket::serde::json::{json, Json};

use crate::api::typings::{AuthUserInfo, Response};
use crate::api::utils::{get_response, get_response_with_data, Responses};
use crate::models::repositories::models::{Repository, NewRepository};

#[post("/user/create/map", data = "<new_repository>")]
pub fn create_repository_for_map(new_repository: Json<NewRepository>, user: AuthUserInfo) -> Response {
	let new_repository = new_repository;

	match Repository::create_for_map(&new_repository, user) {
		Ok(repository) => get_response_with_data(Responses::Created, json!(repository)),
		Err(e) => match e.error_status_code {
			409 => get_response(Responses::Conflict),
			_ => get_response(Responses::ServerError),
		},
	}
}
