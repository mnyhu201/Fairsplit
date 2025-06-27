package com.fairsplit.repository;

import com.fairsplit.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Date;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    
    /**
     * Find all expenses for a specific group
     * @param groupId the ID of the group to get expenses for
     * @return a List of expenses for the specified group
     */
    List<Expense> findByGroup_Id(Long groupId);
    
    /**
     * Find all expenses paid by a specific user
     * @param userId the ID of the user who paid
     * @return a List of expenses paid by the specified user
     */
    List<Expense> findByPayer_Id(Long userId);
    
    /**
     * Find all expenses assigned to a specific user
     * @param userId the ID of the assigned user
     * @return a List of expenses assigned to the specified user
     */
    List<Expense> findByAssignedUsers_Id(Long userId);
    
    /**
     * Find all expenses in a group for a specific category
     * @param groupId the ID of the group
     * @param category the category to filter by
     * @return a List of expenses in the specified group with the specified category
     */
    List<Expense> findByGroup_IdAndCategory(Long groupId, String category);
    
    /**
     * Find all expenses in a group created between a date range
     * @param groupId the ID of the group
     * @param startDate the start date
     * @param endDate the end date
     * @return a List of expenses in the specified group created within the date range
     */
    List<Expense> findByGroup_IdAndCreatedAtBetween(Long groupId, Date startDate, Date endDate);
    
    /**
     * Find all expenses in a group for a specific user
     * @param groupId the ID of the group
     * @param userId the ID of the user who either paid or is assigned
     * @return a List of expenses in the specified group involving the specified user
     */
    List<Expense> findByGroup_IdAndPayer_IdOrGroup_IdAndAssignedUsers_Id(Long groupId, Long userId, Long groupId2, Long userId2);
}
