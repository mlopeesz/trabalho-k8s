## 1. Apagar o cluster atual

```bash
minikube delete
```

---

## 2. Subir com mais recursos

Se sua máquina aguentar:

```bash
minikube start --cpus=4 --memory=8192
```

Se puder ainda mais:

```bash
minikube start --cpus=6 --memory=12288
```

Eu recomendo a segunda se possível.

---

## 3. Verificar saúde básica

```bash
kubectl get nodes
kubectl get pods -A
```

Antes de instalar qualquer coisa pesada, confirme que o `kube-system` está saudável.

---

## 4. Reaplicar sua aplicação

```bash
kubectl create namespace faculdade
cd ~/trabalho-k8s
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/app-deployment.yaml
kubectl apply -f k8s/app-service.yaml
kubectl get all -n faculdade
```

---

## 5. Instalar monitoramento leve

Use um `monitoring-values.yaml` mais leve, assim:

```yaml
alertmanager:
  enabled: false

grafana:
  adminUser: admin
  adminPassword: admin123
  service:
    type: NodePort
    nodePort: 30300

prometheus:
  prometheusSpec:
    retention: 3d
    storageSpec:
      volumeClaimTemplate:
        spec:
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 2Gi

kubeStateMetrics:
  enabled: true

nodeExporter:
  enabled: true

prometheusOperator:
  admissionWebhooks:
    enabled: false

defaultRules:
  create: false
```

---

## 6. Instalar com Helm

```bash
kubectl create namespace monitoring
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install monitoring prometheus-community/kube-prometheus-stack \
  -n monitoring \
  -f monitoring-values.yaml
```

---

## 7. Esperar tudo ficar saudável

```bash
kubectl get pods -n monitoring -w
```

Você quer ver:
- grafana running
- operator running
- kube-state-metrics running
- prometheus running
- node-exporter running

---

## 8. Acessar o Grafana

```bash
kubectl port-forward svc/monitoring-grafana 3000:80 -n monitoring
```

Abrir:

```text
http://localhost:3000
```

Login:
- `admin`
- `admin123`

---

## 9. Queries para CPU e memória

### CPU por pod
```promql
sum(rate(container_cpu_usage_seconds_total{namespace="faculdade", container!="", image!=""}[1m])) by (pod)
```

### Memória por pod
```promql
sum(container_memory_working_set_bytes{namespace="faculdade", container!="", image!=""}) by (pod)
```

---

# Minha recomendação honesta
Você chegou num ponto em que o problema já não é “um detalhe de configuração”; é **saúde do cluster**.

Então a melhor ação agora é:

## Faça isso:
```bash
minikube delete
minikube start --cpus=4 --memory=8192
```

ou melhor:
```bash
minikube start --cpus=6 --memory=12288
```

---

# Se quiser, eu posso te ajudar do jeito mais direto:
Assim que você recriar o Minikube, eu te passo um **roteiro final curtíssimo**, em ordem, só com os comandos necessários para:

1. subir app
2. subir redis
3. instalar monitoramento leve
4. abrir Grafana
5. criar painel CPU/memória
6. rodar stress test
