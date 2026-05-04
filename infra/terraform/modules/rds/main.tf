variable "identifier" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "allowed_sg_ids" { type = list(string) }
variable "postgres_version" { type = string }
variable "instance_class" { type = string }
variable "allocated_storage" { type = number }
variable "multi_az" { type = bool }
variable "parameter_group" { type = string }
variable "enable_postgis" { type = bool }
variable "enable_timescaledb" { type = bool }
variable "enable_pgvector" { type = bool }

# Real impl: aws_db_subnet_group + aws_security_group + aws_db_instance with custom parameter group
# enabling shared_preload_libraries=timescaledb and rds-managed extensions for PostGIS / pgvector.

output "endpoint" { value = "" }
output "port"     { value = 5432 }
