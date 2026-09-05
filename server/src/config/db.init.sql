CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    steam_id BIGINT PRIMARY KEY,
    steam_api_key TEXT
);

CREATE TABLE games (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    steam_id BIGINT UNIQUE,
    cover_square TEXT,
    cover_hero TEXT,
    cover_grid TEXT,
    developer VARCHAR(255),
    release_date DATE,
    rtime_last_played TIMESTAMPTZ,
    favorite boolean DEFAULT false NOT NULL,
    personal_rating INTEGER CHECK (personal_rating BETWEEN 1 AND 5),
    playtime INTEGER NOT NULL DEFAULT 0 CHECK (playtime >= 0),
    status VARCHAR(50)
);

CREATE TABLE genres (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE game_genres (
    id BIGSERIAL PRIMARY KEY,
    game_id BIGINT NOT NULL,
    genre_id BIGINT NOT NULL,
    FOREIGN KEY (game_id)
        REFERENCES games(id)
        ON DELETE CASCADE,
    FOREIGN KEY (genre_id)
        REFERENCES genres(id)
        ON DELETE CASCADE,
    UNIQUE (game_id, genre_id)
);

CREATE INDEX ON game_genres(genre_id);

CREATE TABLE collections (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL
);

CREATE TABLE collection_games (
    id BIGSERIAL PRIMARY KEY,
    collection_id BIGINT NOT NULL,
    game_id BIGINT NOT NULL,
    FOREIGN KEY (collection_id)
        REFERENCES collections(id)
        ON DELETE CASCADE,
    FOREIGN KEY (game_id)
        REFERENCES games(id)
        ON DELETE CASCADE,
    UNIQUE (collection_id, game_id)
);

CREATE INDEX ON collection_games(game_id);