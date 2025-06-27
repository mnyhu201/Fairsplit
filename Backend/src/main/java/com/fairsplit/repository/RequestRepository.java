package com.fairsplit.repository;

import com.fairsplit.model.Request;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RequestRepository extends JpaRepository<Request, Long> {
    
    /**
     * Find all requests for a specific expense
     * @param expenseId the ID of the expense to get requests for
     * @return a List of requests for the specified expense
     */
    List<Request> findByExpense_Id(Long expenseId);
    
    /**
     * Find all requests where a user is the debtor
     * @param userId the ID of the debtor
     * @return a List of requests where the specified user is the debtor
     */
    List<Request> findByDebtor_Id(Long userId);
    
    /**
     * Find all requests where a user is the debtee
     * @param userId the ID of the debtee
     * @return a List of requests where the specified user is the debtee
     */
    List<Request> findByDebtee_Id(Long userId);
    
    /**
     * Find all requests in a specific group
     * @param groupId the ID of the group
     * @return a List of requests in the specified group
     */
    List<Request> findByGroup_Id(Long groupId);
    
    /**
     * Find all unfulfilled requests for a specific debtor
     * @param userId the ID of the debtor
     * @return a List of unfulfilled requests for the specified debtor
     */
    List<Request> findByDebtor_IdAndIsFulfilledFalse(Long userId);
    
    /**
     * Find all fulfilled requests for a specific debtor
     * @param userId the ID of the debtor
     * @return a List of fulfilled requests for the specified debtor
     */
    List<Request> findByDebtor_IdAndIsFulfilledTrue(Long userId);
    
    /**
     * Find all unfulfilled requests in a specific group
     * @param groupId the ID of the group
     * @return a List of unfulfilled requests in the specified group
     */
    List<Request> findByGroup_IdAndIsFulfilledFalse(Long groupId);
}
