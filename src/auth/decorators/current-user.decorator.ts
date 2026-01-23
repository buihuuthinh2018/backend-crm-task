import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

/**
 * Usage:
 * @Post()
 * create(@Body() dto: CreateProjectDto, @CurrentUser() user: any) {
 *   return this.projectsService.create(dto, user.id);
 * }
 */
