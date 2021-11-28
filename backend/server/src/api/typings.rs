use rocket::serde::json::Value;
use rocket::serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct Credentials {
	pub username: String,
	pub email: String,
	pub password: String,
}

#[derive(Serialize, Deserialize)]
pub struct AuthUserInfo {
	pub username: String,
	pub user_id: i32,
	pub is_admin: bool,
	pub email: String,
}

#[derive(Responder)]
#[response(status = 200, content_type = "json")]
pub struct Response200 {
	pub inner: Value,
}

#[derive(Responder)]
#[response(status = 201, content_type = "json")]
pub struct Response201 {
	pub inner: Value,
}

#[derive(Responder)]
#[response(status = 400, content_type = "json")]
pub struct Response400 {
	pub inner: Value,
}

#[derive(Responder)]
#[response(status = 401, content_type = "json")]
pub struct Response401 {
	pub inner: Value,
}

#[derive(Responder)]
#[response(status = 403, content_type = "json")]
pub struct Response403 {
	pub inner: Value,
}

#[derive(Responder)]
#[response(status = 409, content_type = "json")]
pub struct Response409 {
	pub inner: Value,
}

#[derive(Responder)]
#[response(status = 500, content_type = "json")]
pub struct Response500 {
	pub inner: Value,
}

#[derive(Responder)]
pub enum Response {
	Response200(Response200),
	Response201(Response201),
	Response400(Response400),
	Response401(Response401),
	Response403(Response403),
	Response409(Response409),
	Response500(Response500),
}
