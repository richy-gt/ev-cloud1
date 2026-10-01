# Demo de órdenes con RabbitMQ DLQ

## Iniciar

Desde esta carpeta, inicia RabbitMQ:

```sh
docker compose up -d
```

En terminales separadas, inicia backend y frontend:

```sh
cd rabbit-logging-backend
mvn spring-boot:run
```

```sh
cd rabbit-logging-frontend
npm install
npm run dev
```

Abre `http://localhost:5173`. El panel consulta el backend en el puerto `8081` y RabbitMQ Management está en `http://localhost:15672` (`guest` / `guest`).

## Flujo implementado

- `orders.queue`: durable, TTL de 30 segundos, máximo 1000 mensajes y dead-letter exchange configurado.
- `orders.dlx` y `orders.dlq`: los mensajes rechazados tras tres intentos pasan a la DLQ; los mensajes de la DLQ expiran en 24 horas.
- Spring AMQP reintenta con backoff exponencial y procesa un mensaje a la vez.
- El panel muestra el estado de órdenes y alerta visualmente cuando alguna llega a la DLQ. Usa **Probar fallo / DLQ** para forzar ese recorrido.

Las órdenes se mantienen en memoria en el backend; al reiniciarlo, se reinicia el historial visual.