package com.fairsplit.service;

import com.fairsplit.model.Expense;
import com.fairsplit.model.Group;
import com.fairsplit.model.User;
import com.fairsplit.model.Request;
import com.fairsplit.repository.ExpenseRepository;
import com.fairsplit.repository.GroupRepository;
import com.fairsplit.repository.UserRepository;
import com.fairsplit.repository.RequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class ExpenseService {
    
    @Autowired
    private ExpenseRepository expenseRepository;
    
    @Autowired
    private GroupRepository groupRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RequestRepository requestRepository;
    
    /**
     * Get all expenses
     * @return List of all expenses
     */
    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }
    
    /**
     * Get expense by ID
     * @param id the expense ID
     * @return Optional containing the expense if found
     */
    public Optional<Expense> getExpenseById(Long id) {
        return expenseRepository.findById(id);
    }
    
    /**
     * Get all expenses for a specific group
     * @param groupId the group ID
     * @return List of expenses for that group
     */
    public List<Expense> getExpensesByGroupId(Long groupId) {
        return expenseRepository.findByGroup_Id(groupId);
    }
    
    /**
     * Get expenses by group ID and filter criteria
     * @param groupId the group ID
     * @param userId optional user ID filter
     * @param category optional category filter
     * @param startDate optional start date filter
     * @param endDate optional end date filter
     * @return List of filtered expenses
     */
    public List<Expense> getFilteredExpenses(Long groupId, Long userId, String category, Date startDate, Date endDate) {
        // If no filters applied, return all expenses for the group
        if (userId == null && category == null && startDate == null && endDate == null) {
            return expenseRepository.findByGroup_Id(groupId);
        }
        
        // Apply filters
        List<Expense> result = new ArrayList<>();
        if (userId != null) {
            // Find expenses where the user is either a payer or assigned
            result = expenseRepository.findByGroup_IdAndPayer_IdOrGroup_IdAndAssignedUsers_Id(groupId, userId, groupId, userId);
        } else {
            result = expenseRepository.findByGroup_Id(groupId);
        }
        
        // Filter by category if specified
        if (category != null && !category.isEmpty()) {
            result = result.stream()
                .filter(expense -> category.equals(expense.getCategory()))
                .toList();
        }
        
        // Filter by date range if specified
        if (startDate != null && endDate != null) {
            result = result.stream()
                .filter(expense -> !expense.getCreatedAt().before(startDate) && !expense.getCreatedAt().after(endDate))
                .toList();
        } else if (startDate != null) {
            result = result.stream()
                .filter(expense -> !expense.getCreatedAt().before(startDate))
                .toList();
        } else if (endDate != null) {
            result = result.stream()
                .filter(expense -> !expense.getCreatedAt().after(endDate))
                .toList();
        }
        
        return result;
    }
    
    /**
     * Create a new expense and generate associated requests
     * @param expense the expense to create
     * @return the created expense
     * @throws IllegalArgumentException if the expense is invalid
     */
    @Transactional
    public Expense createExpense(Expense expense) throws IllegalArgumentException {
        // Validate expense
        if (expense.getName() == null || expense.getName().isEmpty()) {
            throw new IllegalArgumentException("Expense name cannot be empty");
        }
        
        if (expense.getAmount() == null || expense.getAmount() <= 0) {
            throw new IllegalArgumentException("Expense amount must be positive");
        }
        
        if (expense.getPayer() == null || expense.getGroup() == null) {
            throw new IllegalArgumentException("Expense must have a payer and a group");
        }
        
        // Verify that the payer exists
        User payer = userRepository.findById(expense.getPayer().getId())
            .orElseThrow(() -> new IllegalArgumentException("Payer user not found"));
        
        // Verify that the group exists
        Group group = groupRepository.findById(expense.getGroup().getId())
            .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        
        // Verify that the assigned users exist and belong to the group
        List<User> assignedUsers = new ArrayList<>();
        if (expense.getAssignedUsers() != null && !expense.getAssignedUsers().isEmpty()) {
            for (User assignedUser : expense.getAssignedUsers()) {
                User user = userRepository.findById(assignedUser.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Assigned user not found"));
                
                if (!user.getGroups().contains(group)) {
                    throw new IllegalArgumentException("Assigned user does not belong to the group");
                }
                
                assignedUsers.add(user);
            }
        } else {
            // If no users assigned, assign to all group members
            assignedUsers.addAll(group.getUsers());
        }
        
        expense.setAssignedUsers(assignedUsers);
        expense.setPaid(false);
        expense.setCreatedAt(new Date());
        expense.setUpdatedAt(new Date());
        
        // Save the expense
        Expense savedExpense = expenseRepository.save(expense);
        
        // Generate REQUESTS for each assigned user (except the payer)
        double amountPerUser = savedExpense.getAmount() / savedExpense.getAssignedUsers().size();
        
        for (User assignedUser : savedExpense.getAssignedUsers()) {
            // Don't create a request for the payer to themselves
            if (!assignedUser.getId().equals(payer.getId())) {
                Request request = new Request(
                    amountPerUser,
                    savedExpense,
                    assignedUser, // Debtor (person who owes money)
                    payer,       // Debtee (person who paid)
                    group
                );
                requestRepository.save(request);
            }
        }
        
        return savedExpense;
    }
    
    /**
     * Update an existing expense
     * @param id the expense ID
     * @param expenseDetails the updated expense details
     * @return Optional containing the updated expense if found
     */
    public Optional<Expense> updateExpense(Long id, Expense expenseDetails) {
        return expenseRepository.findById(id)
            .map(expense -> {
                if (expenseDetails.getName() != null) {
                    expense.setName(expenseDetails.getName());
                }
                
                if (expenseDetails.getCategory() != null) {
                    expense.setCategory(expenseDetails.getCategory());
                }
                
                if (expenseDetails.isPaid() != expense.isPaid()) {
                    expense.setPaid(expenseDetails.isPaid());
                }
                
                expense.setUpdatedAt(new Date());
                return expenseRepository.save(expense);
            });
    }
    
    /**
     * Delete an expense and its associated requests
     * @param id the expense ID
     * @return true if deleted, false if not found
     */
    @Transactional
    public boolean deleteExpense(Long id) {
        return expenseRepository.findById(id)
            .map(expense -> {
                // First delete associated requests
                List<Request> requests = requestRepository.findByExpense_Id(id);
                requestRepository.deleteAll(requests);
                
                // Then delete the expense
                expenseRepository.delete(expense);
                return true;
            })
            .orElse(false);
    }
}
