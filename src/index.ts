import 'dotenv/config'; // <-- at the top

const db = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false, // local dev, no SSL
});