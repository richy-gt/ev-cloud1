#!/bin/bash
set -euo pipefail

HOSTNAME=$(hostname)
SEED_NODE="rabbitmq-1"
COOKIE_FILE="/var/lib/rabbitmq/.erlang.cookie"

mkdir -p /var/lib/rabbitmq
chmod 700 /var/lib/rabbitmq
printf '%s' "${RABBITMQ_ERLANG_COOKIE:-rabbitmq-cluster-cookie}" > "${COOKIE_FILE}"
chmod 400 "${COOKIE_FILE}"

rabbitmq-plugins enable --offline rabbitmq_management >/dev/null 2>&1 || true

if [ "$HOSTNAME" = "$SEED_NODE" ]; then
  echo "Iniciando nodo semilla RabbitMQ: $HOSTNAME"
  exec rabbitmq-server
fi

echo "Iniciando nodo RabbitMQ en modo cluster: $HOSTNAME"
rabbitmq-server -detached
rabbitmqctl await_startup

for i in {1..30}; do
  if rabbitmq-diagnostics -q ping -n "rabbit@${SEED_NODE}" >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

rabbitmqctl stop_app || true
rabbitmqctl reset || true
rabbitmqctl join_cluster "rabbit@${SEED_NODE}"
rabbitmqctl start_app
rabbitmqctl await_startup

# Keep the container alive while RabbitMQ runs in the background.
tail -f /dev/null
