FROM rust:1.54

WORKDIR /usr/src/server
COPY ./src ./src
COPY ./Cargo.toml .
COPY ./Cargo.lock .
COPY ./Rocket.toml .

RUN cargo install --path .
RUN cargo install diesel_cli --no-default-features --features postgres

CMD ["./target/release/server"]
