import { Router } from 'express';
import { GroupController } from '../controllers/groupController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const groupController = new GroupController();

// Public routes
router.get('/', groupController.getAllGroups.bind(groupController));
router.get('/active/:status', groupController.getGroupsByActiveStatus.bind(groupController));
router.get('/user/:userId', groupController.getGroupsForUser.bind(groupController));

// Protected routes
router.get('/mine', authenticateToken, groupController.getMyGroups.bind(groupController));
router.get('/:id', authenticateToken, groupController.getGroupById.bind(groupController));
router.get('/:id/users', authenticateToken, groupController.getGroupWithUsers.bind(groupController));
router.post('/', authenticateToken, groupController.createGroup.bind(groupController));
router.put('/:id', authenticateToken, groupController.updateGroup.bind(groupController));
router.delete('/:id', authenticateToken, groupController.deleteGroup.bind(groupController));
router.post('/:groupId/users/:userId', authenticateToken, groupController.addUserToGroup.bind(groupController));
router.delete('/:groupId/users/:userId', authenticateToken, groupController.removeUserFromGroup.bind(groupController));

export default router; 