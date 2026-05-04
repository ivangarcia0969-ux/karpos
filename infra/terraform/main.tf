terraform {
  required_version = ">= 1.7.0"
  required_providers {
    aws        = { source = "hashicorp/aws", version = "~> 5.0" }
    kubernetes = { source = "hashicorp/kubernetes", version = "~> 2.0" }
    helm       = { source = "hashicorp/helm", version = "~> 2.0" }
  }
  backend "s3" {
    bucket         = "karpos-terraform-state"
    key            = "envs/staging/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "karpos-terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "karpos"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

module "network" {
  source             = "./modules/network"
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  environment        = var.environment
}

module "eks" {
  source         = "./modules/eks"
  cluster_name   = "karpos-${var.environment}"
  vpc_id         = module.network.vpc_id
  subnet_ids     = module.network.private_subnet_ids
  node_groups    = var.node_groups
  environment    = var.environment
}

module "rds" {
  source             = "./modules/rds"
  identifier         = "karpos-${var.environment}"
  vpc_id             = module.network.vpc_id
  subnet_ids         = module.network.private_subnet_ids
  allowed_sg_ids     = [module.eks.node_sg_id]
  postgres_version   = "16.4"
  instance_class     = var.db_instance_class
  allocated_storage  = var.db_storage_gb
  multi_az           = var.environment == "production"
  parameter_group    = "default.postgres16"
  enable_postgis     = true
  enable_timescaledb = true
  enable_pgvector    = true
}

module "redis" {
  source             = "./modules/elasticache"
  identifier         = "karpos-${var.environment}"
  subnet_ids         = module.network.private_subnet_ids
  vpc_id             = module.network.vpc_id
  allowed_sg_ids     = [module.eks.node_sg_id]
  node_type          = "cache.t4g.small"
}

module "s3_files" {
  source      = "./modules/s3"
  bucket_name = "karpos-${var.environment}-files"
  encryption  = "aws:kms"
  versioning  = true
  lifecycle_rules = [
    { id = "expire-thumbs", prefix = "thumbs/", expiration_days = 90 }
  ]
}

output "kubeconfig_command" {
  value = "aws eks update-kubeconfig --name ${module.eks.cluster_name} --region ${var.aws_region}"
}
