package com.chaiandleaf.controller;

import com.chaiandleaf.dto.CartItemDTO;
import com.chaiandleaf.entity.CartItem;
import com.chaiandleaf.entity.User;
import com.chaiandleaf.service.CartService;
import com.chaiandleaf.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final UserService userService;

    public CartController(CartService cartService, UserService userService) {
        this.cartService = cartService;
        this.userService = userService;
    }

    private Optional<User> getCurrentUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Optional.empty();
        }
        return userService.getUserFromToken(authHeader.substring(7));
    }

    @PostMapping
    public ResponseEntity<CartItem> addToCart(
            @RequestHeader("X-Session-Id") String sessionId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody CartItemDTO dto) {
        User user = getCurrentUser(authHeader).orElse(null);
        if (user != null) {
            cartService.mergeCart(sessionId, user);
        }
        CartItem item = cartService.addToCart(sessionId, user, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(item);
    }

    @GetMapping
    public ResponseEntity<List<CartItem>> getCart(
            @RequestHeader("X-Session-Id") String sessionId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = getCurrentUser(authHeader).orElse(null);
        if (user != null) {
            cartService.mergeCart(sessionId, user);
        }
        return ResponseEntity.ok(cartService.getCart(sessionId, user));
    }

    @PatchMapping("/{itemId}")
    public ResponseEntity<CartItem> updateQty(
            @RequestHeader("X-Session-Id") String sessionId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long itemId,
            @RequestParam int quantity) {
        User user = getCurrentUser(authHeader).orElse(null);
        CartItem item = cartService.updateQty(sessionId, user, itemId, quantity);
        if (item == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(item);
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> removeItem(
            @RequestHeader("X-Session-Id") String sessionId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long itemId) {
        User user = getCurrentUser(authHeader).orElse(null);
        cartService.removeItem(sessionId, user, itemId);
        return ResponseEntity.noContent().build();
    }
}
