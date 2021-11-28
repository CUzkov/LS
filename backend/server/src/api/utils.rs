use rocket::http::Status;
use rocket::serde::json::{json, Value};
use rocket::serde::Serialize;
use rocket::Request;

use crate::api::typings::{
	Response, Response200, Response201, Response400, Response401, Response403, Response409,
	Response500,
};

const SERVER_ERROR: &str = "Ошибка сервера";
const UNAUTHORIZED: &str = "Вы не авторизованы";
const FORBIDDEN: &str = "Не достаточно полномочий";
const INCORRECT_PASSWORD: &str = "Неверный пароль";
const NO_SUCH_USER: &str = "Такого пользователя не существует";
const CONFLICT: &str = "Невозможно создать";
const BAD_REQUEST: &str = "Неправильный запрос";

pub enum Responses {
	Ok,
	Forbidden,
	Unauthorized,
	IncorrectPassword,
	NoSuchUser,
	ServerError,
	Created,
	Conflict,
	BadRequest,
}

#[derive(Serialize)]
pub struct Error {
	error: String,
	description: String,
}

#[derive(Serialize)]
pub struct Empty {}

fn get_response_general(response_type: Responses, data: Value, error: String) -> Response {
	match response_type {
		Responses::Ok => Response::Response200(Response200 { inner: data }),
		Responses::Created => Response::Response201(Response201 {
			inner: json!(Empty {}),
		}),
		Responses::Unauthorized => Response::Response401(Response401 {
			inner: json!(Error {
				error: UNAUTHORIZED.to_string(),
				description: error
			}),
		}),
		Responses::IncorrectPassword => Response::Response401(Response401 {
			inner: json!(Error {
				error: INCORRECT_PASSWORD.to_string(),
				description: error
			}),
		}),
		Responses::NoSuchUser => Response::Response401(Response401 {
			inner: json!(Error {
				error: NO_SUCH_USER.to_string(),
				description: error
			}),
		}),
		Responses::Forbidden => Response::Response403(Response403 {
			inner: json!(Error {
				error: FORBIDDEN.to_string(),
				description: error
			}),
		}),
		Responses::Conflict => Response::Response409(Response409 {
			inner: json!(Error {
				error: CONFLICT.to_string(),
				description: error
			}),
		}),
		Responses::BadRequest => Response::Response400(Response400 {
			inner: json!(Error {
				error: BAD_REQUEST.to_string(),
				description: error
			}),
		}),
		Responses::ServerError => Response::Response500(Response500 {
			inner: json!(Error {
				error: SERVER_ERROR.to_string(),
				description: error
			}),
		}),
	}
}

pub fn get_response(response_type: Responses) -> Response {
	get_response_general(response_type, json!(Empty {}), "".to_string())
}

pub fn get_response_with_data(response_type: Responses, data: Value) -> Response {
	get_response_general(response_type, data, "".to_string())
}

#[catch(default)]
pub fn default_catcher(status: Status, _req: &Request<'_>) -> Value {
	match status.code {
		401 => json!(Error {
			error: UNAUTHORIZED.to_string(),
			description: "".to_string()
		}),
		500 | _ => json!(Error {
			error: SERVER_ERROR.to_string(),
			description: "".to_string()
		}),
	}
}
