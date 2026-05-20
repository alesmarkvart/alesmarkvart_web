export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { name, email, phone, message } = await request.json();

    if (!name || !email || !message) {
      return json({ error: 'Vyplňte prosím všechna povinná pole.' }, 400);
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Web Aleš Markvart <web@alesmarkvart.cz>',
        to: 'me@alesmarkvart.cz',
        reply_to: email,
        subject: `Nová zpráva od ${name}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
            <h2 style="color:#e36402">Nová zpráva z webu</h2>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 0;color:#888;width:100px">Jméno</td><td style="padding:8px 0"><strong>${esc(name)}</strong></td></tr>
              <tr><td style="padding:8px 0;color:#888">E-mail</td><td style="padding:8px 0"><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
              ${phone ? `<tr><td style="padding:8px 0;color:#888">Telefon</td><td style="padding:8px 0">${esc(phone)}</td></tr>` : ''}
            </table>
            <hr style="border:none;border-top:1px solid #eee;margin:16px 0">
            <p style="white-space:pre-wrap;line-height:1.7">${esc(message)}</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      return json({ error: 'Chyba při odesílání. Zkuste to prosím znovu.' }, 502);
    }

    return json({ success: true }, 200);

  } catch (err) {
    console.error(err);
    return json({ error: 'Neočekávaná chyba. Zkuste to prosím znovu.' }, 500);
  }
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
