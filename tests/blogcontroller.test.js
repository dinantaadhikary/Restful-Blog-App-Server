import { jest } from '@jest/globals';

// Mock the Blog model before importing the controller
const mockSave = jest.fn().mockResolvedValue({});
jest.unstable_mockModule('../../Models/blogModel.js', () => ({
    default: jest.fn().mockImplementation(() => ({
        save: mockSave,
    })),
}));

// Now import the controller
const { createBlog } = await import('../../Controllers/blogController.js');

describe('Blog Controller - Unit Tests', () => {
    let req, res;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Mock Express req and res objects
        req = {
            body: { title: 'Test Title', content: 'Test Content' },
            userId: 'mockUserId123', // This would be set by auth middleware
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    it('should create a blog and return 201 status', async () => {
        await createBlog(req, res);

        expect(mockSave).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalled();
    });

    it('should return 400 if title is missing', async () => {
        req.body.title = ''; // Make input invalid

        await createBlog(req, res);

        expect(mockSave).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Title and content are required.' });
    });
});