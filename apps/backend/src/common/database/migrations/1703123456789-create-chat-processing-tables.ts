import { MigrationInterface, QueryRunner, Table, Index } from "typeorm";

export class CreateChatProcessingTables1703123456789
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create stream_chat_messages table (renamed to avoid conflict)
    await queryRunner.createTable(
      new Table({
        name: "stream_chat_messages",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "uuid_generate_v4()",
          },
          {
            name: "stream_session_id",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "platform",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "user_id",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "username",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "message",
            type: "text",
            isNullable: false,
          },
          {
            name: "response",
            type: "text",
            isNullable: true,
          },
          {
            name: "status",
            type: "varchar",
            default: "'pending'",
            isNullable: false,
          },
          {
            name: "metadata",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "processed_at",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
        ],
      }),
      true
    );

    // Create indexes for stream_chat_messages
    await queryRunner.query(
      "CREATE INDEX idx_stream_chat_messages_stream_session_id ON stream_chat_messages (stream_session_id);"
    );
    await queryRunner.query(
      "CREATE INDEX idx_stream_chat_messages_platform ON stream_chat_messages (platform);"
    );
    await queryRunner.query(
      "CREATE INDEX idx_stream_chat_messages_user_id ON stream_chat_messages (user_id);"
    );
    await queryRunner.query(
      "CREATE INDEX idx_stream_chat_messages_status ON stream_chat_messages (status);"
    );
    await queryRunner.query(
      "CREATE INDEX idx_stream_chat_messages_created_at ON stream_chat_messages (created_at);"
    );

    // Create response_templates table
    await queryRunner.createTable(
      new Table({
        name: "response_templates",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "uuid_generate_v4()",
          },
          {
            name: "game_context",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "keywords",
            type: "text",
            isArray: true,
            isNullable: false,
          },
          {
            name: "response",
            type: "text",
            isNullable: false,
          },
          {
            name: "priority",
            type: "integer",
            default: 1,
            isNullable: false,
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
            isNullable: false,
          },
          {
            name: "metadata",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
        ],
      }),
      true
    );

    // Create indexes for response_templates
    await queryRunner.query(
      "CREATE INDEX idx_response_templates_game_context ON response_templates (game_context);"
    );
    await queryRunner.query(
      "CREATE INDEX idx_response_templates_priority ON response_templates (priority);"
    );
    await queryRunner.query(
      "CREATE INDEX idx_response_templates_is_active ON response_templates (is_active);"
    );

    // Create game_knowledge table
    await queryRunner.createTable(
      new Table({
        name: "game_knowledge",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "uuid_generate_v4()",
          },
          {
            name: "game_context",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "terminology",
            type: "text",
            isArray: true,
            isNullable: false,
          },
          {
            name: "build_recommendations",
            type: "jsonb",
            isNullable: false,
          },
          {
            name: "meta_information",
            type: "jsonb",
            isNullable: false,
          },
          {
            name: "metadata",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
        ],
      }),
      true
    );

    // Create indexes for game_knowledge
    await queryRunner.query(
      "CREATE INDEX idx_game_knowledge_game_context ON game_knowledge (game_context);"
    );

    // Create trigger to update updated_at timestamp
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create triggers for all tables
    await queryRunner.query(`
      CREATE TRIGGER update_stream_chat_messages_updated_at 
        BEFORE UPDATE ON stream_chat_messages 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_response_templates_updated_at 
        BEFORE UPDATE ON response_templates 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_game_knowledge_updated_at 
        BEFORE UPDATE ON game_knowledge 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    await queryRunner.query(
      "DROP TRIGGER IF EXISTS update_stream_chat_messages_updated_at ON stream_chat_messages;"
    );
    await queryRunner.query(
      "DROP TRIGGER IF EXISTS update_response_templates_updated_at ON response_templates;"
    );
    await queryRunner.query(
      "DROP TRIGGER IF EXISTS update_game_knowledge_updated_at ON game_knowledge;"
    );

    // Drop function
    await queryRunner.query(
      "DROP FUNCTION IF EXISTS update_updated_at_column();"
    );

    // Drop tables
    await queryRunner.dropTable("game_knowledge");
    await queryRunner.dropTable("response_templates");
    await queryRunner.dropTable("stream_chat_messages");
  }
}
