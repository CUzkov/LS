/** Auth handlers */
use crate::redis_utils::utils::{del, set};
use chrono::prelude::*;
use chrono::Duration;
use rocket::http::{Cookie, CookieJar};
use rocket::serde::json::serde_json::to_string;
use rocket::serde::json::Json;

use crate::api::typings::{Credentials, Response, UserInfo};
use crate::api::utils::{get_response, Responses};
use crate::errors::error_handler::ServerError;
use crate::models::users::models::User;

#[post("/auth/login", data = "<credentials>")]
pub fn auth_login(jar: &CookieJar<'_>, credentials: Json<Credentials>) -> Response {
	let user: Result<User, ServerError>;

	if credentials.email == "" {
		user = User::get_user_by_username(&credentials.username);
	} else {
		user = User::get_user_by_email(&credentials.email);
	}

	match user {
		Ok(user) => {
			if credentials.password != user.u_password {
				return get_response(Responses::IncorrectPassword);
			}

			let role = user.get_user_role();

			let user_info = UserInfo {
				username: user.username,
				expired_at: (Utc::now() + Duration::hours(1)).to_rfc2822().to_string(),
				role,
			};

			let cookie = Cookie::new("session", user.u_password.clone());

			set(&user.u_password, &to_string(&user_info).unwrap()).unwrap();
			jar.add_private(cookie);

			get_response(Responses::Ok)
		}
		Err(e) => {
			if e.error_status_code == 404 {
				return get_response(Responses::NoSuchUser);
			}

			get_response(Responses::ServerError)
		}
	}
}

#[post("/auth/logout")]
pub fn auth_logout(jar: &CookieJar<'_>) -> Response {
	let cookie = jar.get_private("session");

	if cookie != None {
		del(cookie.unwrap().value()).unwrap();
		jar.remove_private(Cookie::named("session"));

		return get_response(Responses::Ok);
	}

	get_response(Responses::Unauthorized)
}
