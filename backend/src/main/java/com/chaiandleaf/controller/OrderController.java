package com.chaiandleaf.controller;

import com.chaiandleaf.dto.OrderRequest;
import com.chaiandleaf.dto.OrderResponse;
import com.chaiandleaf.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody OrderRequest orderRequest,
            @RequestHeader("X-Session-Id") String sessionId) {
        OrderResponse response = orderService.createOrder(orderRequest, sessionId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
