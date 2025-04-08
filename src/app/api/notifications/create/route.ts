import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wl_id, title, viewer, client, type, statement, link, btnName } = body;

    // Validação dos campos obrigatórios
    if (!wl_id || !title || !viewer || !client || !type || !statement || !link || !btnName) {
      return NextResponse.json({
        success: false,
        message: "Todos os campos são obrigatórios"
      }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        wl_id,
        data: Date.now(),
        title,
        viewer,
        client,
        type,
        statement,
        link,
        btnName
      }
    });

    return NextResponse.json({
      success: true,
      message: "Notificação criada com sucesso",
      notification
    });
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return NextResponse.json({
      success: false,
      message: "Erro ao criar notificação",
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
} 