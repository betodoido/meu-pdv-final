const express = require('express');
const app = express();

app.use(express.json());

// Banco de dados em memória RAM (100% seguro contra travamentos no Render)
let memoria = {
    produtos: [
        { id: 1, nome: "Smash Burger Duplo", descricao: "Dois blends de 90g e cheddar.", preco: 28.90, categoria: "Burgers" },
        { id: 2, nome: "Batata Frita Tradicional", descricao: "Crocante com sal.", preco: 12.00, categoria: "Acompanhamentos" }
    ],
    pedidos: []
};

// ========================================================
// 🛒 TELA DO CARDÁPIO DIGITAL EMBUTIDA
// ========================================================
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cardápio Digital</title>
        <script src="https://tailwindcss.com"></script>
    </head>
    <body class="bg-gray-50 pb-32">
        <header class="bg-red-600 text-white p-6 text-center shadow-md">
            <h1 class="text-2xl font-black">🍔 BURGER HOUSE</h1>
            <p class="text-xs opacity-90 mt-1">Peça online e receba em casa</p>
        </header>
        <main class="max-w-md mx-auto p-4 space-y-4">
            <div id="container-cardapio" class="space-y-2"></div>
            <div class="bg-white p-4 rounded-xl border space-y-3 shadow-sm">
                <h2 class="text-sm font-bold text-gray-700 uppercase">📍 Dados de Entrega</h2>
                <input type="text" id="f-nome" placeholder="Seu Nome" class="w-full border p-3 rounded-xl bg-gray-50 text-sm">
                <input type="tel" id="f-whats" placeholder="WhatsApp com DDD" class="w-full border p-3 rounded-xl bg-gray-50 text-sm">
                <textarea id="f-end" placeholder="Endereço Completo" class="w-full border p-3 rounded-xl bg-gray-50 text-sm" rows="2"></textarea>
            </div>
        </main>
        <footer class="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between items-center max-w-md mx-auto shadow-2xl">
            <div>
                <p class="text-xs text-gray-400">Total com Entrega</p>
                <p class="text-xl font-black text-gray-800" id="v-total">R$ 7,00</p>
            </div>
            <button onclick="enviar()" class="bg-green-600 text-white font-bold py-3 px-6 rounded-xl text-sm hover:bg-green-700">Enviar Pedido 🚀</button>
        </footer>
        <script>
            let prods = []; let car = {}; const TAXA = 7.00;
            async function init() {
                const r = await fetch('/api/produtos'); prods = await r.json();
                const div = document.getElementById('container-cardapio');
                prods.forEach(p => {
                    div.innerHTML += '<div class="bg-white p-4 rounded-xl border flex justify-between items-center shadow-xs"><div><h3 class="font-bold text-gray-800">' + p.nome + '</h3><p class="text-xs text-gray-400">' + p.descricao + '</p><p class="text-red-600 font-bold mt-1">R$ ' + p.preco.toFixed(2) + '</p></div><div class="flex items-center space-x-2"><button onclick="alt(' + p.id + ',-1)" class="w-8 h-8 rounded bg-gray-100 font-bold text-gray-600">-</button><span id="q-' + p.id + '" class="font-bold text-sm w-4 text-center text-gray-800">0</span><button onclick="alt(' + p.id + ',1)" class="w-8 h-8 rounded bg-red-600 text-white font-bold">+</button></div></div>';
                });
            }
            function alt(id, d) {
                car[id] = (car[id] || 0) + d; if(car[id] < 0) car[id] = 0; document.getElementById('q-' + id).innerText = car[id];
                let sub = 0; prods.forEach(p => sub += (car[p.id] || 0) * p.preco);
                document.getElementById('v-total').innerText = 'R$ ' + (sub > 0 ? sub + TAXA : TAXA).toFixed(2);
            }
            async function enviar() {
                const n = document.getElementById('f-nome').value.trim(), w = document.getElementById('f-whats').value.trim(), e = document.getElementById('f-end').value.trim();
                let sub = 0; const its = []; prods.forEach(p => { const q = car[p.id] || 0; if(q > 0) { sub += p.preco * q; its.push({ produto_id: p.id, nome_produto: p.nome, quantity: q, preco_unitario: p.preco }); } });
                if(!n || !w || !e || its.length === 0) return alert("Preencha todos os campos!");
                await fetch('/api/pedidos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cliente_nome: n, cliente_whatsapp: w, endereco_entrega: e, taxa_entrega: TAXA, subtotal: sub, total: sub+TAXA, itens: its }) });
                alert("Pedido Enviado com Sucesso!"); location.reload();
            }
            init();
        </script>
    </body>
    </html>
    `);
});

// ========================================================
// 💻 TELA DO PAINEL GESTOR EMBUTIDA
// ========================================================
app.get('/painel', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><meta charset="UTF-8"><title>Painel Caixa</title><script src="https://tailwindcss.com"></script></head>
    <body class="bg-gray-100 p-6">
        <div class="max-w-6xl mx-auto space-y-4">
            <header class="bg-white p-4 rounded-xl border flex justify-between items-center shadow-sm">
                <div>
                    <h1 class="text-xl font-bold text-gray-800">💻 Monitor PDV & Delivery</h1>
                    <p class="text-xs text-gray-400">Pedidos em tempo real</p>
                </div>
                <button onclick="load()" class="bg-gray-800 text-white font-semibold px-4 py-2 rounded-lg text-xs">🔄 Atualizar</button>
            </header>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white p-4 rounded-xl border shadow-sm"><h2 class="font-bold border-b pb-2 mb-2 text-blue-600">🍳 COZINHA</h2><div id="c-preparo" class="space-y-2"></div></div>
                <div class="bg-white p-4 rounded-xl border shadow-sm"><h2 class="font-bold border-b pb-2 mb-2 text-orange-600">🛵 EM ROTA</h2><div id="c-rota" class="space-y-2"></div></div>
                <div class="bg-white p-4 rounded-xl border shadow-sm"><h2 class="font-bold border-b pb-2 mb-2 text-green-600">✅ CONCLUÍDOS</h2><div id="c-concluido" class="space-y-2"></div></div>
            </div>
        </div>
        <script>
            async function load() {
                const r = await fetch('/api/pedidos'); const peds = await r.json();
                const divP = document.getElementById('c-preparo'), divR = document.getElementById('c-rota'), divC = document.getElementById('c-concluido');
                divP.innerHTML = ""; divR.innerHTML = ""; divC.innerHTML = "";
                peds.forEach(p => {
                    const card = document.createElement('div'); card.className = "bg-gray-50 p-3 rounded-lg border shadow-xs";
                    let btn = "";
                    if(p.status === 'Pendente') btn = '<button onclick="status(' + p.id + ',\\'Em Preparo\\')" class="mt-2 w-full bg-blue-600 text-white text-xs py-1.5 rounded font-bold">Aceitar</button>';
                    else if(p.status === 'Em Preparo') btn = '<button onclick="status(' + p.id + ',\\'Saiu para Entrega\\')" class="mt-2 w-full bg-orange-500 text-white text-xs py-1.5 rounded font-bold">Despachar 🛵</button>';
                    else if(p.status === 'Saiu para Entrega') btn = '<button onclick="status(' + p.id + ',\\'Entregue\\')" class="mt-2 w-full bg-green-600 text-white text-xs py-1.5 rounded font-bold">Entregue ✅</button>';
                    
                    card.innerHTML = '<div class="flex justify-between font-bold text-xs text-gray-800"><span>#' + p.id + ' - ' + p.cliente_nome + '</span><span>R$ ' + p.total.toFixed(2) + '</span></div><p class="text-[10px] text-gray-500 mt-1">' + p.endereco_entrega + '</p>' + btn;
                    if(p.status==='Pendente'||p.status==='Em Preparo') divP.appendChild(card);
                    if(p.status==='Saiu para Entrega') divR.appendChild(card);
                    if(p.status==='Entregue') { card.className="bg-green-50 p-2 rounded text-[11px] text-gray-500"; card.innerHTML='#' + p.id + ' entregue - ' + p.cliente_nome; divC.appendChild(card); }
                });
            }
            async function status(id, st) { await fetch('/api/pedidos/' + id + '/status', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ novoStatus: st }) }); load(); }
            setInterval(load, 4000); load();
        </script>
    </body>
    </html>
    `);
});

// ========================================================
// ⚙️ ROTAS DA API (EM MEMÓRIA)
// ========================================================
app.get('/api/produtos', (req, res) => {
    res.json(memoria.produtos);
});

app.post('/api/pedidos', (req, res) => {
    const novoPedido = {
        id: memoria.pedidos.length + 1,
        ...req.body,
        status: 'Pendente'
    };
    memoria.pedidos.unshift(novoPedido);
    res.status(201).json({ sucesso: true, id: novoPedido.id });
});

app.get('/api/pedidos', (req, res) => {
    res.json(memoria.pedidos);
});

app.patch('/api/pedidos/:id/status', (req, res) => {
    const { id } = req.params;
    const { novoStatus } = req.body;
    const pedido = memoria.pedidos.find(p => p.id == id);
    if (pedido) {
        pedido.status = novoStatus;
    }
    res.json({ sucesso: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Servidor ativo'));
