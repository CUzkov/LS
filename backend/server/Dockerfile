FROM rust:1.54

WORKDIR /usr/src/server
COPY ./src ./src
COPY ./Cargo.toml .
COPY ./Cargo.lock .
COPY ./Rocket.toml .

RUN cargo install --path .

CMD ["./target/release/server"]
