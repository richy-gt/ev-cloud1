package com.example.loggingsystem;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.retry.backoff.ExponentialBackOffPolicy;
import org.springframework.retry.policy.SimpleRetryPolicy;
import org.springframework.retry.support.RetryTemplate;

import java.time.Duration;

@Configuration
public class RabbitMQConfig {

    public static final String ORDERS_EXCHANGE = "orders.exchange";
    public static final String ORDERS_QUEUE = "orders.queue";
    public static final String ORDERS_ROUTING_KEY = "order.created";
    public static final String DLX_EXCHANGE = "orders.dlx";
    public static final String DLQ_QUEUE = "orders.dlq";

    @Bean
    public DirectExchange ordersExchange() {
        return new DirectExchange(ORDERS_EXCHANGE, true, false);
    }

    @Bean
    public Queue ordersQueue() {
        return QueueBuilder.durable(ORDERS_QUEUE)
            .withArgument("x-message-ttl", 30000)
            .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
            .withArgument("x-dead-letter-routing-key", "order.dead")
            .withArgument("x-max-length", 1000)
            .build();
    }

    @Bean
    public Binding ordersBinding(@Qualifier("ordersQueue") Queue ordersQueue, DirectExchange ordersExchange) {
        return BindingBuilder.bind(ordersQueue).to(ordersExchange).with(ORDERS_ROUTING_KEY);
    }

    @Bean
    public FanoutExchange deadLetterExchange() {
        return new FanoutExchange(DLX_EXCHANGE, true, false);
    }

    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(DLQ_QUEUE)
            .withArgument("x-message-ttl", 86400000)
            .build();
    }

    @Bean
    public Binding deadLetterBinding(@Qualifier("deadLetterQueue") Queue deadLetterQueue, FanoutExchange deadLetterExchange) {
        return BindingBuilder.bind(deadLetterQueue).to(deadLetterExchange);
    }

    @Bean
    public Jackson2JsonMessageConverter jacksonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RetryTemplate orderRetryTemplate(
        @Value("${spring.rabbitmq.listener.simple.retry.max-attempts:3}") int maxAttempts,
        @Value("${spring.rabbitmq.listener.simple.retry.initial-interval:1s}") Duration initialInterval,
        @Value("${spring.rabbitmq.listener.simple.retry.max-interval:10s}") Duration maxInterval,
        @Value("${spring.rabbitmq.listener.simple.retry.multiplier:2}") double multiplier
    ) {
        ExponentialBackOffPolicy backOffPolicy = new ExponentialBackOffPolicy();
        backOffPolicy.setInitialInterval(initialInterval.toMillis());
        backOffPolicy.setMaxInterval(maxInterval.toMillis());
        backOffPolicy.setMultiplier(multiplier);

        RetryTemplate retryTemplate = new RetryTemplate();
        retryTemplate.setRetryPolicy(new SimpleRetryPolicy(maxAttempts));
        retryTemplate.setBackOffPolicy(backOffPolicy);
        return retryTemplate;
    }
}
