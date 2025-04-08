import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();
    
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
    
    // Atualizar modelo
    const modeloAtualizado = await prisma.modeloCRM.update({
      where: { id },
      data: {
        nome: data.nome !== undefined ? data.nome : undefined,
        descricao: data.descricao !== undefined ? data.descricao : undefined,
        arquivo: data.arquivo !== undefined ? data.arquivo : undefined,
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json({
      success: true,
      message: "Modelo CRM atualizado com sucesso",
      modelo: modeloAtualizado
    });
    
  } catch (error) {
    console.error("Erro ao atualizar modelo:", error);
    return NextResponse.json({
      success: false,
      message: "Erro ao atualizar modelo CRM",
      error: String(error)
    }, { status: 500 });
  }
} 