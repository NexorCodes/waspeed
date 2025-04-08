import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wl_id = searchParams.get('wl_id');

    if (!wl_id) {
      return NextResponse.json({
        success: false,
        message: "ID do White Label é obrigatório"
      }, { status: 400 });
    }

    const users = await prisma.user.findMany({
      where: {
        wl_id: wl_id
      },
      select: {
        id: true,
        email: true,
        nome: true,
        telefone: true,
        wl_id: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "Usuários encontrados",
      users
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({
      success: false,
      message: "Erro ao buscar usuários",
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
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
} 