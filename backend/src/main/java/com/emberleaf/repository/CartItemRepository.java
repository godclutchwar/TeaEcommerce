package com.emberleaf.repository;

import com.emberleaf.entity.CartItem;
import com.emberleaf.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/*
 * PURPOSE: Data access for CartItem entities, scoped by sessionId or user.
 *
 * WHY findBySessionId: Each user gets a UUID session. Their cart items are all rows
 * matching that sessionId. This lets us query "show me cart X" without user auth.
 *
 * WHY findByUser: When a user is logged in, their cart is persisted to their account.
 */
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findBySessionId(String sessionId);

    List<CartItem> findByUser(User user);

    void deleteBySessionId(String sessionId);

    void deleteByUser(User user);
}
