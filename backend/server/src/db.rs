use diesel::pg::PgConnection;
use diesel::r2d2::ConnectionManager;
use lazy_static::lazy_static;
use r2d2;

use crate::errors::error_handler::ServerError;

type Pool = r2d2::Pool<ConnectionManager<PgConnection>>;
pub type DbConnection = r2d2::PooledConnection<ConnectionManager<PgConnection>>;

lazy_static! {
    static ref POOL: Pool = {
        let db_url = "postgres://admin:admin@localhost/ls";
        let manager = ConnectionManager::<PgConnection>::new(db_url);
        Pool::new(manager).expect("Failed to create db pool")
    };
}

pub fn init() {
    lazy_static::initialize(&POOL);
}

pub fn connection() -> Result<DbConnection, ServerError> {
    POOL.get().map_err(|_e| ServerError {
        error_status_code: 500,
        error_message: "".to_string(),
    })
}
