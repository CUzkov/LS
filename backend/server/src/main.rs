#[macro_use]
extern crate rocket;

mod api;
mod db;
mod errors;
mod git_manager;
mod middleware;
mod models;
mod redis_utils;

use crate::api::auth::handlers::{auth_check, auth_login, auth_logout};
use crate::api::map::handlers::{create_map, get_all_my_maps};
use crate::api::repository::handlers::{create_repository, check_is_repository_name_free, get_repositories_by_filter, change_repository_permitions};
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
            "/api",
            routes![
                // auths
                auth_login,
                auth_logout,
                auth_check,
                // users
                create_user,
                // maps
                create_map,
                get_all_my_maps,
                // repositories
                create_repository,
                check_is_repository_name_free,
                get_repositories_by_filter,
                change_repository_permitions,
                // option for cors
                index
            ],
        )
        .register("/", catchers![default_catcher])
}
