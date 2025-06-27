package com.fairsplit.repository;

import com.fairsplit.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    /**
     * Find all payments made by a specific debtor
     * @param userId the ID of the debtor
     * @return a List of payments made by the specified debtor
     */
    List<Payment> findByDebtor_Id(Long userId);
    
    /**
     * Find all payments received by a specific debtee
     * @param userId the ID of the debtee
     * @return a List of payments received by the specified debtee
     */
    List<Payment> findByDebtee_Id(Long userId);
    
    /**
     * Find all payments in a specific group
     * @param groupId the ID of the group
     * @return a List of payments in the specified group
     */
    List<Payment> findByGroup_Id(Long groupId);
    
    /**
     * Find payment by request ID
     * @param requestId the ID of the request
     * @return an Optional containing the payment if found
     */
    Optional<Payment> findByRequest_Id(Long requestId);
    
    /**
     * Find all payments between a specific debtor and debtee
     * @param debtorId the ID of the debtor
     * @param debteeId the ID of the debtee
     * @return a List of payments between the specified debtor and debtee
     */
    List<Payment> findByDebtor_IdAndDebtee_Id(Long debtorId, Long debteeId);
}
