import { Request, Response } from 'express';
import { GroupService } from '../services/groupService';
import { CreateGroupRequest, UpdateGroupRequest } from '../types/group';

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

export class GroupController {
    private groupService: GroupService;

    constructor() {
        this.groupService = new GroupService();
    }

    /**
     * Get all groups
     * GET /api/groups
     */
    async getAllGroups(req: Request, res: Response): Promise<void> {
        try {
            const groups = await this.groupService.getAllGroups();
            res.json(groups);
        } catch (error) {
            console.error('Error fetching groups:', error);
            res.status(500).json({ 
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get group by ID
     * GET /api/groups/:id
     */
    async getGroupById(req: Request, res: Response): Promise<void> {
        try {
            const idParam = req.params.id;
            if (!idParam) {
                res.status(400).json({ error: 'Group ID is required' });
                return;
            }

            const id = parseInt(idParam);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid group ID' });
                return;
            }

            const group = await this.groupService.getGroupById(id);
            if (!group) {
                res.status(404).json({ error: 'Group not found' });
                return;
            }

            res.json(group);
        } catch (error) {
            console.error('Error fetching group:', error);
            res.status(500).json({ 
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get group by ID with users
     * GET /api/groups/:id/users
     */
    async getGroupWithUsers(req: Request, res: Response): Promise<void> {
        try {
            const idParam = req.params.id;
            if (!idParam) {
                res.status(400).json({ error: 'Group ID is required' });
                return;
            }

            const id = parseInt(idParam);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid group ID' });
                return;
            }

            const group = await this.groupService.getGroupWithUsers(id);
            if (!group) {
                res.status(404).json({ error: 'Group not found' });
                return;
            }

            res.json(group);
        } catch (error) {
            console.error('Error fetching group with users:', error);
            res.status(500).json({ 
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Create a new group (creator is added as member)
     * POST /api/groups
     */
    async createGroup(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const groupData: CreateGroupRequest = req.body;
            const creatorId = req.user?.id;
            if (!creatorId) {
                res.status(401).json({ error: 'User not authenticated' });
                return;
            }
            if (!groupData.name || groupData.name.trim() === '') {
                res.status(400).json({ error: 'Group name is required' });
                return;
            }
            const group = await this.groupService.createGroup(groupData, creatorId);
            res.status(201).json(group);
        } catch (error) {
            console.error('Error creating group:', error);
            res.status(500).json({ 
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Update a group
     * PUT /api/groups/:id
     */
    async updateGroup(req: Request, res: Response): Promise<void> {
        try {
            const idParam = req.params.id;
            if (!idParam) {
                res.status(400).json({ error: 'Group ID is required' });
                return;
            }

            const id = parseInt(idParam);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid group ID' });
                return;
            }

            const groupData: UpdateGroupRequest = req.body;

            // Validate that at least one field is provided
            if (!groupData.name && groupData.is_active === undefined) {
                res.status(400).json({ error: 'At least one field must be provided for update' });
                return;
            }

            const group = await this.groupService.updateGroup(id, groupData);
            res.json(group);
        } catch (error) {
            console.error('Error updating group:', error);
            if (error instanceof Error && error.message === 'Group not found') {
                res.status(404).json({ error: 'Group not found' });
                return;
            }
            res.status(500).json({ 
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Delete a group
     * DELETE /api/groups/:id
     */
    async deleteGroup(req: Request, res: Response): Promise<void> {
        try {
            const idParam = req.params.id;
            if (!idParam) {
                res.status(400).json({ error: 'Group ID is required' });
                return;
            }

            const id = parseInt(idParam);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid group ID' });
                return;
            }

            await this.groupService.deleteGroupById(id);
            res.status(204).send();
        } catch (error) {
            console.error('Error deleting group:', error);
            res.status(500).json({ 
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Add user to group
     * POST /api/groups/:groupId/users/:userId
     */
    async addUserToGroup(req: Request, res: Response): Promise<void> {
        try {
            const groupIdParam = req.params.groupId;
            const userId = req.params.userId;

            if (!groupIdParam) {
                res.status(400).json({ error: 'Group ID is required' });
                return;
            }

            if (!userId) {
                res.status(400).json({ error: 'User ID is required' });
                return;
            }

            const groupId = parseInt(groupIdParam);
            if (isNaN(groupId)) {
                res.status(400).json({ error: 'Invalid group ID' });
                return;
            }

            const group = await this.groupService.addUserToGroup(groupId, userId);
            res.json(group);
        } catch (error) {
            console.error('Error adding user to group:', error);
            if (error instanceof Error) {
                if (error.message === 'Group not found') {
                    res.status(404).json({ error: 'Group not found' });
                    return;
                }
                if (error.message === 'User is already a member of this group') {
                    res.status(400).json({ error: 'User is already a member of this group' });
                    return;
                }
            }
            res.status(500).json({ 
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Remove user from group
     * DELETE /api/groups/:groupId/users/:userId
     */
    async removeUserFromGroup(req: Request, res: Response): Promise<void> {
        try {
            const groupIdParam = req.params.groupId;
            const userId = req.params.userId;

            if (!groupIdParam) {
                res.status(400).json({ error: 'Group ID is required' });
                return;
            }

            if (!userId) {
                res.status(400).json({ error: 'User ID is required' });
                return;
            }

            const groupId = parseInt(groupIdParam);
            if (isNaN(groupId)) {
                res.status(400).json({ error: 'Invalid group ID' });
                return;
            }

            const group = await this.groupService.removeUserFromGroup(groupId, userId);
            res.json(group);
        } catch (error) {
            console.error('Error removing user from group:', error);
            if (error instanceof Error) {
                if (error.message === 'Group not found') {
                    res.status(404).json({ error: 'Group not found' });
                    return;
                }
                if (error.message === 'User is not a member of this group') {
                    res.status(400).json({ error: 'User is not a member of this group' });
                    return;
                }
            }
            res.status(500).json({ 
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get groups by active status
     * GET /api/groups/active/:status
     */
    async getGroupsByActiveStatus(req: Request, res: Response): Promise<void> {
        try {
            const status = req.params.status;
            if (!status) {
                res.status(400).json({ error: 'Status parameter is required' });
                return;
            }
            
            const isActive = status === 'true';

            const groups = await this.groupService.getGroupsByActiveStatus(isActive);
            res.json(groups);
        } catch (error) {
            console.error('Error fetching groups by status:', error);
            res.status(500).json({ 
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get groups for a specific user (by userId)
     * GET /api/groups/user/:userId
     */
    async getGroupsForUser(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.userId;
            if (!userId) {
                res.status(400).json({ error: 'User ID is required' });
                return;
            }
            const groups = await this.groupService.getGroupsForUser(userId);
            res.json(groups);
        } catch (error) {
            console.error('Error fetching user groups:', error);
            res.status(500).json({ 
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get groups for the current user
     * GET /api/groups/mine
     */
    async getMyGroups(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: 'User not authenticated' });
                return;
            }
            const groups = await this.groupService.getGroupsForUser(userId);
            res.json(groups);
        } catch (error) {
            console.error('Error fetching user groups:', error);
            res.status(500).json({ 
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
} 