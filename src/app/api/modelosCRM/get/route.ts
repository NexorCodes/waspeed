import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const modelos = await prisma.modeloCRM.findMany({
      select: {
        id: true,
        nome: true,
        arquivo: true,
        descricao: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "Modelos capturados",
      modelos: modelos
    });
  } catch (error) {
    console.error('Erro ao buscar modelos:', error);
    return NextResponse.json({
      success: false,
      message: "Erro ao buscar modelos",
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