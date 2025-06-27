package com.fairsplit.repository;

import com.fairsplit.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;


@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    // the findById, existsById, deleteById are default implemented by springboot
    /**
     * Find all groups by their active status
     * @param isActive the active status to search for
     * @return a List of groups with the specified active status
     */
    List<Group> findByIsActive(boolean isActive);
    
    /**
     * Find a group by its name
     * @param name the name to search for
     * @return an Optional containing the group if found
     */
    Optional<Group> findByName(String name);
}