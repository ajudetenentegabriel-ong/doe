document.addEventListener('DOMContentLoaded', () => {
  const donationButtons = document.querySelectorAll('.donation-button');

  donationButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const reais = Number(btn.dataset.value || btn.textContent.replace(/[^0-9]/g,''));
      const amount_cents = Math.round(reais * 100);
      const clickTs = new Date().toISOString();

      console.log('Solicitando geração de PIX', amount_cents);

      try {
        const resp = await fetch('/api/generate', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ amount_cents, click_ts: clickTs })
        });

        const body = await resp.json();
        if (!body.ok) throw body;

        const { id, pixCode, pixSvg } = (body.data || {});
        if (!id || !pixCode) throw new Error('Resposta inválida do servidor');

        // Salvar o SVG do QR code no sessionStorage para usar na página de pagamento
        if (pixSvg) {
          sessionStorage.setItem('pixSvg', pixSvg);
        }

        // Redirecionar para a página de pagamento com os dados na URL
        const params = new URLSearchParams({
          id: id,
          amount: amount_cents,
          code: encodeURIComponent(pixCode)
        });
        window.location.href = `/pagamento?${params.toString()}`;

      } catch (err) {
        console.error('Erro ao gerar PIX:', err);
        alert('Erro ao gerar PIX. Por favor, tente novamente.');
      }
    });
  });
});
