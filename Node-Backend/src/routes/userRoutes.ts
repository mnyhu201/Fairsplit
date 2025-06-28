import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { supabaseAuth, supabaseAdmin } from '../config/supabase.js';
import { UserService } from '../services/userService.js';
import { CreateUserRequest } from '../types/user.js';
import { isValidEmail, isValidUsername, isValidPassword } from '../utils/validation.js';

const router = Router();
const userController = new UserController();
const userService = new UserService();

// Public routes (no authentication required)
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.get('/public/username/:username', userController.getPublicUserByUsername);
router.get('/group/:groupId', userController.getGroupUsers);

// Registration endpoint (moved from auth routes to match original structure)
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, fullname } = req.body;

    // Validate required fields
    if (!email || !password || !username) {
      res.status(400).json({ 
        error: 'Email, password, and username are required' 
      });
      return;
    }

    // Basic validation
    if (!isValidEmail(email)) {
      res.status(400).json({ 
        error: 'Invalid email format' 
      });
      return;
    }

    if (!isValidUsername(username)) {
      res.status(400).json({ 
        error: 'Username must be 3-20 characters, alphanumeric and underscores only' 
      });
      return;
    }

    if (!isValidPassword(password)) {
      res.status(400).json({ 
        error: 'Password must be at least 6 characters' 
      });
      return;
    }

    // Check if username already exists
    const existingUser = await userService.getUserByUsername(username);
    if (existingUser) {
      res.status(400).json({ error: 'Username already exists' });
      return;
    }

    // Check if email already exists using admin client
    try {
      const { data: existingAuthUser } = await supabaseAdmin.auth.admin.listUsers();
      const emailExists = existingAuthUser.users.some(user => user.email === email);
      
      if (emailExists) {
        res.status(400).json({ error: 'Email already exists' });
        return;
      }
    } catch (error) {
      console.error('Error checking email existence:', error);
      // Continue with registration if we can't check email existence
    }

    // Create Supabase Auth user
    const { data: authData, error: authError } = await supabaseAuth.auth.signUp({
      email,
      password,
    });

    if (authError) {
      res.status(400).json({ error: authError.message });
      return;
    }

    if (!authData.user) {
      res.status(500).json({ error: 'Failed to create user account' });
      return;
    }

    // Create user profile in our users table
    const userProfile: CreateUserRequest = {
      username,
      fullname: fullname || null,
      amount: 0
    };

    const user = await userService.createUser(userProfile, authData.user.id);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username,
        fullname: user.fullname,
        amount: user.amount
      },
      session: authData.session
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create user account' });
  }
});

// Login endpoint (moved from auth routes)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ 
        error: 'Email and password are required' 
      });
      return;
    }

    // Basic email format validation
    if (!isValidEmail(email)) {
      res.status(400).json({ 
        error: 'Invalid email format' 
      });
      return;
    }

    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      res.status(401).json({ error: error.message });
      return;
    }

    if (!data.user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Get user profile from our users table
    const userProfile = await userService.getUserById(data.user.id);

    res.status(200).json({
      message: 'Login successful',
      user: userProfile,
      session: data.session
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Protected routes (authentication required)
router.get('/username/:username', authenticateToken, userController.getUserByUsername);
router.put('/:id', authenticateToken, userController.updateUser);
router.delete('/:id', authenticateToken, userController.deleteUser);
router.get('/profile/me', authenticateToken, userController.getCurrentUser);

// Balance management routes (no auth required for now, but could be protected)
router.put('/:id/balance', userController.updateUserBalance);
router.put('/:id/add-balance', userController.addUserAmount);

export default router; 