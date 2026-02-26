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
        Branch: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Computer Science" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Degree: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "B.Tech" },
            semesters: { type: "integer", example: 8 },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Subject: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Data Structures" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Note: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            title: { type: "string", example: "Unit 1 Notes" },
            description: { type: "string", nullable: true },
            fileUrl: { type: "string", example: "https://res.cloudinary.com/..." },
            semester: { type: "integer", example: 3 },
            degreeBranchSubjectId: { type: "integer", example: 42 },
            isPublished: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        PYQPaper: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            title: { type: "string", example: "End Semester 2023" },
            description: { type: "string", nullable: true },
            fileUrl: { type: "string", example: "https://res.cloudinary.com/..." },
            examYear: { type: "integer", example: 2023 },
            semester: { type: "integer", example: 3 },
            isSolution: { type: "boolean", example: false },
            isPublished: { type: "boolean", example: true },
            degreeBranchSubjectId: { type: "integer", example: 42 },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Playcircle: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            title: { type: "string", example: "Data Structures Full Course" },
            description: { type: "string", nullable: true },
            playlistUrl: { type: "string", example: "https://youtube.com/playlist?list=..." },
            semester: { type: "integer", example: 3 },
            degreeBranchSubjectId: { type: "integer", example: 42 },
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
