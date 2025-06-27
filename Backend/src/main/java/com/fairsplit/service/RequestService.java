package com.fairsplit.service;

import com.fairsplit.model.Request;
import com.fairsplit.model.User;
import com.fairsplit.model.Payment;
import com.fairsplit.repository.RequestRepository;
import com.fairsplit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class RequestService {
    
    @Autowired
    private RequestRepository requestRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PaymentService paymentService;
    
    /**
     * Get all requests
     * @return List of all requests
     */
    public List<Request> getAllRequests() {
        return requestRepository.findAll();
    }
    
    /**
     * Get request by ID
     * @param id the request ID
     * @return Optional containing the request if found
     */
    public Optional<Request> getRequestById(Long id) {
        return requestRepository.findById(id);
    }
    
    /**
     * Get all requests for a specific expense
     * @param expenseId the expense ID
     * @return List of requests for that expense
     */
    public List<Request> getRequestsByExpenseId(Long expenseId) {
        return requestRepository.findByExpense_Id(expenseId);
    }
    
    /**
     * Get all requests where the user is the debtor
     * @param userId the user ID
     * @return List of requests where the user is the debtor
     */
    public List<Request> getRequestsByDebtorId(Long userId) {
        return requestRepository.findByDebtor_Id(userId);
    }
    
    /**
     * Get all unfulfilled requests where the user is the debtor
     * @param userId the user ID
     * @return List of unfulfilled requests where the user is the debtor
     */
    public List<Request> getUnfulfilledRequestsByDebtorId(Long userId) {
        return requestRepository.findByDebtor_IdAndIsFulfilledFalse(userId);
    }
    
    /**
     * Get all requests where the user is the debtee
     * @param userId the user ID
     * @return List of requests where the user is the debtee
     */
    public List<Request> getRequestsByDebteeId(Long userId) {
        return requestRepository.findByDebtee_Id(userId);
    }
    
    /**
     * Get all requests for a specific group
     * @param groupId the group ID
     * @return List of requests for that group
     */
    public List<Request> getRequestsByGroupId(Long groupId) {
        return requestRepository.findByGroup_Id(groupId);
    }
    
    /**
     * Get all unfulfilled requests for a specific group
     * @param groupId the group ID
     * @return List of unfulfilled requests for that group
     */
    public List<Request> getUnfulfilledRequestsByGroupId(Long groupId) {
        return requestRepository.findByGroup_IdAndIsFulfilledFalse(groupId);
    }
    
    /**
     * Create a new request
     * @param request the request to create
     * @return the created request
     */
    public Request createRequest(Request request) throws IllegalArgumentException {
        // Validate request
        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new IllegalArgumentException("Request amount must be positive");
        }
        
        if (request.getExpense() == null) {
            throw new IllegalArgumentException("Request must be associated with an expense");
        }
        
        if (request.getDebtor() == null || request.getDebtee() == null) {
            throw new IllegalArgumentException("Request must have a debtor and debtee");
        }
        
        if (request.getGroup() == null) {
            throw new IllegalArgumentException("Request must be associated with a group");
        }
        
        // Set default values
        request.setFulfilled(false);
        request.setCreatedAt(new Date());
        request.setUpdatedAt(new Date());
        
        return requestRepository.save(request);
    }
    
    /**
     * Update an existing request
     * @param id the request ID
     * @param requestDetails the updated request details
     * @return Optional containing the updated request if found
     */
    public Optional<Request> updateRequest(Long id, Request requestDetails) {
        return requestRepository.findById(id)
            .map(request -> {
                // Only allow updating the amount if the request is not fulfilled
                if (!request.isFulfilled() && requestDetails.getAmount() != null && requestDetails.getAmount() > 0) {
                    request.setAmount(requestDetails.getAmount());
                }
                
                request.setUpdatedAt(new Date());
                return requestRepository.save(request);
            });
    }
    
    /**
     * Accept a request by creating a payment and marking it as fulfilled
     * @param id the request ID
     * @return Optional containing the fulfilled request if found
     */
    @Transactional
    public Optional<Request> acceptRequest(Long id) {
        return requestRepository.findById(id)
            .map(request -> {
                if (request.isFulfilled()) {
                    throw new IllegalStateException("Request has already been fulfilled");
                }
                
                // Check if debtor has enough balance to pay
                User debtor = request.getDebtor();
                if (debtor.getAmount() < request.getAmount()) {
                    throw new IllegalStateException("Debtor does not have enough balance to fulfill this request");
                }

                // Create a payment for this request using the request amount (not the full expense amount)
                // Creating the payment auto-triggers the transfer of balance
                Payment payment = new Payment(
                    "Payment for " + request.getExpense().getName(),
                    request.getAmount(), // This is the correct amount specific to this request
                    request.getDebtor(),
                    request.getDebtee(),
                    request.getGroup(),
                    request
                );
                
                paymentService.createPayment(payment);
                
                // Mark request as fulfilled
                request.setFulfilled(true);
                request.setUpdatedAt(new Date());
                
                return requestRepository.save(request);
            });
    }
    
    /**
     * Delete a request
     * @param id the request ID
     * @return true if deleted, false if not found
     */
    public boolean deleteRequest(Long id) {
        return requestRepository.findById(id)
            .map(request -> {
                if (request.isFulfilled()) {
                    throw new IllegalStateException("Cannot delete a fulfilled request");
                }
                
                requestRepository.delete(request);
                return true;
            })
            .orElse(false);
    }
}
