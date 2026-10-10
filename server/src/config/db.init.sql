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
    developer VARCHAR(255),
    release_date DATE,
    rtime_last_played TIMESTAMPTZ,
    beatable boolean DEFAULT true NOT NULL,
    hidden boolean DEFAULT false NOT NULL,
    installed boolean DEFAULT false NOT NULL,
    personal_rating INTEGER CHECK (personal_rating BETWEEN 1 AND 5),
    playtime INTEGER DEFAULT 0 CHECK (playtime >= 0) NOT NULL,
    status VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    api_name TEXT NOT NULL,
    display_name TEXT,
    description TEXT,
    icon TEXT,
    icon_gray TEXT,
    unlocked BOOLEAN NOT NULL DEFAULT false,
    unlocked_at TIMESTAMP,
    UNIQUE (game_id, api_name)
);

CREATE INDEX IF NOT EXISTS idx_achievements_game_id ON achievements (game_id);

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