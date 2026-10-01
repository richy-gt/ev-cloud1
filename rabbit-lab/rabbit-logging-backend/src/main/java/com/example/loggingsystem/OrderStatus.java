package com.example.loggingsystem;

public record OrderStatus(
    String orderId,
    String customerName,
    String message,
    String createdAt,
    String status,
    int attempts,
    String lastError
) {
}