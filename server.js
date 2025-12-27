require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
// Static files are handled by Vercel automatically, but we keep this for local dev
app.use(express.static('.'));

// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    // Only log error if not in Vercel build phase (optional check)
    console.error("Erro: SUPABASE_URL e SUPABASE_KEY são obrigatórios");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Routes
// GET all students
app.get('/api/students', async (req, res) => {
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

// DELETE student
app.delete('/api/students/:id', async (req, res) => {
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
