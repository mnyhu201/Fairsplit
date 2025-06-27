package com.fairsplit.model;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.JoinTable;
import jakarta.persistence.JoinColumn;
import java.util.List;

@Entity
@Table(name = "`groups`")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Group {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String name;

    @Column(nullable = false)
    private boolean isActive;


    @ManyToMany
    @JoinTable(
        name = "group_user",
        joinColumns = @JoinColumn(name = "group_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )

    @Column(nullable = false)
    private List<User> users;


    public void addUser(User user) {
        this.users.add(user);
        user.getGroups().add(this);
    }
    
    public void removeUser(User user) {
        this.users.remove(user);
        user.getGroups().remove(this);
    }

}
