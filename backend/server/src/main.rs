#[macro_use] extern crate rocket;

extern crate redis;
use redis::Commands;

fn get_param() -> Result<String, redis::RedisError> {
    // connect to redis
    let client = redis::Client::open("redis://127.0.0.1/")?;
    let mut con = client.get_connection()?;
    // throw away the result, just make sure it does not fail
    let _ : () = con.set("my_key", 42)?;
    // read back the key and return it.  Because the return value
    // from the function is a result for integer this will automatically
    // convert into one.
    let result: String = con.get("my_key")?;

    Result::Ok(result)
}

#[get("/")]
fn index() -> String {
    let result: String = get_param().unwrap();

    result
}

#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", routes![index])
}
