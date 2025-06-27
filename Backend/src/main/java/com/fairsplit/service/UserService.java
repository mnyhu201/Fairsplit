package com.fairsplit.service;

import com.fairsplit.model.User;
import com.fairsplit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Date;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Get all users from the database
     * @return List of all users
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    /**
     * Find a user by their ID
     * @param id the user ID to search for
     * @return an Optional containing the user if found
     */
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    /**
     * Find a user by their username
     * @param username the username to search for
     * @return an Optional containing the user if found
     */
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    /**
     * Get users filtered by group ID
     * @param groupId the group ID to filter users by
     * @return List of users belonging to the specified group
     */
    public List<User> getFilteredUsers(Long groupId) {
        if (groupId == null) {
            return getAllUsers();
        }
        // Find users who belong to the specified group
        return userRepository.findByGroups_Id(groupId);
    }

    /**
     * Create a new user
     * @param user the user to create
     * @return the saved user
     */
    public User createUser(User user) throws IllegalArgumentException {
        // Check if username already exists
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        // Set initial values if not provided
        if (user.getAmount() == null) {
            user.setAmount(0.0);
        }
        if (user.getCreatedAt() == null) {
            user.setCreatedAt(new Date());
        }

        user.setUpdatedAt(new Date());
        user.setActive(true);
        
        return userRepository.save(user);
    }
    /**
     * Update a user's balance by adding an amount to their current balance
     * @param id the ID of the user to update
     * @param newAmount the amount to update to the user's current balance
     * @return the updated user if found, otherwise empty Optional
     */
    public Optional<User> updateUserBalance(Long id, double newAmount){
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setAmount(newAmount);
            user.setUpdatedAt(new Date());
            return Optional.of(userRepository.save(user));
        }
        return Optional.empty();
    }

    /**
     * Add an amount to a user's current balance
     * @param id the ID of the user to update
     * @param amountToAdd the amount to add to the user's current balance
     * @return the updated user if found, otherwise empty Optional
     */
    public Optional<User> addUserAmount(Long id, double amountToAdd) {
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            double currentAmount = user.getAmount();
            double newAmount = currentAmount + amountToAdd;
            user.setAmount(newAmount);
            user.setUpdatedAt(new Date());
            return Optional.of(userRepository.save(user));
        }
        return Optional.empty();
    }

    /**
     * Update an existing user
     * @param id the ID of the user to update
     * @param userDetails the updated user details
     * @return the updated user if found, otherwise empty Optional
     * @throws IllegalArgumentException if trying to update to a username that already exists
     */
    public Optional<User> updateUser(Long id, User userDetails) throws IllegalArgumentException {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            User existingUser = user.get();
            // Update fields if provided
            if (userDetails.getUsername() != null && !userDetails.getUsername().equals(existingUser.getUsername())) {
                // Check if the new username already exists for another user
                if (userRepository.existsByUsername(userDetails.getUsername())) {
                    throw new IllegalArgumentException("Username already exists");
                }
                existingUser.setUsername(userDetails.getUsername());
            }
            
            if (userDetails.getPassword() != null) {
                existingUser.setPassword(userDetails.getPassword());
            }
            
            if (userDetails.getFullname() != null) {
                existingUser.setFullname(userDetails.getFullname());
            }
            
            if (userDetails.getAmount() != null) {
                existingUser.setAmount(userDetails.getAmount());
            }
            
            // Update timestamp
            existingUser.setUpdatedAt(new Date());
            
            return Optional.of(userRepository.save(existingUser));
        }
        
        return Optional.empty();
    }
    
    /**
     * Delete a user by their ID
     * @param id the ID of the user to delete
     * @return true if the user was deleted, false if not found
     */
    public boolean deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * Check if a username already exists
     * @param username the username to check
     * @return true if the username exists, false otherwise
     */
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
    
}
