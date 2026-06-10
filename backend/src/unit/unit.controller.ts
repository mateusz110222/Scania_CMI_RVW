import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UnitService } from './unit.service';

@Controller('units')
export class UnitController {
  constructor(readonly unitService: UnitService) {}

  @Get(':serialNumber/filter')
  filter(@Param('serialNumber') serialNumber: string) {
    return this.unitService.Filter(serialNumber);
  }

  @Get(':serialNumber')
  findOne(@Param('serialNumber') serialNumber: string) {
    return this.unitService.Find(serialNumber);
  }

  @Get(':serialNumber/status')
  getStatus(@Param('serialNumber') serialNumber: string) {
    return this.unitService.GetStatus(serialNumber);
  }

  @Get(':serialNumber/parent')
  getParent(@Param('serialNumber') serialNumber: string) {
    return this.unitService.GetParent(serialNumber);
  }

  @Get(':serialNumber/events')
  getEvents(@Param('serialNumber') serialNumber: string) {
    return this.unitService.GetEvents(serialNumber);
  }

  @Get(':serialNumber/children')
  getChildren(@Param('serialNumber') serialNumber: string) {
    return this.unitService.GetChildren(serialNumber);
  }

  @Get(':serialNumber/PerformHoldRouteCheck/:process')
  PerformHoldRouteCheck(
    @Param('serialNumber') serialNumber: string,
    @Param('process') process: string,
  ) {
    return this.unitService.PerformHoldRouteCheck(serialNumber, process);
  }

  @Post(':serialNumber/dataEntry')
  async DataEntry(
    @Param('serialNumber') serialNumber: string,
    @Body('process') process: string,
    @Body('station') station: string,
    @Body('dcstring') dcstring: string,
  ): Promise<any> {
    return await this.unitService.DataEntry(
      serialNumber,
      process,
      station,
      dcstring,
    );
  }

  @Get(':serialNumeber/find')
  async Find(@Param('serialNumeber') serialNumeber: string): Promise<any> {
    return await this.unitService.Find(serialNumeber);
  }
}
