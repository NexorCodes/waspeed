import { NextRequest, NextResponse } from 'next/server';

const CHROME_STORE_API = 'https://chrome.google.com/webstore/detail';
const EXTENSION_ID = 'balkfdkhbcjjmhndnblgmlmcabnapogp';

async function getExtensionInfo() {
  try {
    const response = await fetch(`${CHROME_STORE_API}/${EXTENSION_ID}`);
    
    if (!response.ok) {
      throw new Error('Extensão não encontrada na Chrome Web Store');
    }

    const html = await response.text();

    console.log(html);

    // Extrai a versão do HTML da página
    const versionMatch = html.match(/"version":\s*"([^"]+)"/);
    const nameMatch = html.match(/"name":\s*"([^"]+)"/);
    
    if (!versionMatch) {
      throw new Error('Não foi possível encontrar a versão da extensão');
    }

    return {
      version: versionMatch[1],
      name: nameMatch ? nameMatch[1] : 'Unknown',
      storeUrl: `https://chrome.google.com/webstore/detail/${EXTENSION_ID}`,
      EXTENSION_ID
    };
  } catch (error) {
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const extensionId = searchParams.get('id');

    if (!extensionId) {
      return NextResponse.json(
        { error: 'ID da extensão não fornecido' },
        { status: 400 }
      );
    }

    const extensionInfo = await getExtensionInfo();

    return NextResponse.json({
      success: true,
      data: extensionInfo,
      checkedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao verificar extensão:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao verificar a extensão';
    const isNotFound = errorMessage.includes('não encontrada');
    
    return NextResponse.json(
      { 
        error: errorMessage,
        success: false 
      },
      { status: isNotFound ? 404 : 500 }
    );
  }
}

// Habilita CORS
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
} 