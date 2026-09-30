const express = require('express');
const app = express();

app.use(express.json());

// Banco de dados em memória RAM com produtos, descrições e fotos baseados no MenuDino
let memoria = {
    produtos: [
        { id: 1, nome: "Smash Burger Duplo", descricao: "Dois blends artesanais de 90g, muito queijo cheddar derretido e molho especial MenuDino.", preco: 28.90, categoria: "Burgers", foto: "https://unsplash.com" },
        { id: 2, nome: "Monster Bacon Crispy", descricao: "Blend de 150g, queijo prato, muito bacon crocante e maionese defumada artesanal.", preco: 34.90, categoria: "Burgers", foto: "https://unsplash.com" },
        { id: 3, nome: "Batata Frita Tradicional", descricao: "Batata palito super crocante temperada com sal e páprica defumada.", preco: 12.00, categoria: "Acompanhamentos", foto: "https://unsplash.com" },
        { id: 4, nome: "Coca-Cola Lata 350ml", descricao: "Refrigerante trincando de gelado direto do freezer.", preco: 6.00, categoria: "Bebidas", foto: "https://unsplash.com" }
    ],
    pedidos: []
};

// ========================================================
// 🛒 TELA DO CARDÁPIO DIGITAL PREMIUM (ESTILO MENUDINO CONSUMER)
// ========================================================
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Burger House - MenuDino Delivery</title>
        <script src="https://tailwindcss.com"></script>
        <link href="https://googleapis.com" rel="stylesheet">
        <style>
            body { font-family: 'Inter', sans-serif; }
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        </style>
    </head>
    <body class="bg-slate-100 pb-36 text-slate-800">

        <!-- Topo Neutro e Clean com Logo Centralizado (Estilo MenuDino) -->
        <header class="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
            <div class="p-4 max-w-md mx-auto flex items-center space-x-4">
                <div class="w-14 h-16 bg-red-600 rounded-xl flex flex-col items-center justify-center text-white text-xl font-extrabold shadow-sm">
                    <span>M</span>
                    <span class="text-[9px] -mt-1 font-bold tracking-widest uppercase">D</span>
                </div>
                <div class="flex-1">
                    <h1 class="text-base font-extrabold text-slate-900 tracking-tight">BURGER HOUSE</h1>
                    <div class="flex items-center space-x-2 mt-0.5 text-xs text-slate-400 font-semibold">
                        <span class="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold text-[10px] uppercase">● Aberto</span>
                        <span>• 🕒 35-50 min</span>
                        <span>• 🛵 R$ 7,00</span>
                    </div>
                </div>
            </div>

            <!-- Navegacão Horizontal por Categorias -->
            <div class="flex space-x-2 overflow-x-auto no-scrollbar border-t border-slate-100 p-2 max-w-md mx-auto scroll-smooth">
                <a href="#sec-Burgers" class="bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap shadow-xs">Burgers</a>
                <a href="#sec-Acompanhamentos" class="bg-slate-100 text-slate-600 text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">Acompanhamentos</a>
                <a href="#sec-Bebidas" class="bg-slate-100 text-slate-600 text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">Bebidas</a>
            </div>
        </header>

        <main class="max-w-md mx-auto p-3 space-y-6">
            
            <!-- Seções de Produtos com Layout de Fotos Laterais do MenuDino -->
            <section id="sec-Burgers" class="space-y-2">
                <h2 class="text-xs font-extrabold text-slate-400 uppercase tracking-wider pl-1">Burgers Artesanais</h2>
                <div id="cat-Burgers" class="space-y-2"></div>
            </section>

            <section id="sec-Acompanhamentos" class="space-y-2">
                <h2 class="text-xs font-extrabold text-slate-400 uppercase tracking-wider pl-1">Acompanhamentos</h2>
                <div id="cat-Acompanhamentos" class="space-y-2"></div>
            </section>

            <section id="sec-Bebidas" class="space-y-2">
                <h2 class="text-xs font-extrabold text-slate-400 uppercase tracking-wider pl-1">Bebidas Geladas</h2>
                <div id="cat-Bebidas" class="space-y-2"></div>
            </section>

            <!-- Checkout de Endereço Consumer -->
            <section class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <h2 class="text-xs font-extrabold text-slate-400 uppercase tracking-wider border-b pb-2 flex items-center space-x-1.5">
                    <span>📍 Finalizar para o Delivery</span>
                </h2>
                <div class="space-y-2.5">
                    <input type="text" id="f-nome" placeholder="Seu Nome Completo" class="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 font-medium focus:outline-none focus:border-red-500 transition-all">
                    <input type="tel" id="f-whats" placeholder="WhatsApp com DDD (Ex: 11999998888)" class="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 font-medium focus:outline-none_focus:border-red-500 transition-all">
                    <textarea id="f-end" placeholder="Endereço de Entrega (Rua, Número, Bairro)" class="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 font-medium focus:outline-none focus:border-red-500 transition-all" rows="2"></textarea>
                </div>
            </section>
        </main>

        <!-- Carrinho Fixo Inferior Completo do MenuDino -->
        <footer class="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-xl max-w-md mx-auto rounded-t-xl flex justify-between items-center z-50">
            <div class="flex items-center space-x-3">
                <div class="bg-red-50 text-red-600 border border-red-100 w-9 h-9 rounded-lg flex items-center justify-center font-black text-xs" id="bag-count">
                    0
                </div>
                <div>
                    <p class="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Total com taxa</p>
                    <p class="text-lg font-black text-slate-900 tracking-tight" id="v-total">R$ 7,00</p>
                </div>
            </div>
            <button onclick="enviar()" class="bg-red-600 hover:bg-red-700 text-white font-extrabold py-3 px-6 rounded-lg transition-all text-xs flex items-center space-x-1 uppercase tracking-wider active:scale-95 shadow-sm">
                <span>Enviar Pedido</span>
                <span>➔</span>
            </button>
        </footer>

        <script>
            let prods = []; let car = {}; const TAXA = 7.00;
            async function init() {
                const r = await fetch('/api/produtos'); prods = await r.json();
                prods.forEach(p => {
                    const container = document.getElementById('cat-' + (p.categoria || "Burgers"));
                    if(container) {
                        container.innerHTML += \`
                            <div class="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center shadow-xs">
                                <div class="flex-1 pr-3">
                                    <h3 class="font-bold text-slate-900 text-sm tracking-tight">\${p.nome}</h3>
                                    <p class="text-[11px] text-slate-400 mt-0.5 leading-tight line-clamp-2 font-medium">\${p.descricao}</p>
                                    <p class="text-slate-900 font-black mt-2 text-xs">R$ \${p.preco.toFixed(2)}</p>
                                </div>
                                <div class="flex flex-col items-center space-y-2">
                                    <img src="\${p.foto}" class="w-14 h-14 object-cover rounded-lg border bg-slate-100 shadow-xs pointer-events-none">
                                    <div class="flex items-center space-x-1.5 bg-slate-50 p-0.5 rounded-md border border-slate-100">
                                        <button onclick="alt(\${p.id},-1)" class="w-6 h-6 rounded bg-white border text-gray-600 text-xs font-bold flex items-center justify-center shadow-xs">-</button>
                                        <span id="q-\${p.id}" class="font-bold text-xs w-3 text-center text-slate-800">0</span>
                                        <button onclick="alt(\text{\${p.id}},1)" class="w-6 h-6 rounded bg-red-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">+</button>
                                    </div>
                                </div>
                            </div>\`;
                    }
                });
            }
            function alt(id, d) {
                car[id] = (car[id] || 0) + d; if(car[id] < 0) car[id] = 0; document.getElementById('q-' + id).innerText = car[id];
                let sub = 0; let totalItens = 0;
                prods.forEach(p => {
                    const qtd = car[p.id] || 0;
                    sub += qtd * p.preco;
                    totalItens += qtd;
                });
                document.getElementById('bag-count').innerText = totalItens;
