const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Banco de dados inicial (Alimenta os primeiros lanches caso a lista esteja limpa)
let memoria = {
    produtos: [
        { id: 1, nome: "Smash Burger Duplo", descricao: "Dois blends artesanais de 90g, muito queijo cheddar derretido e molho especial.", preco: 28.90, categoria: "Burgers" },
        { id: 2, nome: "Monster Bacon Crispy", descricao: "Blend de 150g, queijo prato, muito bacon crocante e maionese defumada.", preco: 34.90, categoria: "Burgers" },
        { id: 3, nome: "Batata Frita Tradicional", descricao: "Batata palito super crocante temperada com sal e páprica.", preco: 12.00, categoria: "Acompanhamentos" },
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

// ========================================================
// ⚙️ ROTAS DA API DE DADOS
// ========================================================
app.get('/api/produtos', (req, res) => { res.json(memoria.produtos); });
app.get('/api/pedidos', (req, res) => { res.json(memoria.pedidos); });

// ROTA NOVA: Recebe os dados digitados na tela de administração e cadastra no cardápio
app.post('/api/produtos', (req, res) => {
    const { nome, descricao, preco, categoria } = req.body;
    if(!nome || isNaN(preco) || !categoria) return res.status(400).json({ erro: "Dados inválidos" });
    
    const novoProduto = {
        id: memoria.produtos.length + 1,
        nome,
        descricao: descricao || "Preparado com ingredientes selecionados.",
        preco: parseFloat(preco),
        categoria
    };
    
    memoria.produtos.push(novoProduto);
    res.status(201).json({ sucesso: true, produto: novoProduto });
});

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
