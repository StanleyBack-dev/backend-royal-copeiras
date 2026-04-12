export const getWelcomeEmailTemplate = (name: string) => {
    const appUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const firstName = name.split(' ')[0];

    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo ao FitPulse</title>
    <style>
        body { margin: 0; padding: 0; background-color: #f4f4f7; font-family: 'Arial', sans-serif; color: #e5e5e5; }
        table { border-spacing: 0; }
        td { padding: 0; }
        img { border: 0; }
        
        @media only screen and (max-width: 600px) {
        .container { width: 100% !important; padding: 20px !important; }
        .content { padding: 20px !important; }
        }
    </style>
    </head>
    <body style="background-color: #f4f4f7; margin: 0; padding: 0;">

    <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f4f4f7" style="background-color: #f4f4f7;">
        <tr>
        <td align="center" style="padding: 40px 0;">
            
            <table class="container" width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #0f0f0f; border-radius: 22px; border: 1px solid #1f1f1f; box-shadow: 0 15px 50px rgba(0,0,0,0.2); overflow: hidden;">
            
            <tr>
                <td align="center" style="padding: 40px 0 20px 0;">
                <div style="
                    width: 80px; 
                    height: 80px; 
                    border-radius: 50%; 
                    background: radial-gradient(circle at top, #1aff9c, #00c06d); 
                    margin: 0 auto 15px auto;
                    box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
                    display: block;
                    line-height: 80px;
                    text-align: center;
                ">
                    <span style="font-size: 40px;">⚡</span>
                </div>
                
                <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 1px; color: #ffffff; text-transform: uppercase;">
                    FIT<span style="color: #00ff88;">PULSE</span>
                </h1>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #a0a0a0;">Análises de saúde inteligentes</p>
                </td>
            </tr>

            <tr>
                <td style="padding: 0 40px;">
                <div style="height: 1px; background-color: #1f1f1f; width: 100%;"></div>
                </td>
            </tr>

            <tr>
                <td class="content" style="padding: 40px; text-align: left;">
                
                <h2 style="color: #ffffff; font-size: 24px; margin-bottom: 16px;">Olá, ${firstName}! 👋</h2>
                
                <p style="color: #b0b0b0; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                    Seja muito bem-vindo(a) à <strong>FitPulse</strong>. Estamos empolgados em ter você conosco nessa jornada de transformação.
                </p>

                <p style="color: #b0b0b0; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    Agora você tem o poder dos dados ao seu lado. Veja o que você já pode fazer:
                </p>

                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                    <td style="padding-bottom: 12px;">
                        <table width="100%" bgcolor="#161616" style="border-radius: 12px; border: 1px solid #252525;">
                        <tr>
                            <td style="padding: 15px; color: #e5e5e5; font-size: 15px;">
                            <strong style="color: #00ff88;">⚡ IMC Instantâneo:</strong> Cálculos precisos em segundos.
                            </td>
                        </tr>
                        </table>
                    </td>
                    </tr>
                    <tr>
                    <td style="padding-bottom: 12px;">
                        <table width="100%" bgcolor="#161616" style="border-radius: 12px; border: 1px solid #252525;">
                        <tr>
                            <td style="padding: 15px; color: #e5e5e5; font-size: 15px;">
                            <strong style="color: #00b3ff;">📈 Evolução Real:</strong> Gráficos que mostram seu progresso.
                            </td>
                        </tr>
                        </table>
                    </td>
                    </tr>
                    <tr>
                    <td style="padding-bottom: 30px;">
                        <table width="100%" bgcolor="#161616" style="border-radius: 12px; border: 1px solid #252525;">
                        <tr>
                            <td style="padding: 15px; color: #e5e5e5; font-size: 15px;">
                            <strong style="color: #ffaa00;">🔥 Resultados:</strong> Transforme números em saúde.
                            </td>
                        </tr>
                        </table>
                    </td>
                    </tr>
                </table>

                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                    <td align="center">
                        <a href="${appUrl}/" target="_blank" style="
                        background-color: #00ff88; 
                        color: #050505; 
                        padding: 16px 32px; 
                        font-size: 16px; 
                        font-weight: bold; 
                        text-decoration: none; 
                        border-radius: 14px; 
                        display: inline-block;
                        transition: all 0.3s;
                        box-shadow: 0 4px 15px rgba(0, 255, 136, 0.25);
                        ">
                        Acessar Meu Painel
                        </a>
                    </td>
                    </tr>
                </table>

                </td>
            </tr>

            <tr>
                <td style="padding: 30px; background-color: #0a0a0a; text-align: center; border-top: 1px solid #1f1f1f;">
                <p style="color: #666; font-size: 12px; margin-bottom: 10px;">
                    Enviado com energia pelo app FitPulse 💚
                </p>
                <p style="color: #444; font-size: 11px; margin: 0;">
                    Se você não criou esta conta, por favor ignore este email.<br>
                    <a href="${appUrl}/termos" style="color: #00ff88; text-decoration: none;">Termos</a> • 
                    <a href="${appUrl}/privacidade" style="color: #00ff88; text-decoration: none;">Privacidade</a>
                </p>
                </td>
            </tr>

            </table>
            
            <table width="600" align="center" style="margin-top: 20px;">
            <tr>
                <td align="center">
                <span style="color: #888888; font-size: 11px;">FitPulse Inc © ${new Date().getFullYear()}</span>
                </td>
            </tr>
            </table>

        </td>
        </tr>
    </table>
    </body>
    </html>
    `;
};