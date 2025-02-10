# Application Monitoring
## Prometheus, Grafana and Loki

### Prometheus 
   - Log metrics collection
   - prom-client package gets metrics from the server and send metrics to the Prometheus server 
   - Prometheus server connect with Grafana server and send metrics to the Grafana server for better visualization

### Grafana
   - Visualization
   - Grafana connect to both Prometheus and Loki.
   - Show metrics and logs in Graphs and Charts format easy to understand and read.

### Loki
   - Log collection 
   - Loki-Winston package collect logs from winston and send logs to the Loki server. 
   - Loki server connect to Grafana server.