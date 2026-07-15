import { All, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import axios, { AxiosError } from 'axios';
import { JwtAuthGuard } from '@minetech/common';

/**
 * A genuinely dumb proxy: no business logic lives here. It forwards the
 * raw request body (JSON, or multipart with an incident photo, whatever
 * the caller sends) straight through to core-service and streams the
 * response back untouched. bodyParser is disabled app-wide (see main.ts)
 * so the request stream is still intact when it reaches here.
 */
@Controller()
export class ProxyController {
  private readonly coreServiceUrl: string;

  constructor(private readonly config: ConfigService) {
    this.coreServiceUrl = this.config.get<string>('coreServiceUrl')!;
  }

  // Public: no token exists yet at login time.
  @Post('auth/login')
  async login(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, '/auth/login');
  }

  // Everything else requires a valid bearer token before we even proxy.
  @UseGuards(JwtAuthGuard)
  @All('api/*')
  async proxy(@Req() req: Request, @Res() res: Response) {
    const targetPath = req.originalUrl.replace(/^\/api/, '');
    return this.forward(req, res, targetPath);
  }

  private async forward(req: Request, res: Response, targetPath: string) {
    const url = `${this.coreServiceUrl}${targetPath}`;
    const headers = { ...req.headers };
    delete headers.host;
    delete headers['content-length'];

    try {
      const upstream = await axios({
        method: req.method as any,
        url,
        headers,
        data: ['GET', 'HEAD'].includes(req.method) ? undefined : req,
        responseType: 'stream',
        validateStatus: () => true,
      });

      res.status(upstream.status);
      for (const [key, value] of Object.entries(upstream.headers)) {
        if (value !== undefined) res.setHeader(key, value as string);
      }
      upstream.data.pipe(res);
    } catch (err) {
      const axiosErr = err as AxiosError;
      res.status(502).json({
        statusCode: 502,
        message: `core-service unreachable: ${axiosErr.message}`,
      });
    }
  }
}
