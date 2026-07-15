import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShiftStatus } from '@minetech/common';
import { Worker } from './worker.entity';
import { Shift } from './shift.entity';
import { CreateWorkerDto } from './create-worker.dto';

@Injectable()
export class WorkersService {
  constructor(
    @InjectRepository(Worker) private readonly workerRepo: Repository<Worker>,
    @InjectRepository(Shift) private readonly shiftRepo: Repository<Shift>,
  ) {}

  async create(tenantId: string, dto: CreateWorkerDto): Promise<Worker> {
    const worker = this.workerRepo.create({ ...dto, tenantId });
    return this.workerRepo.save(worker);
  }

  // Every query below filters by tenantId - never trust an id alone.
  async findAll(tenantId: string): Promise<Array<Worker & { onShift: boolean }>> {
    const workers = await this.workerRepo.find({ where: { tenantId }, order: { fullName: 'ASC' } });
    const openShifts = await this.shiftRepo.find({
      where: { tenantId, status: ShiftStatus.ON_SHIFT },
    });
    const onShiftWorkerIds = new Set(openShifts.map((shift) => shift.workerId));
    return workers.map((worker) => ({ ...worker, onShift: onShiftWorkerIds.has(worker.id) }));
  }

  async findOneOrThrow(tenantId: string, id: string): Promise<Worker> {
    const worker = await this.workerRepo.findOne({ where: { id, tenantId } });
    if (!worker) throw new NotFoundException('Worker not found');
    return worker;
  }

  async checkIn(tenantId: string, workerId: string): Promise<Shift> {
    await this.findOneOrThrow(tenantId, workerId);

    const openShift = await this.shiftRepo.findOne({
      where: { tenantId, workerId, status: ShiftStatus.ON_SHIFT },
    });
    if (openShift) throw new BadRequestException('Worker is already checked in');

    const shift = this.shiftRepo.create({
      tenantId,
      workerId,
      status: ShiftStatus.ON_SHIFT,
      checkInAt: new Date(),
      checkOutAt: null,
    });
    return this.shiftRepo.save(shift);
  }

  async checkOut(tenantId: string, workerId: string): Promise<Shift> {
    await this.findOneOrThrow(tenantId, workerId);

    const openShift = await this.shiftRepo.findOne({
      where: { tenantId, workerId, status: ShiftStatus.ON_SHIFT },
    });
    if (!openShift) throw new BadRequestException('Worker is not currently checked in');

    openShift.status = ShiftStatus.OFF_SHIFT;
    openShift.checkOutAt = new Date();
    return this.shiftRepo.save(openShift);
  }

  async countOnShift(tenantId: string): Promise<number> {
    return this.shiftRepo.count({ where: { tenantId, status: ShiftStatus.ON_SHIFT } });
  }
}
