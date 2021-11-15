use lazy_static::lazy_static;
use r2d2;
use r2d2_postgres;

use crate::errors::error_handler::ServerError;

type Pool = r2d2::Pool<r2d2_postgres::PostgresConnectionManager<r2d2_postgres::postgres::NoTls>>;
pub type DbConnection = r2d2::PooledConnection<
    r2d2_postgres::PostgresConnectionManager<r2d2_postgres::postgres::NoTls>,
>;

lazy_static! {
    static ref POOL: Pool = {
        let db_url = "host=localhost user=ls password=ls";
        let manager = r2d2_postgres::PostgresConnectionManager::new(
            db_url.parse().unwrap(),
            r2d2_postgres::postgres::NoTls,
        );
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
