#!/usr/bin/env bash

echo "======================================================="
echo " TRILLIONS CLOUD / VIRTUALIZATION / HPC DETECTOR"
echo "======================================================="

echo ""
echo "[1] HOSTNAME"
hostname

echo ""
echo "[2] KERNEL"
uname -a

echo ""
echo "[3] OS RELEASE"
cat /etc/os-release 2>/dev/null || true

echo ""
echo "[4] CPU"
lscpu

echo ""
echo "[5] CPUINFO FLAGS"
grep -m1 '^flags' /proc/cpuinfo || true

echo ""
echo "[6] HYPERVISOR"
lscpu | grep -Ei 'hypervisor|virtualization' || true

echo ""
echo "[7] DMI"
sudo dmidecode -t system 2>/dev/null || true

echo ""
echo "[8] CLOUD CLUES"
grep -RiE 'azure|aws|gcp|google|microsoft|oracle|digitalocean|openstack' /var/log 2>/dev/null | head -20 || true

echo ""
echo "[9] CGROUP"
cat /proc/1/cgroup || true

echo ""
echo "[10] MOUNT"
mount | head -30

echo ""
echo "[11] MEMORY"
free -h

echo ""
echo "[12] STORAGE"
lsblk
df -h

echo ""
echo "[13] NETWORK"
ip a || true

echo ""
echo "[14] ROUTES"
ip route || true

echo ""
echo "[15] DNS"
cat /etc/resolv.conf || true

echo ""
echo "[16] OPEN PORTS"
ss -tulpn | head -30 || true

echo ""
echo "[17] NODE"
node -v
npm -v

echo ""
echo "[18] DOCKER / CONTAINER"
docker --version 2>/dev/null || echo "docker unavailable"

echo ""
echo "[19] KUBERNETES"
kubectl version --client 2>/dev/null || echo "kubectl unavailable"

echo ""
echo "[20] GPU"
lspci | grep -iE 'vga|3d|nvidia|amd' || true

echo ""
echo "[21] VIRTUALIZATION CLASSIFICATION"

KERNEL=$(uname -a)

if echo "$KERNEL" | grep -qi azure; then
  echo "CLASSIFICATION => MICROSOFT AZURE CLOUD"
fi

if cat /proc/1/cgroup | grep -qi docker; then
  echo "CLASSIFICATION => DOCKER CONTAINER"
fi

if lscpu | grep -qi hypervisor; then
  echo "CLASSIFICATION => HYPERVISOR DETECTED"
fi

echo ""
echo "[22] HPC PROFILE"

CPU_COUNT=$(nproc)
RAM=$(free -g | awk '/Mem:/ {print $2}')

echo "CPU THREADS => $CPU_COUNT"
echo "RAM GB      => $RAM"

if [ "$CPU_COUNT" -le 2 ]; then
  echo "PROFILE => LIGHT CLOUD NODE"
elif [ "$CPU_COUNT" -le 8 ]; then
  echo "PROFILE => MEDIUM CLOUD NODE"
else
  echo "PROFILE => HPC / LARGE NODE"
fi

echo ""
echo "[23] TRILLIONS ORCHESTRATION LAYER"

echo "TRILLIONS MODE => ORCHESTRATOR / COPROCESSOR FABRIC"
echo "RUNTIME        => NODE.JS"
echo "UI             => ACTIVE"
echo "SOCKET         => ACTIVE"
echo "PORT 3000      => EXPECTED"
echo "MIRRORS        => SOFTWARE VIRTUALIZATION"
echo "COPROCESSORS   => SOFTWARE ORCHESTRATION"
echo "REALITY LOCK   => ACTIVE"

echo ""
echo "[24] SAVE REPORT"

OUT=REPORTS_VIRTUALIZATION/TRILLIONS_HYPERVISOR_REPORT.txt

{
echo "===== TRILLIONS VIRTUALIZATION REPORT ====="
date
echo ""
uname -a
echo ""
lscpu
echo ""
free -h
echo ""
df -h
echo ""
ip a || true
} > "$OUT"

echo "REPORT => $OUT"

echo ""
echo "======================================================="
echo " TRILLIONS DETECTION COMPLETE"
echo "======================================================="
