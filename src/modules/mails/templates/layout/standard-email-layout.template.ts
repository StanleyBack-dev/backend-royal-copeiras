interface StandardEmailLayoutInput {
  title: string;
  preheader: string;
  heading: string;
  greeting: string;
  contentHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function renderStandardEmailLayout({
  title,
  preheader,
  heading,
  greeting,
  contentHtml,
  ctaLabel,
  ctaUrl,
  footerNote,
}: StandardEmailLayoutInput): string {
  const year = new Date().getFullYear();
  const ctaHtml =
    ctaLabel && ctaUrl
      ? `
      <div style="margin: 28px 0 10px 0; text-align: center;">
        <a href="${escapeHtml(ctaUrl)}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #2c1810; color: #ffffff; text-decoration: none; font-weight: 600; padding: 12px 22px; border-radius: 10px;">
          ${escapeHtml(ctaLabel)}
        </a>
      </div>
    `
      : "";

  return `
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f2ef;font-family:Arial,sans-serif;color:#2c1810;">
    <span style="display:none;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">${escapeHtml(preheader)}</span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f2ef;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="620" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #eadfd7;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:24px 28px;background:#2c1810;color:#fff;">
                <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;opacity:0.85;">Royal Copeiras</div>
                <h1 style="margin:10px 0 0 0;font-size:22px;line-height:1.3;">${escapeHtml(heading)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 28px;">
                <p style="margin:0 0 14px 0;font-size:15px;line-height:1.6;">${escapeHtml(greeting)}</p>
                <div style="font-size:15px;line-height:1.65;color:#3d2a22;">${contentHtml}</div>
                ${ctaHtml}
                <p style="margin:24px 0 0 0;font-size:12px;line-height:1.5;color:#7b655b;">
                  ${escapeHtml(
                    footerNote ||
                      "Se você não reconhece este email, ignore esta mensagem.",
                  )}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 28px;background:#f9f6f4;border-top:1px solid #eadfd7;font-size:11px;color:#8c756a;text-align:center;">
                Royal Copeiras © ${year}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`.trim();
}
