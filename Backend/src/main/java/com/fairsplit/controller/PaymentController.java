package com.fairsplit.controller;

import com.fairsplit.model.Payment;
import com.fairsplit.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    
    @Autowired
    private PaymentService paymentService;
    
    @GetMapping
    public ResponseEntity<List<Payment>> getAllPayments() {
        List<Payment> payments = paymentService.getAllPayments();
        return new ResponseEntity<>(payments, HttpStatus.OK);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long id) {
        Optional<Payment> payment = paymentService.getPaymentById(id);
        return payment.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    @GetMapping("/debtor/{userId}")
    public ResponseEntity<List<Payment>> getPaymentsByDebtorId(@PathVariable Long userId) {
        List<Payment> payments = paymentService.getPaymentsByDebtorId(userId);
        return new ResponseEntity<>(payments, HttpStatus.OK);
    }
    
    @GetMapping("/debtee/{userId}")
    public ResponseEntity<List<Payment>> getPaymentsByDebteeId(@PathVariable Long userId) {
        List<Payment> payments = paymentService.getPaymentsByDebteeId(userId);
        return new ResponseEntity<>(payments, HttpStatus.OK);
    }
    
    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<Payment>> getPaymentsByGroupId(@PathVariable Long groupId) {
        List<Payment> payments = paymentService.getPaymentsByGroupId(groupId);
        return new ResponseEntity<>(payments, HttpStatus.OK);
    }
    
    @PostMapping
    public ResponseEntity<Payment> createPayment(@RequestBody Payment payment) {
        try {
            Payment createdPayment = paymentService.createPayment(payment);
            return new ResponseEntity<>(createdPayment, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deletePayment(@PathVariable Long id) {
        try {
            boolean deleted = paymentService.deletePayment(id);
            if (deleted) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
}
