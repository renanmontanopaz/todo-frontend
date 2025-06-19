provider "google" {
  project = "meu-projeto-stage" # Substitua se necessário
  region  = "us-central1"
}

resource "google_container_cluster" "primary" {
  name     = "autopilot-cluster-stage"
  location = "us-central1"

  enable_autopilot = true

  monitoring_config {
    enable_components  = ["SYSTEM_COMPONENTS"]
    managed_prometheus {
      enabled = true
    }
  }
}