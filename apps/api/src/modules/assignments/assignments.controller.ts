import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js';
import { AssignmentsService } from './assignments.service.js';
import { CurrentPrincipal } from '../../iam/decorators/current-principal.decorator.js';
import type { Principal } from '../../iam/auth.service.js';

const CreateWorkOrderSchema = z.object({
  farmId: z.string().uuid(),
  code: z.string(),
  plannedDate: z.string(), // ISO date
  operationType: z.string(),
  notes: z.string().optional(),
});

const CreateAssignmentSchema = z.object({
  workOrderId: z.string().uuid(),
  plotId: z.string().uuid(),
  assigneeId: z.string().uuid().optional(),
  assignedAreaHa: z.number().optional(),
});

const ExecuteAssignmentSchema = z.object({
  executedAreaHa: z.number(),
  notes: z.string().optional(),
});

const SignExecutionSchema = z.object({
  signatureUrl: z.string().url(),
  receiptUrl: z.string().url().optional(),
  notes: z.string().optional(),
});

@Controller('/v1/assignments')
export class AssignmentsController {
  constructor(private readonly svc: AssignmentsService) {}

  @Get('work-orders')
  async listWorkOrders(@CurrentPrincipal() principal: Principal) {
    return this.svc.listWorkOrders(principal.orgId);
  }

  @Post('work-orders')
  async createWorkOrder(
    @CurrentPrincipal() principal: Principal,
    @Body(new ZodValidationPipe(CreateWorkOrderSchema)) body: z.infer<typeof CreateWorkOrderSchema>
  ) {
    return this.svc.createWorkOrder(principal.orgId, body);
  }

  @Get()
  async listAssignments(@CurrentPrincipal() principal: Principal) {
    return this.svc.listAssignments(principal.orgId);
  }

  @Post()
  async createAssignment(
    @CurrentPrincipal() principal: Principal,
    @Body(new ZodValidationPipe(CreateAssignmentSchema)) body: z.infer<typeof CreateAssignmentSchema>
  ) {
    return this.svc.createAssignment(principal.orgId, principal.userId, body);
  }

  @Patch(':id/execute')
  async executeAssignment(
    @CurrentPrincipal() principal: Principal,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(ExecuteAssignmentSchema)) body: z.infer<typeof ExecuteAssignmentSchema>
  ) {
    return this.svc.executeAssignment(principal.orgId, id, body);
  }

  @Patch('executions/:id/sign')
  async signExecution(
    @CurrentPrincipal() principal: Principal,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(SignExecutionSchema)) body: z.infer<typeof SignExecutionSchema>
  ) {
    return this.svc.signExecution(principal.orgId, principal.userId, id, body);
  }
}
