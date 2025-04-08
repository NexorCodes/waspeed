import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const modelos = await prisma.modeloCRM.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({
      success: true,
      modelos
    });
    
  } catch (error) {
    console.error("Erro ao listar modelos:", error);
    return NextResponse.json({
      success: false,
      message: "Erro ao listar modelos CRM",
      error: String(error)
    }, { status: 500 });
  }
} 