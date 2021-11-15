#[macro_use]
extern crate rocket;

mod api;
mod db;
mod errors;
mod git_manager;
mod middleware;
mod models;
mod redis_utils;

use crate::api::auth::handlers::{auth_login, auth_logout};
use crate::api::map::handlers::create_map;
use crate::api::repository::handlers::create_repository_for_map;
use crate::api::user::handlers::create_user;
use crate::api::utils::default_catcher;

#[options("/<_..>")]
fn index() -> String {
    "".to_string()
}

#[launch]
fn rocket() -> _ {
    db::init();

    rocket::build()
        .attach(middleware::cors::Cors)
        .mount(
            "/",
            routes![
                auth_login,
                auth_logout,
                create_user,
                create_map,
                create_repository_for_map,
                index
            ],
        )
        .register("/", catchers![default_catcher])
}
