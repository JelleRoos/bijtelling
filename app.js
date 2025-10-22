// Formatters
const fmt = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

// DOM
const s_price = document.getElementById('s_price');
const s_tax = document.getElementById('s_tax');
const s_own = document.getElementById('s_own');
const messagesEl = document.getElementById('messages');
const grossYearEl = document.getElementById('grossYear');
const grossMonthEl = document.getElementById('grossMonth');
const netYearEl = document.getElementById('netYear');
const netMonthEl = document.getElementById('netMonth');
const netYearWrap = document.getElementById('netYearWrap');
const netMonthWrap = document.getElementById('netMonthWrap');

// Core
function calc() {
    messagesEl.innerHTML = '';

    const fuel = document.querySelector('input[name="s_fuel"]:checked')?.value || 'ev';
    const under = document.querySelector('input[name="s_private"]:checked')?.value === 'under';
    const base = Math.max(0, +s_price.value || 0);
    const ownYr = Math.max(0, (+s_own.value || 0) * 12);
    const tax = parseFloat(s_tax.value || '');

    if (base === 0) {
        pushMsg('Vul een consumentenprijs in.', 'ok');
        setTotals(0, 0, null);
        return;
    }
    if (under) {
        pushMsg('Minder dan 500 km privé: geen bijtelling.', 'ok');
        setTotals(0, 0, null);
        return;
    }

    let bruto = 0;
    if (fuel === 'ev_full') {
        // Waterstof / geïntegreerde zonnecellen: 17% over alles
        bruto = 0.17 * base;
    } else if (fuel === 'ev') {
        // EV 2025: 17% t/m €30.000, daarboven 22%
        const cap = 30000;
        const p1 = Math.min(base, cap);
        const p2 = Math.max(0, base - cap);
        bruto = 0.17 * p1 + 0.22 * p2;
    } else {
        // Niet-EV
        bruto = 0.22 * base;
    }

    // Eigen bijdrage verlaagt bijtelling (niet onder nul)
    bruto = Math.max(0, bruto - ownYr);

    const grossYear = Math.round(bruto);
    const grossMonth = Math.round(grossYear / 12);

    let netYear = null, netMonth = null;
    if (!Number.isNaN(tax)) {
        netYear = Math.round(grossYear * tax);
        netMonth = Math.round(netYear / 12);
    }

    pushMsg('2025-regels toegepast (EV-cap t/m €30.000).', 'ok');
    setTotals(grossYear, grossMonth, netYear !== null ? { netYear, netMonth } : null);
}

// Helpers
function setTotals(gY, gM, net) {
    grossYearEl.textContent = gY ? fmt.format(gY) : '—';
    grossMonthEl.textContent = gM ? fmt.format(gM) : '—';
    if (net) {
        netYearWrap.hidden = false;
        netMonthWrap.hidden = false;
        netYearEl.textContent = fmt.format(net.netYear);
        netMonthEl.textContent = fmt.format(net.netMonth);
    } else {
        netYearWrap.hidden = true;
        netMonthWrap.hidden = true;
    }
}

function pushMsg(text, tone = 'ok') {
    const div = document.createElement('div');
    div.className = `msg ${tone}`;
    div.textContent = text;
    messagesEl.appendChild(div);
}

// Live
document.getElementById('calc-form').addEventListener('input', calc);
calc();
