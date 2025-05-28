import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
// import { GreetDto, UpdateGreetingDto } from './dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // @Post('greet')
  // postGreeting(@Body() body: GreetDto): any {
  //   return { message: `Hello, ${body.name}` };
  // }

  // @Put('update')
  // updateGreeting(@Body() body: UpdateGreetingDto): any {
  //   return { message: `Updated greeting to: ${body.newGreeting}` };
  // }
}
