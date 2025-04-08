import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validar dados
    if (!data.nome || !data.arquivo) {
      return NextResponse.json({
        success: false,
        message: "Nome e arquivo são obrigatórios"
      }, { status: 400 });
    }
    
    // Criar modelo diretamente no banco de dados
    const modelo = await prisma.modeloCRM.create({
      data: {
        nome: data.nome,
        arquivo: data.arquivo, // JSON do modelo como string
        descricao: data.descricao || ""
      }
    });
    
    return NextResponse.json({
      success: true,
      message: "Modelo CRM criado com sucesso",
      modelo
    });
    
  } catch (error) {
    console.error("Erro ao criar modelo:", error);
    return NextResponse.json({
      success: false,
      message: "Erro ao criar modelo CRM",
      error: String(error)
    }, { status: 500 });
  }
} 