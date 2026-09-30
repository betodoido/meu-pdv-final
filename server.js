const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();

app.use(express.json());

// Inicializa o Banco de Dados Real integrado
const db = new sqlite3.Database(path.join(__dirname, 'database.db'), (err) => {
    if (err) console.error(err.message);
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS produtos (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, descricao TEXT, preco REAL, categoria TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS pedidos (id INTEGER PRIMARY KEY AUTOINCREMENT, cliente_nome TEXT, cliente_whatsapp TEXT, endereco_entrega TEXT, taxa_entrega REAL DEFAULT 7.00, subtotal REAL, total REAL, status TEXT DEFAULT 'Pendente')`);
    db.run(`CREATE TABLE IF NOT EXISTS pedido_itens (id INTEGER PRIMARY KEY AUTOINCREMENT, pedido_id INTEGER, produto_id INTEGER, nome_produto TEXT, quantidade INTEGER, preco_unitario REAL)`);
    db.get("SELECT COUNT(*) as count FROM produtos", (err, row) => {
        if (row && row.count === 0) {
            const stmt = db.prepare("INSERT INTO produtos (nome, descricao, preco, categoria) VALUES (?, ?, ?, ?)");
            stmt.run("Smash Burger Duplo", "Dois blends de 90g e cheddar.", 28.90, "Burgers");
            stmt.run("Batata Frita Tradicional", "Crocante com sal.", 12.00, "Acompanhamentos");
            stmt.finalize();
        }
    });
});

// ========================================================
// 🛒 TELA DO CARDÁPIO EMBUTIDA (Abre direto no link puro)
// ========================================================
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Cardápio</title><script src="https://tailwindcss.com"></script></head>
    <body class="bg-gray-50 pb-32">
        <header class="bg-red-600 text-white p-6 text-center shadow-md"><h1 class="text-2xl font-black">🍔 BURGER HOUSE</h1></header>
        <main class="max-w-md mx-auto p-4 space-y-4">
            <div id="container-cardapio" class="space-y-2"></div>
            <input type="text" id="f-nome" placeholder="Seu Nome" class="w-full border p-3 rounded-xl bg-white text-sm">
            <input type="tel" id="f-whats" placeholder="WhatsApp com DDD" class="w-full border p-3 rounded-xl bg-white text-sm">
            <textarea id="f-end" placeholder="Endereço Completo" class="w-full border p-3 rounded-xl bg-white text-sm" rows="2"></textarea>
        </main>
        <footer class="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between items-center max-w-md mx-auto shadow-2xl">
            <div><p class="text-xs text-gray-400">Total + R$ 7 taxa</p><p class="text-xl font-black" id="v-total">R$ 7,00</p></div>
            <button onclick="enviar()" class="bg-green-600 text-white font-bold py-3 px-6 rounded-xl text-sm">Pedir 🚀</button>
        </footer>
        <script>
            let prods = []; let car = {}; const TAXA = 7.00;
            async function init() {
                const r = await fetch('/api/produtos'); prods = await r.json();
                const div = document.getElementById('container-cardapio');
                prods.forEach(p => {
                    div.innerHTML += '<div class="bg-white p-4 rounded-xl border flex justify-between items-center"><div><h3 class="font-bold text-gray-800">' + p.nome + '</h3><p class="text-xs text-gray-400">' + p.descricao + '</p><p class="text-red-600 font-bold mt-1">R$ ' + p.preco.toFixed(2) + '</p></div><div class="flex items-center space-x-2"><button onclick="alt(' + p.id + ',-1)" class="w-8 h-8 rounded bg-gray-100 font-bold">-</button><span id="q-' + p.id + '" class="font-bold text-sm w-4 text-center">0</span><button onclick="alt(' + p.id + ',1)" class="w-8 h-8 rounded bg-red-600 text-white font-bold">+</button></div></div>';
                });
            }
            function alt(id, d) {
                car[id] = (car[id] || 0) + d; if(car[id] < 0) car[id] = 0; document.getElementById('q-' + id).innerText = car[id];
                let sub = 0; prods.forEach(p => sub += (car[p.id] || 0) * p.preco);
                document.getElementById('v-total').innerText = 'R$ ' + (sub > 0 ? sub + TAXA : TAXA).toFixed(2);
            }
            async function enviar() {
                const n = document.getElementById('f-nome').value.trim(), w = document.getElementById('f-whats').value.trim(), e = document.getElementById('f-end').value.trim();
                let sub = 0; const its = []; prods.forEach(p => { const q = car[p.id] || 0; if(q > 0) { sub += p.preco * q; its.push({ produto_id: p.id, nome_produto: p.nome, quantidade: q, preco_unitario: p.preco }); } });
                if(!n || !w || !e || its.length === 0) return alert("Preencha tudo!");
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
// 💻 TELA DO PAINEL EMBUTIDA (Abre no link /painel)
// ========================================================
app.get('/painel', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><meta charset="UTF-8"><title>Painel Caixa</title><script src="https://tailwindcss.com"></script></head>
    <body class="bg-gray-100 p-6">
        <div class="max-w-6xl mx-auto space-y-4">
            <header class="bg-white p-4 rounded-xl border flex justify-between items-center">
                <div>
                    <h1 class="text-xl font-bold text-gray-800">💻 Monitor PDV & Delivery</h1>
                    <p class="text-xs text-gray-400">Clique para mudar as etapas de produção</p>
                </div>
            </header>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white p-4 rounded-xl border"><h2 class="font-bold border-b pb-2 mb-2 text-blue-600">🍳 COZINHA</h2><div id="c-preparo" class="space-y-2"></div></div>
                <div class="bg-white p-4 rounded-xl border"><h2 class="font-bold border-b pb-2 mb-2 text-orange-600">🛵 EM ROTA</h2><div id="c-rota" class="space-y-2"></div></div>
                <div class="bg-white p-4 rounded-xl border"><h2 class="font-bold border-b pb-2 mb-2 text-green-600">✅ CONCLUÍDOS</h2><div id="c-concluido" class="space-y-2"></div></div>
            </div>
        </div>
        <script>
            async function load() {
                const r = await fetch('/api/pedidos'); const peds = await r.json();
                const divP = document.getElementById('c-preparo'), divR = document.getElementById('c-rota'), divC = document.getElementById('c-concluido');
                divP.innerHTML = ""; divR.innerHTML = ""; divC.innerHTML = "";
                peds.forEach(p => {
                    const card = document.createElement('div'); card.className = "bg-gray-50 p-3 rounded-lg border";
                    let btn = "";
                    if(p.status === 'Pendente') btn = '<button onclick="status(' + p.id + ',\\'Em Preparo\\')" class="mt-2 w-full bg-blue-600 text-white text-xs py-1.5 rounded font-bold">Aceitar</button>';
                    else if(p.status === 'Em Preparo') btn = '<button onclick="status(' + p.id + ',\\'Saiu para Entrega\\')" class="mt-2 w-full bg-orange-500 text-white text-xs py-1.5 rounded font-bold">Despachar 🛵</button>';
                    else if(p.status === 'Saiu para Entrega') btn = '<button onclick="status(' + p.id + ',\\'Entregue\\')" class="mt-2 w-full bg-green-600 text-white text-xs py-1.5 rounded font-bold">Entregue ✅</button>';
                    
                    card.innerHTML = '<div class="flex justify-between font-bold text-xs"><span>#' + p.id + ' - ' + p.cliente_nome + '</span><span>R$ ' + p.total.toFixed(2) + '</span></div><p class="text-[10px] text-gray-400 mt-1">' + p.endereco_entrega + '</p><p class="text-xs font-bold mt-2 text-gray-600 whitespace-pre-line">' + (p.resumo_itens||'') + '</p>' + btn;
                    if(p.status==='Pendente'||p.status==='Em Preparo') divP.appendChild(card);
                    if(p.status==='Saiu para Entrega') divR.appendChild(card);
                    if(p.status==='Entregue') { card.className="bg-green-50 p-2 rounded text-[11px] text-gray-500"; card.innerHTML='#' + p.id + ' entregue para ' + p.cliente_nome + ' (R$ ' + p.total.toFixed(2) + ')'; divC.appendChild(card); }
                });
            }
            async function status(id, st) { await fetch('/api/pedidos/' + id + '/status', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ novoStatus: st }) }); load(); }
            setInterval(load, 3000); load();
        </script>
    </body>
    </html>
    `);
});

// ========================================================
// ⚙️ ROTAS DE DADOS (API)
// ========================================================
app.get('/api/produtos', (req, res) => { db.all("SELECT * FROM produtos", [], (err, rows) => res.json(rows)); });
app.post('/api/pedidos', (req, res) => {
    const { cliente_nome, cliente_whatsapp, endereco_entrega, taxa_entrega, subtotal, total, itens } = req.body;
    db.run(`INSERT INTO pedidos (cliente_nome, cliente_whatsapp, endereco_entrega, taxa_entrega, subtotal, total) VALUES (?, ?, ?, ?, ?, ?)`, [cliente_nome, cliente_whatsapp, endereco_entrega, taxa_entrega, subtotal, total], function() {
        const pId = this.lastID;
        const stmt = db.prepare(`INSERT INTO pedido_itens (pedido_id, produto_id, nome_produto, quantidade, preco_unitario) VALUES (?, ?, ?, ?, ?)`);
