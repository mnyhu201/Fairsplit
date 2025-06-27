package com.fairsplit.controller;

import com.fairsplit.model.Request;
import com.fairsplit.service.RequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/requests")
public class RequestController {
    
    @Autowired
    private RequestService requestService;
    
    @GetMapping
    public ResponseEntity<List<Request>> getAllRequests() {
        List<Request> requests = requestService.getAllRequests();
        return new ResponseEntity<>(requests, HttpStatus.OK);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Request> getRequestById(@PathVariable Long id) {
        Optional<Request> request = requestService.getRequestById(id);
        return request.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    @GetMapping("/expense/{expenseId}")
    public ResponseEntity<List<Request>> getRequestsByExpenseId(@PathVariable Long expenseId) {
        List<Request> requests = requestService.getRequestsByExpenseId(expenseId);
        return new ResponseEntity<>(requests, HttpStatus.OK);
    }
    
    @GetMapping("/debtor/{userId}")
    public ResponseEntity<List<Request>> getRequestsByDebtorId(@PathVariable Long userId) {
        List<Request> requests = requestService.getRequestsByDebtorId(userId);
        return new ResponseEntity<>(requests, HttpStatus.OK);
    }
    
    @GetMapping("/debtor/{userId}/unfulfilled")
    public ResponseEntity<List<Request>> getUnfulfilledRequestsByDebtorId(@PathVariable Long userId) {
        List<Request> requests = requestService.getUnfulfilledRequestsByDebtorId(userId);
        return new ResponseEntity<>(requests, HttpStatus.OK);
    }
    
    @GetMapping("/debtee/{userId}")
    public ResponseEntity<List<Request>> getRequestsByDebteeId(@PathVariable Long userId) {
        List<Request> requests = requestService.getRequestsByDebteeId(userId);
        return new ResponseEntity<>(requests, HttpStatus.OK);
    }
    
    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<Request>> getRequestsByGroupId(@PathVariable Long groupId) {
        List<Request> requests = requestService.getRequestsByGroupId(groupId);
        return new ResponseEntity<>(requests, HttpStatus.OK);
    }
    
    @GetMapping("/group/{groupId}/unfulfilled")
    public ResponseEntity<List<Request>> getUnfulfilledRequestsByGroupId(@PathVariable Long groupId) {
        List<Request> requests = requestService.getUnfulfilledRequestsByGroupId(groupId);
        return new ResponseEntity<>(requests, HttpStatus.OK);
    }
    
    @PostMapping
    public ResponseEntity<Request> createRequest(@RequestBody Request request) {
        try {
            Request createdRequest = requestService.createRequest(request);
            return new ResponseEntity<>(createdRequest, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Request> updateRequest(@PathVariable Long id, @RequestBody Request requestDetails) {
        try {
            Optional<Request> updatedRequest = requestService.updateRequest(id, requestDetails);
            return updatedRequest.map(request -> new ResponseEntity<>(request, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    @PostMapping("/{id}/accept")
    public ResponseEntity<Request> acceptRequest(@PathVariable Long id) {
        try {
            Optional<Request> acceptedRequest = requestService.acceptRequest(id);
            return acceptedRequest.map(request -> new ResponseEntity<>(request, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteRequest(@PathVariable Long id) {
        try {
            boolean deleted = requestService.deleteRequest(id);
            if (deleted) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
}
