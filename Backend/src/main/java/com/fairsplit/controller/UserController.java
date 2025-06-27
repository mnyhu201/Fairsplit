package com.fairsplit.controller;

import com.fairsplit.model.User;
import com.fairsplit.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        Optional<User> user = userService.getUserById(id);
        return user.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

     
    @GetMapping("/username/{username}")
    public ResponseEntity<User> getUserById(@PathVariable String username) {
        Optional<User> user = userService.getUserByUsername(username);
        return user.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    // create new user
    // catches illegal argument exception by service function, passes http BAD REQUEST response
    @PostMapping("/register")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        try {
            User savedUser = userService.createUser(user);
            return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    
    // update user on id by putting a new User object to replace
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        try {
            Optional<User> updatedUser = userService.updateUser(id, userDetails);
            
            return updatedUser.map(user -> new ResponseEntity<>(user, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (IllegalArgumentException e) {
            // Handle case where username already exists
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // update user balance to a specific amount
    @PutMapping("/{id}/balance")
    public ResponseEntity<User> updateUserBalance(@PathVariable Long id, @RequestBody Double newAmount) {
        Optional<User> updatedUser = userService.updateUserBalance(id, newAmount);
        
        return updatedUser.map(user -> new ResponseEntity<>(user, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<User>> getGroupUsers(@PathVariable Long groupId){
        List<User> users = userService.getFilteredUsers(groupId);
        return new ResponseEntity<>(users, HttpStatus.OK);
    }


    // add amount to user's current balance
    @PutMapping("/{id}/add-balance")
    public ResponseEntity<User> addUserAmount(@PathVariable Long id, @RequestBody Double amountToAdd) {
        Optional<User> updatedUser = userService.addUserAmount(id, amountToAdd);
        
        return updatedUser.map(user -> new ResponseEntity<>(user, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    // delete user by id
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteUser(@PathVariable Long id) {
        boolean deleted = userService.deleteUser(id);
        
        if (deleted) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
