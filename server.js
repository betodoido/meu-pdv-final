const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
// Serve os arquivos visuais de verdade que estão na pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Banco de dados em memória RAM super leve
let memoria = {
    produtos: [
        { id: 1, nome: "Smash Burger Duplo", descricao: "Dois blends artesanais de 90g, queijo cheddar derretido e molho especial.", preco: 28.90, categoria: "Burgers" },
        { id: 2, nome: "Monster Bacon Crispy", descricao: "Blend de 150g, queijo prato, muito bacon crocante e maionese defumada.", preco: 34.90, categoria: "Burgers" },
        { id: 3, font: "bold", nome: "Batata Frita Tradicional", descricao: "Batata palito super crocante temperada com sal e páprica.", preco: 12.00, categoria: "Acompanhamentos" },
        { id: 4, nome: "Coca-Cola Lata 350ml", descricao: "Refrigerante trincando de gelado.", preco: 6.00, categoria: "Bebidas" }
    ],
    pedidos: []
};

// Abre o cardápio automaticamente na página inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cardapio.html'));
});

// Abre o painel automaticamente ao digitar /painel
app.get('/painel', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'painel.html'));
});

// ROTAS DA API
app.get('/api/produtos', (req, res) => { res.json(memoria.produtos); });
app.get('/api/pedidos', (req, res) => { res.json(memoria.pedidos); });

app.post('/api/pedidos', (req, res) => {
    const novoPedido = { id: memoria.pedidos.length + 1, ...req.body, status: 'Pendente' };
    memoria.pedidos.unshift(novoPedido);
    res.status(201).json({ sucesso: true, id: novoPedido.id });
});

app.patch('/api/pedidos/:id/status', (req, res) => {
    const { id } = req.params; const { novoStatus } = req.body;
    const pedido = memoria.pedidos.find(p => p.id == id);
    if (pedido) { pedido.status = novoStatus; }
    res.json({ sucesso: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Servidor ativo de delivery'));
