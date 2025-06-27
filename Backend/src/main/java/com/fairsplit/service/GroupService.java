package com.fairsplit.service;

import com.fairsplit.model.Group;
import com.fairsplit.model.User;
import com.fairsplit.repository.GroupRepository;
import com.fairsplit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GroupService {
    @Autowired
    private GroupRepository groupRepository;

    @Autowired 
    private UserRepository userRepository;

    /**
     * Get all groups from the database
     * @return a list of all groups
     */
    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }

    /**
     * Get a group by its ID
     * @param id the ID of the group to retrieve
     * @return an Optional containing the group if found
     */
    public Optional<Group> getGroupById(Long id) {
        return groupRepository.findById(id);
    }

    /**
     * Remove a user from a group
     * @param groupId the ID of the group
     * @param userId the ID of the user to remove
     * @return the updated group
     * @throws IllegalArgumentException if the group or user is not found, or if the user is not a member of the group
     */
    public Group removeUserFromGroup(Long groupId, Long userId) {
        Optional<Group> existingGroupOpt = groupRepository.findById(groupId);
        if (!existingGroupOpt.isPresent()) {
            throw new IllegalArgumentException("Group not found with id: " + groupId);
        }

        Optional<User> existingUserOpt = userRepository.findById(userId);
        if (!existingUserOpt.isPresent()) {
            throw new IllegalArgumentException("User not found with id: " + userId);
        }

        Group group = existingGroupOpt.get();
        User user = existingUserOpt.get();

        // Check if user is a member of the group
        if (!group.getUsers().contains(user)) {
            throw new IllegalArgumentException("User is not a member of this group");
        }
        
        // Remove user from the group
        group.removeUser(user);

        return groupRepository.save(group);
    }

    /**
     * Add a user to a group
     * @param groupId the ID of the group
     * @param userId the ID of the user to add
     * @return the updated group
     * @throws IllegalArgumentException if the group or user is not found, or if the user is already a member of the group
     */
    public Group addUserToGroup(Long groupId, Long userId) {
        Optional<Group> existingGroupOpt = groupRepository.findById(groupId);
        if (!existingGroupOpt.isPresent()) {
            throw new IllegalArgumentException("Group not found with id: " + groupId);
        }

        Optional<User> existingUserOpt = userRepository.findById(userId);
        if (!existingUserOpt.isPresent()) {
            throw new IllegalArgumentException("User not found with id: " + userId);
        }

        Group group = existingGroupOpt.get();
        User user = existingUserOpt.get();

        // Check if user is already in the group
        if (group.getUsers().contains(user)) {
            throw new IllegalArgumentException("User is already a member of this group");
        }
        
        // Add user to the group
        group.addUser(user);

        return groupRepository.save(group);
    }

    /**
     * Delete a group by its ID
     * @param id the ID of the group to delete
     */
    public void deleteGroupById(Long id) {
        groupRepository.deleteById(id);
    }
    
    /**
     * Update a group's details
     * @param id the ID of the group to update
     * @param newGroupDetails the new details for the group
     * @return the updated group
     * @throws IllegalArgumentException if the group is not found
     */
    public Group updateGroup(Long id, Group newGroupDetails) {
        Optional<Group> existingGroupOpt = groupRepository.findById(id);
        if (!existingGroupOpt.isPresent()) {
            throw new IllegalArgumentException("Group not found with id: " + id);
        }
        
        Group existingGroup = existingGroupOpt.get(); // confirmed Group exists
        
        // Update fields only if they are provided in the new details
        if (newGroupDetails.getName() != null && !newGroupDetails.getName().isEmpty()) {
            existingGroup.setName(newGroupDetails.getName());
        }
        
        // Update isActive status if it's different
        if (existingGroup.isActive() != newGroupDetails.isActive()) {
            existingGroup.setActive(newGroupDetails.isActive());
        }
        
        // Don't update users list here - that should be handled by specific add/remove user methods
        return groupRepository.save(existingGroup);
    }

    /**
     * Create a new group
     * @param group the group to create
     * @return the saved group
     */
    public Group createGroup(Group group)  {
        group.setActive(true);
        return groupRepository.save(group);
    }



    /**
     * Delete a group by their ID
     * @param id the ID of the group to delete
     * @return true if the group was deleted, false if not found
     */
    public boolean deleteGroup(Long id) {
        if (groupRepository.existsById(id)) {
            groupRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
