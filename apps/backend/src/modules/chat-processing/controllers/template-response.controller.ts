import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { TemplateResponseService } from "../services/template-response.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ResponseTemplate } from "../entities/response-template.entity";

@Controller("chat-processing/templates")
export class TemplateResponseController {
  constructor(
    private readonly templateResponseService: TemplateResponseService,
    @InjectRepository(ResponseTemplate)
    private readonly responseTemplateRepository: Repository<ResponseTemplate>
  ) {}

  @Get()
  async listTemplates(@Query("gameContext") gameContext?: string) {
    if (gameContext) {
      return this.responseTemplateRepository.find({ where: { gameContext } });
    }
    return this.responseTemplateRepository.find();
  }

  @Get(":id")
  async getTemplate(@Param("id") id: string) {
    const template = await this.responseTemplateRepository.findOne({
      where: { id },
    });
    if (!template) throw new NotFoundException("Template not found");
    return template;
  }

  @Post()
  async createTemplate(@Body() dto: Partial<ResponseTemplate>) {
    if (!dto.keywords || !dto.response || !dto.gameContext) {
      throw new BadRequestException(
        "Missing required fields: keywords, response, gameContext"
      );
    }
    const template = this.responseTemplateRepository.create(dto);
    return this.responseTemplateRepository.save(template);
  }

  @Put(":id")
  async updateTemplate(
    @Param("id") id: string,
    @Body() dto: Partial<ResponseTemplate>
  ) {
    const template = await this.responseTemplateRepository.findOne({
      where: { id },
    });
    if (!template) throw new NotFoundException("Template not found");
    Object.assign(template, dto);
    return this.responseTemplateRepository.save(template);
  }

  @Delete(":id")
  async deleteTemplate(@Param("id") id: string) {
    const template = await this.responseTemplateRepository.findOne({
      where: { id },
    });
    if (!template) throw new NotFoundException("Template not found");
    await this.responseTemplateRepository.remove(template);
    return { deleted: true };
  }

  @Get("/validate/all")
  async validateAllTemplates() {
    return this.templateResponseService.validateTemplates();
  }
}
