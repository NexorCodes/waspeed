import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID do usuário é obrigatório' 
      });
    }

    const deletedUser = await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ 
      success: true, 
      user: deletedUser 
    });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erro ao excluir usuário' 
    });
  }
} 