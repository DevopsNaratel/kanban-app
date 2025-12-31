# Kubernetes Deployment Manifests Guide

This guide explains the Kubernetes manifests needed for the Kanban app deployment.

## 📁 Required Manifest Structure

Your `deployment-manifests` repository should have this structure:

```
deployment-manifests/
├── kanban-app/
│   ├── dev/
│   │   ├── backend-deployment.yaml
│   │   ├── frontend-deployment.yaml
│   │   ├── postgres-deployment.yaml
│   │   └── namespace.yaml
│   └── prod/
│       ├── backend-deployment.yaml
│       ├── frontend-deployment.yaml
│       ├── postgres-deployment.yaml
│       └── namespace.yaml
```

## 📝 Manifest Templates

### 1. Namespace (namespace.yaml)

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: kanban-dev  # or kanban-prod for production
```

### 2. PostgreSQL Deployment (postgres-deployment.yaml)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: postgres-config
  namespace: kanban-dev
data:
  POSTGRES_DB: kanban_db
  POSTGRES_USER: postgres

---
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
  namespace: kanban-dev
type: Opaque
stringData:
  POSTGRES_PASSWORD: "your-secure-password"  # Change this!

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: kanban-dev
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: kanban-dev
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
        envFrom:
        - configMapRef:
            name: postgres-config
        - secretRef:
            name: postgres-secret
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc

---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: kanban-dev
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
  type: ClusterIP
```

### 3. Backend Deployment (backend-deployment.yaml)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
  namespace: kanban-dev
data:
  NODE_ENV: "production"
  PORT: "3000"
  DB_HOST: "postgres"
  DB_PORT: "5432"
  DB_NAME: "kanban_db"
  DB_USER: "postgres"
  JWT_EXPIRES_IN: "7d"
  FRONTEND_URL: "http://kanban-dev.example.com"  # Update with your domain

---
apiVersion: v1
kind: Secret
metadata:
  name: backend-secret
  namespace: kanban-dev
type: Opaque
stringData:
  DB_PASSWORD: "your-secure-password"  # Match postgres password
  JWT_SECRET: "your-super-secret-jwt-key-min-32-chars"  # Change this!

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: kanban-dev
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: diwamln/kanban-app-backend:latest  # Jenkins will update this
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: backend-config
        - secretRef:
            name: backend-secret
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"

---
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: kanban-dev
spec:
  selector:
    app: backend
  ports:
  - port: 3000
    targetPort: 3000
  type: ClusterIP
```

### 4. Frontend Deployment (frontend-deployment.yaml)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: kanban-dev
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: diwamln/kanban-app-frontend:latest  # Jenkins will update this
        ports:
        - containerPort: 80
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"

---
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: kanban-dev
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: kanban-ingress
  namespace: kanban-dev
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: "letsencrypt-prod"  # If using cert-manager
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - kanban-dev.example.com  # Update with your domain
    secretName: kanban-tls
  rules:
  - host: kanban-dev.example.com  # Update with your domain
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
```

## 🚀 Deployment Steps

### 1. Create Namespace
```bash
kubectl apply -f kanban-app/dev/namespace.yaml
```

### 2. Deploy Database
```bash
kubectl apply -f kanban-app/dev/postgres-deployment.yaml
```

### 3. Initialize Database Schema
```bash
# Get postgres pod name
kubectl get pods -n kanban-dev

# Copy schema file
kubectl cp backend/database/schema.sql kanban-dev/<postgres-pod-name>:/tmp/schema.sql

# Execute schema
kubectl exec -n kanban-dev <postgres-pod-name> -- psql -U postgres -d kanban_db -f /tmp/schema.sql
```

### 4. Deploy Backend
```bash
kubectl apply -f kanban-app/dev/backend-deployment.yaml
```

### 5. Deploy Frontend
```bash
kubectl apply -f kanban-app/dev/frontend-deployment.yaml
```

### 6. Verify Deployment
```bash
# Check all resources
kubectl get all -n kanban-dev

# Check pods
kubectl get pods -n kanban-dev

# Check logs
kubectl logs -n kanban-dev -l app=backend
kubectl logs -n kanban-dev -l app=frontend

# Check ingress
kubectl get ingress -n kanban-dev
```

## 🔄 Jenkins CI/CD Flow

1. **Code Push** → Triggers Jenkins pipeline
2. **Build** → Builds Docker images for frontend & backend
3. **Push** → Pushes images to Docker Hub
4. **Update Manifest** → Updates image tags in deployment manifests
5. **ArgoCD/FluxCD** → Detects manifest changes and deploys to cluster

## 📊 Monitoring

### Check Application Health
```bash
# Backend health
kubectl exec -n kanban-dev -it <backend-pod> -- wget -qO- http://localhost:3000/health

# Frontend health
kubectl exec -n kanban-dev -it <frontend-pod> -- wget -qO- http://localhost/health

# Database connection
kubectl exec -n kanban-dev -it <postgres-pod> -- psql -U postgres -d kanban_db -c "SELECT 1;"
```

### View Logs
```bash
# Backend logs
kubectl logs -n kanban-dev -l app=backend -f

# Frontend logs
kubectl logs -n kanban-dev -l app=frontend -f

# Database logs
kubectl logs -n kanban-dev -l app=postgres -f
```

## 🔒 Security Best Practices

1. **Use Secrets for Sensitive Data**
   - Never commit passwords to Git
   - Use Kubernetes Secrets or external secret managers

2. **Network Policies**
   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: NetworkPolicy
   metadata:
     name: backend-network-policy
     namespace: kanban-dev
   spec:
     podSelector:
       matchLabels:
         app: backend
     policyTypes:
     - Ingress
     ingress:
     - from:
       - podSelector:
           matchLabels:
             app: frontend
       ports:
       - protocol: TCP
         port: 3000
   ```

3. **Resource Limits**
   - Always set resource requests and limits
   - Prevents resource exhaustion

4. **RBAC**
   - Use service accounts with minimal permissions
   - Implement Pod Security Standards

## 🎯 Production Considerations

### For Production Environment:

1. **Increase Replicas**
   ```yaml
   spec:
     replicas: 3  # or more
   ```

2. **Use HPA (Horizontal Pod Autoscaler)**
   ```yaml
   apiVersion: autoscaling/v2
   kind: HorizontalPodAutoscaler
   metadata:
     name: backend-hpa
     namespace: kanban-prod
   spec:
     scaleTargetRef:
       apiVersion: apps/v1
       kind: Deployment
       name: backend
     minReplicas: 2
     maxReplicas: 10
     metrics:
     - type: Resource
       resource:
         name: cpu
         target:
           type: Utilization
           averageUtilization: 70
   ```

3. **Use StatefulSet for Database**
   - Better for persistent data
   - Stable network identities

4. **Implement Backup Strategy**
   ```bash
   # Backup database
   kubectl exec -n kanban-prod <postgres-pod> -- pg_dump -U postgres kanban_db > backup.sql
   ```

5. **Use External Database**
   - Managed PostgreSQL (AWS RDS, Google Cloud SQL, etc.)
   - Better reliability and backups

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Jenkins Kubernetes Plugin](https://plugins.jenkins.io/kubernetes/)
- [ArgoCD](https://argo-cd.readthedocs.io/)
- [FluxCD](https://fluxcd.io/)

---

**Note**: Update all placeholder values (domains, passwords, secrets) before deploying to production!
