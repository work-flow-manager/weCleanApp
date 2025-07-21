    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.format(),
        },
        { status: 400 },
      );
    }