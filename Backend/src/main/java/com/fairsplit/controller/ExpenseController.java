package com.fairsplit.controller;

import com.fairsplit.model.Expense;
import com.fairsplit.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {
    
    @Autowired
    private ExpenseService expenseService;
    
    @GetMapping
    public ResponseEntity<List<Expense>> getAllExpenses() {
        List<Expense> expenses = expenseService.getAllExpenses();
        return new ResponseEntity<>(expenses, HttpStatus.OK);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Expense> getExpenseById(@PathVariable Long id) {
        Optional<Expense> expense = expenseService.getExpenseById(id);
        return expense.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    @PostMapping
    public ResponseEntity<Expense> createExpense(@RequestBody Expense expense) {
        try {
            Expense createdExpense = expenseService.createExpense(expense);
            return new ResponseEntity<>(createdExpense, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            // Return 400 Bad Request with error message
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateExpense(@PathVariable Long id, @RequestBody Expense expenseDetails) {
        Optional<Expense> updatedExpense = expenseService.updateExpense(id, expenseDetails);
        return updatedExpense.map(expense -> new ResponseEntity<>(expense, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteExpense(@PathVariable Long id) {
        boolean deleted = expenseService.deleteExpense(id);
        if (deleted) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<Expense>> getGroupExpenses(
            @PathVariable Long groupId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate) {
        
        List<Expense> expenses = expenseService.getFilteredExpenses(groupId, userId, category, startDate, endDate);
        return new ResponseEntity<>(expenses, HttpStatus.OK);
    }
}
