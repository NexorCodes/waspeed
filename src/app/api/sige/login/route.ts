import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET;

interface LoginRequest {
  form: {
    email: string;
    senha: string;
    labelID: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, senha, labelID } = body.form;

    const whiteLabel = await prisma.whiteLabel.findUnique({
      where: {
        id: labelID
      }
    });

    if (!whiteLabel) {
      return NextResponse.json({
        success: false,
        activeWL: false,
        message: "White label não encontrada"
      });
    }

    if (whiteLabel.status !== 'ACTIVE') {
      return NextResponse.json({
        success: false,
        activeWL: false,
        message: "White label inativa"
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        email: email,
        wl_id: labelID
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        activeWL: true,
        message: "Usuário não encontrado"
      });
    }

    const senhaCorreta = await bcrypt.compare(senha, user.senha);
    if (!senhaCorreta) {
      return NextResponse.json({
        success: false,
        activeWL: true,
        message: "Senha incorreta"
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        nome: user.nome,
        telefone: user.telefone,
        wl_id: user.wl_id
      },
      JWT_SECRET || 'meu_jwt_secret_aqui',
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      activeWL: true,
      message: "Logado com sucesso.",
      token: token
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      {
        success: false,
        activeWL: true,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
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