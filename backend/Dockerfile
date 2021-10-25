FROM rust:1.54

WORKDIR /usr/src/server
COPY ./server .

RUN cargo install --path .

CMD ["./target/release/server"]
