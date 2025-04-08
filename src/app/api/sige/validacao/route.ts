import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'meu_jwt_secret_aqui';

interface ValidationRequest {
  form: {
    email: string;
    token: string;
    labelID: string;
  };
}

interface JWTPayload {
  userId: string;
  email: string;
  nome: string;
  telefone: string;
  wl_id: string;
  iat?: number;
  exp?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: ValidationRequest = await request.json();
    const { email, token, labelID } = body.form;

    const whiteLabel = await prisma.whiteLabel.findUnique({
      where: {
        id: labelID
      }
    });

    if (!whiteLabel || whiteLabel.status !== 'ACTIVE') {
      return NextResponse.json({
        error: {},
        activeWL: false
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

      if (decoded.email !== email || decoded.wl_id !== labelID) {
        return NextResponse.json({
          error: {},
          activeWL: true
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
          error: {},
          activeWL: true
        });
      }

      return NextResponse.json({
        result: {
          retorno: 1,
          id_status: 1,
          token: token,
          id_white_label: "5",
          white_label: "",
          mensagem: "Logado com sucesso."
        },
        activeWL: true
      });

    } catch (err) {
      console.error('Erro na validação:', err);
      return NextResponse.json({
        error: {},
        activeWL: true
      });
    }

  } catch (error) {
    console.error('Erro na validação:', error);
    return NextResponse.json({
      error: {},
      activeWL: true
    });
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