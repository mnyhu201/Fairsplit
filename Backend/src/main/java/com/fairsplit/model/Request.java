package com.fairsplit.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Request {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Double amount;
    
    @Column(nullable = false)
    private boolean isFulfilled;
    
    @ManyToOne
    //@JoinColumn(name = "expense_id", nullable = false)
    @JoinColumn(name = "expense_id", nullable = true)
    private Expense expense;
    
    @ManyToOne
    @JoinColumn(name = "debtor_id", nullable = false)
    private User debtor;
    
    @ManyToOne
    @JoinColumn(name = "debtee_id", nullable = false)
    private User debtee;
    
    @ManyToOne
    //@JoinColumn(name = "group_id", nullable = false)
    @JoinColumn(name = "group_id", nullable = true)
    private Group group;
    
    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false)
    private Date createdAt;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;
    
    // Constructor with essential fields
    public Request(Double amount, Expense expense, User debtor, User debtee, Group group) {
        this.amount = amount;
        this.expense = expense;
        this.debtor = debtor;
        this.debtee = debtee;
        this.group = group;
        this.isFulfilled = false;
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
