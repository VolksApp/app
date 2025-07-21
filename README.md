# Catálogo de Veículos da Volkswagen

Bem-vindo ao projeto de Catálogo de Veículos da Volkswagen! Este é um sistema web simples e intuitivo para gerenciar e exibir informações sobre veículos da marca, incluindo modelos, especificações e imagens. O projeto foi desenvolvido com foco em automação, reprodutibilidade e melhores práticas da AWS Well-Architected Framework, garantindo segurança, eficiência operacional, confiabilidade, desempenho e otimização de custos. Ele utiliza tecnologias como AWS para hospedagem, containers com Docker para empacotamento e GitHub Actions para integração contínua e deploy contínuo (CI/CD).

Assume-se que:
- Você tem acesso a uma conta AWS com permissões para criar recursos como EC2, RDS, S3 e IAM.
- O ambiente local possui Git, Docker e Node.js/Python instalados (detalhes nos pré-requisitos).
- O projeto usa React para frontend, Node.js para backend e PostgreSQL para banco de dados, mas isso pode ser adaptado.
- Integrações externas incluem uma API pública de veículos (ex.: uma API fictícia da VW para dados reais).
- O diagrama da infraestrutura AWS está em um arquivo separado chamado `infra.png`, que ilustra os componentes como VPC, EC2/ECS, RDS e Load Balancer.

## Instruções de Deploy

Aqui vai um guia passo a passo para implantar o projeto em ambientes de desenvolvimento (dev), teste (test) e produção (prod). O deploy é automatizado via GitHub Actions, mas você pode fazer manualmente para testes iniciais. Como você tem conhecimento intermediário em AWS e containers, mas zero em CI/CD, explico conceitos chave: CI/CD é um processo que automatiza testes e deploys quando você faz mudanças no código, garantindo que tudo funcione antes de ir ao ar. GitHub Actions é uma ferramenta gratuita que roda esses processos no GitHub.

### Requisitos de Hardware/Software
- **Hardware**: Máquina local com pelo menos 4GB RAM e 2 núcleos CPU. Na AWS, use instâncias t3.micro para dev/test e t3.small para prod.
- **Software**:
  - Git (para clonar o repositório).
  - Docker (para criar containers – pense neles como pacotes leves que incluem o app e suas dependências).
  - AWS CLI (instale via `pip install awscli` ou site oficial).
  - Node.js v18+ (para frontend/backend, instale via nvm ou site).
  - Python 3.10+ (para scripts de dados, se aplicável).
  - Conta GitHub com repositório forkado deste projeto.
- **Permissões AWS**: IAM role com acesso a EC2, ECS (para containers na AWS), RDS, S3 e CloudFormation para stacks automatizados.

### Passos para Deploy Manual (para dev local)
1. Clone o repositório: `git clone https://github.com/VolksApp/app/catalogo-vw.git && cd catalogo-vw`.
2. Instale dependências:
   - Frontend: `cd frontend && npm install`.
   - Backend: `cd ../backend && npm install`.
3. Configure variáveis de ambiente (crie um arquivo `.env` no root):
   ```
   DB_HOST=localhost
   DB_USER=seuusuario
   DB_PASS=suasenha
   AWS_REGION=us-east-1
   ENVIRONMENT=dev
   ```
4. Inicie o banco de dados local com Docker: `docker run -d -p 5432:5432 --name db -e POSTGRES_PASSWORD=suasenha postgres`.
5. Rode o backend: `cd backend && npm start`.
6. Rode o frontend: `cd frontend && npm start`. Acesse em `http://localhost:3000`.

