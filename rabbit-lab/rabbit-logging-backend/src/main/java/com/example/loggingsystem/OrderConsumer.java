package com.example.loggingsystem;

import com.rabbitmq.client.Channel;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.retry.support.RetryTemplate;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class OrderConsumer {

    private final OrderTrackingService orderTrackingService;
    private final RetryTemplate retryTemplate;

    public OrderConsumer(OrderTrackingService orderTrackingService, RetryTemplate orderRetryTemplate) {
        this.orderTrackingService = orderTrackingService;
        this.retryTemplate = orderRetryTemplate;
    }

    @RabbitListener(queues = RabbitMQConfig.ORDERS_QUEUE)
    public void processOrder(
        OrderMessage order,
        Channel channel,
        @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag
    ) throws IOException {
        try {
            retryTemplate.execute(context -> {
                int attempt = orderTrackingService.startAttempt(order.orderId());
                System.out.printf("[PROCESADOR] Orden %s, intento %d/3%n", order.orderId(), attempt);

                if (order.forceFailure() || ThreadLocalRandom.current().nextDouble() < 0.5) {
                    String error = "Fallo simulado durante el procesamiento";
                    orderTrackingService.markRetrying(order.orderId(), error);
                    System.out.printf("[REINTENTO] Orden %s: %s%n", order.orderId(), error);
                    throw new IllegalStateException(error);
                }

                orderTrackingService.markProcessed(order.orderId());
                System.out.printf("[EXITO] Orden %s procesada%n", order.orderId());
                return null;
            });
            channel.basicAck(deliveryTag, false);
        } catch (RuntimeException exception) {
            orderTrackingService.markRetrying(order.orderId(), exception.getMessage());
            channel.basicNack(deliveryTag, false, false);
        }
    }

    @RabbitListener(queues = RabbitMQConfig.DLQ_QUEUE)
    public void processDeadLetter(
        OrderMessage order,
        Channel channel,
        @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag
    ) throws IOException {
        orderTrackingService.markFailed(order.orderId());
        System.out.printf("[DLQ] Orden en cuarentena: %s (%s)%n", order.orderId(), order.customerName());
        channel.basicAck(deliveryTag, false);
    }
}