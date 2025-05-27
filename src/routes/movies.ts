import { ClientError } from '../lib/client-error';
import express from 'express';
import pg from 'pg';
import 'dotenv/config';

const db = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

const router = express.Router();

// GET all movies for a user
router.get('/movies', async (req, res, next) => {
    try {
        const sql = `
        SELECT * from "movies"
        ORDER by "movieId"
        `;
        const result = await db.query(sql);

        res.json(result.rows);
    } catch (err) {
        console.error(`Error in GET /movies`, err);

        next(err);
    }
});

// GET a movies by ID
router.get('/movies/:movieId', async (req, res, next) => {
    try {
        const id = Number(req.params.movieId);
        if (!id) {
            console.warn(`Invalid movie Id provided: ${req.params.movieId}`);

            throw new ClientError(400, 'movie Id is required');
        }

        const sql = `
        SELECT * from "movies"
        WHERE "movieId" = $1
        `;
        const result = await db.query(sql, [id]);

        if (result.rows.length === 0) {
            console.warn(`Movie with id ${id} not found`);
            throw new ClientError(404, `Movie with id ${id} not found`);
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(`Error in GET /movies/${req.params.movieId}:`, err);
        next(err);
    }
});

// POST a new property
router.post('/movies', async (req, res, next) => {
    try {
        const { title, summary, imdbLink, rating } = req.body

        if (!title || !imdbLink || !rating) {
            throw new ClientError(400, 'title, imdbLink, and rating are required')
        }

        if (rating < 1 || rating > 5) {
            throw new ClientError(400, 'rating must be between 1-5')
        }

        const sql = `
        INSERT INTO "movies" (
        "title",
        "summary",
        "imdbLink",
        "rating")
        VALUES ($1, $2, $3, $4)
        RETURNING *`


        const params = [
            title, summary, imdbLink, rating
        ];

        const result = await db.query(sql, params);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error in POST /movies:', err);

        next(err);
    }
});

// PUT to update a property
router.put('/movies/:movieId', async (req, res, next) => {
    try {
        const id = Number(req.params.movieId);
        if (!id) {
            console.warn('Invalid movie id provided:', req.params.movieId);
            throw new ClientError(400, 'movie id is required');
        }

        const {
            title,
            imdbLink,
            rating,
            summary
        } = req.body;

        const sql = `
        UPDATE "movies"
        SET 
        "title" = $1,
        "imdbLink" = $2,
        "rating" = $3,
        "summary" = $4
        WHERE "movieId" = $5
        RETURNING *;
        `;

        const params = [title, imdbLink, rating, summary, id];

        const result = await db.query(sql, params);

        if (result.rows.length === 0) {
            throw new ClientError(404, `Movie with id ${id} not found`);
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error in PUT /movies/:movieId:', err);

        next(err);
    }
});

// DELETE a movie
router.delete('/movies/:movieId', async (req, res, next) => {
    try {
        const id = Number(req.params.movieId);
        if (!id) {
            console.warn('Invalid movie id provided:', req.params.movieId);
            throw new ClientError(400, 'movie id is required');
        }

        const sql = `
      DELETE FROM "movies"
      WHERE "movieId" = $1
      RETURNING *
    `;

        const result = await db.query(sql, [id]);

        if (result.rows.length === 0) {
            throw new ClientError(404, `movie with id ${id} not found`);
        }

        res.sendStatus(204);
    } catch (err) {
        console.error('Error in DELETE /movies/:movieId:', err);

        next(err);
    }
});

export default router;