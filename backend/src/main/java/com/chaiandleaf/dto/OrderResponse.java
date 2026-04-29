package com.chaiandleaf.dto;

public class OrderResponse {
    private Long orderId;
    private String status;
    private String clientSecret;

    public OrderResponse() {}

    public OrderResponse(Long orderId, String status, String clientSecret) {
        this.orderId = orderId;
        this.status = status;
        this.clientSecret = clientSecret;
    }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getClientSecret() { return clientSecret; }
    public void setClientSecret(String clientSecret) { this.clientSecret = clientSecret; }
}
