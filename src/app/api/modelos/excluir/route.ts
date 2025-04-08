import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({
        success: false,
        message: "ID do modelo é obrigatório"
      }, { status: 400 });
    }
    
    // Verificar se o modelo existe
    const modeloExistente = await prisma.modeloCRM.findUnique({
      where: { id }
    });
    
    if (!modeloExistente) {
      return NextResponse.json({
        success: false,
        message: "Modelo não encontrado"
      }, { status: 404 });
    }
    
    // Excluir o modelo
    await prisma.modeloCRM.delete({
      where: { id }
    });
    
    return NextResponse.json({
      success: true,
      message: "Modelo excluído com sucesso"
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