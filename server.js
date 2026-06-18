const express = require('express')
const mysql = require('mysql2/promise')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()
const PORT = 3000

app.use(express.json())

const JWT_SECRET = 'meu_segredo_super_secreto'

let db

async function iniciar() {
    db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'api_completa'
    })

    console.log('Conectado ao banco!')

    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`)
    })
}

function autenticar(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ erro: 'Token não enviado' })
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        req.usuario = decoded
        next()
    } catch (erro) {
        return res.status(401).json({ erro: 'Token inválido' })
    }
}

// Suas rotas vão aqui
app.post('/cadastro', async (req, res) => {
    const nome = req.body.nome
    const email = req.body.email
    const senha = req.body.senha

    if (!nome || !email || !senha) {
        return res.status(400).json({ mensagem: 'Todos os campos precisam ser preenchidos' })
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10)

    const [usuario] = await db.execute(
        'INSERT INTO usuarios (nome, email,senha) VALUES (?,?,?)',
        [nome, email, senhaCriptografada]
    )

    const [retornoUsuario] = await db.execute(
        'SELECT id,nome, email FROM usuarios WHERE id=?',
        [usuario.insertId]
    )

    res.status(201).json(retornoUsuario[0])
})

app.post('/login', async (req, res) => {
    const email = req.body.email
    const senha = req.body.senha

    if (!email || !senha) {
        return res.status(400).json({ mensagem: 'Todos os campos precisam ser preenchidos' })
    }

    const [usuario] = await db.execute(
        'SELECT id,email,senha FROM usuarios WHERE email=?',
        [email]
    )

    if (!usuario[0]) {
        return res.status(404).json({ mensagem: 'Usuário não encontrado' })
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario[0].senha)

    if (!senhaCorreta) {
        return res.status(401).json({ erro: 'Usuário não autenticado' })
    }

    const token = jwt.sign(
        { id: usuario[0].id, email: usuario[0].email },
        JWT_SECRET,
        { expiresIn: '1d' }
    )

    res.json({ token: token })

})

app.post('/tarefas', autenticar, async (req, res) => {
    const titulo = req.body.titulo
    const descricao = req.body.descricao

    if (!titulo) {
        return res.status(400).json({ mensagem: 'O título é obrigatório' })
    }

    const usuario_id = req.usuario.id

    const [tarefa] = await db.execute(
        'INSERT INTO tarefas (titulo,descricao,usuario_id) VALUES (?,?,?)', [titulo, descricao, usuario_id]
    )

    const [retornarTarefa] = await db.execute(
        'SELECT id,titulo,descricao FROM tarefas WHERE id=?',
        [tarefa.insertId]
    )

    res.status(201).json(retornarTarefa[0])
})

app.get('/tarefas', autenticar, async (req, res) => {
    const usuario_id = req.usuario.id

    const [tarefas] = await db.execute(
        'SELECT titulo,descricao FROM tarefas WHERE usuario_id=?',
        [usuario_id]
    )

    res.json(tarefas)

})

app.get('/tarefas/:id', autenticar, async (req, res) => {
    const id = req.params.id

    const [tarefas] = await db.execute(
        'SELECT * FROM tarefas WHERE id = ? AND usuario_id = ?',
        [id, req.usuario.id]
    )

    if (!tarefas[0]) {
        return res.status(404).json({ mensagem: 'Tarefa não encontrada' })
    }

    res.json(tarefas[0])
})


app.delete('/tarefas/:id', autenticar, async (req, res) => {
    const id = req.params.id
    const idUsuario = req.usuario.id

    const [verificarTarefa] = await db.execute(
        'SELECT * FROM tarefas WHERE id=? AND usuario_id=?',
        [id, idUsuario]
    )

    if (!verificarTarefa[0]) {
        return res.status(404).json({ mensagem: 'Tarefa não encontrada' })
    }

    const [deletarTarefa] = await db.execute(
        'DELETE FROM tarefas WHERE id=? AND usuario_id=?',
        [id, idUsuario]
    )

    res.status(200).json({ mensagem: 'Tarefa deletada com sucesso' })

})

iniciar()