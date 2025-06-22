PROJETO DE ARQUITETURA MULTINUVEM COM CI/CD NO GCP

Este repositório contém um projeto de automação de infraestrutura e deploy contínuo que simula uma arquitetura multinuvem utilizando dois ambientes distintos (Homologação e Produção) no Google Cloud Platform (GCP).

O objetivo é demonstrar o provisionamento de infraestrutura como código (IaC) com Terraform, orquestração de contêineres com Google Kubernetes Engine (GKE), e a criação de pipelines de CI/CD completas com GitHub Actions.

--------------------------------------------------

TABELA DE CONTEÚDO

* Arquitetura da Solução
* Descrição dos Ambientes
* Tecnologias Utilizadas
* Instruções de Uso
* Observações Adicionais
* Autor

--------------------------------------------------

ARQUITETURA DA SOLUÇÃO

A solução é composta por dois ambientes independentes, cada um em seu próprio projeto GCP, para garantir o isolamento completo entre Homologação (Stage) e Produção (Prod).

- Infraestrutura como Código (IaC): O TERRAFORM é utilizado para provisionar e gerenciar todos os recursos na nuvem, incluindo: Cluster GOOGLE KUBERNETES ENGINE (GKE) para orquestração, ARTIFACT REGISTRY para armazenamento seguro das imagens Docker, e Contas de Serviço (Service Accounts) e permissões de IAM.

- CI/CD com GitHub Actions: Quatro pipelines de automação foram configuradas para gerenciar o ciclo de vida das aplicações (backend e frontend):
    1. Build & Push: Compila o código da aplicação, cria uma imagem Docker e a envia para o Artifact Registry.
    2. Infra & Deploy: Garante que a infraestrutura esteja no estado desejado (via Terraform) e realiza o deploy da nova versão da aplicação no cluster GKE utilizando HELM.

- Monitoramento: A stack PROMETHEUS + GRAFANA, instalada via Helm Chart (kube-prometheus-stack), é implantada em cada cluster para coletar e visualizar métricas-chave, como uso de CPU, memória e status dos Pods.

--------------------------------------------------

DESCRIÇÃO DOS AMBIENTES

* Ambiente de Homologação (Stage)
- Propósito: Ambiente para testes de integração e validação de novas funcionalidades antes de irem para produção.
- Projeto GCP: [ID_DO_SEU_PROJETO_STAGE]
- Gatilho de Deploy: Push ou merge na branch "develop".
- URL da Aplicação: http://[IP_EXTERNO_DA_APP_STAGE]
- URL do Grafana: http://[IP_EXTERNO_DO_GRAFANA_STAGE]

* Ambiente de Produção (Production)
- Propósito: Ambiente vivo, acessível aos usuários finais.
- Projeto GCP: [ID_DO_SEU_PROJETO_PROD]
- Gatilho de Deploy: Push ou merge na branch "main".
- URL da Aplicação: http://[IP_EXTERNO_DA_APP_PROD]
- URL do Grafana: http://[IP_EXTERNO_DO_GRAFANA_PROD]

--------------------------------------------------

TECNOLOGIAS UTILIZADAS

- Cloud: Google Cloud Platform (GCP)
- CI/CD: GitHub Actions
- Infraestrutura como Código: Terraform
- Contêineres: Docker
- Orquestração: Google Kubernetes Engine (GKE)
- Gerenciador de Pacotes K8s: Helm
- Monitoramento: Prometheus & Grafana
- Backend: Node.js + TypeScript
- Frontend: React + TypeScript

--------------------------------------------------

INSTRUÇÕES DE USO

Siga os passos abaixo para replicar o ambiente.

* Pré-requisitos

- Conta no Google Cloud com Faturamento ativado.
- Terraform (v1.0+)
- Google Cloud SDK (gcloud CLI)
- kubectl
- Docker

* Configuração do Ambiente

1. Clone o Repositório:
git clone [URL_DO_SEU_REPOSITORIO]
cd [NOME_DO_REPOSITORIO]

2. Configure os Projetos GCP:
- Crie dois projetos no GCP (um para Stage, outro para Prod).
- Em cada projeto, ative as APIs: Kubernetes Engine API, Artifact Registry API, Compute Engine API, Cloud Resource Manager API.
- Configure a autenticação segura entre o GitHub e o GCP utilizando WORKLOAD IDENTITY FEDERATION. Siga o guia oficial para criar um Pool, um Provider e uma Service Account com as permissões necessárias.

3. Configure os Secrets do GitHub:
- No seu repositório GitHub, vá em "Settings > Secrets and variables > Actions".
- Crie os seguintes secrets com os valores obtidos no passo anterior:
    GCP_PROJECT_ID_STAGE
    GCP_PROJECT_ID_PROD
    GCP_WORKLOAD_IDENTITY_PROVIDER_STAGE
    GCP_WORKLOAD_IDENTITY_PROVIDER_PROD
    GCP_SERVICE_ACCOUNT_STAGE
    GCP_SERVICE_ACCOUNT_PROD

* Executando as Pipelines

O deploy é acionado automaticamente com base na estratégia de branches:

- Deploy para Stage: Faça um push para a branch "develop".
- Deploy para Produção: Faça um merge em "main" ou um push direto para a branch.
- Acompanhe a execução das pipelines na aba "Actions" do seu repositório no GitHub.

* Acesso às Aplicações e Monitoramento

1. Conecte-se ao Cluster:
   # Para Stage
   gcloud container clusters get-credentials gke-cluster-stage --region [SUA_REGIAO] --project [ID_DO_SEU_PROJETO_STAGE]

   # Para Prod
   gcloud container clusters get-credentials gke-cluster-prod --region [SUA_REGIAO] --project [ID_DO_SEU_PROJETO_PROD]

2. Encontre o IP da Aplicação e do Grafana:
   Para obter o IP externo de cada serviço, execute:
   kubectl get services --all-namespaces
   Procure na coluna EXTERNAL-IP pelos serviços correspondentes.

3. Acesse o Grafana:
   - Usuário: admin
   - Senha: Obtenha a senha gerada automaticamente com o comando:
     kubectl get secret prometheus-grafana -n monitoring -o jsonpath="{.data.admin-password}" | base64 --decode ; echo

--------------------------------------------------

OBSERVAÇÕES ADICIONAIS

- GERENCIAMENTO DE ESTADO DO TERRAFORM: O estado do Terraform é armazenado de forma segura e remota em um bucket do Google Cloud Storage, configurado no bloco `backend "gcs"` de cada ambiente. Isso é crucial para a execução em pipelines e trabalho em equipe.

- SEGURANÇA: A autenticação das pipelines é feita via WORKLOAD IDENTITY FEDERATION, que é a prática recomendada pelo Google. Isso evita o uso de chaves de serviço estáticas e de longa duração, aumentando significativamente a segurança.

- CUSTO: Os recursos criados nesta arquitetura (Clusters GKE, Load Balancers, etc.) incorrem em custos no GCP. Lembre-se de destruir a infraestrutura após a avaliação para evitar cobranças, utilizando o comando "terraform destroy" em cada diretório de ambiente.
