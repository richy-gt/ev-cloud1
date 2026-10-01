package com.example.loggingsystem;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    private final RabbitTemplate rabbitTemplate;
    private final OrderTrackingService orderTrackingService;

    public OrderController(RabbitTemplate rabbitTemplate, OrderTrackingService orderTrackingService) {
        this.rabbitTemplate = rabbitTemplate;
        this.orderTrackingService = orderTrackingService;
    }

    @PostMapping("/send")
    public OrderStatus sendOrder(@RequestBody OrderRequest request) {
        String customerName = request.customerName() == null || request.customerName().isBlank()
            ? "Cliente desconocido"
            : request.customerName().trim();
        String orderId = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String createdAt = Instant.now().toString();
        OrderMessage order = new OrderMessage(
            orderId,
            customerName,
            "Orden " + orderId + " | Cliente: " + customerName,
            createdAt,
            request.forceFailure()
        );

        orderTrackingService.register(order);
        try {
            rabbitTemplate.convertAndSend(
                RabbitMQConfig.ORDERS_EXCHANGE,
                RabbitMQConfig.ORDERS_ROUTING_KEY,
                order
            );
        } catch (RuntimeException exception) {
            orderTrackingService.remove(orderId);
            throw exception;
        }
        return orderTrackingService.find(orderId);
    }

    @GetMapping
    public List<OrderStatus> getOrders() {
        return orderTrackingService.findAll();
    }

    @GetMapping("/status")
    public Map<String, String> getStatus() {
        boolean connected;
        try {
            connected = Boolean.TRUE.equals(rabbitTemplate.execute(channel -> channel.isOpen()));
        } catch (RuntimeException exception) {
            connected = false;
        }
        return Map.of(
            "backend", "Online",
            "rabbitmq", connected ? "Conectado" : "Desconectado",
            "timestamp", Instant.now().toString()
        );
    }

    public record OrderRequest(String customerName, boolean forceFailure) {
    }
}