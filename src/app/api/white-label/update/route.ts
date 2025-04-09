import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      checkout,
      tutorial,
      webhook,
      cor_primaria,
      banner,
      status,
      install,
      uninstall,
      rewards
    } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'ID do White Label é obrigatório'
      }, { status: 400 });
    }

    const whiteLabel = await prisma.whiteLabel.update({
      where: {
        id
      },
      data: {
        checkout,
        tutorial,
        webhook,
        cor_primaria,
        banner,
        status,
        install,
        uninstall,
        rewards
      }
    });

    return NextResponse.json({
      success: true,
      whiteLabel
    });
  } catch (error) {
    console.error('Erro ao atualizar White Label:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro ao atualizar White Label'
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