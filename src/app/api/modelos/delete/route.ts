import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID do modelo é obrigatório' 
      });
    }

    const deletedModelo = await prisma.modeloCRM.delete({
      where: { id }
    });

    return NextResponse.json({ 
      success: true, 
      modelo: deletedModelo 
    });
  } catch (error) {
    console.error('Erro ao excluir modelo:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erro ao excluir modelo' 
    });
  }
} 