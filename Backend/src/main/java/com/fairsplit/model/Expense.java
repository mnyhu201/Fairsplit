package com.fairsplit.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.*;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "expenses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Expense {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private Double amount;
    
    @Column(nullable = false)
    private String category;
    
    @Column(nullable = false)
    private boolean paid;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User payer;
    
    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;
    
    @ManyToMany
    @JoinTable(
        name = "expense_assigned_users",
        joinColumns = @JoinColumn(name = "expense_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> assignedUsers;
    
    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false)
    private Date createdAt;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;
    
    // Constructor with essential fields
    public Expense(String name, Double amount, User payer, Group group, String category, List<User> assignedUsers) {
        this.name = name;
        this.amount = amount;
        this.payer = payer;
        this.group = group;
        this.category = category;
        this.assignedUsers = assignedUsers;
        this.paid = false;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Date();
    }
}
