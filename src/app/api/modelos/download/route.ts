import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({
        success: false,
        message: "ID do modelo é obrigatório"
      }, { status: 400 });
    }

    const modelo = await prisma.modeloCRM.findUnique({
      where: { id }
    });

    if (!modelo) {
      return NextResponse.json({
        success: false,
        message: "Modelo não encontrado"
      }, { status: 404 });
    }

    // Retornar o arquivo JSON diretamente do banco de dados
    return NextResponse.json({
      success: true,
      data: modelo.arquivo
    });
  } catch (error) {
    console.error("Erro ao baixar modelo:", error);
    return NextResponse.json({
      success: false,
      message: "Erro ao baixar modelo CRM",
      error: String(error)
    }, { status: 500 });
  }
} 