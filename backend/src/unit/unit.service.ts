import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UnitService {
  constructor(private readonly httpService: HttpService) {}

  private static readonly BASE_URL =
    'http://10.142.11.20/custom//matz/phpBB/router.php';

  async Find(SerialNumber: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post(UnitService.BASE_URL + '?job=UnitFind', {
        Unit: SerialNumber,
      }),
    );

    return response.data;
  }

  async Filter(SerialNumber: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post(UnitService.BASE_URL + '?job=UnitFilter', {
        Unit: SerialNumber,
      }),
    );

    return response.data;
  }
  async GetStatus(SerialNumber: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post(UnitService.BASE_URL + '?job=UnitGetStatus', {
        Unit: SerialNumber,
      }),
    );

    return response.data;
  }
  async GetEvents(SerialNumber: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post(UnitService.BASE_URL + '?job=GetEvents', {
        Unit: SerialNumber,
        Order: 1,
      }),
    );

    return response.data;
  }

  async GetParent(SerialNumber: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post(UnitService.BASE_URL + '?job=GetParent', {
        Unit: SerialNumber,
      }),
    );

    return response.data;
  }

  async PerformHoldRouteCheck(
    SerialNumber: string,
    Process: string,
  ): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post(
        UnitService.BASE_URL + '?job=PerformHoldRouteCheck',
        {
          Unit: SerialNumber,
          Process: Process,
        },
      ),
    );

    return response.data;
  }

  async GetChildren(SerialNumber: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post(UnitService.BASE_URL + '?job=GetChildren', {
        Unit: SerialNumber,
      }),
    );

    return response.data;
  }

  async DataEntry(
    SerialNumber: string,
    Process: string,
    Station: string,
    Dcstring: string,
  ): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post(UnitService.BASE_URL + '?job=UnitDataEntry', {
        Unit: SerialNumber,
        Process: Process,
        Station: Station,
        DcString: Dcstring,
      }),
    );

    return response.data;
  }
}
