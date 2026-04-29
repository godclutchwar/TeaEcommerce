package com.chaiandleaf.service;

import com.chaiandleaf.dto.CartItemDTO;
import com.chaiandleaf.dto.OrderRequest;
import com.chaiandleaf.dto.OrderResponse;
import com.chaiandleaf.entity.Order;
import com.chaiandleaf.entity.OrderItem;
import com.chaiandleaf.repository.OrderRepository;
import com.chaiandleaf.repository.ProductRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/*
 * PURPOSE: Handles order creation + Stripe payment intent in a single transactional operation.
 *
 * FLOW:
 * 1. Creates Order entity from request, copying cart items to OrderItem snapshots
 * 2. Calculates total in cents
 * 3. Creates Stripe PaymentIntent → returns clientSecret for frontend
 * 4. Saves order (cascade saves items), clears session cart
 */
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository,
                        CartService cartService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.cartService = cartService;
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request, String sessionId) {
        com.stripe.Stripe.apiKey = stripeSecretKey;

        Order order = new Order();
        order.setCustomerName(request.getCustomerName());
        order.setEmail(request.getEmail());
        order.setAddress(request.getAddress());
        order.setCity(request.getCity());
        order.setZip(request.getZip());
        order.setCountry(request.getCountry());
        order.setStatus("PENDING");
        order.setCreatedAt(LocalDateTime.now());

        int totalCents = 0;
        for (CartItemDTO cartDto : request.getItems()) {
            var product = productRepository.findById(cartDto.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + cartDto.getProductId()));

            int lineTotal = product.getPrice() * cartDto.getQuantity();
            totalCents += lineTotal;

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProductName(product.getName());
            item.setQuantity(cartDto.getQuantity());
            item.setUnitPrice(product.getPrice());

            order.getItems().add(item);
        }

        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount((long) totalCents)
                    .setCurrency("usd")
                    .setReceiptEmail(request.getEmail())
                    .putMetadata("orderId", String.valueOf(order.getId()))
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);
            order.setStripePaymentIntentId(paymentIntent.getId());

            Order saved = orderRepository.save(order);

            cartService.clearCart(sessionId, null);

            return new OrderResponse(saved.getId(), saved.getStatus(), paymentIntent.getClientSecret());
        } catch (StripeException e) {
            throw new RuntimeException("Stripe payment failed: " + e.getMessage(), e);
        }
    }
}
