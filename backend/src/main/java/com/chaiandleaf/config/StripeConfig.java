package com.chaiandleaf.config;

import com.stripe.Stripe;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

/*
 * PURPOSE: Initializes the Stripe Java SDK with our API key when Spring starts up.
 *
 * WHAT IT DOES:
 * - @PostConstruct runs after Spring has injected all @Value properties but before the
 *   application starts accepting requests. This guarantees Stripe.apiKey is set before
 *   any PaymentIntent creation request reaches the OrderService.
 *
 * WHY NOT SET THE KEY IN ORDER SERVICE:
 * Setting it globally here means we don't need to read the property on every order.
 * Stripe.apiKey is a static field — one-time setup is cleaner and faster.
 */
@Configuration
public class StripeConfig {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }
}
