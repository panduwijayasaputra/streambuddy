import { IoAdapter } from "@nestjs/platform-socket.io";
import { ServerOptions } from "socket.io";
import { ConfigService } from "@nestjs/config";

export class WebSocketAdapter extends IoAdapter {
  constructor(private configService: ConfigService) {
    super();
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const cors = {
      origin: this.configService.get("FRONTEND_URL", "http://localhost:3000"),
      credentials: true,
    };

    const optionsWithCORS: ServerOptions = {
      ...options,
      cors,
      transports: ["websocket", "polling"],
      allowEIO3: true,
    };

    return super.createIOServer(port, optionsWithCORS);
  }
}
