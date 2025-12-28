require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase;

if (!supabaseUrl || !supabaseKey) {
    console.error("Erro CRÍTICO: SUPABASE_URL e SUPABASE_KEY são obrigatórios");
    // We don't crash, but we set supabase to null so we can return error in routes
    supabase = null;
} else {
    try {
        supabase = createClient(supabaseUrl, supabaseKey);
    } catch (e) {
        console.error("Erro ao iniciar Supabase:", e);
        supabase = null;
    }
}

// Routes
// GET all students
app.get('/api/students', async (req, res) => {
    if (!supabase) return res.status(500).json({ error: 'Erro de Configuração: Variáveis de Ambiente ausentes no servidor.' });
    try {
        const { data, error } = await supabase
            .from('alunos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error("Erro Supabase:", err);
        res.status(500).json({ error: 'Erro ao buscar alunos' });
    }
});

// POST new student
app.post('/api/students', async (req, res) => {
    if (!supabase) return res.status(500).json({ error: 'Erro de Configuração: Variáveis de Ambiente ausentes no servidor.' });
    try {
        const { name, email, phone } = req.body;
        if (!name || !email || !phone) {
            return res.status(400).json({ error: 'Campos obrigatórios' });
        }

        const { data, error } = await supabase
            .from('alunos')
            .insert([{ name, email, phone }])
            .select();

        if (error) throw error;
        res.json(data[0]);
    } catch (err) {
        console.error("Erro Supabase:", err);
        res.status(500).json({ error: 'Erro ao salvar aluno' });
    }
});

// PUT update student
app.put('/api/students/:id', async (req, res) => {
    if (!supabase) return res.status(500).json({ error: 'Erro de Configuração: Variáveis de Ambiente ausentes no servidor.' });
    try {
        const { id } = req.params;
        const { name, email, phone } = req.body;

        const { data, error } = await supabase
            .from('alunos')
            .update({ name, email, phone })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json(data[0]);
    } catch (err) {
        console.error("Erro Supabase:", err);
        res.status(500).json({ error: 'Erro ao atualizar aluno' });
    }
});

// DELETE student
app.delete('/api/students/:id', async (req, res) => {
    if (!supabase) return res.status(500).json({ error: 'Erro de Configuração: Variáveis de Ambiente ausentes no servidor.' });
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('alunos')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Removido com sucesso' });
    } catch (err) {
        console.error("Erro Supabase:", err);
        res.status(500).json({ error: 'Erro ao remover aluno' });
    }
});

// Export the app for Vercel
module.exports = app;

// Only listen if running locally (not imported as a module)
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
        console.log(`Use Ctrl+C to stop`);
    });
}
