package com.example.loggingsystem;

import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OrderTrackingService {

    private final ConcurrentHashMap<String, OrderStatus> orders = new ConcurrentHashMap<>();

    public void register(OrderMessage order) {
        orders.put(order.orderId(), new OrderStatus(
            order.orderId(), order.customerName(), order.message(), order.createdAt(), "ENVIADA", 0, null
        ));
    }

    public int startAttempt(String orderId) {
        OrderStatus updated = orders.computeIfPresent(orderId, (id, current) -> new OrderStatus(
            current.orderId(), current.customerName(), current.message(), current.createdAt(),
            "PROCESANDO", current.attempts() + 1, current.lastError()
        ));
        return updated == null ? 1 : updated.attempts();
    }

    public void markRetrying(String orderId, String error) {
        update(orderId, "REINTENTANDO", error);
    }

    public void markProcessed(String orderId) {
        update(orderId, "PROCESADA", null);
    }

    public void markFailed(String orderId) {
        update(orderId, "FALLIDA (DLQ)", "Se agotaron los 3 intentos");
    }

    public void remove(String orderId) {
        orders.remove(orderId);
    }

    public OrderStatus find(String orderId) {
        return orders.get(orderId);
    }

    public List<OrderStatus> findAll() {
        return orders.values().stream()
            .sorted(Comparator.comparing(OrderStatus::createdAt).reversed())
            .toList();
    }

    private void update(String orderId, String status, String error) {
        orders.computeIfPresent(orderId, (id, current) -> new OrderStatus(
            current.orderId(), current.customerName(), current.message(), current.createdAt(),
            status, current.attempts(), error
        ));
    }
}