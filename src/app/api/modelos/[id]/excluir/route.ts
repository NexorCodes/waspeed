import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Verificar se modelo existe
    const modeloExistente = await prisma.modeloCRM.findUnique({
      where: { id }
    });
    
    if (!modeloExistente) {
      return NextResponse.json({
        success: false,
        message: "Modelo não encontrado"
      }, { status: 404 });
    }
    
    // Excluir modelo
    await prisma.modeloCRM.delete({
      where: { id }
    });
    
    return NextResponse.json({
      success: true,
      message: "Modelo CRM excluído com sucesso"
    });
    
  } catch (error) {
    console.error("Erro ao excluir modelo:", error);
    return NextResponse.json({
      success: false,
      message: "Erro ao excluir modelo CRM",
      error: String(error)
    }, { status: 500 });
  }
} 