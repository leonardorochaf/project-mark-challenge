import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  use(req: Request & { user?: User }, res: Response, next: NextFunction): void {
    const startTime = Date.now();

    const originalSend = res.send.bind(res);
    let responseBody: any;

    res.send = (body: any) => {
      responseBody = body;
      return originalSend(body);
    };

    res.on('finish', () => {
      const timeTaken = Date.now() - startTime;
      const userId = req.user?.id;

      if (res.statusCode >= 400) {
        this.logger.error({
          message: 'Request Failed',
          requestBody: this.redactBodyFields(req.body),
          responseBody: this.redactBodyFields(
            this.parseResponseBody(responseBody),
          ),
          responseTime: `${timeTaken}ms`,
          userId,
        });
      } else {
        this.logger.log({
          message: 'Request Successful',
          requestBody: this.redactBodyFields(req.body),
          responseBody: this.redactBodyFields(
            this.parseResponseBody(responseBody),
          ),
          responseTime: `${timeTaken}ms`,
          userId,
        });
      }
    });

    next();
  }

  private redactBodyFields(data: any) {
    if (!data) return data;

    const sensitiveFields = ['password', 'passwordHash', 'token'];

    if (Array.isArray(data)) {
      return data.map((item) => this.redactBodyFields(item));
    }

    if (typeof data === 'object') {
      const clonedData = { ...data };
      for (const field of sensitiveFields) {
        if (clonedData[field]) {
          clonedData[field] = '[Redacted]';
        }
      }

      for (const key in clonedData) {
        if (typeof clonedData[key] === 'object' && clonedData[key] !== null) {
          clonedData[key] = this.redactBodyFields(clonedData[key]);
        }
      }

      return clonedData;
    }

    return data;
  }

  private parseResponseBody(body: any) {
    try {
      if (typeof body === 'string') {
        return JSON.parse(body);
      }
    } catch {}
    return body;
  }
}
