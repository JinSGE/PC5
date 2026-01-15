#!/bin/bash
PASSWORD="centos"
PROXY_CMD="ssh -o StrictHostKeyChecking=no -W %h:%p -q root@10.2.2.20"

for IP in "10.2.3.2" "10.2.3.3"; do
    echo "Fixing Sudo on $IP..."
    sshpass -p "$PASSWORD" ssh -o ProxyCommand="$PROXY_CMD" -o StrictHostKeyChecking=no root@$IP "echo 'ansible ALL=(ALL) NOPASSWD: ALL' > /etc/sudoers.d/ansible"
    if [ $? -eq 0 ]; then echo "SUCCESS: $IP"; else echo "FAIL: $IP"; fi
done
