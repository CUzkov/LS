/** User handlers */
use rocket::serde::json::{json, Json};
use serde::{Deserialize, Serialize};

use crate::api::typings::{AuthUserInfo, Response};
use crate::api::utils::{get_response, get_response_with_data, Responses};
use crate::models::maps::models::{Map, NewMap};

#[derive(Serialize, Deserialize)]
pub struct ICreateMap {
	pub title: String,
}

#[post("/maps/create", data = "<new_map>")]
pub fn create_map(new_map: Json<ICreateMap>, user: AuthUserInfo) -> Response {
	let map = NewMap {
		title: new_map.title.clone(),
		user_id: user.user_id,
	};

	match Map::create(map) {
		Ok(user) => get_response_with_data(Responses::Created, json!(user)),
		Err(e) => match e.error_status_code {
			409 => get_response(Responses::Conflict),
			_ => get_response(Responses::ServerError),
		},
	}
}

#[get("/maps/all/my")]
pub fn get_all_my_maps(user: AuthUserInfo) -> Response {
	match Map::get_by_user_id(user.user_id) {
		Ok(maps) => get_response_with_data(Responses::Ok, json!(maps)),
		Err(e) => match e.error_status_code {
			404 => get_response(Responses::BadRequest),
			_ => {
				println!("{}", e);
				get_response(Responses::ServerError)
			}
		},
	}
}
