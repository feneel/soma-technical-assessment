import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkCircularDependency } from '@/lib/utils';

interface Params {
  params: {
    id: string;
  };
}

export async function DELETE(request: Request, { params }: Params) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    await prisma.todo.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Todo deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting todo' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const taskId = parseInt(params.id);
  const { dependsOnId } = await req.json();

  if (taskId === dependsOnId) {
    return NextResponse.json(
      { error: "Task cannot depend on itself!" },
      { status: 400 }
    );
  }

  const isCircular = await checkCircularDependency(dependsOnId, taskId);
  if (isCircular) {
    return NextResponse.json(
      { error: "Circular dependency detected" },
      { status: 400 }
    );
  }

  try {
    await prisma.taskDependency.create({
      data: {
        taskId,
        dependsOnId,
      },
    });

    return NextResponse.json({ message: "Dependency added!" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Error adding dependency." },
      { status: 500 }
    );
  }
}