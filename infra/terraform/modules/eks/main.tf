variable "cluster_name" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "environment" { type = string }
variable "node_groups" {
  type = map(object({
    instance_types = list(string)
    desired_size   = number
    min_size       = number
    max_size       = number
  }))
}

# Real implementation would use the terraform-aws-modules/eks AWS module.
# Kept as a placeholder to keep the repository self-contained without an external dependency.

output "cluster_name" { value = var.cluster_name }
output "node_sg_id"   { value = "" }
