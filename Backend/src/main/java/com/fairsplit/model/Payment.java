package com.fairsplit.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private Double amount;
    
    @ManyToOne
    @JoinColumn(name = "debtor_id", nullable = false)
    private User debtor;
    
    @ManyToOne
    @JoinColumn(name = "debtee_id", nullable = false)
    private User debtee;
    
    @ManyToOne
    @JoinColumn(name = "group_id")
    private Group group;
    
    @OneToOne
    @JoinColumn(name = "request_id")
    private Request request;
    
    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false)
    private Date createdAt;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;
    
    // Constructor for payment with request
    public Payment(String name, Double amount, User debtor, User debtee, Group group, Request request) {
        this.name = name;
        this.amount = amount;
        this.debtor = debtor;
        this.debtee = debtee;
        this.group = group;
        this.request = request;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
    
    // Constructor for standalone payment (without request)
    public Payment(String name, Double amount, User debtor, User debtee, Group group) {
        this.name = name;
        this.amount = amount;
        this.debtor = debtor;
        this.debtee = debtee;
        this.group = group;
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
