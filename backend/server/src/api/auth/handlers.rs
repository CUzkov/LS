/** Auth handlers */
use crate::redis_utils::utils::{del, set};
use chrono::prelude::*;
use chrono::Duration;
use rocket::http::{Cookie, CookieJar};
use rocket::serde::json::serde_json::to_string;
use rocket::serde::json::{json, Json};

use crate::api::guardians::UserInfo;
use crate::api::typings::{AuthUserInfo, Credentials, Response};
use crate::api::utils::{get_response, get_response_with_data, Responses};
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

			let user_info = UserInfo {
				username: user.username.clone(),
				expired_at: (Utc::now() + Duration::hours(1)).to_rfc2822(),
				is_admin: user.is_admin,
				id: user.id,
				email: user.email.clone(),
			};

			let cookie = Cookie::new("session", user.u_password.clone());

			set(&user.u_password, &to_string(&user_info).unwrap()).unwrap();
			jar.add_private(cookie);

			get_response_with_data(Responses::Ok, json!(&user.get_user_without_password()))
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

#[get("/auth/check")]
pub fn auth_check(_user: AuthUserInfo) -> Response {
	get_response(Responses::Ok)
}
