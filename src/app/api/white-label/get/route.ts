import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wl_id = searchParams.get('wl_id');

    if (!wl_id) {
      return NextResponse.json({
        success: false,
        message: 'ID do White Label é obrigatório'
      }, { status: 400 });
    }

    const whiteLabel = await prisma.whiteLabel.findUnique({
      where: {
        id: wl_id
      }
    });

    if (!whiteLabel) {
      return NextResponse.json({
        success: false,
        message: 'White Label não encontrado'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      whiteLabel
    });
  } catch (error) {
    console.error('Erro ao buscar White Label:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro ao buscar White Label'
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