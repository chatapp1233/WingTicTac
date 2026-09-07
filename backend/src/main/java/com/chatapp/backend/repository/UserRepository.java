package com.chatapp.backend.repository;

import com.chatapp.backend.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByUsernameIgnoreCase(String username);

    boolean existsByUsernameIgnoreCase(String username);

    @Query("""
            select u from User u
            where u.active = true
              and u.id <> :excludeUserId
              and lower(u.username) like lower(concat(:query, '%'))
            order by u.username asc
            """)
    List<User> searchByUsernamePrefix(@Param("query") String query, @Param("excludeUserId") UUID excludeUserId);
}