### Deploy na AWS (dev/test/prod)
O deploy segue o AWS Well-Architected: usa VPC isolada para segurança, Auto Scaling para confiabilidade e monitoring com CloudWatch.
1. Configure AWS CLI: `aws configure` (insira access key, secret key e region).
2. Crie stack com CloudFormation (template em `infra/cloudformation.yaml`): `aws cloudformation create-stack --stack-name catalogo-vw-dev --template-body file://infra/cloudformation.yaml --parameters ParameterKey=Environment,ParameterValue=dev`.
3. Build e push de images Docker:
   - `docker build -t catalogo-backend ./backend`.
   - `docker tag catalogo-backend:latest sua-conta.dkr.ecr.us-east-1.amazonaws.com/catalogo-backend:latest`.
   - `docker push sua-conta.dkr.ecr.us-east-1.amazonaws.com/catalogo-backend:latest`.
   (Faça o mesmo para frontend).
4. Deploy via ECS (para containers): `aws ecs update-service --cluster catalogo-cluster --service catalogo-service --force-new-deployment`.
5. Para test/prod, mude o parâmetro `Environment` para `test` ou `prod` e ajuste quotas (ex.: mais instâncias em prod).
6. Verifique: Acesse o Load Balancer URL gerado pelo CloudFormation.

Para automação total, use o pipeline CI/CD (veja seção abaixo).

## Explicação da Arquitetura

A arquitetura é dividida em camadas para separação de responsabilidades, seguindo princípios de escalabilidade e segurança do AWS Well-Architected. Usamos microserviços: frontend para interface usuário, backend para lógica de negócios, banco de dados para armazenamento persistente e integrações externas para dados dinâmicos.

### Componentes Principais
- **Frontend**: Aplicação React hospedada em S3 (para estático) ou EC2/ECS. Responsável por exibir o catálogo, buscas e formulários.
- **Backend**: API Node.js (com Express) rodando em ECS ou Lambda. Gerencia autenticação, CRUD de veículos e integrações.
- **Banco de Dados**: PostgreSQL no RDS, com réplicas para alta disponibilidade. Armazena dados como modelos de carros, preços e specs.
- **Integrações Externas**: API da Volkswagen (ex.: via HTTP requests) para atualizar dados reais de veículos. Armazenamento de imagens no S3.
- **Outros**: Docker para containerização, garantindo que o app rode igual em qualquer ambiente. GitHub Actions para CI/CD.

### Diagrama Simples em Markdown
Aqui um diagrama textual da arquitetura (para o diagrama AWS completo, veja `infra.png`):

```
[Usuário] --> [Frontend (React em S3/EC2)] --> [Backend (Node.js em ECS/Lambda)]
                                           |
                                           v
[Banco de Dados (RDS PostgreSQL)] <--> [Integrações Externas (API VW)]
                                           |
                                           v
[Armazenamento (S3 para imagens)] <--> [Monitoring (CloudWatch)]
```

Isso garante fluxo: usuário acessa frontend, que chama backend, que consulta BD e APIs. Tudo em uma VPC segura.

## Como Rodar o Pipeline

O pipeline é de CI/CD com GitHub Actions – uma ferramenta que automatiza testes e deploys ao pushar código no GitHub. Como você não tem experiência nisso, explico: CI (Integração Contínua) testa o código automaticamente; CD (Deploy Contínuo) implanta se testes passarem. Isso torna o processo reprodutível e automatizado.

Ferramentas envolvidas:
- GitHub Actions (workflow em `.github/workflows/deploy.yaml`).
- Docker (para build de images).
- AWS CLI (para deploy).

### Passos para Executar
1. No GitHub, vá ao repositório > Actions tab.
2. Selecione o workflow "Deploy to AWS".
3. Clique em "Run workflow" e escolha o branch (ex.: main para prod, dev para desenvolvimento).
4. Preencha inputs: ambiente (dev/test/prod) e versão.
5. O pipeline roda: testa código, builda Docker images, pusha para ECR (repositório AWS de containers) e deploya em ECS.
6. Comando manual (se preferir local): `act -j deploy` (instale act via `go install github.com/nektos/act@latest` para rodar workflows localmente).

Monitore logs no GitHub Actions. Para prod, adicione aprovações manuais no workflow.
