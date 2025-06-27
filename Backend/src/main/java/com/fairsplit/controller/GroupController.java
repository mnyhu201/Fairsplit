package com.fairsplit.controller;

import com.fairsplit.model.Group;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.Optional;

import com.fairsplit.service.GroupService;
import java.util.List;



@RestController
@RequestMapping("/api/groups")
public class GroupController {
    
    @Autowired
    private GroupService groupService;

    @GetMapping
    public List<Group> getAllGroups() { 
        return groupService.getAllGroups();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Group> getGroupById(@PathVariable Long id) {
        Optional<Group> group = groupService.getGroupById(id);
        return group.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<Group> createGroup(@RequestBody Group group) {
        try {
            Group savedGroup = groupService.createGroup(group);
            return new ResponseEntity<>(savedGroup, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Group> updateGroup(@PathVariable Long id, @RequestBody Group groupDetails) {
        try {
            Group updatedGroup = groupService.updateGroup(id, groupDetails);
            return new ResponseEntity<>(updatedGroup, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteGroup(@PathVariable Long id) {
        try {
            groupService.deleteGroupById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PostMapping("/{groupId}/users/{userId}")
    public ResponseEntity<Group> addUserToGroup(@PathVariable Long groupId, @PathVariable Long userId) {
        try {
            Group updatedGroup = groupService.addUserToGroup(groupId, userId);
            return new ResponseEntity<>(updatedGroup, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    @DeleteMapping("/{groupId}/users/{userId}")
    public ResponseEntity<Group> removeUserFromGroup(@PathVariable Long groupId, @PathVariable Long userId) {
        try {
            Group updatedGroup = groupService.removeUserFromGroup(groupId, userId);
            return new ResponseEntity<>(updatedGroup, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

}
