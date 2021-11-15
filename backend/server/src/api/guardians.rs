use chrono::prelude::*;
use rocket::http::Status;
use rocket::request::{self, FromRequest, Outcome, Request};
use rocket::serde::json::serde_json::from_str;
use rocket::serde::{Deserialize, Serialize};

use crate::api::typings::AuthUserInfo;
use crate::errors::error_handler::ServerError;
use crate::redis_utils::utils::get;

#[derive(Serialize, Deserialize)]
pub struct UserInfo {
	pub username: String,
	pub expired_at: String,
	pub id: i32,
	pub is_admin: bool,
	pub email: String,
}

fn get_failure_401<T>() -> request::Outcome<T, ()> {
	Outcome::Failure((Status::Unauthorized, ()))
}

fn get_failure_500<T>() -> request::Outcome<T, ()> {
	Outcome::Failure((Status::InternalServerError, ()))
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for AuthUserInfo {
	type Error = ();

	async fn from_request(req: &'r Request<'_>) -> request::Outcome<Self, Self::Error> {
		let cookie = match req
			.cookies()
			.get_private("session")
			.ok_or(ServerError::new(404, "".to_string()))
		{
			Ok(cookie) => cookie,
			Err(_) => {
				return get_failure_401();
			}
		};

		let user_info_string = match get(cookie.value()) {
			Ok(user_info_string) => user_info_string,
			Err(_) => {
				return get_failure_401();
			}
		};

		let user_info: UserInfo = match from_str(&user_info_string) {
			Ok(user_info) => user_info,
			Err(_) => {
				return get_failure_500();
			}
		};

		let expired_at = match DateTime::parse_from_rfc2822(&user_info.expired_at) {
			Ok(time) => time,
			Err(_) => {
				return get_failure_500();
			}
		};

		let is_cookie_rottened = Utc::now() > expired_at;

		if is_cookie_rottened {
			return get_failure_401();
		}

		Outcome::Success(AuthUserInfo {
			username: user_info.username,
			user_id: user_info.id,
			is_admin: user_info.is_admin,
			email: user_info.email
		})
	}
}
