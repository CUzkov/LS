use rocket::http::{Cookie, CookieJar};
use rocket::serde::json::serde_json::from_str;

use crate::api::typings::UserInfo;
use crate::errors::error_handler::ServerError;
use crate::redis_utils::utils::get;

pub fn get_cookie_info(jar: &CookieJar) -> Result<UserInfo, ServerError> {
	let cookie: Cookie = jar
		.get_private("session")
		.ok_or(ServerError::new(404, "".to_string()))?;

	let value: UserInfo = from_str(&get(cookie.value())?)?;

	Ok(value)
}
