import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';

const CHROME_WEBSTORE_API = 'https://clients2.google.com/service/update2/crx';
const DEFAULT_ICON_URL = 'https://watidy.vercel.app/_next/image?url=%2Flogo.png&w=256&q=75';
const EXTENSION_ID = 'balkfdkhbcjjmhndnblgmlmcabnapogp';


interface RequestBody {
  iconUrl?: string;
  urlReplacements?: Array<{
    old: string;
    new: string;
  }>;
  textReplacements?: Array<{
    old: string;
    new: string;
  }>;
}

interface ProcessingResult {
  success: boolean;
  data?: {
    buffer: Buffer;
    crxSize: number;
    zipSize: number;
    modifiedSize: number;
    modifications: Array<{
      file: string;
      replacements: string[];
    }>;
  };
  error?: string;
}

// Interface para o content_script do manifest
interface ContentScript {
  matches?: string[];
  css?: string[];
  js?: string[];
  run_at?: string;
}

async function downloadImage(url: string): Promise<Buffer> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Erro ao baixar imagem:', error);
    throw error;
  }
}

async function convertCrxToZip(crxBuffer: Buffer): Promise<Buffer> {
  const zipSignature = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
  let zipStartIndex = 0;

  for (let i = 0; i < crxBuffer.length - 4; i++) {
    if (crxBuffer[i] === zipSignature[0] &&
        crxBuffer[i + 1] === zipSignature[1] &&
        crxBuffer[i + 2] === zipSignature[2] &&
        crxBuffer[i + 3] === zipSignature[3]) {
      zipStartIndex = i;
      break;
    }
  }

  if (zipStartIndex === 0) {
    throw new Error('Assinatura ZIP não encontrada no arquivo CRX');
  }

  return crxBuffer.subarray(zipStartIndex);
}

async function modifyManifest(content: string): Promise<string> {
  try {
    const manifest = JSON.parse(content);
    
    // Remove update_url
    delete manifest.update_url;
    
    // Substitui WaSpeed por WaTurbo no nome e descrição
    if (manifest.name) {
      manifest.name = manifest.name.replace(/WaSpeed/g, 'WaTurbo');
    }
    if (manifest.description) {
      manifest.description = manifest.description.replace(/WaSpeed/g, 'WaTurbo');
    }

    // Atualiza o caminho do CSS nos content_scripts
    if (manifest.content_scripts && Array.isArray(manifest.content_scripts)) {
      manifest.content_scripts = manifest.content_scripts.map((script: ContentScript) => {
        if (script.css && Array.isArray(script.css)) {
          script.css = script.css.map((cssPath: string) => 
            cssPath.replace(/waspeed\.css/i, 'waturbo.css')
          );
        }
        return script;
      });
    }

    return JSON.stringify(manifest, null, 2);
  } catch (error) {
    console.error('Erro ao modificar manifest.json:', error);
    throw error;
  }
}

async function replaceIcon(zip: JSZip, modifications: Array<{ file: string; replacements: string[] }>, iconUrl: string): Promise<void> {
  const iconPath = 'label/icons/icon.png';
  
  if (zip.files[iconPath]) {
    try {

      const iconBuffer = await downloadImage(iconUrl);
      
      zip.file(iconPath, iconBuffer, { binary: true });
      
      modifications.push({
        file: iconPath,
        replacements: ['Ícone substituído por novo']
      });
    } catch (error) {
      console.error('Erro ao substituir ícone:', error);
      throw error;
    }
  } else {
    console.warn('Arquivo de ícone não encontrado em:', iconPath);
  }
}

