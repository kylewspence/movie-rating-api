CREATE TABLE users (
  userId SERIAL PRIMARY KEY
);

CREATE TABLE movies (
  movieId SERIAL PRIMARY KEY,
  userId INTEGER REFERENCES users(userId),
  title TEXT,
  summary TEXT,
  imdbLink TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5)
);