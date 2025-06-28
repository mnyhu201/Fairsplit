import { Router, Request, Response } from 'express';
import { supabaseAuth } from '../config/supabase.js';
import { UserService } from '../services/userService.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { CreateUserRequest } from '../types/user.js';

const router = Router();
const userService = new UserService();

/**
 * Register a new user with Supabase Auth and create user profile
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, username, fullname } = req.body;

    // Validate required fields
    if (!email || !password || !username) {
      res.status(400).json({ 
        error: 'Email, password, and username are required' 
      });
      return;
    }

    // Check if username already exists
    const existingUser = await userService.getUserByUsername(username);
    if (existingUser) {
      res.status(400).json({ error: 'Username already exists' });
      return;
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

/**
 * Login user with Supabase Auth
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ 
        error: 'Email and password are required' 
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

/**
 * Logout user
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    const { error } = await supabaseAuth.auth.signOut();
    
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

/**
 * Get current user session
 */
router.get('/session', async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabaseAuth.auth.getSession();
    
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    if (!data.session) {
      res.status(401).json({ error: 'No active session' });
      return;
    }

    // Get user profile
    const userProfile = await userService.getUserById(data.session.user.id);

    res.status(200).json({
      session: data.session,
      user: userProfile
    });
  } catch (error) {
    console.error('Session error:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

/**
 * Refresh access token
 */
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      res.status(400).json({ error: 'Refresh token is required' });
      return;
    }

    const { data, error } = await supabaseAuth.auth.refreshSession({
      refresh_token
    });

    if (error) {
      res.status(401).json({ error: error.message });
      return;
    }

    res.status(200).json({
      session: data.session
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

/**
 * Reset password
 */
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const { error } = await supabaseAuth.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    });

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(200).json({ 
      message: 'Password reset email sent' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
});

/**
 * Update password
 */
router.post('/update-password', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { password } = req.body;

    if (!password) {
      res.status(400).json({ error: 'New password is required' });
      return;
    }

    const { error } = await supabaseAuth.auth.updateUser({
      password: password
    });

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(200).json({ 
      message: 'Password updated successfully' 
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

export default router; 