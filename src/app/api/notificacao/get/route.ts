import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wl_id = searchParams.get('wl_id');

    if (!wl_id) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID da white label não fornecido'
        },
        { status: 400 }
      );
    }

    const whiteLabel = await prisma.whiteLabel.findUnique({
      where: {
        id: wl_id
      }
    });

    if (!whiteLabel) {
      return NextResponse.json(
        {
          success: false,
          message: 'White label não encontrada'
        },
        { status: 404 }
      );
    }

    const notifications = await prisma.notification.findMany({
      where: {
        wl_id: wl_id
      },
      orderBy: {
        data: 'desc'
      }
    });

    // Convert BigInt to string for JSON serialization
    const serializedNotifications = notifications.map(notification => ({
      ...notification,
      data: notification.data.toString()
    }));

    return NextResponse.json({
      success: true,
      message: 'Notificações capturas',
      notificacoes: serializedNotifications
    });

  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
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
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
} 