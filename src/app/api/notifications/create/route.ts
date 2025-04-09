import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wl_id, title, viewer, client, type, statement, link, btnName } = body;

    if (!wl_id || !title || !statement) {
      return NextResponse.json(
        {
          success: false,
          message: 'Campos obrigatórios não fornecidos'
        },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        wl_id,
        title,
        viewer,
        client,
        type,
        statement,
        link,
        btnName,
        data: BigInt(Date.now()) // Convertendo para BigInt
      }
    });

    // Convertendo o BigInt para string na resposta
    const serializedNotification = {
      ...notification,
      data: notification.data.toString()
    };

    return NextResponse.json({
      success: true,
      message: 'Notificação criada com sucesso',
      notification: serializedNotification
    });

  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao criar notificação',
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
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