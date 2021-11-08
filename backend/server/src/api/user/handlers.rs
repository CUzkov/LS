/** User handlers */
use chrono::prelude::*;
use rocket::http::CookieJar;
use rocket::serde::json::{json, Json};

use crate::api::typings::Response;
use crate::api::utils::{get_response, get_response_with_data, Responses};
use crate::models::users::models::{NewUser, Roles, User};
use crate::utils::utils::get_cookie_info;

#[post("/user/create", data = "<new_user>")]
pub fn create_user(jar: &CookieJar, new_user: Json<NewUser>) -> Response {
	match get_cookie_info(&jar) {
		Ok(user_info) => {
			let is_cookie_rottened =
				Utc::now() > DateTime::parse_from_rfc2822(&user_info.expired_at).unwrap();

			if is_cookie_rottened {
				return get_response(Responses::Unauthorized);
			}

			match user_info.role {
				Roles::Admin => match User::create(&new_user) {
					Ok(user) => get_response_with_data(Responses::Created, json!(user)),
					Err(e) => match e.error_status_code {
						409 => get_response(Responses::Conflict),
						_ => get_response(Responses::ServerError),
					},
				},
				Roles::User => get_response(Responses::Forbidden),
			}
		}
		Err(e) => match e.error_status_code {
			404 => get_response(Responses::Unauthorized),
			_ => get_response(Responses::ServerError),
		},
	}
}
