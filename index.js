const express = require('express');
const cors = require('cors');
const sqlite = require('sqlite3').verbose();
const path = require('path');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Libera a pasta public para o navegador acessar imagens, CSS, JS, etc.
app.use(express.static(path.join(__dirname, 'public')));

// Inicializa o banco de dados
var db = new sqlite.Database('Database.sqlite', (err) => {
    if (err) {
        console.error('Erro ao abrir o banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        CriarDatabase();
    }
});

// Função para criar as tabelas caso não existam
function CriarDatabase() {
    var queryLogin = `CREATE TABLE IF NOT EXISTS LOGIN (
        ID INTEGER PRIMARY KEY AUTOINCREMENT, 
        USUARIO VARCHAR, 
        SENHA VARCHAR, 
        NOME VARCHAR
    )`;

    var queryConsultas = `CREATE TABLE IF NOT EXISTS CONSULTAS (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        PACIENTE VARCHAR,
        ESPECIALISTA VARCHAR,
        DATA VARCHAR,
        HORARIO VARCHAR,
        MOTIVO VARCHAR
    )`;

    db.run(queryLogin, (err) => {
        if (err) console.log('Erro ao criar tabela LOGIN:', err);
        else console.log('Tabela LOGIN verificada/criada com sucesso!');
    });

    db.run(queryConsultas, (err) => {
        if (err) console.log('Erro ao criar tabela CONSULTAS:', err);
        else console.log('Tabela CONSULTAS verificada/criada com sucesso!');
    });
}

// Rota inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota de Cadastro
app.get('/cadastrar/:usuario/:nome/:senha', (req, res) => {
    var x = req.params.usuario;
    var y = req.params.nome;
    var z = req.params.senha;

    var query = 'INSERT INTO LOGIN (USUARIO, NOME, SENHA) VALUES (?, ?, ?)';

    db.run(query, [x, y, z], (err) => {
        if (err) {
            console.error(err);
            res.status(500).send(err);
        } else {
            res.send('OK');
        }
    });
});

// Rota de Login (buscar diretamente no SQL)
app.get('/login/:usuario/:senha', (req, res) => {
    var usuario = req.params.usuario;
    var senha = req.params.senha;

    console.log('Usuario tentado = ' + usuario);

    var query = 'SELECT * FROM LOGIN WHERE USUARIO = ? AND SENHA = ?';

    db.get(query, [usuario, senha], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erro interno no servidor' });
        }

        if (row) {
            return res.json({
                CHECA: true,
                NOME: row.NOME
            });
        } else {
            return res.json({ 
                CHECA: false, 
                NOME: null 
            });
        }
    });
});

// Rota de Agendamento
app.get('/agendar/:paciente/:especialista/:data/:horario/:motivo', (req, res) => {
    var paciente = req.params.paciente;
    var especialista = req.params.especialista;
    var data = req.params.data;
    var horario = req.params.horario;
    var motivo = req.params.motivo;

    var query = 'INSERT INTO CONSULTAS (PACIENTE, ESPECIALISTA, DATA, HORARIO, MOTIVO) VALUES (?, ?, ?, ?, ?)';

    db.run(query, [paciente, especialista, data, horario, motivo], (err) => {
        if (err) {
            console.error(err);
            res.status(500).send(err);
        } else {
            res.send('OK');
        }
    });
});

// Inicialização do Servidor na porta 5500
const PORT = 5500;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}!!`);
});

//para rodar no navegador, inserir este endereço: http://localhost:5500/