async function modifyExtensionFiles(
  zipBuffer: Buffer, 
  iconUrl: string,
  urlReplacements: Array<{ old: string; new: string }>,
  textReplacements: Array<{ old: string; new: string }>
): Promise<{ buffer: Buffer; modifications: Array<{ file: string; replacements: string[] }> }> {
  const zip = new JSZip();
  const modifications: Array<{ file: string; replacements: string[] }> = [];
  
  await zip.loadAsync(zipBuffer);
  const files = Object.keys(zip.files);

  await replaceIcon(zip, modifications, iconUrl);
  
  const oldCssName = `${textReplacements[0].old.toLowerCase()}.css`;
  const newCssName = `${textReplacements[0].new.toLowerCase()}.css`;

  const cssFile = files.find(file => file.toLowerCase().includes(oldCssName.toLowerCase()));
  
  if (cssFile) {
    const cssDir = cssFile.substring(0, cssFile.lastIndexOf('/') + 1);
    const newCssPath = cssDir + newCssName;
    
    try {
      const cssContent = await zip.files[cssFile].async('text');
      zip.remove(cssFile);
      zip.file(newCssPath, cssContent);
      modifications.push({
        file: cssFile,
        replacements: [`Arquivo renomeado para ${newCssPath}`]
      });
    } catch (error) {
      console.error(`Erro ao processar arquivo CSS: ${error}`);
    }
  }
  
  for (const filePath of files) {
    try {
      const file = zip.files[filePath];
      if (!file || file.dir) continue;
      
      if (/\.(js|json|html|htm|css|txt)$/i.test(filePath)) {
        let content = await file.async('text');
        const fileModifications: string[] = [];
        
        if (filePath.toLowerCase() === 'manifest.json') {
          const oldContent = content;
          content = await modifyManifest(content);
          if (content !== oldContent) {
            fileModifications.push('Modificado manifest.json (update_url removido e nome atualizado)');
          }
        }
        
        for (const replacement of urlReplacements) {
          if (content.includes(replacement.old)) {
            content = content.replace(new RegExp(replacement.old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement.new);
            fileModifications.push(`${replacement.old} -> ${replacement.new}`);
          }
        }
        
        for (const replacement of textReplacements) {
          if (content.includes(replacement.old)) {
            content = content.replace(new RegExp(replacement.old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement.new);
            fileModifications.push(`${replacement.old} -> ${replacement.new}`);
          }
        }
        
        if (fileModifications.length > 0) {
          zip.file(filePath, content);
          modifications.push({
            file: filePath,
            replacements: fileModifications
          });
        }
      }
    } catch (error) {
      console.error(`Erro ao processar arquivo ${filePath}: ${error}`);
    }
  }
  
  const buffer = await zip.generateAsync({ type: 'nodebuffer' });
  return { buffer, modifications };
}

async function downloadAndConvertExtension(
  extensionId: string, 
  iconUrl: string,
  urlReplacements: Array<{ old: string; new: string }>,
  textReplacements: Array<{ old: string; new: string }>
): Promise<ProcessingResult> {
  try {
    const downloadUrl = `${CHROME_WEBSTORE_API}?response=redirect&prodversion=135.0.0.0&x=id%3D${extensionId}%26installsource%3Dondemand%26uc&nacl_arch=x86-64&acceptformat=crx2,crx3`;

    const response = await fetch(downloadUrl, {
      headers: {
        'accept': '*/*',
        'accept-language': 'pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'cache-control': 'no-cache',
        'pragma': 'no-cache',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'none'
      }
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Falha ao baixar a extensão. Status: ${response.status}`
      };
    }

    const crxBuffer = Buffer.from(await response.arrayBuffer());
    const zipBuffer = await convertCrxToZip(crxBuffer);
    const { buffer: modifiedBuffer, modifications } = await modifyExtensionFiles(
      zipBuffer, 
      iconUrl,
      urlReplacements,
      textReplacements
    );

    return {
      success: true,
      data: {
        buffer: modifiedBuffer,
        crxSize: crxBuffer.length,
        zipSize: zipBuffer.length,
        modifiedSize: modifiedBuffer.length,
        modifications
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao processar extensão'
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    
    const iconUrl = body.iconUrl || DEFAULT_ICON_URL;
    const urlReplacements = body.urlReplacements || [];
    const textReplacements = body.textReplacements || [];

    const result = await downloadAndConvertExtension(
      EXTENSION_ID,
      iconUrl,
      urlReplacements,
      textReplacements
    );

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.error || 'Erro desconhecido' },
        { status: 500 }
      );
    }

    if (result.data.modifications.length === 0) {
      return NextResponse.json({
        warning: 'Nenhuma modificação realizada',
        stats: {
          crxSize: result.data.crxSize,
          zipSize: result.data.zipSize
        }
      });
    }

    return new NextResponse(result.data.buffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${EXTENSION_ID}_modified.zip"`,
        'Cache-Control': 'no-cache',
        'X-Processing-Stats': JSON.stringify({
          crxSize: result.data.crxSize,
          zipSize: result.data.zipSize,
          modifiedSize: result.data.modifiedSize,
          modifications: result.data.modifications
        })
      }
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        success: false 
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