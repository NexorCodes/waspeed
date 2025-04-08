import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
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
      modelo
    });
    
  } catch (error) {
    console.error("Erro ao buscar modelo:", error);
    return NextResponse.json({
      success: false,
      message: "Erro ao buscar modelo CRM",
      error: String(error)
    }, { status: 500 });
  }
} 