package com.example.loggingsystem;

public record OrderMessage(
    String orderId,
    String customerName,
    String message,
    String createdAt,
    boolean forceFailure
) {
}