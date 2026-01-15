#!/bin/bash
PASSWORD="centos"
PUB_KEY=$(cat ~/.ssh/id_rsa.pub)
PROXY_CMD="ssh -o StrictHostKeyChecking=no -W %h:%p -q root@10.2.2.20"

for IP in "10.2.3.2" "10.2.3.3"; do
    echo "Fixing $IP..."
    sshpass -p "$PASSWORD" ssh -o ProxyCommand="$PROXY_CMD" -o StrictHostKeyChecking=no root@$IP "mkdir -p /home/ansible/.ssh && echo \"$PUB_KEY\" >> /home/ansible/.ssh/authorized_keys && chown -R ansible:ansible /home/ansible/.ssh && chmod 700 /home/ansible/.ssh && chmod 600 /home/ansible/.ssh/authorized_keys && restorecon -R -v /home/ansible/.ssh"
    if [ $? -eq 0 ]; then echo "SUCCESS: $IP"; else echo "FAIL: $IP"; fi
done
