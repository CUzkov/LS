table! {
    repositories (id) {
        id -> Int4,
        user_id -> Nullable<Int4>,
        path_to_repository -> Text,
    }
}

table! {
    users (id) {
        id -> Int4,
        username -> Varchar,
        email -> Varchar,
        u_password -> Varchar,
        u_role -> Varchar,
    }
}

joinable!(repositories -> users (user_id));

allow_tables_to_appear_in_same_query!(
    repositories,
    users,
);
