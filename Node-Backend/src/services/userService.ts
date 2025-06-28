import { supabase } from '../config/supabase.js';
import { User, CreateUserRequest, UpdateUserRequest, UserTable, PublicUserInfo } from '../types/user.js';

export class UserService {
  private readonly tableName = 'users';

  /**
   * Get all users from the database
   */
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Find a user by their ID
   */
  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // User not found
      }
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return data;
  }

  /**
   * Find a user by their username
   */
  async getUserByUsername(username: string): Promise<User | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // User not found
      }
      throw new Error(`Failed to fetch user by username: ${error.message}`);
    }

    return data;
  }

  /**
   * Get public user information by username (safe for public access)
   */
  async getPublicUserByUsername(username: string): Promise<PublicUserInfo | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('id, username, fullname, is_active')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // User not found
      }
      throw new Error(`Failed to fetch public user info: ${error.message}`);
    }

    return data;
  }

  /**
   * Get users filtered by group ID
   */
  async getFilteredUsers(groupId: string): Promise<User[]> {
    if (!groupId) {
      return this.getAllUsers();
    }

    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        group_user!inner(group_id)
      `)
      .eq('group_user.group_id', groupId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch users by group: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Create a new user (assumes Supabase Auth user already exists)
   */
  async createUser(userData: CreateUserRequest, supabaseUserId: string): Promise<User> {
    // Check if username already exists
    const existingUser = await this.getUserByUsername(userData.username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    const now = new Date().toISOString();
    const newUser: Omit<UserTable, 'id'> = {
      username: userData.username,
      fullname: userData.fullname || null,
      amount: userData.amount || 0,
      is_active: true,
      created_at: now,
      updated_at: now
    };

    const { data, error } = await supabase
      .from(this.tableName)
      .insert([{ ...newUser, id: supabaseUserId }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return data;
  }

  /**
   * Update a user's balance to a specific amount
   */
  async updateUserBalance(id: string, newAmount: number): Promise<User | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({
        amount: newAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('is_active', true)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // User not found
      }
      throw new Error(`Failed to update user balance: ${error.message}`);
    }

    return data;
  }

  /**
   * Add an amount to a user's current balance
   */
  async addUserAmount(id: string, amountToAdd: number): Promise<User | null> {
    // First get current user to calculate new balance
    const currentUser = await this.getUserById(id);
    if (!currentUser) {
      return null;
    }

    const newAmount = currentUser.amount + amountToAdd;
    return this.updateUserBalance(id, newAmount);
  }

  /**
   * Update an existing user
   */
  async updateUser(id: string, userDetails: UpdateUserRequest): Promise<User | null> {
    // Check if username already exists (if username is being updated)
    if (userDetails.username) {
      const existingUser = await this.getUserByUsername(userDetails.username);
      if (existingUser && existingUser.id !== id) {
        throw new Error('Username already exists');
      }
    }

    const updateData: Partial<UserTable> = {
      updated_at: new Date().toISOString()
    };

    if (userDetails.username !== undefined) {
      updateData.username = userDetails.username;
    }
    if (userDetails.fullname !== undefined) {
      updateData.fullname = userDetails.fullname;
    }
    if (userDetails.amount !== undefined) {
      updateData.amount = userDetails.amount;
    }

    const { data, error } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .eq('is_active', true)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // User not found
      }
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a user by their ID (soft delete)
   */
  async deleteUser(id: string): Promise<boolean> {
    const { error } = await supabase
      .from(this.tableName)
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }

    return true;
  }

  /**
   * Check if a username already exists
   */
  async existsByUsername(username: string): Promise<boolean> {
    const user = await this.getUserByUsername(username);
    return user !== null;
  }

  /**
   * Get user by Supabase Auth ID
   */
  async getUserBySupabaseId(supabaseUserId: string): Promise<User | null> {
    return this.getUserById(supabaseUserId);
  }
} 