package com.fairsplit.repository;

import com.fairsplit.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // the findById, existsById, deleteById are default implemented by springboot


    /**
     * Find a user by their username
     * @param username the username to search for
     * @return an Optional containing the user if found
     */
    Optional<User> findByUsername(String username);
    
    /**
     * Check if a username already exists
     * @param username the username to check
     * @return true if the username exists, false otherwise
     */
    boolean existsByUsername(String username);

    /**
     * Delete by username
     * @param username the username to delete
     */
    void deleteByUsername(String username);

    
    /**
     * Find all users that belong to a specific group
     * @param groupId the ID of the group to search for
     * @return a List of users that are members of the specified group
     */
    List<User> findByGroups_Id(Long groupId);
}
