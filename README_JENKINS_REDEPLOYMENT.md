# Jenkins 재배포 시 자동 설정 완료 가이드

## ✅ 완료된 작업

### 1. **Jenkins 자동 SSH 설정** (`roles/jenkins/tasks/main.yml`)
Jenkins 컨테이너 배포 후 자동으로 다음 작업을 수행합니다:

- ✅ Jenkins SSH 키 자동 생성 (없을 경우)
- ✅ SSH Config 파일 생성 (10.2.3.x 프록시 설정 포함)
- ✅ sshpass 자동 설치
- ✅ 모든 서버에 SSH 키 자동 배포 (`jenkins_distribute_sshkeys.sh` 실행)

### 2. **통합 SSH 키 배포 스크립트** (`Script/jenkins_distribute_sshkeys.sh`)
- ✅ Jenkins 컨테이너에서 직접 배포 시도
- ✅ 실패한 서버는 현재 VM에서 자동 재시도
- ✅ 10.2.3.x 서브넷 프록시 지원
- ✅ 타임아웃 처리 (오프라인 서버 자동 스킵)

### 3. **설정 파일 수정**
- ✅ `group_vars/ETCD_Cluster.yml`: `ansible_become_password` 추가
- ✅ `Script/allserver_distribute_sshkeys.sh`: 비밀번호 수정 (centos → ansible)
- ✅ Jenkins SSH Config: 프록시 설정 자동 생성

### 4. **Git 저장소 동기화**
- ✅ `Ansible.git` 저장소에 푸시
- ✅ `All-Ansible` 저장소에 푸시 (Jenkins가 사용)
- ✅ Jenkins 워크스페이스 업데이트 완료

## 🚀 Jenkins 재배포 시 자동 실행 절차

### 방법 1: Ansible 플레이북으로 재배포 (권장)

```bash
# Jenkins 파이프라인에서 실행
# PLAYBOOK: playbooks/05_deploy_cicd.yml
# LIMIT: CICD-OPS
# DRY_RUN: false
```

**자동으로 수행되는 작업:**
1. Jenkins 컨테이너 재생성
2. SSH 키 생성 (없을 경우)
3. SSH Config 설정 (프록시 포함)
4. sshpass 설치
5. 모든 서버에 SSH 키 배포

### 방법 2: 수동으로 Jenkins 재배포

```bash
# 1. Jenkins 컨테이너 삭제 및 재생성
cd /opt/jenkins_stack
docker compose down
docker compose up -d --build

# 2. SSH 키 배포 스크립트 실행 (자동화)
cd /root/Antigravity/Ansible
./Script/jenkins_distribute_sshkeys.sh
```

## 📋 검증 방법

### 1. Jenkins SSH 접속 테스트

```bash
# 일반 서버 접속 테스트
docker exec jenkins ssh ansible@10.2.2.50 'hostname'

# 프록시를 통한 etcd 서버 접속 테스트
docker exec jenkins ssh ansible@10.2.3.20 'hostname'
```

### 2. Ansible Ping 테스트

```bash
# Jenkins 컨테이너에서 실행
docker exec jenkins bash -c "cd /var/jenkins_home/workspace/Ansible-Pipeline && ansible -i inventory.ini ETCD_Cluster -m ping"
```

**예상 결과:**
```
etcd_1 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
etcd_2 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
etcd_3 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
```

### 3. Jenkins 파이프라인 테스트

```bash
# Jenkins 웹 UI에서 실행
# http://172.16.6.61:8080

# PLAYBOOK: playbooks/04_deploy_db.yml
# LIMIT: ETCD_Cluster
# DRY_RUN: true (먼저 Dry Run으로 테스트)
```

## 🔧 문제 해결

### "Missing sudo password" 오류

**원인:** Jenkins 워크스페이스에 `ansible_become_password`가 없음

**해결:**
```bash
# Jenkins 워크스페이스 업데이트
docker exec jenkins bash -c "cd /var/jenkins_home/workspace/Ansible-Pipeline && git pull origin main"

# group_vars/ETCD_Cluster.yml 확인
docker exec jenkins cat /var/jenkins_home/workspace/Ansible-Pipeline/group_vars/ETCD_Cluster.yml
```

### "Permission denied" 오류

**원인:** Jenkins SSH 키가 서버에 배포되지 않음

**해결:**
```bash
# SSH 키 재배포
cd /root/Antigravity/Ansible
./Script/jenkins_distribute_sshkeys.sh
```

### Git 저장소 동기화 문제

**두 개의 Git 저장소:**
- `origin`: http://10.2.2.40:3001/admin/Ansible.git
- `all`: http://10.2.2.40:3001/admin/All-Ansible (Jenkins가 사용)

**동기화 방법:**
```bash
cd /root/Antigravity/Ansible

# 두 저장소 모두에 푸시
git push origin main
git push all main
```

## 📝 파일 구조

```
/root/Antigravity/Ansible/
├── Script/
│   ├── jenkins_distribute_sshkeys.sh      # Jenkins SSH 키 자동 배포 (통합)
│   └── allserver_distribute_sshkeys.sh    # 현재 VM SSH 키 배포
├── roles/jenkins/tasks/main.yml            # Jenkins 배포 + SSH 자동 설정
├── group_vars/ETCD_Cluster.yml            # ansible_become_password 포함
├── README_SSH_DEPLOYMENT.md                # SSH 배포 가이드
└── Jenkinsfile                             # Jenkins 파이프라인 정의
```

## ✨ 핵심 개선사항

### Before (수동 작업 필요)
1. Jenkins 재배포
2. 수동으로 SSH 키 생성
3. 수동으로 SSH Config 설정
4. 수동으로 sshpass 설치
5. 수동으로 SSH 키 배포 스크립트 실행

### After (완전 자동화)
1. Jenkins 재배포 → **모든 작업 자동 완료!** ✅

## 🎯 결론

이제 Jenkins를 삭제하고 다시 올려도:
- ✅ SSH 키 자동 생성
- ✅ SSH Config 자동 설정
- ✅ 모든 서버에 SSH 키 자동 배포
- ✅ 10.2.3.x 서브넷 프록시 자동 설정
- ✅ Jenkins 파이프라인 즉시 사용 가능

**추가 작업 없이 바로 Ansible 플레이북을 실행할 수 있습니다!** 🚀
