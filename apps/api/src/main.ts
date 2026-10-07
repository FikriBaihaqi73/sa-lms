import * as dotenv from "dotenv";

dotenv.config();

import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { apiReference } from "@scalar/nestjs-api-reference";
import compression from "compression";
import { Request, Response } from "express";
import helmet from "helmet";
import { cleanupOpenApiDoc, ZodValidationPipe } from "nestjs-zod";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security & Optimization
  app.enableCors();
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );
  app.use(compression());

  // Global Validation
  app.useGlobalPipes(new ZodValidationPipe());

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle("Boilerplate API")
    .setDescription("API Documentation for Boilerplate Backend")
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "Authorization",
        description: "Enter JWT token",
        in: "header",
      },
      "JWT-auth",
    )
    .build();

  const rawDocument = SwaggerModule.createDocument(app, config);
  const document = cleanupOpenApiDoc(rawDocument);

  // Serve OpenAPI JSON
  app.getHttpAdapter().get("/api-json", (_req: Request, res: Response) => {
    (res as Response & { json: (body: unknown) => void }).json(document);
  });

  // Serve Scalar API Reference UI
  app.use(
    "/api",
    apiReference({
      spec: {
        content: document,
      },
    }),
  );

  const rawPort = process.env.PORT;
  const parsedPort = rawPort ? Number(rawPort) : Number.NaN;
  const port =
    Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 5001;

  // Bind tanpa host eksplisit -> Node memakai dual-stack ("::" dengan
  // ipv6Only=false), sehingga endpoint terjangkau lewat 127.0.0.1 (IPv4)
  // maupun ::1 (IPv6). Jika di-bind ke "localhost", Node hanya mengambil satu
  // hasil resolusi (bisa jadi ::1 saja) dan browser yang me-resolve localhost
  // ke IPv4 akan gagal dengan "Failed to fetch".
  await app.listen(port);
  console.log(
    `Application is running on: http://localhost:${port}/api (dual-stack IPv4+IPv6)`,
  );
}
bootstrap();
