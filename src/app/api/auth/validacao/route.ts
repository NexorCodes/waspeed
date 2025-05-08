import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'meu_jwt_secret_aqui';

interface ValidationRequest {
  email: string;
  token: string;
  chromeStoreID: string;
}

interface JWTPayload {
  userId: string;
  email: string;
  nome: string;
  telefone: string;
  wl_id: string;
  expirationDate?: Date;
  iat?: number;
  exp?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: ValidationRequest = await request.json();
    const { email, token, chromeStoreID } = body;

    const whiteLabel = await prisma.whiteLabel.findUnique({
      where: {
        id: chromeStoreID
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

      if (decoded.email !== email || decoded.wl_id !== chromeStoreID) {
        return NextResponse.json({
          error: {},
          activeWL: true
        });
      }

      const user = await prisma.user.findFirst({
        where: {
          email: email,
          wl_id: chromeStoreID
        }
      });

      if (!user) {
        return NextResponse.json({
          error: {},
          activeWL: true
        });
      }

      if (user.expirationDate && new Date() > user.expirationDate) {
        return NextResponse.json({
          error: {
            message: "Sua conta expirou. Entre em contato com o administrador."
          },
          activeWL: true
        });
      }

      return NextResponse.json({ success: true });

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