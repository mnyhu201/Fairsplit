import { supabase } from '../config/supabase';
import { Group, CreateGroupRequest, UpdateGroupRequest, GroupWithUsers, UserInGroup } from '../types/group';

export class GroupService {
    /**
     * Get all groups from the database
     */
    async getAllGroups(): Promise<Group[]> {
        const { data, error } = await supabase
            .from('groups')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch groups: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Get a group by its ID
     */
    async getGroupById(id: number): Promise<Group | null> {
        const { data, error } = await supabase
            .from('groups')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // Not found
            }
            throw new Error(`Failed to fetch group: ${error.message}`);
        }

        return data;
    }

    /**
     * Get a group by its ID with users
     */
    async getGroupWithUsers(id: number): Promise<GroupWithUsers | null> {
        const { data, error } = await supabase
            .from('groups')
            .select(`
                *,
                group_user!inner(
                    joined_at,
                    users:user_id(
                        id,
                        username,
                        fullname,
                        email,
                        is_active
                    )
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // Not found
            }
            throw new Error(`Failed to fetch group with users: ${error.message}`);
        }

        if (!data) return null;

        // Transform the data to match our interface
        const users: UserInGroup[] = data.group_user.map((membership: any) => ({
            ...membership.users,
            joined_at: membership.joined_at
        }));

        return {
            id: data.id,
            name: data.name,
            is_active: data.is_active,
            created_at: data.created_at,
            updated_at: data.updated_at,
            users
        };
    }

    /**
     * Create a new group and add the creator as a member
     */
    async createGroup(groupData: CreateGroupRequest, creatorId: string): Promise<Group> {
        // Create the group
        const { data: group, error } = await supabase
            .from('groups')
            .insert({
                name: groupData.name,
                is_active: groupData.is_active ?? true
            })
            .select()
            .single();

        if (error || !group) {
            throw new Error(`Failed to create group: ${error?.message}`);
        }

        // Add the creator as a member
        const { error: memberError } = await supabase
            .from('group_user')
            .insert({
                group_id: group.id,
                user_id: creatorId
            });
        if (memberError) {
            throw new Error(`Failed to add creator to group: ${memberError.message}`);
        }

        return group;
    }

    /**
     * Update a group's details
     */
    async updateGroup(id: number, groupData: UpdateGroupRequest): Promise<Group> {
        const updateData: any = {};
        
        if (groupData.name !== undefined) {
            updateData.name = groupData.name;
        }
        if (groupData.is_active !== undefined) {
            updateData.is_active = groupData.is_active;
        }

        const { data, error } = await supabase
            .from('groups')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                throw new Error('Group not found');
            }
            throw new Error(`Failed to update group: ${error.message}`);
        }

        return data;
    }

    /**
     * Delete a group by its ID
     */
    async deleteGroupById(id: number): Promise<void> {
        const { error } = await supabase
            .from('groups')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Failed to delete group: ${error.message}`);
        }
    }

    /**
     * Add a user to a group
     */
    async addUserToGroup(groupId: number, userId: string): Promise<Group> {
        // First check if the group exists
        const group = await this.getGroupById(groupId);
        if (!group) {
            throw new Error('Group not found');
        }

        // Check if user is already in the group
        const { data: existingMembership, error: checkError } = await supabase
            .from('group_user')
            .select('*')
            .eq('group_id', groupId)
            .eq('user_id', userId)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            throw new Error(`Failed to check group membership: ${checkError.message}`);
        }

        if (existingMembership) {
            throw new Error('User is already a member of this group');
        }

        // Add user to group
        const { error: insertError } = await supabase
            .from('group_user')
            .insert({
                group_id: groupId,
                user_id: userId
            });

        if (insertError) {
            throw new Error(`Failed to add user to group: ${insertError.message}`);
        }

        // Return the updated group
        return await this.getGroupById(groupId) as Group;
    }

    /**
     * Remove a user from a group
     */
    async removeUserFromGroup(groupId: number, userId: string): Promise<Group> {
        // First check if the group exists
        const group = await this.getGroupById(groupId);
        if (!group) {
            throw new Error('Group not found');
        }

        // Check if user is in the group
        const { data: existingMembership, error: checkError } = await supabase
            .from('group_user')
            .select('*')
            .eq('group_id', groupId)
            .eq('user_id', userId)
            .single();

        if (checkError) {
            if (checkError.code === 'PGRST116') {
                throw new Error('User is not a member of this group');
            }
            throw new Error(`Failed to check group membership: ${checkError.message}`);
        }

        // Remove user from group
        const { error: deleteError } = await supabase
            .from('group_user')
            .delete()
            .eq('group_id', groupId)
            .eq('user_id', userId);

        if (deleteError) {
            throw new Error(`Failed to remove user from group: ${deleteError.message}`);
        }

        // Return the updated group
        return await this.getGroupById(groupId) as Group;
    }

    /**
     * Get groups by active status
     */
    async getGroupsByActiveStatus(isActive: boolean): Promise<Group[]> {
        const { data, error } = await supabase
            .from('groups')
            .select('*')
            .eq('is_active', isActive)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch groups: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Get a group by its name
     */
    async getGroupByName(name: string): Promise<Group | null> {
        const { data, error } = await supabase
            .from('groups')
            .select('*')
            .eq('name', name)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // Not found
            }
            throw new Error(`Failed to fetch group by name: ${error.message}`);
        }

        return data;
    }

    /**
     * Get groups for a specific user (by userId)
     */
    async getGroupsForUser(userId: string): Promise<Group[]> {
        const { data, error } = await supabase
            .from('groups')
            .select(`*, group_user!inner(user_id)`) // join with group_user
            .eq('group_user.user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch user groups: ${error.message}`);
        }

        return data || [];
    }
} 