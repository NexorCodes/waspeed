import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email, nome, telefone, expirationDate } = body;

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID do usuário é obrigatório' 
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        email,
        nome,
        telefone,
        expirationDate: expirationDate ? new Date(expirationDate) : null
      }
    });

    return NextResponse.json({ 
      success: true, 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erro ao atualizar usuário' 
    });
  }
} 