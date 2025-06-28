import { Request, Response } from 'express';
import { UserService } from '../services/userService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { CreateUserRequest, UpdateUserRequest } from '../types/user.js';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Get all users
   */
  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      console.error('Error getting all users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  };

  /**
   * Get user by ID
   */
  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      const user = await this.userService.getUserById(id);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Error getting user by ID:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  };

  /**
   * Get user by username (full user data - requires authentication)
   */
  getUserByUsername = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username } = req.params;
      if (!username) {
        res.status(400).json({ error: 'Username is required' });
        return;
      }

      const user = await this.userService.getUserByUsername(username);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Error getting user by username:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  };

  /**
   * Get public user information by username (safe for public access)
   */
  getPublicUserByUsername = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username } = req.params;
      if (!username) {
        res.status(400).json({ error: 'Username is required' });
        return;
      }

      const publicUser = await this.userService.getPublicUserByUsername(username);

      if (!publicUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json(publicUser);
    } catch (error) {
      console.error('Error getting public user by username:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  };

  /**
   * Create new user (requires authentication)
   */
  createUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const userData: CreateUserRequest = req.body;
      
      // Validate required fields
      if (!userData.username) {
        res.status(400).json({ error: 'Username is required' });
        return;
      }

      const user = await this.userService.createUser(userData, req.user.id);
      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      
      if (error instanceof Error && error.message === 'Username already exists') {
        res.status(400).json({ error: 'Username already exists' });
        return;
      }

      res.status(500).json({ error: 'Failed to create user' });
    }
  };

  /**
   * Update user
   */
  updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      const userDetails: UpdateUserRequest = req.body;

      // Users can only update their own profile
      if (req.user && req.user.id !== id) {
        res.status(403).json({ error: 'Can only update your own profile' });
        return;
      }

      const updatedUser = await this.userService.updateUser(id, userDetails);

      if (!updatedUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      
      if (error instanceof Error && error.message === 'Username already exists') {
        res.status(400).json({ error: 'Username already exists' });
        return;
      }

      res.status(500).json({ error: 'Failed to update user' });
    }
  };

  /**
   * Update user balance to a specific amount
   */
  updateUserBalance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      const { amount } = req.body;

      if (typeof amount !== 'number') {
        res.status(400).json({ error: 'Amount must be a number' });
        return;
      }

      const updatedUser = await this.userService.updateUserBalance(id, amount);

      if (!updatedUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error updating user balance:', error);
      res.status(500).json({ error: 'Failed to update user balance' });
    }
  };

  /**
   * Add amount to user's current balance
   */
  addUserAmount = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      const { amount } = req.body;

      if (typeof amount !== 'number') {
        res.status(400).json({ error: 'Amount must be a number' });
        return;
      }

      const updatedUser = await this.userService.addUserAmount(id, amount);

      if (!updatedUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error adding user amount:', error);
      res.status(500).json({ error: 'Failed to add user amount' });
    }
  };

  /**
   * Get users by group
   */
  getGroupUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { groupId } = req.params;
      if (!groupId) {
        res.status(400).json({ error: 'Group ID is required' });
        return;
      }

      const users = await this.userService.getFilteredUsers(groupId);
      res.status(200).json(users);
    } catch (error) {
      console.error('Error getting group users:', error);
      res.status(500).json({ error: 'Failed to fetch group users' });
    }
  };

  /**
   * Delete user (soft delete)
   */
  deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      // Users can only delete their own account
      if (req.user && req.user.id !== id) {
        res.status(403).json({ error: 'Can only delete your own account' });
        return;
      }

      const deleted = await this.userService.deleteUser(id);

      if (!deleted) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  };

  /**
   * Get current user profile
   */
  getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const user = await this.userService.getUserById(req.user.id);

      if (!user) {
        res.status(404).json({ error: 'User profile not found' });
        return;
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Error getting current user:', error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  };
} 