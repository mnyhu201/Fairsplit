package com.fairsplit.model;
import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.persistence.ManyToMany;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    private String fullname;

    @Column(nullable = false)
    private Double amount;
    
    @Column(nullable = false)
    private boolean isActive;

    @ManyToMany(mappedBy = "users")
    @JsonIgnore
    private List<Group> groups;
    
    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false)
    private java.util.Date createdAt;
    
    @Temporal(TemporalType.TIMESTAMP)
    private java.util.Date updatedAt;
    
    // Default constructor
    public User() {
        this.isActive = true;
        this.createdAt = new java.util.Date();
        this.updatedAt = new java.util.Date();
    }
    
    // Parameterized constructor
    public User(String username, String fullname, String password) {
        this.username = username;
        this.password = password;
        this.fullname = fullname;
        this.isActive = true;
        this.amount = 0.0;
        this.createdAt = new java.util.Date();
        this.updatedAt = new java.util.Date();
    }
    
    // Full constructor, includes amount
    public User(String username, String password, String fullname, Double amount) {
        this.username = username;
        this.password = password;
        this.fullname = fullname;
        this.amount = amount;
        this.isActive = true;
        this.createdAt = new java.util.Date();
        this.updatedAt = new java.util.Date();
    }
    
    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", fullname='" + fullname + '\'' +
                ", amount='" + amount +
                ", isActive=" + isActive +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}


