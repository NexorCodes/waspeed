import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const modelos = await prisma.modeloCRM.findMany({
      orderBy: {
        nome: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: modelos
    });
  } catch (error) {
    console.error("Erro ao buscar modelos:", error);
    return NextResponse.json({
      success: false,
      message: "Erro ao buscar modelos CRM",
      error: String(error)
    }, { status: 500 });
  }
}

// Endpoint para obter um modelo específico por ID
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

    return NextResponse.json({
      success: true,
      data: modelo
    });
  } catch (error) {
    console.error("Erro ao buscar modelo específico:", error);
    return NextResponse.json({
      success: false,
      message: "Erro ao buscar modelo CRM",
      error: String(error)
    }, { status: 500 });
  }
} 