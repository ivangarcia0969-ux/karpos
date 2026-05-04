variable "identifier" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "allowed_sg_ids" { type = list(string) }
variable "node_type" { type = string }

# Real impl: aws_elasticache_subnet_group + aws_security_group + aws_elasticache_replication_group
# with at-rest and in-transit encryption enabled.

output "endpoint" { value = "" }
