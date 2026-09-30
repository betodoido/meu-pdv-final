const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ROTA NOVA: Faz o link puro redirecionar direto para o cardápio automaticamente!
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cardapio.html'));
});

// ROTA NOVA: Facilita o acesso ao painel digitando apenas /painel
app.get('/painel', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'painel.html'));
});

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

app.get('/api/produtos', (req, res) => { db.all("SELECT * FROM produtos", [], (err, rows) => res.json(rows)); });
app.post('/api/pedidos', (req, res) => {
    const { cliente_nome, cliente_whatsapp, endereco_entrega, taxa_entrega, subtotal, total, itens } = req.body;
    db.run(`INSERT INTO pedidos (cliente_nome, cliente_whatsapp, endereco_entrega, taxa_entrega, subtotal, total) VALUES (?, ?, ?, ?, ?, ?)`, [cliente_nome, cliente_whatsapp, endereco_entrega, taxa_entrega, subtotal, total], function() {
        const pId = this.lastID;
        const stmt = db.prepare(`INSERT INTO pedido_itens (pedido_id, produto_id, nome_produto, quantidade, preco_unitario) VALUES (?, ?, ?, ?, ?)`);
        itens.forEach(i => stmt.run(pId, i.produto_id, i.nome_produto, i.quantidade, i.preco_unitario));
        stmt.finalize();
        console.log(`\n📱 [WHATSAPP SIMULADO] Novo pedido #${pId} de ${cliente_nome} (${cliente_whatsapp})\n`);
        res.status(201).json({ sucesso: true });
    });
});
app.get('/api/pedidos', (req, res) => { db.all(`SELECT p.*, GROUP_CONCAT(i.quantidade || 'x ' || i.nome_produto, '\n') as resumo_itens FROM pedidos p LEFT JOIN pedido_itens i ON p.id = i.pedido_id GROUP BY p.id ORDER BY p.id DESC`, [], (err, rows) => res.json(rows)); });
app.patch('/api/pedidos/:id/status', (req, res) => {
    const { id } = req.params; const { novoStatus } = req.body;
    db.run("UPDATE pedidos SET status = ? WHERE id = ?", [novoStatus, id], () => {
        db.get("SELECT * FROM pedidos WHERE id = ?", [id], (err, p) => {
            console.log(`\n📱 [WHATSAPP SIMULADO] Pedido #${id} updated to: ${novoStatus}\n`);
            res.json({ sucesso: true });
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor na porta ${PORT}`));
