import request from 'supertest';
import express from 'express';
import * as db from '../db-handler.js';

// Import your actual routes
import userRoutes from '../../Routes/userRoutes.js';
import blogRoutes from '../../Routes/blogRoutes.js';

// Setup a test Express app
const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);

// Connect to the memory database before running any tests.
beforeAll(async () => await db.connect());

// Clear all test data after every test.
afterEach(async () => await db.clearDatabase());

// Remove and close the db and server.
afterAll(async () => await db.closeDatabase());

describe('API Integration Tests', () => {
    let token;

    // Create a user and log in to get a token before blog tests
    beforeEach(async () => {
        await request(app).post('/api/users/register').send({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
        });
        const response = await request(app).post('/api/users/login').send({
            email: 'test@example.com',
            password: 'password123',
        });
        token = response.body.token; // Assuming your login returns a token
    });

    it('POST /api/blogs - should not create a blog without authentication', async () => {
        const response = await request(app)
            .post('/api/blogs')
            .send({ title: 'A new blog', content: 'Some content' });

        expect(response.statusCode).toBe(401); // Or 403, depending on your auth middleware
    });

    it('POST /api/blogs - should create a blog with valid authentication', async () => {
        const response = await request(app)
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`) // Set the auth header
            .send({ title: 'A new blog by an auth user', content: 'Some cool content' });

        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe('A new blog by an auth user');
    });
    
    it('GET /api/blogs - should retrieve all blogs', async () => {
        // First, create a blog to make sure there's data to retrieve
        await request(app)
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Blog One', content: 'Content One' });

        const response = await request(app).get('/api/blogs');
        
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(1);
        expect(response.body[0].title).toBe('Blog One');
    });
});