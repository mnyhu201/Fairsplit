package com.fairsplit.service;

import com.fairsplit.model.Payment;
import com.fairsplit.model.Request;
import com.fairsplit.model.User;
import com.fairsplit.repository.PaymentRepository;
import com.fairsplit.repository.RequestRepository;
import com.fairsplit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class PaymentService {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RequestRepository requestRepository;
    
    /**
     * Get all payments
     * @return List of all payments
     */
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }
    
    /**
     * Get payment by ID
     * @param id the payment ID
     * @return Optional containing the payment if found
     */
    public Optional<Payment> getPaymentById(Long id) {
        return paymentRepository.findById(id);
    }
    
    /**
     * Get all payments made by a specific debtor
     * @param userId the debtor's user ID
     * @return List of payments made by the debtor
     */
    public List<Payment> getPaymentsByDebtorId(Long userId) {
        return paymentRepository.findByDebtor_Id(userId);
    }
    
    /**
     * Get all payments received by a specific debtee
     * @param userId the debtee's user ID
     * @return List of payments received by the debtee
     */
    public List<Payment> getPaymentsByDebteeId(Long userId) {
        return paymentRepository.findByDebtee_Id(userId);
    }
    
    /**
     * Get all payments in a specific group
     * @param groupId the group ID
     * @return List of payments in the group
     */
    public List<Payment> getPaymentsByGroupId(Long groupId) {
        return paymentRepository.findByGroup_Id(groupId);
    }
    
    /**
     * Create a new payment
     * @param payment the payment to create
     * @return the created payment
     */
    @Transactional
    public Payment createPayment(Payment payment) throws IllegalArgumentException {
        // Validate payment: check all input valid
        if (payment.getName() == null || payment.getName().isEmpty()) {
            throw new IllegalArgumentException("Payment name cannot be empty");
        }
        
        if (payment.getAmount() == null || payment.getAmount() <= 0) {
            throw new IllegalArgumentException("Payment amount must be positive");
        }
        
        if (payment.getDebtor() == null || payment.getDebtee() == null) {
            throw new IllegalArgumentException("Payment must have a debtor and debtee");
        }
        
        // Set timestamps
        payment.setCreatedAt(new Date());
        payment.setUpdatedAt(new Date());
        
        // If payment is linked to a request, mark the request as fulfilled
        if (payment.getRequest() != null) {
            Request request = payment.getRequest();
            
            // Verify that the payment amount matches the request amount
            if (!payment.getAmount().equals(request.getAmount())) {
                throw new IllegalArgumentException("Payment amount must match request amount");
            }
            
            // Mark the request as fulfilled
            request.setFulfilled(true);
            request.setUpdatedAt(new Date());
            requestRepository.save(request);
        }
        
        // Update user balances
        User debtor = payment.getDebtor();
        debtor.setAmount(debtor.getAmount() - payment.getAmount());
        userRepository.save(debtor);
        
        User debtee = payment.getDebtee();
        debtee.setAmount(debtee.getAmount() + payment.getAmount());
        userRepository.save(debtee);
        
        return paymentRepository.save(payment);
    }
    
    /**
     * Delete a payment
     * @param id the payment ID
     * @return true if deleted, false if not found
     */
    @Transactional
    public boolean deletePayment(Long id) {
        return paymentRepository.findById(id)
            .map(payment -> {
                // If payment is linked to a request, mark the request as unfulfilled
                if (payment.getRequest() != null) {
                    Request request = payment.getRequest();
                    request.setFulfilled(false);
                    request.setUpdatedAt(new Date());
                    requestRepository.save(request);
                }
                
                // Revert user balances
                User debtor = payment.getDebtor();
                debtor.setAmount(debtor.getAmount() + payment.getAmount());
                userRepository.save(debtor);
                
                User debtee = payment.getDebtee();
                debtee.setAmount(debtee.getAmount() - payment.getAmount());
                userRepository.save(debtee);
                
                paymentRepository.delete(payment);
                return true;
            })
            .orElse(false);
    }
}
