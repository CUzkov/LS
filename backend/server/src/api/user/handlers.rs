/** User handlers */
use rocket::serde::json::{json, Json};

use crate::api::typings::{AuthUserInfo, Response};
use crate::api::utils::{get_response, get_response_with_data, Responses};
use crate::models::users::models::{User, NewUser};

#[post("/user/create", data = "<new_user>")]
pub fn create_user(new_user: Json<NewUser>, _user: AuthUserInfo) -> Response {
	let mut new_user = new_user;

	match User::create(&mut new_user) {
		Ok(user) => get_response_with_data(Responses::Created, json!(user)),
		Err(e) => match e.error_status_code {
			409 => get_response(Responses::Conflict),
			_ => get_response(Responses::ServerError),
		},
	}
}