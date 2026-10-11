import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../../database/database.module.js';
import { workOrders, assignments, executions } from '../../database/schema/assignments.js';

@Injectable()
export class AssignmentsService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async listWorkOrders(orgId: string) {
    return this.db.select().from(workOrders).where(eq(workOrders.orgId, orgId));
  }

  async createWorkOrder(orgId: string, data: any) {
    const [wo] = await this.db.insert(workOrders).values({
      orgId,
      farmId: data.farmId,
      code: data.code,
      plannedDate: data.plannedDate,
      operationType: data.operationType,
      notes: data.notes,
    }).returning();
    return wo;
  }

  async listAssignments(orgId: string) {
    return this.db.select().from(assignments).where(eq(assignments.orgId, orgId));
  }

  async createAssignment(orgId: string, supervisorId: string, data: any) {
    const [assignment] = await this.db.insert(assignments).values({
      orgId,
      workOrderId: data.workOrderId,
      plotId: data.plotId,
      assigneeId: data.assigneeId,
      supervisorId,
      assignedAreaHa: data.assignedAreaHa ? String(data.assignedAreaHa) : null,
    }).returning();
    return assignment;
  }

  async executeAssignment(orgId: string, assignmentId: string, data: any) {
    return await this.db.transaction(async (tx) => {
      await tx.update(assignments)
        .set({ status: 'COMPLETED', updatedAt: new Date() })
        .where(and(eq(assignments.id, assignmentId), eq(assignments.orgId, orgId)));
        
      const [execution] = await tx.insert(executions).values({
        orgId,
        assignmentId,
        executedAreaHa: String(data.executedAreaHa),
        status: 'FINALIZADO',
        notes: data.notes,
        endedAt: new Date(),
      }).returning();
      
      return execution;
    });
  }

  async signExecution(orgId: string, verifiedBy: string, executionId: string, data: any) {
    const [exec] = await this.db.update(executions)
      .set({
        status: 'FIRMADO',
        signatureUrl: data.signatureUrl,
        receiptUrl: data.receiptUrl,
        notes: data.notes,
        verifiedBy,
        updatedAt: new Date(),
      })
      .where(and(eq(executions.id, executionId), eq(executions.orgId, orgId)))
      .returning();
      
    if (!exec) throw new NotFoundException('Execution not found');
    return exec;
  }
}
