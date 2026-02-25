import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Prep Shelf API",
      version: "1.0.0",
      description:
        "API for Prep Shelf — a study help platform providing PYQ papers, notes, and assignments with anonymous contribution support.",
    },
    servers: [
      {
        url: "/api",
        description: "API base path",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        AdminLoginBody: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "admin@prepshelf.com" },
            password: { type: "string", example: "your-password" },
          },
        },
        AdminLoginResponse: {
          type: "object",
          properties: {
            token: { type: "string" },
            user: {
              type: "object",
              properties: {
                id: { type: "integer" },
                email: { type: "string" },
                name: { type: "string" },
              },
            },
          },
        },
        ApiError: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
        MessageResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
        Note: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            title: { type: "string", example: "Operating Systems Unit 3 Notes" },
            description: { type: "string", nullable: true, example: "Covers process scheduling and memory management" },
            degreeBranchSubjectId: { type: "integer", example: 5 },
            semester: { type: "integer", example: 3 },
            fileUrl: { type: "string", example: "https://res.cloudinary.com/example/notes.pdf" },
            isPublished: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Playcircle: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            title: { type: "string", example: "OS Playlist - Process Scheduling" },
            description: { type: "string", nullable: true, example: "Full playlist covering unit 3 concepts" },
            playlistUrl: { type: "string", example: "https://youtube.com/playlist?list=abc123" },
            degreeBranchSubjectId: { type: "integer", example: 5 },
            semester: { type: "integer", example: 3 },
            isPublished: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
  },
  apis: ["./src/**/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
