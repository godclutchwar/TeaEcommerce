package com.chaiandleaf.service;

import com.chaiandleaf.dto.CartItemDTO;
import com.chaiandleaf.entity.CartItem;
import com.chaiandleaf.entity.Product;
import com.chaiandleaf.entity.User;
import com.chaiandleaf.repository.CartItemRepository;
import com.chaiandleaf.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/*
 * PURPOSE: Business logic for shopping cart operations, scoped by sessionId or User.
 *
 * Every operation requires a sessionId (for guest) or a User (for authenticated).
 * If a user is logged in, their cart is stored with their user ID.
 * When they log in, any items in their guest session are merged into their account.
 */
@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartService(CartItemRepository cartItemRepository, ProductRepository productRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    public CartItem addToCart(String sessionId, User user, CartItemDTO dto) {
        List<CartItem> existingItems = (user != null)
                ? cartItemRepository.findByUser(user)
                : cartItemRepository.findBySessionId(sessionId);

        for (CartItem item : existingItems) {
            if (item.getProduct().getId().equals(dto.getProductId())) {
                item.setQuantity(item.getQuantity() + dto.getQuantity());
                return cartItemRepository.save(item);
            }
        }
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found: " + dto.getProductId()));

        CartItem newItem = new CartItem(null, product, dto.getQuantity(), sessionId, user);
        return cartItemRepository.save(newItem);
    }

    public CartItem updateQty(String sessionId, User user, Long itemId, int quantity) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found: " + itemId));

        // Security check: ensure item belongs to this session OR this user
        boolean belongsToSession = item.getSessionId().equals(sessionId);
        boolean belongsToUser = user != null && item.getUser() != null && item.getUser().getId().equals(user.getId());

        if (!belongsToSession && !belongsToUser) {
            throw new RuntimeException("Cart item does not belong to this session or user");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(item);
            return null;
        }

        item.setQuantity(quantity);
        return cartItemRepository.save(item);
    }

    public void removeItem(String sessionId, User user, Long itemId) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found: " + itemId));

        boolean belongsToSession = item.getSessionId().equals(sessionId);
        boolean belongsToUser = user != null && item.getUser() != null && item.getUser().getId().equals(user.getId());

        if (!belongsToSession && !belongsToUser) {
            throw new RuntimeException("Cart item does not belong to this session or user");
        }

        cartItemRepository.delete(item);
    }

    public List<CartItem> getCart(String sessionId, User user) {
        if (user != null) {
            return cartItemRepository.findByUser(user);
        }
        return cartItemRepository.findBySessionId(sessionId);
    }

    @Transactional
    public void mergeCart(String sessionId, User user) {
        if (user == null) return;
        // Only merge items that are truly guest items (user == null).
        // Items added while logged in have both sessionId and user set;
        // treating them as guests would cause them to be deleted in the merge loop.
        List<CartItem> guestItems = cartItemRepository.findBySessionId(sessionId)
                .stream()
                .filter(item -> item.getUser() == null)
                .collect(java.util.stream.Collectors.toList());
        if (guestItems.isEmpty()) return;

        List<CartItem> userItems = cartItemRepository.findByUser(user);

        for (CartItem guestItem : guestItems) {
            CartItem existing = userItems.stream()
                    .filter(ui -> ui.getProduct().getId().equals(guestItem.getProduct().getId()))
                    .findFirst()
                    .orElse(null);

            if (existing != null) {
                existing.setQuantity(existing.getQuantity() + guestItem.getQuantity());
                cartItemRepository.save(existing);
                cartItemRepository.delete(guestItem);
            } else {
                guestItem.setUser(user);
                cartItemRepository.save(guestItem);
            }
        }
    }

    public void clearCart(String sessionId, User user) {
        if (user != null) {
            cartItemRepository.deleteByUser(user);
        } else {
            cartItemRepository.deleteBySessionId(sessionId);
        }
    }
}
