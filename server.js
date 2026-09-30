const express = require('express');
const app = express();

app.use(express.json());

// Banco de dados em memória RAM com categorias e descrições completas
let memoria = {
    produtos: [
        { id: 1, nome: "Smash Burger Duplo", descricao: "Dois blends artesanais de 90g, muito queijo cheddar derretido e molho especial da casa.", preco: 28.90, categoria: "Burgers" },
        { id: 2, nome: "Monster Bacon Crispy", descricao: "Blend de 150g, queijo prato, muito bacon crocante e maionese defumada.", preco: 34.90, categoria: "Burgers" },
        { id: 3, nome: "Batata Frita Tradicional", descricao: "Batata palito super crocante com sal e salpicada com páprica defumada.", preco: 12.00, categoria: "Acompanhamentos" },
        { id: 4, nome: "Anéis de Cebola", descricao: "12 unidades de anéis de cebola gigantes, empanados e fritos na hora.", preco: 16.00, categoria: "Acompanhamentos" },
        { id: 5, nome: "Coca-Cola Lata 350ml", descricao: "Refrigerante trincando de gelado.", preco: 6.00, categoria: "Bebidas" }
    ],
    pedidos: []
};

// ========================================================
// 🛒 TELA DO CARDÁPIO DIGITAL PREMIUM (Layout iFood)
// ========================================================
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Burger House - Cardápio Digital</title>
        <script src="https://tailwindcss.com"></script>
        <link href="https://googleapis.com" rel="stylesheet">
        <style>
            body { font-family: 'Plus Jakarta Sans', sans-serif; }
        </style>
    </head>
    <body class="bg-slate-50 pb-36 text-slate-800">

        <!-- Capa com Imagem e Degradê Elegante -->
        <div class="relative h-48 bg-slate-900 overflow-hidden">
            <img src="https://unsplash.com" class="w-full h-full object-cover opacity-60 pointer-events-none" alt="Capa Burger">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
            
            <div class="absolute bottom-4 left-4 right-4 flex flex-col items-center text-center">
                <h1 class="text-3xl font-extrabold tracking-tight text-white uppercase">🍔 BURGER HOUSE</h1>
                <p class="text-xs text-slate-300 font-medium mt-1">Os melhores blends artesanais na sua casa</p>
                <div class="mt-2.5 inline-flex items-center space-x-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Aberto para pedidos</span>
                </div>
            </div>
        </div>

        <main class="max-w-md mx-auto p-4 space-y-6">
            
            <!-- Lista Dinâmica Organizada por Categoria -->
            <div class="space-y-6">
                <div>
                    <h2 class="text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-3">🍔 Burgers Artesanais</h2>
                    <div id="cat-Burgers" class="space-y-3"></div>
                </div>

                <div>
                    <h2 class="text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-3">🍟 Acompanhamentos</h2>
                    <div id="cat-Acompanhamentos" class="space-y-3"></div>
                </div>

                <div>
                    <h2 class="text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-3">🥤 Bebidas Geladas</h2>
                    <div id="cat-Bebidas" class="space-y-3"></div>
                </div>
            </div>

            <!-- Formulário de Entrega com Design de App -->
            <section class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h2 class="text-sm font-bold text-slate-700 uppercase tracking-wide">📍 Endereço de Entrega</h2>
                <div class="space-y-3">
                    <input type="text" id="f-nome" placeholder="Seu Nome Completo" class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-slate-50 font-medium transition-all">
                    <input type="tel" id="f-whats" placeholder="WhatsApp com DDD (Ex: 11999998888)" class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-slate-50 font-medium transition-all">
                    <textarea id="f-end" placeholder="Rua, Número, Bairro e Complemento" class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-slate-50 font-medium transition-all" rows="2"></textarea>
                </div>
            </section>
        </main>

        <!-- Barra do Carrinho Fixa Estilo iFood -->
        <footer class="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 shadow-2xl max-w-md mx-auto rounded-t-3xl flex justify-between items-center z-50">
            <div>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Subtotal + R$ 7,00 Entrega</p>
                <p class="text-2xl font-black text-slate-900 tracking-tight" id="v-total">R$ 7,00</p>
            </div>
            <button onclick="enviar()" class="bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 px-8 rounded-xl shadow-lg shadow-red-600/20 transition-all active:scale-95 text-sm flex items-center space-x-2">
                <span>Concluir Pedido</span>
                <span>🚀</span>
            </button>
        </footer>

        <script>
            let prods = []; let car = {}; const TAXA = 7.00;
            async function init() {
                const r = await fetch('/api/produtos'); prods = await r.json();
                
                prods.forEach(p => {
                    const container = document.getElementById('cat-' + p.categoria);
                    if(container) {
                        container.innerHTML += '<div class="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-xs">' +
                            '<div class="flex-1 pr-3">' +
                                '<h3 class="font-bold text-slate-800 text-sm tracking-tight">' + p.nome + '</h3>' +
                                '<p class="text-xs text-slate-400 mt-1 leading-relaxed font-medium">' + p.descricao + '</p>' +
                                '<p class="text-slate-900 font-black mt-2 text-sm">R$ ' + p.preco.toFixed(2) + '</p>' +
                            '</div>' +
                            '<div class="flex items-center space-x-2 bg-slate-50 p-1 rounded-xl border border-slate-100">' +
                                '<button onclick="alt(' + p.id + ',-1)" class="w-8 h-8 rounded-lg bg-white text-slate-600 font-bold border border-slate-100 flex items-center justify-center shadow-sm">-</button>' +
                                '<span id="q-' + p.id + '" class="font-extrabold text-sm w-5 text-center text-slate-800">0</span>' +
                                '<button onclick="alt(' + p.id + ',1)" class="w-8 h-8 rounded-lg bg-red-600 text-white font-bold flex items-center justify-center shadow-md">+</button>' +
                            '</div>' +
                        '</div>';
                    }
                });
            }
            function alt(id, d) {
                car[id] = (car[id] || 0) + d; if(car[id] < 0) car[id] = 0; 
                const display = document.getElementById('q-' + id);
                if(display) display.innerText = car[id];
                let sub = 0; prods.forEach(p => sub += (car[p.id] || 0) * p.preco);
                document.getElementById('v-total').innerText = 'R$ ' + (sub > 0 ? sub + TAXA : TAXA).toFixed(2);
            }
            async function enviar() {
                const n = document.getElementById('f-nome').value.trim(), w = document.getElementById('f-whats').value.trim(), e = document.getElementById('f-end').value.trim();
                let sub = 0; const its = []; prods.forEach(p => { const q = car[p.id] || 0; if(q > 0) { sub += p.preco * q; its.push({ produto_id: p.id, nome_produto: p.nome, quantity: q, preco_unitario: p.preco }); } });
                if(!n || !w || !e || its.length === 0) return alert("Por favor, preencha todos os dados e selecione seus lanches!");
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
// 💻 TELA DO PAINEL GESTOR EMBUTIDA (Layout Clean)
// ========================================================
app.get('/painel', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Painel Operador - Monitor PDV</title>
        <script src="https://tailwindcss.com"></script>
        <link href="https://googleapis.com" rel="stylesheet">
        <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
    </head>
    <body class="bg-slate-50 p-6 text-slate-800">
        <div class="max-w-6xl mx-auto space-y-6">
            
