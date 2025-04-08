import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, senha, nome, telefone, wl_id } = body;

    // Validação dos campos obrigatórios
    if (!email || !senha || !nome || !telefone || !wl_id) {
      return NextResponse.json({
        success: false,
        message: "Todos os campos são obrigatórios"
      }, { status: 400 });
    }

    // Verifica se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "Email já cadastrado"
      }, { status: 400 });
    }

    // Verifica se o White Label existe
    const whiteLabel = await prisma.whiteLabel.findUnique({
      where: { id: wl_id }
    });

    if (!whiteLabel) {
      return NextResponse.json({
        success: false,
        message: "White Label não encontrado"
      }, { status: 400 });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    const user = await prisma.user.create({
      data: {
        email,
        senha: hashedPassword,
        nome,
        telefone,
        wl_id
      }
    });

    // Remove a senha do retorno
    const { senha: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      message: "Usuário criado com sucesso",
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json({
      success: false,
      message: "Erro ao criar usuário",
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
} 