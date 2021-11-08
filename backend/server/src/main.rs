#[macro_use]
extern crate rocket;

#[macro_use]
extern crate diesel;

mod api;
mod db;
mod errors;
mod models;
mod redis_utils;
mod utils;

use crate::api::auth::handlers::{auth_login, auth_logout};
use crate::api::user::handlers::create_user;
use crate::models::users::models::User;

use rocket::serde::json::{json, Value};

#[get("/")]
fn index() -> Value {
    let users = User::find_all().unwrap();

    json!(users)
}

#[launch]
fn rocket() -> _ {
    db::init();

    rocket::build()
        .mount("/", routes![index])
        .mount("/", routes![auth_login])
        .mount("/", routes![auth_logout])
        .mount("/", routes![create_user])
}
